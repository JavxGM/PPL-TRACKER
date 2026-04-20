import type { DiaRutina } from '../types/database'

export interface Ejercicio {
  id: string
  nombre: string
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
      { id: 'chest_inclinado', nombre: 'Press Inclinado' },
      { id: 'chest_vertical', nombre: 'Press Vertical' },
      { id: 'pec_deck', nombre: 'Pec Deck' },
      { id: 'dips', nombre: 'Dips' },
      { id: 'extension_polea_alta', nombre: 'Extensión Polea Alta' },
      { id: 'extension_polea_baja', nombre: 'Extensión Polea Baja' },
    ],
  },
  mar: {
    label: 'MAR',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#3A7BD5',
    ejercicios: [
      { id: 'dominadas', nombre: 'Dominadas' },
      { id: 'remo_cable_ancho', nombre: 'Remo Cable Ancho' },
      { id: 'jalon_pecho', nombre: 'Jalón al Pecho' },
      { id: 'remo_gironda', nombre: 'Remo Gironda' },
      { id: 'remo_maquina', nombre: 'Remo Máquina' },
      { id: 'chin_up', nombre: 'Chin Up' },
      { id: 'curl_ez', nombre: 'Curl EZ' },
      { id: 'curl_martillo', nombre: 'Curl Martillo' },
      { id: 'curl_polea', nombre: 'Curl Polea' },
      { id: 'curl_muneca', nombre: 'Curl Muñeca' },
    ],
  },
  mie: {
    label: 'MIÉ',
    descripcion: 'Piernas',
    color: '#16793A',
    ejercicios: [
      { id: 'peso_muerto', nombre: 'Peso Muerto' },
      { id: 'leg_press', nombre: 'Leg Press' },
      { id: 'leg_extension', nombre: 'Leg Extension' },
      { id: 'lying_leg_curl', nombre: 'Lying Leg Curl' },
      { id: 'calf_raise', nombre: 'Calf Raise' },
      { id: 'abduccion', nombre: 'Abducción' },
    ],
  },
  jue: {
    label: 'JUE',
    descripcion: 'Hombro · Trapecio · Tríceps',
    color: '#9B59B6',
    ejercicios: [
      { id: 'shoulder_press', nombre: 'Shoulder Press' },
      { id: 'press_hombro_mancuerna', nombre: 'Press Hombro Mancuerna' },
      { id: 'lateral_mancuerna', nombre: 'Lateral Mancuerna' },
      { id: 'elevacion_frontal', nombre: 'Elevación Frontal' },
      { id: 'reverse_pec_deck', nombre: 'Reverse Pec Deck' },
      { id: 'encogimiento_barra', nombre: 'Encogimiento Barra' },
      { id: 'encogimiento_mancuerna', nombre: 'Encogimiento Mancuerna' },
      { id: 'tricep_pushdown', nombre: 'Tricep Pushdown' },
    ],
  },
  vie: {
    label: 'VIE',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#E67E22',
    ejercicios: [
      { id: 'jalon_cerrado', nombre: 'Jalón Cerrado' },
      { id: 'remo_cable_ancho', nombre: 'Remo Cable Ancho' },
      { id: 'curl_concentrado', nombre: 'Curl Concentrado' },
      { id: 'curl_polea_vie', nombre: 'Curl Polea (Vie)' },
    ],
  },
}

export const STORAGE_BASE_URL =
  'https://hmwgjsztpkhzbjoonlqf.supabase.co/storage/v1/object/public/ejercicios'

export function getImageUrl(ejercicioId: string): string {
  return `${STORAGE_BASE_URL}/${ejercicioId}.jpg`
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
