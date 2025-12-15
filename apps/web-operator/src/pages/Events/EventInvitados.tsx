import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { eventGuestsApi, eventsApi, EventGuest, Event, EventGuestStats } from '@/lib/api'
import { ArrowLeft, Plus, Upload, Loader2, Check, X, User, MapPin, QrCode } from 'lucide-react'
import clsx from 'clsx'
import { GuestForm } from '@/components/GuestForm'
import { ImportGuestsCSV } from '@/components/ImportGuestsCSV'
import { EventCheckinQR } from '@/components/EventCheckinQR'

export function EventInvitadosPage() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<EventGuest[]>([])
  const [stats, setStats] = useState<EventGuestStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'PENDIENTE' | 'INGRESADO' | 'NO_ASISTIO'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showGuestForm, setShowGuestForm] = useState(false)
  const [showImportCSV, setShowImportCSV] = useState(false)
  const [showCheckinQR, setShowCheckinQR] = useState(false)
  const [editingGuest, setEditingGuest] = useState<EventGuest | null>(null)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const [eventRes, guestsRes, statsRes] = await Promise.all([
        eventsApi.get(eventId),
        eventGuestsApi.list(eventId),
        eventGuestsApi.getStats(eventId)
      ])

      setEvent(eventRes.data)
      // El backend devuelve { success, data: guests[], meta: stats }
      const guestsData = (guestsRes.data as any).data || guestsRes.data.guests || []
      setGuests(guestsData)
      // Stats puede venir en data o directamente
      const statsData = (statsRes.data as any).data || statsRes.data
      setStats(statsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckIn = async (guestId: string) => {
    if (!eventId) return

    try {
      await eventGuestsApi.checkIn(eventId, guestId)
      await loadData()
    } catch (err) {
      console.error('Error checking in guest:', err)
      alert('Error al hacer check-in')
    }
  }

  const handleDelete = async (guest: EventGuest) => {
    if (!eventId) return

    const fullName = `${guest.person?.nombre || ''} ${guest.person?.apellido || ''}`
    if (!confirm(`¿Eliminar a ${fullName} de la lista de invitados?`)) {
      return
    }

    try {
      await eventGuestsApi.delete(eventId, guest.id)
      await loadData()
    } catch (err) {
      console.error('Error deleting guest:', err)
      alert('Error al eliminar invitado')
    }
  }

  const getFilteredGuests = () => {
    let filtered = guests

    // Filtrar por estado
    if (filter !== 'all') {
      filtered = filtered.filter(g => g.estadoIngreso === filter)
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(g =>
        g.person?.nombre?.toLowerCase().includes(term) ||
        g.person?.apellido?.toLowerCase().includes(term) ||
        g.person?.email?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const filteredGuests = getFilteredGuests()

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
            <h1 className="text-2xl font-bold text-gray-900">Lista de Invitados</h1>
            {event?.eventData?.eventName && (
              <p className="text-sm text-gray-500">{event.eventData.eventName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCheckinQR(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <QrCode className="h-4 w-4" />
            QR Check-in
          </button>
          <button
            onClick={() => setShowImportCSV(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Upload className="h-4 w-4" />
            Importar CSV
          </button>
          <button
            onClick={() => {
              setEditingGuest(null)
              setShowGuestForm(true)
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" />
            Agregar Invitado
          </button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Invitados</div>
          <div className="text-2xl font-bold text-gray-900">{stats?.total || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Ingresados</div>
          <div className="text-2xl font-bold text-green-600">{stats?.ingresados || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Pendientes</div>
          <div className="text-2xl font-bold text-yellow-600">{stats?.pendientes || 0}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">% Asistencia</div>
          <div className="text-2xl font-bold text-primary-600">
            {stats?.porcentajeAsistencia?.toFixed(1) || 0}%
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <input
              type="search"
              placeholder="Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro de estado */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                filter === 'all'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Todos
            </button>
            <button
              onClick={() => setFilter('PENDIENTE')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                filter === 'PENDIENTE'
                  ? 'bg-yellow-100 text-yellow-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Pendientes
            </button>
            <button
              onClick={() => setFilter('INGRESADO')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                filter === 'INGRESADO'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Ingresados
            </button>
            <button
              onClick={() => setFilter('NO_ASISTIO')}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition',
                filter === 'NO_ASISTIO'
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              No asistieron
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de invitados */}
      {filteredGuests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || filter !== 'all'
              ? 'No se encontraron invitados con los filtros aplicados'
              : 'No hay invitados en este evento. Agrega el primer invitado o importa desde CSV.'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Invitado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mesa
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredGuests.map((guest) => {
                  const fullName = `${guest.person?.nombre || ''} ${guest.person?.apellido || ''}`
                  const dietaryRestrictions = guest.person?.dietaryRestrictions
                    ? (() => {
                        try {
                          return JSON.parse(guest.person.dietaryRestrictions)
                        } catch {
                          return []
                        }
                      })()
                    : []
                  const hasRestrictions = Array.isArray(dietaryRestrictions) && dietaryRestrictions.length > 0

                  return (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium text-gray-900">{fullName}</div>
                          {guest.person?.company && (
                            <div className="text-sm text-gray-500">{guest.person.company}</div>
                          )}
                          {hasRestrictions && (
                            <div className="text-xs text-orange-600 mt-1">
                              🥗 Restricciones dietarias
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {guest.person?.email && (
                            <div className="text-gray-900">{guest.person.email}</div>
                          )}
                          {guest.person?.phone && (
                            <div className="text-gray-500">{guest.person.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {guest.mesa ? (
                          <div className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium">
                            <MapPin className="h-3 w-3" />
                            Mesa {guest.mesa.numero}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Sin asignar</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <EstadoBadge estado={guest.estadoIngreso} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {guest.checkedInAt ? (
                          <div className="text-sm text-gray-600">
                            {new Date(guest.checkedInAt).toLocaleDateString('es-AR', {
                              day: '2-digit',
                              month: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {guest.estadoIngreso === 'PENDIENTE' && (
                            <button
                              onClick={() => handleCheckIn(guest.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                              title="Check-in"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingGuest(guest)
                              setShowGuestForm(true)
                            }}
                            className="px-3 py-1 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(guest)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {showGuestForm && eventId && (
        <GuestForm
          eventId={eventId}
          guest={editingGuest}
          onClose={() => {
            setShowGuestForm(false)
            setEditingGuest(null)
          }}
          onSuccess={loadData}
        />
      )}

      {showImportCSV && eventId && (
        <ImportGuestsCSV
          eventId={eventId}
          onClose={() => setShowImportCSV(false)}
          onSuccess={loadData}
        />
      )}

      {showCheckinQR && eventId && (
        <EventCheckinQR
          eventId={eventId}
          onClose={() => setShowCheckinQR(false)}
        />
      )}
    </div>
  )
}

// Componente auxiliar para el badge de estado
function EstadoBadge({ estado }: { estado: EventGuest['estadoIngreso'] }) {
  const config = {
    PENDIENTE: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pendiente'
    },
    INGRESADO: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Ingresado'
    },
    NO_ASISTIO: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'No asistió'
    }
  }

  const { bg, text, label } = config[estado]

  return (
    <span className={clsx('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', bg, text)}>
      {label}
    </span>
  )
}

export default EventInvitadosPage
