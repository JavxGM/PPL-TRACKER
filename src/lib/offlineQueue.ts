import { openDB, type IDBPDatabase } from 'idb'
import type { DiaRutina } from '../types/database'

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface SetPendiente {
  ejercicio_id: string
  ejercicio_nombre: string
  set_num: number
  peso_lb: number
  reps_completadas: number
}

export interface SesionPendiente {
  /** UUID generado en cliente — permite idempotencia al sincronizar */
  sesion_id: string
  user_id: string
  fecha: string
  dia: DiaRutina
  notas: string | null
  sets: SetPendiente[]
  /** ISO timestamp del momento en que se encoló */
  enqueued_at: string
}

/** Fila en IndexedDB: añade la PK auto-incremental que maneja idb */
export interface SesionPendienteRow extends SesionPendiente {
  id?: number
}

// ─── Schema de la DB ──────────────────────────────────────────────────────────

const DB_NAME = 'ppl-offline'
const DB_VERSION = 1
const STORE = 'pending_sesiones'

type PPLOfflineDB = {
  [STORE]: {
    key: number
    value: SesionPendienteRow
    indexes: { by_user_id: string }
  }
}

// ─── Singleton de la conexión ─────────────────────────────────────────────────

let dbPromise: Promise<IDBPDatabase<PPLOfflineDB>> | null = null

function getDB(): Promise<IDBPDatabase<PPLOfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<PPLOfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE)) {
          const store = db.createObjectStore(STORE, {
            keyPath: 'id',
            autoIncrement: true,
          })
          store.createIndex('by_user_id', 'user_id')
        }
      },
    })
  }
  return dbPromise
}

// ─── API pública ──────────────────────────────────────────────────────────────

/**
 * Encola una sesión pendiente de sincronizar.
 * Genera automáticamente `sesion_id` (UUID v4) y `enqueued_at` si no vienen.
 */
export async function enqueue(sesion: Omit<SesionPendienteRow, 'id' | 'enqueued_at'>): Promise<void> {
  const db = await getDB()
  const row: SesionPendienteRow = {
    ...sesion,
    enqueued_at: new Date().toISOString(),
  }
  await db.add(STORE, row)
}

/** Devuelve todas las sesiones pendientes para un usuario dado. */
export async function getAllPending(userId: string): Promise<SesionPendienteRow[]> {
  const db = await getDB()
  return db.getAllFromIndex(STORE, 'by_user_id', userId)
}

/** Elimina una entrada por su PK auto-incremental (después de sincronizar con éxito). */
export async function remove(id: number): Promise<void> {
  const db = await getDB()
  await db.delete(STORE, id)
}
