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
      { id: 'chest_inclinado', nombre: 'Chest Press Inclinado' },
      { id: 'chest_vertical', nombre: 'Chest Press Vertical' },
      { id: 'pec_deck', nombre: 'Pec Deck / Cable Fly' },
      { id: 'dips', nombre: 'Dips en Paralelas' },
      { id: 'shoulder_press', nombre: 'Shoulder Press' },
      { id: 'tricep_pushdown', nombre: 'Tricep Pushdown Rope' },
    ],
  },
  mar: {
    label: 'MAR',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#3A7BD5',
    ejercicios: [
      { id: 'dominadas', nombre: 'Dominadas' },
      { id: 'jalon_pecho', nombre: 'Jalón al Pecho' },
      { id: 'remo_maquina', nombre: 'Remo Máquina' },
      { id: 'remo_gironda', nombre: 'Remo Gironda Agarre Cerrado' },
      { id: 'reverse_pec_deck', nombre: 'Reverse Pec Deck' },
      { id: 'curl_polea', nombre: 'Curl de Bíceps en Polea' },
      { id: 'curl_concentrado', nombre: 'Curl Concentrado Mancuerna' },
    ],
  },
  mie: {
    label: 'MIÉ',
    descripcion: 'Piernas',
    color: '#16793A',
    ejercicios: [
      { id: 'peso_muerto', nombre: 'Peso Muerto' },
      { id: 'leg_press', nombre: 'Leg Press' },
      { id: 'lying_leg_curl', nombre: 'Lying Leg Curl' },
      { id: 'leg_extension', nombre: 'Leg Extension' },
      { id: 'abduccion', nombre: 'Abducción de Cadera' },
      { id: 'calf_raise', nombre: 'Calf Raise' },
    ],
  },
  jue: {
    label: 'JUE',
    descripcion: 'Hombro · Trapecio · Tríceps',
    color: '#9B59B6',
    ejercicios: [
      { id: 'press_hombro_mancuerna', nombre: 'Press Hombro Mancuerna' },
      { id: 'encogimiento_mancuerna', nombre: 'Encogimiento Mancuerna' },
      { id: 'lateral_mancuerna', nombre: 'Elevación Lateral Mancuerna' },
      { id: 'encogimiento_barra', nombre: 'Encogimiento Barra' },
      { id: 'elevacion_frontal', nombre: 'Elevación Frontal Mancuerna' },
      { id: 'extension_polea_alta', nombre: 'Extensión Tríceps Polea Alta' },
      { id: 'extension_polea_baja', nombre: 'Extensión Tríceps Polea Baja' },
    ],
  },
  vie: {
    label: 'VIE',
    descripcion: 'Espalda · Bíceps · Antebrazo',
    color: '#E67E22',
    ejercicios: [
      { id: 'chin_up', nombre: 'Dominadas Agarre Supino' },
      { id: 'jalon_cerrado', nombre: 'Jalón Agarre Cerrado' },
      { id: 'remo_cable_ancho', nombre: 'Remo Cable Agarre Ancho' },
      { id: 'curl_ez', nombre: 'Curl Barra EZ' },
      { id: 'curl_martillo', nombre: 'Curl Martillo Mancuerna' },
      { id: 'curl_polea_vie', nombre: 'Curl Bíceps en Polea' },
      { id: 'curl_muneca', nombre: 'Curl Muñeca Invertido Barra' },
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
