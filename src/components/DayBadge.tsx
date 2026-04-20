import type { DiaRutina } from '../types/database'
import { RUTINA } from '../lib/rutina'

interface Props {
  dia: DiaRutina
  size?: 'sm' | 'md'
}

export function DayBadge({ dia, size = 'md' }: Props) {
  const config = RUTINA[dia]
  return (
    <span
      className="tag"
      style={{
        background: `${config.color}22`,
        color: config.color,
        border: `1px solid ${config.color}44`,
        fontSize: size === 'sm' ? '0.65rem' : '0.7rem',
      }}
    >
      {config.label}
    </span>
  )
}
