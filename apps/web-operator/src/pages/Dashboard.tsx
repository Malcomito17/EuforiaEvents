import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { eventsApi, venuesApi, clientsApi, usersApi, Event } from '@/lib/api'
import { Calendar, Building2, Users, UserCog, Plus, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

interface Stats {
  totalEvents: number
  activeEvents: number
  totalVenues: number
  totalClients: number
  totalUsers: number
}

export function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentEvents, setRecentEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [eventsRes, venuesRes, clientsRes, usersRes] = await Promise.all([
        eventsApi.list({ limit: 5 }),
        venuesApi.list(),
        clientsApi.list(),
        usersApi.list(),
      ])

      setStats({
        totalEvents: eventsRes.data.total,
        activeEvents: eventsRes.data.events.filter(e => e.status === 'ACTIVE').length,
        totalVenues: venuesRes.data.total,
        totalClients: clientsRes.data.total,
        totalUsers: usersRes.data.pagination.total,
      })
      setRecentEvents(eventsRes.data.events)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
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
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/events/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Evento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Link to="/events" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-100 rounded-lg">
              <Calendar className="h-6 w-6 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Eventos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalEvents || 0}</p>
            </div>
          </div>
        </Link>

        <Link to="/events" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Eventos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeEvents || 0}</p>
            </div>
          </div>
        </Link>

        <Link to="/venues" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Venues</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalVenues || 0}</p>
            </div>
          </div>
        </Link>

        <Link to="/clients" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Clientes</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalClients || 0}</p>
            </div>
          </div>
        </Link>

        <Link to="/users" className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserCog className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Usuarios</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Eventos Recientes</h2>
          <Link 
            to="/events" 
            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            Ver todos
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay eventos aún.{' '}
            <Link to="/events/new" className="text-primary-600 hover:underline">
              Creá el primero
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {event.eventData?.eventName || 'Sin nombre'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {event.eventData?.startDate 
                        ? new Date(event.eventData.startDate).toLocaleDateString('es-AR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })
                        : 'Sin fecha'}
                      {event.venue && ` • ${event.venue.name}`}
                    </p>
                  </div>
                  <span className={clsx(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    statusColors[event.status]
                  )}>
                    {statusLabels[event.status]}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
