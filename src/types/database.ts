export type DiaRutina = 'lun' | 'mar' | 'mie' | 'jue' | 'vie'

export interface Sesion {
  id: string
  user_id: string
  fecha: string
  dia: DiaRutina
  notas: string | null
  created_at: string
}

export interface SetEntrenamiento {
  id: string
  user_id: string
  sesion_id: string
  ejercicio_id: string
  ejercicio_nombre: string
  set_num: number
  peso_lb: number
  reps_completadas: number
  created_at: string
}

export interface SesionConSets extends Sesion {
  sets: SetEntrenamiento[]
}

export type Database = {
  public: {
    Tables: {
      sesiones: {
        Row: {
          id: string
          user_id: string
          fecha: string
          dia: string
          notas: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          fecha: string
          dia: string
          notas?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          fecha?: string
          dia?: string
          notas?: string | null
          created_at?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          id: string
          user_id: string
          sesion_id: string
          ejercicio_id: string
          ejercicio_nombre: string
          set_num: number
          peso_lb: number
          reps_completadas: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sesion_id: string
          ejercicio_id: string
          ejercicio_nombre: string
          set_num: number
          peso_lb: number
          reps_completadas: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sesion_id?: string
          ejercicio_id?: string
          ejercicio_nombre?: string
          set_num?: number
          peso_lb?: number
          reps_completadas?: number
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      semanas_entrenamiento: {
        Args: {
          p_user_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
