import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

interface SetRow {
  ejercicio_nombre: string
  peso_lb: number
  reps_completadas: number
  set_num: number
  sesiones: { fecha: string }
}

interface SesionRow {
  fecha: string
  dia: string
  notas: string | null
}


Deno.serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ ok: false, error: 'Método no permitido.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(
      JSON.stringify({ ok: false, error: 'No autorizado.' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const groqKey = Deno.env.get('GROQ_API_KEY')
  if (!groqKey) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Configuración de servidor incompleta.' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })

  const jwt = authHeader.replace('Bearer ', '')
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt)

  if (authError || !user) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Token inválido o expirado.' }),
      { status: 401, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const userId = user.id

  const [{ data: sesiones, error: sesionesError }, { data: sets, error: setsError }] =
    await Promise.all([
      supabase
        .from('sesiones')
        .select('fecha, dia, notas')
        .eq('user_id', userId)
        .order('fecha', { ascending: true }),
      supabase
        .from('sets')
        .select('ejercicio_nombre, peso_lb, reps_completadas, set_num, sesiones!inner(fecha)')
        .eq('user_id', userId)
        .order('set_num', { ascending: true }),
    ])

  if (sesionesError || setsError) {
    const msg = sesionesError?.message ?? setsError?.message ?? 'Error de base de datos.'
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const sesionRows = (sesiones ?? []) as SesionRow[]
  const setRows = (sets ?? []) as unknown as SetRow[]

  if (sesionRows.length === 0) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Sin datos suficientes.' }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const semanas = calcularSemanas(sesionRows.map((s) => s.fecha))

  const resumenEjercicios = buildResumenEjercicios(setRows)

  const notasTexto = sesionRows
    .filter((s) => s.notas && s.notas.trim() !== '')
    .map((s) => `${s.fecha}: ${s.notas}`)
    .join('\n')

  const prompt = buildPrompt(semanas, resumenEjercicios, notasTexto || 'Sin notas.')

  const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${groqKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  })

  const groqData = await groqRes.json() as { choices?: Array<{ message?: { content?: string } }>; error?: { message: string } }

  if (!groqRes.ok || groqData.error) {
    const msg = groqData.error?.message ?? `Error de Groq (${groqRes.status}).`
    return new Response(
      JSON.stringify({ ok: false, error: msg }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  const analisis = groqData.choices?.[0]?.message?.content ?? ''

  if (!analisis) {
    return new Response(
      JSON.stringify({ ok: false, error: 'Groq no devolvió contenido.' }),
      { status: 502, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    )
  }

  return new Response(
    JSON.stringify({ ok: true, analisis, semanas }),
    { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
  )
})

function calcularSemanas(fechas: string[]): number {
  if (fechas.length === 0) return 0
  const sorted = [...fechas].sort()
  const primera = new Date(sorted[0])
  const ultima = new Date(sorted[sorted.length - 1])
  const diffMs = ultima.getTime() - primera.getTime()
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(1, Math.ceil((diffDias + 1) / 7))
}

function buildResumenEjercicios(sets: SetRow[]): string {
  type EjercicioData = {
    nombre: string
    pesoMinimo: number
    ultimoPeso: number
    ultimasReps: number
    ultimaFecha: string
  }

  const mapa = new Map<string, EjercicioData>()

  for (const s of sets) {
    const fecha = s.sesiones?.fecha ?? ''
    const existing = mapa.get(s.ejercicio_nombre)

    if (!existing) {
      mapa.set(s.ejercicio_nombre, {
        nombre: s.ejercicio_nombre,
        pesoMinimo: s.peso_lb,
        ultimoPeso: s.peso_lb,
        ultimasReps: s.reps_completadas,
        ultimaFecha: fecha,
      })
    } else {
      if (s.peso_lb < existing.pesoMinimo) {
        existing.pesoMinimo = s.peso_lb
      }
      if (fecha > existing.ultimaFecha || (fecha === existing.ultimaFecha && s.set_num >= 1)) {
        existing.ultimoPeso = s.peso_lb
        existing.ultimasReps = s.reps_completadas
        existing.ultimaFecha = fecha
      }
    }
  }

  if (mapa.size === 0) return 'Sin ejercicios registrados.'

  return Array.from(mapa.values())
    .map((e) => `- ${e.nombre}: ${e.pesoMinimo}lb → ${e.ultimoPeso}lb (${e.ultimasReps} reps)`)
    .join('\n')
}

function buildPrompt(semanas: number, resumen: string, notas: string): string {
  return `Eres entrenador personal. Analiza este progreso PPL (5 días, intermedio, mixto) de ${semanas} semanas.
EJERCICIOS:
${resumen}
NOTAS:
${notas}
Responde en español con:
1. **Resumen general**
2. **Lo que va bien**
3. **Lo que necesita atención**
4. **3 recomendaciones concretas**
5. **Consejo nutrición/recuperación**
Sé directo.`
}
