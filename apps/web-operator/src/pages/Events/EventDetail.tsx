import { useEffect, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { eventsApi, Event } from '@/lib/api'
import {
  ArrowLeft, Edit, QrCode, Copy, Play, Pause, CheckCircle,
  Calendar, MapPin, Users, Music, Instagram, Hash, Loader2, Mic, Settings, UserCheck, Utensils, Layout
} from 'lucide-react'
import clsx from 'clsx'
import { useAuthStore } from '@/stores/authStore'

export function EventDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isDJ = user?.role === 'DJ'

  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    loadEvent()
  }, [id])

  const loadEvent = async () => {
    try {
      const { data } = await eventsApi.get(id!)
      setEvent(data)
    } catch (err) {
      console.error('Error loading event:', err)
      navigate('/events')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!event) return
    setIsUpdating(true)
    try {
      const { data } = await eventsApi.updateStatus(event.id, newStatus)
      setEvent(data)
    } catch (err) {
      console.error('Error updating status:', err)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDuplicate = async () => {
    if (!event || !confirm('¿Duplicar este evento?')) return
    try {
      const { data } = await eventsApi.duplicate(event.id)
      navigate(`/events/${data.id}`)
    } catch (err) {
      console.error('Error duplicating:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!event) return null

  const statusColors = {
    DRAFT: 'bg-gray-100 text-gray-700 border-gray-300',
    ACTIVE: 'bg-green-100 text-green-700 border-green-300',
    PAUSED: 'bg-yellow-100 text-yellow-700 border-yellow-300',
    FINISHED: 'bg-blue-100 text-blue-700 border-blue-300',
  }

  const statusLabels = {
    DRAFT: 'Borrador',
    ACTIVE: 'Activo',
    PAUSED: 'Pausado',
    FINISHED: 'Finalizado',
  }

  const getStatusActions = () => {
    switch (event.status) {
      case 'DRAFT':
        return [{ action: 'ACTIVE', label: 'Activar', icon: Play, color: 'bg-green-600 hover:bg-green-700' }]
      case 'ACTIVE':
        return [
          { action: 'PAUSED', label: 'Pausar', icon: Pause, color: 'bg-yellow-600 hover:bg-yellow-700' },
          { action: 'FINISHED', label: 'Finalizar', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700' },
        ]
      case 'PAUSED':
        return [
          { action: 'ACTIVE', label: 'Reanudar', icon: Play, color: 'bg-green-600 hover:bg-green-700' },
          { action: 'FINISHED', label: 'Finalizar', icon: CheckCircle, color: 'bg-blue-600 hover:bg-blue-700' },
        ]
      default:
        return []
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/events')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {event.eventData?.eventName || 'Sin nombre'}
            </h1>
            <p className="text-gray-500">{event.slug}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={clsx(
            'px-4 py-2 rounded-lg text-sm font-medium border',
            statusColors[event.status]
          )}>
            {statusLabels[event.status]}
          </span>
        </div>
      </div>

      {/* Actions - Solo para ADMIN/OPERATOR */}
      {!isDJ && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/events/${event.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
            >
              <Edit className="h-4 w-4" />
              Editar
            </Link>

            <Link
              to={`/events/${event.id}/settings`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              <Settings className="h-4 w-4" />
              Configuración
            </Link>

            <Link
              to={`/events/${event.id}/qr`}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <QrCode className="h-4 w-4" />
              Ver QR
            </Link>

            <button
              onClick={handleDuplicate}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Copy className="h-4 w-4" />
              Duplicar
            </button>

            {/* Status change buttons */}
            {getStatusActions().map(({ action, label, icon: Icon, color }) => (
              <button
                key={action}
                onClick={() => handleStatusChange(action)}
                disabled={isUpdating}
                className={clsx(
                  'inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors',
                  color,
                  isUpdating && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
                {label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Modules Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Módulos del Evento</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* MUSICADJ Module */}
          <Link
            to={`/events/${event.id}/musicadj`}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-3 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
              <Music className="h-6 w-6 text-primary-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">MUSICADJ</h3>
              <p className="text-sm text-gray-500">Gestionar pedidos musicales</p>
            </div>
            <div className="text-gray-400 group-hover:text-primary-500">
              →
            </div>
          </Link>

          {/* KARAOKEYA Module */}
          <Link
            to={`/events/${event.id}/karaokeya`}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-3 bg-purple-100 rounded-xl group-hover:bg-purple-200 transition-colors">
              <Mic className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">KARAOKEYA</h3>
              <p className="text-sm text-gray-500">Gestionar cola de karaoke</p>
            </div>
            <div className="text-gray-400 group-hover:text-primary-500">
              →
            </div>
          </Link>

          {/* INVITADOS Module */}
          <Link
            to={`/events/${event.id}/invitados`}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
              <UserCheck className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">Invitados</h3>
              <p className="text-sm text-gray-500">Gestionar lista de invitados</p>
            </div>
            <div className="text-gray-400 group-hover:text-primary-500">
              →
            </div>
          </Link>

          {/* MENÚ Module */}
          <Link
            to={`/events/${event.id}/menu`}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-3 bg-green-100 rounded-xl group-hover:bg-green-200 transition-colors">
              <Utensils className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">Menú</h3>
              <p className="text-sm text-gray-500">Gestionar menú y platos</p>
            </div>
            <div className="text-gray-400 group-hover:text-primary-500">
              →
            </div>
          </Link>

          {/* MESAS Module */}
          <Link
            to={`/events/${event.id}/mesas`}
            className="flex items-center gap-4 p-4 border border-gray-200 rounded-xl hover:border-primary-300 hover:bg-primary-50 transition-all group"
          >
            <div className="p-3 bg-orange-100 rounded-xl group-hover:bg-orange-200 transition-colors">
              <Layout className="h-6 w-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 group-hover:text-primary-700">Mesas</h3>
              <p className="text-sm text-gray-500">Distribución y asignación</p>
            </div>
            <div className="text-gray-400 group-hover:text-primary-500">
              →
            </div>
          </Link>
        </div>
      </div>

      {/* Event Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Datos del evento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Evento</h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Fecha de inicio</p>
                <p className="font-medium">
                  {event.eventData?.startDate 
                    ? formatDate(event.eventData.startDate)
                    : 'No definida'}
                </p>
              </div>
            </div>

            {event.eventData?.endDate && (
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de fin</p>
                  <p className="font-medium">{formatDate(event.eventData.endDate)}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Invitados</p>
                <p className="font-medium">
                  {event.eventData?.guestCount || 'No especificado'}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Tipo de evento</p>
                <p className="font-medium">{event.eventData?.eventType || '-'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Venue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue</h2>
          
          {event.venue ? (
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium">{event.venue.name}</p>
                  {event.venue.address && (
                    <p className="text-sm text-gray-500">{event.venue.address}</p>
                  )}
                  {event.venue.city && (
                    <p className="text-sm text-gray-500">{event.venue.city}</p>
                  )}
                </div>
              </div>

              {event.venue.contactName && (
                <div>
                  <p className="text-sm text-gray-500">Contacto</p>
                  <p className="font-medium">{event.venue.contactName}</p>
                  {event.venue.contactPhone && (
                    <p className="text-sm text-gray-500">{event.venue.contactPhone}</p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Sin venue asignado</p>
          )}
        </div>

        {/* Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cliente</h2>
          
          {event.client ? (
            <div className="space-y-2">
              <p className="font-medium">{event.client.name}</p>
              {event.client.company && (
                <p className="text-sm text-gray-500">{event.client.company}</p>
              )}
              {event.client.phone && (
                <p className="text-sm text-gray-500">Tel: {event.client.phone}</p>
              )}
              {event.client.email && (
                <p className="text-sm text-gray-500">{event.client.email}</p>
              )}
            </div>
          ) : (
            <p className="text-gray-500">Sin cliente asignado</p>
          )}
        </div>

        {/* Redes Sociales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redes y Música</h2>
          
          <div className="space-y-4">
            {event.eventData?.instagramUser && (
              <div className="flex items-center gap-3">
                <Instagram className="h-5 w-5 text-gray-400" />
                <span>{event.eventData.instagramUser}</span>
              </div>
            )}

            {event.eventData?.hashtag && (
              <div className="flex items-center gap-3">
                <Hash className="h-5 w-5 text-gray-400" />
                <span>{event.eventData.hashtag}</span>
              </div>
            )}

            {event.eventData?.spotifyPlaylist && (
              <div className="flex items-center gap-3">
                <Music className="h-5 w-5 text-gray-400" />
                <a 
                  href={event.eventData.spotifyPlaylist}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline truncate"
                >
                  Ver playlist
                </a>
              </div>
            )}

            {!event.eventData?.instagramUser && 
             !event.eventData?.hashtag && 
             !event.eventData?.spotifyPlaylist && (
              <p className="text-gray-500">Sin información de redes</p>
            )}
          </div>
        </div>
      </div>

      {/* Notas */}
      {event.eventData?.notes && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>
          <p className="text-gray-700 whitespace-pre-wrap">{event.eventData.notes}</p>
        </div>
      )}
    </div>
  )
}
