import type { DiaRutina } from '../types/database'

export interface Ejercicio {
  id: string
  nombre: string
  imagenId?: string   // override para cuando el archivo en Storage tiene nombre distinto al id
  consejos?: string[]
}

export interface DiaConfig {
  label: string
  descripcion: string
  color: string
  ejercicios: Ejercicio[]
}

export const RUTINA: Record<DiaRutina, DiaConfig> = {
  lun: {
    label: 'LUN',
    descripcion: 'Pecho · Tríceps',
    color: '#E94560',
    ejercicios: [
      {
        id: 'chest_inclinado', nombre: 'Chest Press Inclinado',
        consejos: ['Retrae escápulas antes de bajar', 'Codos a 45–60° del torso, no abiertos', 'Baja hasta rozar el pecho, empuja explosivo'],
      },
      {
        id: 'chest_vertical', nombre: 'Chest Press Vertical',
        consejos: ['Pecho hacia arriba, espalda baja neutra', 'Empuje vertical sin llevar los codos atrás del plano del hombro', 'Contrae el pecho en la parte alta'],
      },
      {
        id: 'pec_deck', nombre: 'Pec Deck / Cable Fly',
        consejos: ['Mantén ligera flexión en el codo durante todo el rango', 'Abre controlado, no dejes que los hombros se vayan adelante', 'Aprieta en el centro — imagina que abraza un árbol'],
      },
      {
        id: 'dips', nombre: 'Dips en Paralelas',
        consejos: ['Inclínate ligeramente hacia adelante para más pecho', 'Baja hasta que el codo llegue a 90°', 'Evita bloquear el codo arriba — mantén tensión'],
      },
      {
        id: 'shoulder_press', nombre: 'Shoulder Press',
        consejos: ['Core apretado, no arquees la lumbar', 'Codos ligeramente adelante del plano del hombro', 'Empuja directo hacia arriba — no atrás'],
      },
      {
        id: 'tricep_pushdown', nombre: 'Tricep Pushdown Rope',
        consejos: ['Codos fijos a los lados del torso, sin moverse', 'Abre la cuerda al final — máxima extensión', 'Controla el negativo, no sueltes la tensión'],
      },
    ],
  },
  mar: {
    label: 'MAR',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#3A7BD5',
    ejercicios: [
      {
        id: 'dominadas', nombre: 'Dominadas',
        consejos: ['Agarre ligeramente más ancho que hombros', 'Inicia con depresión escapular antes de doblar el codo', 'Pecho al bar, no la barbilla — rango completo'],
      },
      {
        id: 'jalon_pecho', nombre: 'Jalón al Pecho',
        consejos: ['Inclínate ~15° atrás, pecho hacia la barra', 'Jala con los codos hacia atrás y abajo, no hacia los lados', 'Contrae la espalda en la parte baja del movimiento'],
      },
      {
        id: 'remo_maquina', nombre: 'Remo Máquina',
        imagenId: 'remo_gironda',
        consejos: ['Pecho pegado al pad, no uses el torso para jalar', 'Jala hacia el ombligo — codos pegados al cuerpo', 'Pausa de 1 seg contrayendo la espalda'],
      },
      {
        id: 'remo_gironda', nombre: 'Remo Gironda Agarre Cerrado',
        imagenId: 'remo_maquina',
        consejos: ['Pecho al pad del banco, torso estático', 'Agarre neutro — jala alto hacia el pecho bajo', 'Contrae romboides apretando escápulas al final'],
      },
      {
        id: 'reverse_pec_deck', nombre: 'Reverse Pec Deck',
        consejos: ['Pecho pegado al pad, frente mirando al frente', 'Abre los brazos en arco — no uses el trapeció', 'Aprieta deltoides posterior en el punto máximo'],
      },
      {
        id: 'curl_polea', nombre: 'Curl de Bíceps en Polea',
        consejos: ['Codos fijos a los costados, no los muevas hacia adelante', 'Sube controlado, baja lento 2–3 seg', 'Supina la muñeca al subir para máxima contracción'],
      },
      {
        id: 'curl_concentrado', nombre: 'Curl Concentrado Mancuerna',
        consejos: ['Codo apoyado en la cara interna del muslo', 'Gira la muñeca hacia afuera al subir', 'Pausa de 1 seg arriba apretando el bíceps'],
      },
    ],
  },
  mie: {
    label: 'MIÉ',
    descripcion: 'Piernas',
    color: '#16793A',
    ejercicios: [
      {
        id: 'peso_muerto', nombre: 'Peso Muerto',
        consejos: ['Barra sobre el mediopié, espalda neutra desde el inicio', 'Empuja el suelo — no jales la barra', 'Bloquea caderas y rodillas simultáneamente arriba'],
      },
      {
        id: 'leg_press', nombre: 'Leg Press',
        consejos: ['Pies a ancho de hombros o más, punta ligeramente afuera', 'No bloquees las rodillas arriba — mantén ligera flexión', 'Baja hasta ~90° sin que la cadera se despegue del asiento'],
      },
      {
        id: 'lying_leg_curl', nombre: 'Lying Leg Curl',
        consejos: ['Caderas pegadas al pad durante todo el movimiento', 'Sube explosivo, baja controlado 2–3 seg', 'Punta de los pies en dorsiflexión para más bíceps femoral'],
      },
      {
        id: 'leg_extension', nombre: 'Leg Extension',
        consejos: ['Pausa de 1–2 seg arriba con el cuádriceps apretado', 'Baja lento — no dejes caer el peso', 'Ajusta el asiento para que la rótula no tenga presión'],
      },
      {
        id: 'abduccion', nombre: 'Abducción de Cadera',
        consejos: ['Movimiento lento y controlado — no uses el torso', 'Aprieta glúteo medio en el punto más alto', 'No dejes que las rodillas caigan hacia adentro al bajar'],
      },
      {
        id: 'calf_raise', nombre: 'Calf Raise',
        consejos: ['Rango completo — desde el estiramiento hasta la punta máxima', 'Pausa de 1 seg arriba en cada rep', 'Varía la posición del pie (neutro/dentro/fuera) entre series'],
      },
    ],
  },
  jue: {
    label: 'JUE',
    descripcion: 'Hombro · Trapecio · Tríceps',
    color: '#9B59B6',
    ejercicios: [
      {
        id: 'press_hombro_mancuerna', nombre: 'Press Hombro Mancuerna',
        consejos: ['Codos ligeramente adelante — no en plano del hombro', 'Core apretado, sin arquear la lumbar', 'Baja hasta que el codo llegue a 90° — rango completo'],
      },
      {
        id: 'encogimiento_mancuerna', nombre: 'Encogimiento Mancuerna',
        consejos: ['Sube el hombro directo hacia la oreja — sin girar', 'Pausa de 1 seg arriba apretando el trapecio', 'Baja lento — el estiramiento es parte del trabajo'],
      },
      {
        id: 'lateral_mancuerna', nombre: 'Elevación Lateral Mancuerna',
        consejos: ['Ligera inclinación hacia adelante para activar más el deltoides medio', 'El meñique ligeramente arriba al subir — codo lidera', 'No subas más allá del hombro — innecesario y lesivo'],
      },
      {
        id: 'encogimiento_barra', nombre: 'Encogimiento Barra',
        consejos: ['Agarre prono al ancho de hombros', 'Movimiento puro de trapecio — no doblar los codos', 'Estiramiento completo hacia abajo antes de subir'],
      },
      {
        id: 'elevacion_frontal', nombre: 'Elevación Frontal Mancuerna',
        consejos: ['Sube hasta la altura del hombro — no más', 'Control total en el negativo', 'Mantén el torso estático — no uses impulso'],
      },
      {
        id: 'extension_polea_alta', nombre: 'Extensión Tríceps Polea Alta',
        consejos: ['Codos fijos junto a la cabeza — no se mueven', 'Lleva el agarre detrás de la nuca — rango completo', 'Extiende completamente y aprieta el tríceps arriba'],
      },
      {
        id: 'extension_polea_baja', nombre: 'Extensión Tríceps Polea Baja',
        consejos: ['Inclínate ligeramente hacia adelante', 'Codo fijo, lleva el agarre hacia arriba detrás de la cabeza', 'Estiramiento máximo en la parte baja del movimiento'],
      },
    ],
  },
  vie: {
    label: 'VIE',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#E67E22',
    ejercicios: [
      {
        id: 'chin_up', nombre: 'Dominadas Agarre Supino',
        consejos: ['Agarre a ancho de hombros o más cerrado', 'El agarre supino activa más el bíceps que el dorsal', 'Pecho al bar — rango completo, sin impulso'],
      },
      {
        id: 'jalon_cerrado', nombre: 'Jalón Agarre Cerrado',
        consejos: ['Agarre neutro o supino, manos juntas', 'Jala hacia el pecho bajo — codos van detrás del cuerpo', 'Contrae el dorsal y bíceps al final del movimiento'],
      },
      {
        id: 'remo_cable_ancho', nombre: 'Remo Cable Agarre Ancho',
        consejos: ['Agarre prono ancho — jala hacia el ombligo bajo', 'Codos hacia afuera y atrás — activa más el infraespinoso', 'Estira completamente hacia adelante antes de cada rep'],
      },
      {
        id: 'curl_ez', nombre: 'Curl Barra EZ',
        consejos: ['Codos fijos a los costados durante todo el rango', 'Agarre en el ángulo interno de la EZ — menos estrés en muñeca', 'Baja controlado hasta extensión casi completa'],
      },
      {
        id: 'curl_martillo', nombre: 'Curl Martillo Mancuerna',
        consejos: ['Agarre neutro durante todo el movimiento — no rotes', 'Activa braquial y braquiorradial además del bíceps', 'Alterna brazos para mejor control o simultáneo'],
      },
      {
        id: 'curl_polea_vie', nombre: 'Curl Bíceps en Polea',
        consejos: ['Polea baja — usa cuerda o barra recta', 'Codos fijos, contrae al máximo arriba', 'El cable mantiene tensión constante en todo el rango'],
      },
      {
        id: 'curl_muneca', nombre: 'Curl Muñeca Invertido Barra',
        consejos: ['Agarre prono, antebrazos apoyados en el banco', 'Movimiento solo de muñeca — sin codo', 'Rango completo: baja hasta la extensión máxima'],
      },
    ],
  },
}

export const STORAGE_BASE_URL =
  'https://hmwgjsztpkhzbjoonlqf.supabase.co/storage/v1/object/public/ejercicios'

export function getImageUrl(ejercicio: Ejercicio): string {
  return `${STORAGE_BASE_URL}/${ejercicio.imagenId ?? ejercicio.id}.jpg`
}

export const DIA_LABELS: Record<string, DiaRutina | null> = {
  0: null,
  1: 'lun',
  2: 'mar',
  3: 'mie',
  4: 'jue',
  5: 'vie',
  6: null,
}

export function getDiaHoy(): DiaRutina | null {
  const day = new Date().getDay()
  return DIA_LABELS[day] ?? null
}

export function getAllEjercicios(): Ejercicio[] {
  return Object.values(RUTINA).flatMap((d) => d.ejercicios)
}
