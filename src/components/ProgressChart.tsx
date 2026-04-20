import type { ReactNode } from 'react'
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import type { PuntoProgresion } from '../hooks/useProgresion'

interface Props {
  datos: PuntoProgresion[]
  color: string
}

function formatFechaStr(fecha: string) {
  const [, m, d] = fecha.split('-')
  return `${d}/${m}`
}

function formatFechaLabel(label: ReactNode): ReactNode {
  if (typeof label === 'string') return formatFechaStr(label)
  return label
}

export function ProgressChart({ datos, color }: Props) {
  if (datos.length === 0) {
    return (
      <div className="empty-state">
        <p>Sin datos para este ejercicio todavía.</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={datos} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <CartesianGrid stroke="#2A2A4A" strokeDasharray="4 4" vertical={false} />
        <XAxis
          dataKey="fecha"
          tickFormatter={formatFechaStr}
          tick={{ fill: '#8888AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: '#8888AA', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          domain={['auto', 'auto']}
        />
        <Tooltip
          contentStyle={{
            background: '#16213E',
            border: '1px solid #2A2A4A',
            borderRadius: 8,
            fontSize: 13,
            color: '#E8E8F0',
          }}
          labelFormatter={formatFechaLabel}
          formatter={(value) => [`${value ?? ''} lb`, 'Peso máx']}
        />
        <Line
          type="monotone"
          dataKey="peso_max"
          stroke={color}
          strokeWidth={2.5}
          dot={{ fill: color, r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6, strokeWidth: 0 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
