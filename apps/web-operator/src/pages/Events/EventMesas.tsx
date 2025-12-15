import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi, mesasApi, Event, Mesa, MesaStats, AsignacionStrategy } from '@/lib/api'
import { ArrowLeft, Plus, Loader2, Sparkles, Trash2, Edit } from 'lucide-react'
import clsx from 'clsx'
import { MesaCanvas } from '@/components/MesaCanvas'
import { MesaForm } from '@/components/MesaForm'

export function EventMesasPage() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [mesas, setMesas] = useState<Mesa[]>([])
  const [stats, setStats] = useState<MesaStats | null>(null)
  const [selectedMesa, setSelectedMesa] = useState<Mesa | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Modales
  const [showMesaForm, setShowMesaForm] = useState(false)
  const [editingMesa, setEditingMesa] = useState<Mesa | null>(null)
  const [showAutoAssign, setShowAutoAssign] = useState(false)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const [eventRes, mesasRes] = await Promise.all([
        eventsApi.get(eventId),
        mesasApi.list(eventId)
      ])

      setEvent(eventRes.data)
      setMesas(mesasRes.data.mesas)
      setStats(mesasRes.data.stats)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdatePosition = async (mesaId: string, x: number, y: number) => {
    if (!eventId) return

    try {
      await mesasApi.updatePosition(eventId, mesaId, { posX: x, posY: y })
      await loadData()
    } catch (err) {
      console.error('Error updating position:', err)
    }
  }

  const handleDelete = async (mesa: Mesa) => {
    if (!eventId) return

    const hasGuests = (mesa._count?.invitados ?? 0) > 0
    const confirmMessage = hasGuests
      ? `¿Eliminar mesa ${mesa.numero}? Los ${mesa._count?.invitados ?? 0} invitados asignados quedarán sin mesa.`
      : `¿Eliminar mesa ${mesa.numero}?`

    if (!confirm(confirmMessage)) return

    try {
      await mesasApi.delete(eventId, mesa.id)
      if (selectedMesa?.id === mesa.id) {
        setSelectedMesa(null)
      }
      await loadData()
    } catch (err: any) {
      console.error('Error deleting mesa:', err)
      alert(err.response?.data?.error || 'Error al eliminar la mesa')
    }
  }

  const handleAutoAssign = async (strategy: AsignacionStrategy) => {
    if (!eventId) return

    try {
      const { data } = await mesasApi.autoAssign(eventId, { strategy })
      alert(`Se asignaron ${data.assigned} invitados a mesas. ${data.failed} fallaron.`)
      if (data.errors.length > 0) {
        console.log('Errores de asignación:', data.errors)
      }
      await loadData()
      setShowAutoAssign(false)
    } catch (err: any) {
      console.error('Error auto-assigning:', err)
      alert(err.response?.data?.error || 'Error al auto-asignar invitados')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Distribución de Mesas</h1>
            {event?.eventData?.eventName && (
              <p className="text-sm text-gray-500">{event.eventData.eventName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {mesas.length > 0 && (
            <button
              onClick={() => setShowAutoAssign(true)}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <Sparkles className="h-4 w-4" />
              Auto-asignar
            </button>
          )}
          <button
            onClick={() => {
              setEditingMesa(null)
              setShowMesaForm(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            Nueva Mesa
          </button>
        </div>
      </div>

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar: Lista de mesas */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Mesas ({mesas.length})
              </h2>
            </div>

            {/* Estadísticas */}
            {stats && (
              <div className="grid grid-cols-2 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">Capacidad total</div>
                  <div className="text-lg font-bold text-gray-900">{stats.capacidadTotal}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Asignados</div>
                  <div className="text-lg font-bold text-primary-600">{stats.invitadosAsignados}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Disponible</div>
                  <div className="text-lg font-bold text-green-600">{stats.capacidadDisponible}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Sin mesa</div>
                  <div className="text-lg font-bold text-yellow-600">{stats.invitadosSinMesa}</div>
                </div>
              </div>
            )}

            {/* Lista de mesas */}
            <div className="space-y-2 max-h-[calc(100vh-400px)] overflow-y-auto">
              {mesas.length === 0 ? (
                <div className="text-center py-12 text-gray-500 text-sm">
                  <p className="mb-2">No hay mesas creadas</p>
                  <p className="text-xs">Crea la primera mesa para empezar</p>
                </div>
              ) : (
                mesas.map((mesa) => (
                  <div
                    key={mesa.id}
                    onClick={() => setSelectedMesa(mesa)}
                    className={clsx(
                      'p-3 border rounded-lg cursor-pointer transition',
                      selectedMesa?.id === mesa.id
                        ? 'bg-primary-50 border-primary-300'
                        : 'hover:bg-gray-50 border-gray-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-semibold text-gray-900">Mesa {mesa.numero}</div>
                      <div className="text-sm text-gray-500">{mesa.forma}</div>
                    </div>
                    <div className="text-sm text-gray-600">
                      {mesa._count?.invitados ?? 0} / {mesa.capacidad} personas
                    </div>
                    {mesa.sector && (
                      <div className="text-xs text-gray-500 mt-1">{mesa.sector}</div>
                    )}
                    <div className="flex gap-1 mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingMesa(mesa)
                          setShowMesaForm(true)
                        }}
                        className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition"
                        title="Editar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(mesa)
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main: Canvas de distribución */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Vista del Salón
            </h2>

            {mesas.length === 0 ? (
              <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-center text-gray-500">
                  <p className="mb-2">No hay mesas para mostrar</p>
                  <p className="text-sm">Crea mesas para visualizar la distribución</p>
                </div>
              </div>
            ) : (
              <div className="h-[600px]">
                <MesaCanvas
                  mesas={mesas}
                  selectedMesa={selectedMesa}
                  onSelectMesa={setSelectedMesa}
                  onUpdatePosition={handleUpdatePosition}
                />
              </div>
            )}
          </div>

          {/* Info de mesa seleccionada */}
          {selectedMesa && (
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Mesa {selectedMesa.numero}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Capacidad</div>
                  <div className="font-medium">{selectedMesa.capacidad} personas</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Ocupación</div>
                  <div className="font-medium">
                    {selectedMesa._count?.invitados ?? 0} / {selectedMesa.capacidad}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Forma</div>
                  <div className="font-medium">{selectedMesa.forma}</div>
                </div>
                {selectedMesa.sector && (
                  <div>
                    <div className="text-sm text-gray-500">Sector</div>
                    <div className="font-medium">{selectedMesa.sector}</div>
                  </div>
                )}
              </div>
              {selectedMesa.observaciones && (
                <div className="mt-3">
                  <div className="text-sm text-gray-500">Observaciones</div>
                  <div className="text-sm text-gray-700">{selectedMesa.observaciones}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modales */}
      {showMesaForm && eventId && (
        <MesaForm
          eventId={eventId}
          mesa={editingMesa}
          onClose={() => {
            setShowMesaForm(false)
            setEditingMesa(null)
          }}
          onSuccess={loadData}
        />
      )}

      {showAutoAssign && (
        <AutoAssignModal
          onClose={() => setShowAutoAssign(false)}
          onConfirm={handleAutoAssign}
        />
      )}
    </div>
  )
}

// Modal para auto-asignación
function AutoAssignModal({
  onClose,
  onConfirm
}: {
  onClose: () => void
  onConfirm: (strategy: AsignacionStrategy) => void
}) {
  const [strategy, setStrategy] = useState<AsignacionStrategy>('DISTRIBUTE')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Auto-asignar Invitados</h2>

        <p className="text-sm text-gray-600 mb-4">
          Selecciona cómo distribuir los invitados sin mesa asignada:
        </p>

        <div className="space-y-3 mb-6">
          <button
            onClick={() => setStrategy('FILL_FIRST')}
            className={clsx(
              'w-full p-4 border-2 rounded-lg text-left transition',
              strategy === 'FILL_FIRST'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="font-medium text-gray-900 mb-1">Llenar Primero</div>
            <div className="text-sm text-gray-600">
              Completa cada mesa antes de pasar a la siguiente
            </div>
          </button>

          <button
            onClick={() => setStrategy('DISTRIBUTE')}
            className={clsx(
              'w-full p-4 border-2 rounded-lg text-left transition',
              strategy === 'DISTRIBUTE'
                ? 'border-primary-500 bg-primary-50'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="font-medium text-gray-900 mb-1">Distribuir Uniformemente</div>
            <div className="text-sm text-gray-600">
              Distribuye invitados de forma equilibrada entre todas las mesas
            </div>
          </button>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(strategy)}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            Asignar
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventMesasPage
