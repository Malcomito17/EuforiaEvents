import { useState, useRef, useEffect } from 'react'
import { Mesa } from '@/lib/api'
import { MesaShape } from './MesaShape'

interface MesaCanvasProps {
  mesas: Mesa[]
  selectedMesa: Mesa | null
  onSelectMesa: (mesa: Mesa | null) => void
  onUpdatePosition: (mesaId: string, x: number, y: number) => void
}

export function MesaCanvas({ mesas, selectedMesa, onSelectMesa, onUpdatePosition }: MesaCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [draggingMesa, setDraggingMesa] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [tempPositions, setTempPositions] = useState<Record<string, { x: number; y: number }>>({})

  // Inicializar posiciones temporales con las posiciones actuales
  useEffect(() => {
    const positions: Record<string, { x: number; y: number }> = {}
    mesas.forEach(mesa => {
      positions[mesa.id] = {
        x: mesa.posX ?? 50,
        y: mesa.posY ?? 50
      }
    })
    setTempPositions(positions)
  }, [mesas])

  const handleMouseDown = (e: React.MouseEvent<SVGGElement>, mesa: Mesa) => {
    e.stopPropagation()

    if (!svgRef.current) return

    // Obtener coordenadas del mouse en el SVG
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

    const mesaPos = tempPositions[mesa.id] || { x: mesa.posX ?? 50, y: mesa.posY ?? 50 }

    setDragOffset({
      x: svgP.x - mesaPos.x,
      y: svgP.y - mesaPos.y
    })
    setDraggingMesa(mesa.id)
    onSelectMesa(mesa)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!draggingMesa || !svgRef.current) return

    // Obtener coordenadas del mouse en el SVG
    const pt = svgRef.current.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgP = pt.matrixTransform(svgRef.current.getScreenCTM()?.inverse())

    // Calcular nueva posición
    let newX = svgP.x - dragOffset.x
    let newY = svgP.y - dragOffset.y

    // Limitar a los bordes del canvas
    newX = Math.max(50, Math.min(950, newX))
    newY = Math.max(50, Math.min(550, newY))

    // Actualizar posición temporal
    setTempPositions(prev => ({
      ...prev,
      [draggingMesa]: { x: newX, y: newY }
    }))
  }

  const handleMouseUp = () => {
    if (draggingMesa) {
      const newPos = tempPositions[draggingMesa]
      if (newPos) {
        // Actualizar posición en el backend
        onUpdatePosition(draggingMesa, newPos.x, newPos.y)
      }
      setDraggingMesa(null)
    }
  }

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Solo deseleccionar si se hace click en el fondo del canvas
    if (e.target === e.currentTarget) {
      onSelectMesa(null)
    }
  }

  return (
    <div className="relative w-full h-full bg-gray-50 rounded-lg overflow-hidden">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox="0 0 1000 600"
        className="cursor-default"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Grid de fondo */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
          </pattern>
        </defs>
        <rect width="1000" height="600" fill="url(#grid)" />

        {/* Mesas */}
        {mesas.map((mesa) => {
          const pos = tempPositions[mesa.id] || { x: mesa.posX ?? 50, y: mesa.posY ?? 50 }
          const isSelected = selectedMesa?.id === mesa.id
          const isDragging = draggingMesa === mesa.id

          return (
            <g
              key={mesa.id}
              transform={`translate(${pos.x - 50}, ${pos.y - 50})`}
              onMouseDown={(e) => handleMouseDown(e, mesa)}
              className="cursor-move"
              style={{
                opacity: isDragging ? 0.7 : 1,
                transition: isDragging ? 'none' : 'opacity 0.2s'
              }}
            >
              {/* Highlight si está seleccionada */}
              {isSelected && (
                <rect
                  x="-5"
                  y="-5"
                  width="110"
                  height="110"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                  rx="8"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from="0"
                    to="10"
                    dur="1s"
                    repeatCount="indefinite"
                  />
                </rect>
              )}

              <MesaShape
                forma={mesa.forma}
                numero={mesa.numero}
                ocupados={mesa._count.invitados}
                capacidad={mesa.capacidad}
                isSelected={isSelected}
              />
            </g>
          )
        })}
      </svg>

      {/* Instrucciones */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-xs text-gray-600 shadow-sm">
        <p>💡 Arrastra las mesas para posicionarlas • Click para seleccionar</p>
      </div>

      {/* Leyenda de colores */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-90 rounded-lg p-3 text-xs space-y-1 shadow-sm">
        <div className="font-medium text-gray-700 mb-2">Ocupación:</div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></div>
          <span className="text-gray-600">Vacía</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10b981' }}></div>
          <span className="text-gray-600">&lt; 80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#f59e0b' }}></div>
          <span className="text-gray-600">≥ 80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#ef4444' }}></div>
          <span className="text-gray-600">Completa</span>
        </div>
      </div>
    </div>
  )
}
