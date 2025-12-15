import { FormaMesa } from '@/lib/api'

interface MesaShapeProps {
  forma: FormaMesa
  numero: string
  ocupados: number
  capacidad: number
  isSelected?: boolean
}

export function MesaShape({ forma, numero, ocupados, capacidad, isSelected = false }: MesaShapeProps) {
  const ocupacionPorcentaje = (ocupados / capacidad) * 100

  // Colores según ocupación
  const getColor = () => {
    if (ocupados === 0) return '#e5e7eb' // gray-200
    if (ocupacionPorcentaje >= 100) return '#ef4444' // red-500
    if (ocupacionPorcentaje >= 80) return '#f59e0b' // amber-500
    return '#10b981' // green-500
  }

  const fillColor = getColor()
  const strokeColor = isSelected ? '#3b82f6' : '#6b7280' // blue-500 : gray-500
  const strokeWidth = isSelected ? 3 : 2

  const renderShape = () => {
    switch (forma) {
      case 'CUADRADA':
        return (
          <rect
            x="10"
            y="10"
            width="80"
            height="80"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx="4"
          />
        )

      case 'RECTANGULAR':
        return (
          <rect
            x="5"
            y="20"
            width="90"
            height="60"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx="4"
          />
        )

      case 'REDONDA':
        return (
          <circle
            cx="50"
            cy="50"
            r="40"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )

      case 'OVALADA':
        return (
          <ellipse
            cx="50"
            cy="50"
            rx="45"
            ry="30"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )

      case 'BARRA':
        return (
          <rect
            x="5"
            y="35"
            width="90"
            height="30"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx="15"
          />
        )

      default:
        return null
    }
  }

  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      {renderShape()}

      {/* Número de mesa */}
      <text
        x="50"
        y="48"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="#1f2937"
      >
        {numero}
      </text>

      {/* Ocupación */}
      <text
        x="50"
        y="62"
        textAnchor="middle"
        fontSize="10"
        fill="#4b5563"
      >
        {ocupados}/{capacidad}
      </text>
    </svg>
  )
}
