/**
 * KaraokeQueue - Vista de cola de karaoke del invitado (v1.4)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Mic2, Loader2, AlertCircle, Plus,
  Clock, Phone, Users, CheckCircle2, UserX, XCircle, Trash2
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useGuestStore } from '../stores/guestStore'
import { ClientHeader } from '../components/ClientHeader'
import { StarRating } from '../components/StarRating'
import { DifficultyBadge } from '../components/DifficultyBadge'
import * as api from '../services/api'
import type { KaraokeRequest, KaraokeRequestStatus } from '../types'
import { io, Socket } from 'socket.io-client'
import { useKaraokeNotifications } from '../hooks/useKaraokeNotifications'

// Badge component for status
function StatusBadge({ status }: { status: KaraokeRequestStatus }) {
  const config = {
    QUEUED: { icon: Clock, label: 'En Cola', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
    CALLED: { icon: Phone, label: '¡ES TU TURNO!', className: 'bg-green-500/20 text-green-300 border-green-500/50 animate-pulse' },
    ON_STAGE: { icon: Users, label: 'En Escenario', className: 'bg-purple-500/20 text-purple-300 border-purple-500/50' },
    COMPLETED: { icon: CheckCircle2, label: 'Completado', className: 'bg-green-500/20 text-green-300 border-green-500/50' },
    NO_SHOW: { icon: UserX, label: 'No Viniste', className: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
    CANCELLED: { icon: XCircle, label: 'Cancelado', className: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
  }

  const { icon: Icon, label, className } = config[status]

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3.5 h-3.5" />
      {label}
    </span>
  )
}

// Format date
function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)

  if (minutes < 1) return 'Hace un momento'
  if (minutes < 60) return `Hace ${minutes}m`
  if (minutes < 1440) return `Hace ${Math.floor(minutes / 60)}h`
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
}

export default function KaraokeQueue() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, loadEvent } = useEventStore()
  const { guest } = useGuestStore()

  const [requests, setRequests] = useState<KaraokeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [_socket, setSocket] = useState<Socket | null>(null)

  // Hook de notificaciones (100% gratis!)
  const { notifyYourTurn, requestPermission } = useKaraokeNotifications()

  // Solicitar permiso de notificaciones al cargar
  useEffect(() => {
    requestPermission()
  }, [])

  // Handler para cancelar un pedido
  const handleCancelRequest = async (requestId: string, title: string) => {
    if (!confirm(`¿Estás seguro que querés cancelar "${title}"?`)) {
      return
    }

    try {
      await api.deleteKaraokeRequest(event!.id, requestId, guest!.id)
      // El socket se encargará de actualizar la lista
    } catch (err) {
      console.error('Error al cancelar pedido:', err)
      alert('No se pudo cancelar el pedido. Intentá de nuevo.')
    }
  }

  // Cargar evento si no está
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Redirigir si no hay guest
  useEffect(() => {
    if (!guest) {
      navigate(`/e/${slug}/karaokeya`)
    }
  }, [guest, slug, navigate])

  // Cargar pedidos (cola pública)
  useEffect(() => {
    if (!guest || !event) return

    const fetchRequests = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.getPublicKaraokeQueue(event.id)
        setRequests(result.requests)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar cola')
      } finally {
        setLoading(false)
      }
    }

    fetchRequests()
  }, [guest, event])

  // Socket.io real-time updates
  useEffect(() => {
    if (!event || !guest) return

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl)

    newSocket.on('connect', () => {
      console.log('[Socket] Connected to real-time updates')
      newSocket.emit('join', `event:${event.id}`)
    })

    // Listen for request updates (todos los pedidos del evento)
    newSocket.on('karaokeya:request:updated', (updatedRequest: KaraokeRequest) => {
      setRequests((prev) => {
        const prevRequest = prev.find(r => r.id === updatedRequest.id)

        // Si es del usuario actual y cambió a CALLED, mostrar notificación!
        if (updatedRequest.guestId === guest.id && prevRequest && prevRequest.status !== 'CALLED' && updatedRequest.status === 'CALLED') {
          notifyYourTurn(updatedRequest.title, updatedRequest.artist || undefined)
        }

        // Si el pedido actualizado está en cola/llamado/escenario, actualizarlo
        if (['QUEUED', 'CALLED', 'ON_STAGE'].includes(updatedRequest.status)) {
          const exists = prev.find(r => r.id === updatedRequest.id)
          if (exists) {
            return prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
          } else {
            // Agregar si no estaba (cambió de otro estado a activo)
            return [...prev, updatedRequest].sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0))
          }
        } else {
          // Remover si cambió a otro estado (COMPLETED, CANCELLED, etc)
          return prev.filter((req) => req.id !== updatedRequest.id)
        }
      })
    })

    // Listen for new requests (todos los del evento)
    newSocket.on('karaokeya:request:new', (newRequest: KaraokeRequest) => {
      if (['QUEUED', 'CALLED', 'ON_STAGE'].includes(newRequest.status)) {
        setRequests((prev) => [...prev, newRequest].sort((a, b) => (a.queuePosition || 0) - (b.queuePosition || 0)))
      }
    })

    // Listen for deleted requests
    newSocket.on('karaokeya:request:deleted', (deletedId: string) => {
      setRequests((prev) => prev.filter((req) => req.id !== deletedId))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [event, guest, notifyYourTurn])

  if (!guest) {
    return null // Will redirect
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Check if any request is CALLED
  const hasCalledRequest = requests.some((r) => r.status === 'CALLED')

  return (
    <div className="min-h-screen pb-safe">
      <ClientHeader
        title="Cola del Evento"
        subtitle={event.name}
        showTurnNotification={false}
      />

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Banner "ES TU TURNO" */}
        {hasCalledRequest && (
          <div className="mb-4 p-4 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 border-2 border-green-400 rounded-xl animate-pulse">
            <div className="flex items-center gap-3">
              <Phone className="w-8 h-8 text-white animate-bounce" />
              <div>
                <p className="text-xl font-bold text-white">¡ES TU TURNO!</p>
                <p className="text-sm text-green-50">Acercate al escenario ahora</p>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        )}

        {/* Empty state */}
        {!loading && requests.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mic2 className="w-8 h-8 text-white/40" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No tenés temas en cola</h2>
            <p className="text-white/60 mb-6">
              Todavía no pediste ningún tema de karaoke en este evento
            </p>
            <button
              onClick={() => navigate(`/e/${slug}/karaokeya`)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Pedir un tema
            </button>
          </div>
        )}

        {/* Requests list */}
        {!loading && requests.length > 0 && (
          <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="card text-center">
                <p className="text-2xl font-bold text-yellow-400">
                  {requests.length}
                </p>
                <p className="text-xs text-white/60 mt-1">En Cola</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-primary-400">
                  {requests.filter((r) => r.guestId === guest.id).length}
                </p>
                <p className="text-xs text-white/60 mt-1">Tus Pedidos</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-purple-400">
                  {requests.filter((r) => r.status === 'ON_STAGE').length}
                </p>
                <p className="text-xs text-white/60 mt-1">En Escenario</p>
              </div>
            </div>

            {/* Requests */}
            <div className="space-y-3">
              {requests.map((request) => {
                const thumbnailUrl = request.song?.thumbnailUrl || null
                const youtubeShareUrl = request.song?.youtubeShareUrl || null
                const isMyRequest = request.guestId === guest.id

                return (
                  <div
                    key={request.id}
                    className={`card relative ${isMyRequest ? 'border-2 border-primary-500 bg-primary-500/10' : ''}`}
                  >
                    {/* Cancel button - only for user's own requests */}
                    {isMyRequest && (
                      <button
                        onClick={() => handleCancelRequest(request.id, request.title)}
                        className="absolute top-3 right-3 p-2 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors group"
                        title="Cancelar pedido"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 group-hover:text-red-300" />
                      </button>
                    )}

                    <div className="flex items-start gap-4">
                      {/* Thumbnail */}
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={request.title}
                          className="w-16 h-16 rounded-lg flex-shrink-0 object-cover"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Mic2 className="w-8 h-8 text-white/40" />
                        </div>
                      )}

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold truncate">{request.title}</p>
                          {request.turnNumber && (
                            <span className="bg-primary-500/20 text-primary-300 border border-primary-500/50 px-2.5 py-0.5 rounded-full text-xs font-bold flex-shrink-0">
                              #{request.turnNumber}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/60 truncate">
                          {request.artist || 'Artista desconocido'}
                        </p>
                        <p className="text-xs text-white/50 truncate mb-2">
                          Pedido por: {isMyRequest ? 'Vos' : (request.guest?.displayName || 'Invitado')}
                        </p>

                        {/* Rating + Difficulty */}
                        {request.song && (request.song.ranking || request.song.difficulty) && (
                          <div className="flex items-center gap-2 mb-2">
                            {request.song.ranking && <StarRating rating={request.song.ranking} size="sm" />}
                            {request.song.difficulty && <DifficultyBadge difficulty={request.song.difficulty} size="sm" />}
                          </div>
                        )}

                        {/* Opinion */}
                        {request.song?.opinion && (
                          <p className="text-xs text-white/50 italic mb-2 line-clamp-2">
                            "{request.song.opinion}"
                          </p>
                        )}
                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={request.status} />
                          {(request.status === 'QUEUED' || request.status === 'CALLED') && (
                            <span className="text-xs text-white/60 bg-white/5 px-2 py-0.5 rounded-full">
                              Posición: {request.queuePosition}
                            </span>
                          )}
                          <span className="text-xs text-white/40">
                            {formatDate(request.createdAt)}
                          </span>
                        </div>
                        {youtubeShareUrl && (
                          <a
                            href={youtubeShareUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-red-400 hover:text-red-300 mt-2"
                          >
                            Ver en YouTube →
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Message based on status */}
                    {request.status === 'QUEUED' && isMyRequest && (
                      <p className="mt-3 text-sm text-yellow-300 bg-yellow-500/10 px-3 py-2 rounded-lg">
                        Estás en la posición {request.queuePosition} de la cola
                      </p>
                    )}
                    {request.status === 'CALLED' && (
                      <p className="mt-3 text-sm text-green-300 bg-green-500/10 px-3 py-2 rounded-lg font-semibold animate-pulse">
                        ¡ES TU TURNO! Acercate al escenario
                      </p>
                    )}
                    {request.status === 'ON_STAGE' && (
                      <p className="mt-3 text-sm text-purple-300 bg-purple-500/10 px-3 py-2 rounded-lg">
                        ¡Estás cantando! 🎤
                      </p>
                    )}
                    {request.status === 'COMPLETED' && (
                      <p className="mt-3 text-sm text-green-300 bg-green-500/10 px-3 py-2 rounded-lg">
                        ¡Genial performance! 👏
                      </p>
                    )}
                    {request.status === 'NO_SHOW' && (
                      <p className="mt-3 text-sm text-orange-300 bg-orange-500/10 px-3 py-2 rounded-lg">
                        No viniste cuando te llamaron
                      </p>
                    )}
                    {request.status === 'CANCELLED' && (
                      <p className="mt-3 text-sm text-gray-400 bg-gray-500/10 px-3 py-2 rounded-lg">
                        Tu pedido fue cancelado
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add another button */}
            <button
              onClick={() => navigate(`/e/${slug}/karaokeya`)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Pedir otro tema
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
