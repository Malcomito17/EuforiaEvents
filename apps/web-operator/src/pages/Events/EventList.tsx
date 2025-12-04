import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi, Event } from '@/lib/api'
import { Plus, Search, Filter, Calendar, QrCode, Copy, Trash2, MoreVertical } from 'lucide-react'
import clsx from 'clsx'

export function EventListPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    loadEvents()
  }, [statusFilter])

  const loadEvents = async () => {
    setIsLoading(true)
    try {
      const { data } = await eventsApi.list({
        status: statusFilter || undefined,
        search: search || undefined,
        limit: 50,
      })
      setEvents(data.events)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadEvents()
  }

  const handleDuplicate = async (id: string) => {
    if (!confirm('¿Duplicar este evento?')) return
    try {
      await eventsApi.duplicate(id)
      loadEvents()
    } catch (error) {
      console.error('Error duplicating:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Finalizar este evento? Esta acción no se puede deshacer.')) return
    try {
      await eventsApi.delete(id)
      loadEvents()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700',
    ACTIVE: 'bg-green-100 text-green-700',
    PAUSED: 'bg-yellow-100 text-yellow-700',
    FINISHED: 'bg-blue-100 text-blue-700',
  }

  const statusLabels = {
    DRAFT: 'Borrador',
    ACTIVE: 'Activo',
    PAUSED: 'Pausado',
    FINISHED: 'Finalizado',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Eventos</h1>
        <Link
          to="/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Evento
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar eventos..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              "px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors",
              showFilters 
                ? "border-primary-500 bg-primary-50 text-primary-700" 
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            )}
          >
            <Filter className="h-5 w-5" />
            Filtros
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                >
                  <option value="">Todos</option>
                  <option value="DRAFT">Borrador</option>
                  <option value="ACTIVE">Activo</option>
                  <option value="PAUSED">Pausado</option>
                  <option value="FINISHED">Finalizado</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Events List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay eventos</h3>
          <p className="text-gray-500 mb-4">Creá tu primer evento para empezar</p>
          <Link
            to="/events/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crear Evento
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Evento
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Venue
                </th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link to={`/events/${event.id}`} className="block">
                      <div className="font-medium text-gray-900 hover:text-primary-600">
                        {event.eventData?.eventName || 'Sin nombre'}
                      </div>
                      <div className="text-sm text-gray-500">{event.slug}</div>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.eventData?.startDate
                      ? new Date(event.eventData.startDate).toLocaleDateString('es-AR')
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {event.venue?.name || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={clsx(
                      'px-3 py-1 rounded-full text-xs font-medium',
                      statusColors[event.status]
                    )}>
                      {statusLabels[event.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/events/${event.id}/qr`}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Ver QR"
                      >
                        <QrCode className="h-5 w-5" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(event.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Duplicar"
                      >
                        <Copy className="h-5 w-5" />
                      </button>
                      {event.status !== 'FINISHED' && (
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Finalizar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
