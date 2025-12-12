import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { guestsApi, Guest, GuestRequests } from '@/lib/api'
import {
  ArrowLeft, Mail, MessageSquare, Music, Mic, Loader2,
  Calendar, ExternalLink, Play, MapPin
} from 'lucide-react'
import clsx from 'clsx'

export function ParticipantDetailPage() {
  const { guestId } = useParams()
  const navigate = useNavigate()
  const [guest, setGuest] = useState<Guest | null>(null)
  const [requests, setRequests] = useState<GuestRequests | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'musicadj' | 'karaokeya'>('all')

  useEffect(() => {
    loadData()
  }, [guestId])

  const loadData = async () => {
    if (!guestId) return

    setIsLoading(true)
    try {
      const [guestRes, requestsRes] = await Promise.all([
        guestsApi.get(guestId),
        guestsApi.getRequests(guestId) // No eventId filter - get ALL requests
      ])

      setGuest(guestRes.data.guest)
      setRequests(requestsRes.data.requests)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const getStatusBadge = (status: string, type: 'song' | 'karaoke') => {
    const styles = type === 'song' ? {
      PENDING: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      HIGHLIGHTED: 'bg-blue-100 text-blue-700 border-blue-200',
      URGENT: 'bg-red-100 text-red-700 border-red-200',
      PLAYED: 'bg-green-100 text-green-700 border-green-200',
      DISCARDED: 'bg-gray-100 text-gray-500 border-gray-200',
    } : {
      QUEUED: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      CALLED: 'bg-blue-100 text-blue-700 border-blue-200',
      ON_STAGE: 'bg-purple-100 text-purple-700 border-purple-200',
      COMPLETED: 'bg-green-100 text-green-700 border-green-200',
      NO_SHOW: 'bg-gray-100 text-gray-500 border-gray-200',
      CANCELLED: 'bg-red-100 text-red-700 border-red-200',
    }

    const labels = type === 'song' ? {
      PENDING: 'Pendiente',
      HIGHLIGHTED: 'Destacado',
      URGENT: 'Urgente',
      PLAYED: 'Reproducido',
      DISCARDED: 'Descartado',
    } : {
      QUEUED: 'En cola',
      CALLED: 'Llamado',
      ON_STAGE: 'En escena',
      COMPLETED: 'Completado',
      NO_SHOW: 'No presentado',
      CANCELLED: 'Cancelado',
    }

    return (
      <span className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-500 border-gray-200'
      )}>
        {labels[status as keyof typeof labels] || status}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  if (!guest || !requests) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No se encontró el participante</p>
      </div>
    )
  }

  const totalSongs = requests.songs.length
  const totalKaraoke = requests.karaoke.length
  const totalRequests = totalSongs + totalKaraoke

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/participants')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{guest.displayName}</h1>
            <p className="text-sm text-gray-500">Historial completo de pedidos</p>
          </div>
        </div>
      </div>

      {/* Guest info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Email</div>
              <div className="font-medium">{guest.email}</div>
            </div>
          </div>
          {guest.whatsapp && (
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-gray-400" />
              <div>
                <div className="text-sm text-gray-500">WhatsApp</div>
                <div className="font-medium">{guest.whatsapp}</div>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-gray-400" />
            <div>
              <div className="text-sm text-gray-500">Registrado</div>
              <div className="font-medium">
                {new Date(guest.createdAt).toLocaleDateString('es-AR')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500">Total Pedidos</div>
          <div className="text-2xl font-bold text-gray-900">{totalRequests}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Music className="h-4 w-4" />
            MUSICADJ
          </div>
          <div className="text-2xl font-bold text-primary-600">{totalSongs}</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Mic className="h-4 w-4" />
            KARAOKEYA
          </div>
          <div className="text-2xl font-bold text-purple-600">{totalKaraoke}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('all')}
              className={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition',
                activeTab === 'all'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              Todos ({totalRequests})
            </button>
            <button
              onClick={() => setActiveTab('musicadj')}
              className={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2',
                activeTab === 'musicadj'
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Music className="h-4 w-4" />
              MUSICADJ ({totalSongs})
            </button>
            <button
              onClick={() => setActiveTab('karaokeya')}
              className={clsx(
                'px-6 py-4 text-sm font-medium border-b-2 transition flex items-center gap-2',
                activeTab === 'karaokeya'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Mic className="h-4 w-4" />
              KARAOKEYA ({totalKaraoke})
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* MUSICADJ Requests */}
          {(activeTab === 'all' || activeTab === 'musicadj') && requests.songs.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Music className="h-5 w-5 text-primary-600" />
                  MUSICADJ
                </h3>
              )}
              <div className="space-y-3">
                {requests.songs.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition"
                  >
                    {request.albumArtUrl && (
                      <img
                        src={request.albumArtUrl}
                        alt=""
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{request.title}</div>
                      <div className="text-sm text-gray-600">{request.artist}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getStatusBadge(request.status, 'song')}
                        {request.event?.eventData?.eventName && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <MapPin className="h-3 w-3" />
                            {request.event.eventData.eventName}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                    {request.spotifyId && (
                      <a
                        href={`https://open.spotify.com/track/${request.spotifyId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                        title="Abrir en Spotify"
                      >
                        <Play className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KARAOKEYA Requests */}
          {(activeTab === 'all' || activeTab === 'karaokeya') && requests.karaoke.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mic className="h-5 w-5 text-purple-600" />
                  KARAOKEYA
                </h3>
              )}
              <div className="space-y-3">
                {requests.karaoke.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-purple-300 transition"
                  >
                    {request.song?.thumbnailUrl && (
                      <img
                        src={request.song.thumbnailUrl}
                        alt=""
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                          {request.turnNumber}
                        </span>
                        <div className="font-semibold text-gray-900">{request.title}</div>
                      </div>
                      {request.artist && (
                        <div className="text-sm text-gray-600">{request.artist}</div>
                      )}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {getStatusBadge(request.status, 'karaoke')}
                        {request.event?.eventData?.eventName && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 border border-indigo-200">
                            <MapPin className="h-3 w-3" />
                            {request.event.eventData.eventName}
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                    {request.song?.youtubeShareUrl && (
                      <a
                        href={request.song.youtubeShareUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        title="Ver en YouTube"
                      >
                        <ExternalLink className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {((activeTab === 'all' && totalRequests === 0) ||
            (activeTab === 'musicadj' && totalSongs === 0) ||
            (activeTab === 'karaokeya' && totalKaraoke === 0)) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay pedidos en esta sección</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ParticipantDetailPage
