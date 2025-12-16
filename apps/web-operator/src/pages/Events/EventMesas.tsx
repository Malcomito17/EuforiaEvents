import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventsApi, mesasApi, eventGuestsApi, Event, Mesa, MesaStats, AsignacionStrategy, EventGuest } from '@/lib/api'
import { ArrowLeft, Plus, Loader2, Sparkles, Trash2, Edit, User, X, UserPlus } from 'lucide-react'
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
  const [showAddGuestModal, setShowAddGuestModal] = useState(false)

  // Invitados para asignar
  const [guestsWithoutMesa, setGuestsWithoutMesa] = useState<EventGuest[]>([])
  const [mesaGuests, setMesaGuests] = useState<EventGuest[]>([])
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [assigningGuest, setAssigningGuest] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [eventId])

  // Cargar invitados de la mesa seleccionada y los sin mesa
  useEffect(() => {
    if (selectedMesa && eventId) {
      loadMesaGuests()
    }
  }, [selectedMesa?.id])

  const loadData = async () => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const [eventRes, mesasRes] = await Promise.all([
        eventsApi.get(eventId),
        mesasApi.list(eventId)
      ])

      setEvent(eventRes.data)
      // El backend devuelve { success, data: mesas[], meta: stats }
      const mesasData = (mesasRes.data as any).data || mesasRes.data.mesas || []
      const statsData = (mesasRes.data as any).meta || mesasRes.data.stats || null
      setMesas(mesasData)
      setStats(statsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMesaGuests = async () => {
    if (!eventId || !selectedMesa) return
    setLoadingGuests(true)
    try {
      const { data } = await eventGuestsApi.list(eventId)
      const guestsData = (data as any).data || data.guests || []

      // Filtrar invitados de esta mesa e invitados sin mesa
      const thisTableGuests = guestsData.filter((g: EventGuest) => g.mesaId === selectedMesa.id)
      const withoutTable = guestsData.filter((g: EventGuest) => !g.mesaId)

      setMesaGuests(thisTableGuests)
      setGuestsWithoutMesa(withoutTable)
    } catch (err) {
      console.error('Error loading guests:', err)
    } finally {
      setLoadingGuests(false)
    }
  }

  const handleAssignGuest = async (guestId: string) => {
    if (!eventId || !selectedMesa) return
    setAssigningGuest(guestId)
    try {
      await eventGuestsApi.update(eventId, guestId, { mesaId: selectedMesa.id })
      await loadMesaGuests()
      await loadData() // Actualizar stats
    } catch (err) {
      console.error('Error assigning guest:', err)
      alert('Error al asignar invitado')
    } finally {
      setAssigningGuest(null)
    }
  }

  const handleRemoveFromMesa = async (guestId: string) => {
    if (!eventId) return
    setAssigningGuest(guestId)
    try {
      await eventGuestsApi.update(eventId, guestId, { mesaId: null })
      await loadMesaGuests()
      await loadData() // Actualizar stats
    } catch (err) {
      console.error('Error removing guest from mesa:', err)
      alert('Error al quitar invitado de la mesa')
    } finally {
      setAssigningGuest(null)
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
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Mesa {selectedMesa.numero}</h3>
                <button
                  onClick={() => setShowAddGuestModal(true)}
                  disabled={mesaGuests.length >= selectedMesa.capacidad}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  title={mesaGuests.length >= selectedMesa.capacidad ? 'Mesa llena' : 'Agregar invitado'}
                >
                  <UserPlus className="h-4 w-4" />
                  Agregar
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4 text-center">
                <div className="p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{selectedMesa.capacidad}</div>
                  <div className="text-xs text-gray-500">Capacidad</div>
                </div>
                <div className="p-2 bg-primary-50 rounded">
                  <div className="text-lg font-bold text-primary-600">{mesaGuests.length}</div>
                  <div className="text-xs text-gray-500">Asignados</div>
                </div>
                <div className="p-2 bg-green-50 rounded">
                  <div className="text-lg font-bold text-green-600">{selectedMesa.capacidad - mesaGuests.length}</div>
                  <div className="text-xs text-gray-500">Disponible</div>
                </div>
              </div>

              {/* Lista de invitados en esta mesa */}
              <div className="border-t border-gray-200 pt-3">
                <div className="text-sm font-medium text-gray-700 mb-2">Invitados en esta mesa:</div>
                {loadingGuests ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  </div>
                ) : mesaGuests.length === 0 ? (
                  <div className="text-sm text-gray-500 py-2 text-center">
                    No hay invitados asignados
                  </div>
                ) : (
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {mesaGuests.map((guest) => (
                      <div
                        key={guest.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {guest.person?.nombre} {guest.person?.apellido}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFromMesa(guest.id)}
                          disabled={assigningGuest === guest.id}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition disabled:opacity-50"
                          title="Quitar de la mesa"
                        >
                          {assigningGuest === guest.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {selectedMesa.observaciones && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-xs text-gray-500">Observaciones</div>
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

      {showAddGuestModal && selectedMesa && (
        <AddGuestToMesaModal
          guests={guestsWithoutMesa}
          mesaNumero={selectedMesa.numero}
          capacidadDisponible={selectedMesa.capacidad - mesaGuests.length}
          assigningGuest={assigningGuest}
          onAssign={handleAssignGuest}
          onClose={() => setShowAddGuestModal(false)}
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

// Modal para agregar invitado a mesa
function AddGuestToMesaModal({
  guests,
  mesaNumero,
  capacidadDisponible,
  assigningGuest,
  onAssign,
  onClose
}: {
  guests: EventGuest[]
  mesaNumero: string
  capacidadDisponible: number
  assigningGuest: string | null
  onAssign: (guestId: string) => void
  onClose: () => void
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredGuests = guests.filter((g) => {
    if (!searchTerm) return true
    const fullName = `${g.person?.nombre || ''} ${g.person?.apellido || ''}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[80vh] flex flex-col">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Agregar a Mesa {mesaNumero}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {capacidadDisponible} lugar(es) disponible(s)
        </p>

        {/* Búsqueda */}
        <input
          type="search"
          placeholder="Buscar invitado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />

        {/* Lista de invitados sin mesa */}
        <div className="flex-1 overflow-y-auto">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              {guests.length === 0 ? (
                <p>No hay invitados sin mesa asignada</p>
              ) : (
                <p>No se encontraron invitados</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredGuests.map((guest) => (
                <button
                  key={guest.id}
                  onClick={() => onAssign(guest.id)}
                  disabled={assigningGuest !== null || capacidadDisponible <= 0}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-primary-50 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div className="text-left">
                      <div className="font-medium text-gray-900">
                        {guest.person?.nombre} {guest.person?.apellido}
                      </div>
                      {guest.person?.company && (
                        <div className="text-xs text-gray-500">{guest.person.company}</div>
                      )}
                    </div>
                  </div>
                  {assigningGuest === guest.id ? (
                    <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventMesasPage
