import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { guestsApi, Guest, eventsApi, Event } from '@/lib/api'
import { ArrowLeft, Trash2, Mail, MessageSquare, Music, Mic, Loader2 } from 'lucide-react'
import clsx from 'clsx'

export function EventGuestsPage() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'name' | 'songs' | 'karaoke' | 'total'>('name')

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const [eventRes, guestsRes] = await Promise.all([
        eventsApi.get(eventId),
        guestsApi.listByEvent(eventId)
      ])

      setEvent(eventRes.data)
      setGuests(guestsRes.data.guests)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (guest: Guest) => {
    if (!confirm(`¿Eliminar a ${guest.displayName}? Se eliminarán también todos sus pedidos.`)) {
      return
    }

    try {
      await guestsApi.delete(guest.id)
      await loadData()
    } catch (err) {
      console.error('Error deleting guest:', err)
      alert('Error al eliminar invitado')
    }
  }

  const getSortedGuests = () => {
    const sorted = [...guests]

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.displayName.localeCompare(b.displayName))
      case 'songs':
        return sorted.sort((a, b) =>
          (b.songRequestsCount || 0) - (a.songRequestsCount || 0)
        )
      case 'karaoke':
        return sorted.sort((a, b) =>
          (b.karaokeRequestsCount || 0) - (a.karaokeRequestsCount || 0)
        )
      case 'total':
        return sorted.sort((a, b) => {
          const totalA = (a.songRequestsCount || 0) + (a.karaokeRequestsCount || 0)
          const totalB = (b.songRequestsCount || 0) + (b.karaokeRequestsCount || 0)
          return totalB - totalA
        })
      default:
        return sorted
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const sortedGuests = getSortedGuests()

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
            <h1 className="text-2xl font-bold text-gray-900">Invitados</h1>
            {event?.eventData?.eventName && (
              <p className="text-sm text-gray-500">{event.eventData.eventName}</p>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Invitados</div>
          <div className="text-2xl font-bold text-gray-900">{guests.length}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total MUSICADJ</div>
          <div className="text-2xl font-bold text-primary-600">
            {guests.reduce((sum, g) => sum + (g.songRequestsCount || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total KARAOKEYA</div>
          <div className="text-2xl font-bold text-purple-600">
            {guests.reduce((sum, g) => sum + (g.karaokeRequestsCount || 0), 0)}
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Pedidos</div>
          <div className="text-2xl font-bold text-gray-900">
            {guests.reduce((sum, g) =>
              sum + (g.songRequestsCount || 0) + (g.karaokeRequestsCount || 0), 0
            )}
          </div>
        </div>
      </div>

      {/* Sort controls */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Ordenar por:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setSortBy('name')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition',
                sortBy === 'name'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Nombre
            </button>
            <button
              onClick={() => setSortBy('songs')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition',
                sortBy === 'songs'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              MUSICADJ
            </button>
            <button
              onClick={() => setSortBy('karaoke')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition',
                sortBy === 'karaoke'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              KARAOKEYA
            </button>
            <button
              onClick={() => setSortBy('total')}
              className={clsx(
                'px-3 py-1 rounded-lg text-sm font-medium transition',
                sortBy === 'total'
                  ? 'bg-primary-100 text-primary-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              Total pedidos
            </button>
          </div>
        </div>
      </div>

      {/* Guest list */}
      {sortedGuests.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No hay invitados con pedidos en este evento</p>
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
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Music className="h-4 w-4 inline mr-1" />
                    MUSICADJ
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <Mic className="h-4 w-4 inline mr-1" />
                    KARAOKEYA
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedGuests.map((guest) => {
                  const total = (guest.songRequestsCount || 0) + (guest.karaokeRequestsCount || 0)

                  return (
                    <tr key={guest.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/events/${eventId}/guests/${guest.id}`}
                          className="group"
                        >
                          <div className="font-medium text-gray-900 group-hover:text-primary-600">
                            {guest.displayName}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {guest.email}
                          </div>
                          {guest.whatsapp && (
                            <div className="text-sm text-gray-500 flex items-center gap-2 mt-1">
                              <MessageSquare className="h-3 w-3" />
                              {guest.whatsapp}
                            </div>
                          )}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={clsx(
                          'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                          (guest.songRequestsCount || 0) > 0
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-gray-100 text-gray-400'
                        )}>
                          {guest.songRequestsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={clsx(
                          'inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium',
                          (guest.karaokeRequestsCount || 0) > 0
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-400'
                        )}>
                          {guest.karaokeRequestsCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-900 text-white text-sm font-medium">
                          {total}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/events/${eventId}/guests/${guest.id}`}
                            className="text-primary-600 hover:text-primary-900"
                          >
                            Ver pedidos
                          </Link>
                          <button
                            onClick={() => handleDelete(guest)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Eliminar invitado"
                          >
                            <Trash2 className="h-4 w-4" />
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
    </div>
  )
}

export default EventGuestsPage
