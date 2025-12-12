/**
 * MyRequests - Vista de pedidos del invitado (v1.3)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Music2, Loader2, AlertCircle, Plus,
  Clock, Star, Zap, CheckCircle2, XCircle
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useGuestStore } from '../stores/guestStore'
import { ClientHeader } from '../components/ClientHeader'
import * as api from '../services/api'
import type { SongRequest, SongRequestStatus } from '../types'
import { io, Socket } from 'socket.io-client'

// Badge component for status
function StatusBadge({ status }: { status: SongRequestStatus }) {
  const config = {
    PENDING: { icon: Clock, label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/50' },
    HIGHLIGHTED: { icon: Star, label: 'Destacado', className: 'bg-blue-500/20 text-blue-300 border-blue-500/50' },
    URGENT: { icon: Zap, label: 'Urgente', className: 'bg-orange-500/20 text-orange-300 border-orange-500/50' },
    PLAYED: { icon: CheckCircle2, label: 'Reproducido', className: 'bg-green-500/20 text-green-300 border-green-500/50' },
    DISCARDED: { icon: XCircle, label: 'Descartado', className: 'bg-gray-500/20 text-gray-300 border-gray-500/50' },
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

export default function MyRequests() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, loadEvent } = useEventStore()
  const { guest } = useGuestStore()

  const [requests, setRequests] = useState<SongRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [socket, setSocket] = useState<Socket | null>(null)

  // Cargar evento si no está
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Redirigir si no hay guest
  useEffect(() => {
    if (!guest) {
      navigate(`/e/${slug}/musicadj`)
    }
  }, [guest, slug, navigate])

  // Cargar pedidos
  useEffect(() => {
    if (!guest || !event) return

    const fetchRequests = async () => {
      setLoading(true)
      setError(null)

      try {
        const result = await api.getGuestRequests(guest.id, event.id)
        setRequests(result.requests.songs)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
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

    // Listen for request updates
    newSocket.on('musicadj:requestUpdated', (updatedRequest: SongRequest) => {
      if (updatedRequest.guestId === guest.id) {
        setRequests((prev) =>
          prev.map((req) => (req.id === updatedRequest.id ? updatedRequest : req))
        )
      }
    })

    // Listen for new requests (in case user requests from another device)
    newSocket.on('musicadj:newRequest', (newRequest: SongRequest) => {
      if (newRequest.guestId === guest.id) {
        setRequests((prev) => [newRequest, ...prev])
      }
    })

    // Listen for deleted requests
    newSocket.on('musicadj:requestDeleted', (deletedId: string) => {
      setRequests((prev) => prev.filter((req) => req.id !== deletedId))
    })

    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [event, guest])

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

  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <ClientHeader title="Mis Pedidos" subtitle={event?.name} />

      <main className="max-w-lg mx-auto px-4 py-6">
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
              <Music2 className="w-8 h-8 text-white/40" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No tenés pedidos</h2>
            <p className="text-white/60 mb-6">
              Todavía no pediste ningún tema en este evento
            </p>
            <button
              onClick={() => navigate(`/e/${slug}/musicadj`)}
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
                <p className="text-2xl font-bold text-white">
                  {requests.filter((r) => r.status === 'PENDING' || r.status === 'HIGHLIGHTED' || r.status === 'URGENT').length}
                </p>
                <p className="text-xs text-white/60 mt-1">Pendientes</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-green-400">
                  {requests.filter((r) => r.status === 'PLAYED').length}
                </p>
                <p className="text-xs text-white/60 mt-1">Reproducidos</p>
              </div>
              <div className="card text-center">
                <p className="text-2xl font-bold text-white/40">
                  {requests.length}
                </p>
                <p className="text-xs text-white/60 mt-1">Total</p>
              </div>
            </div>

            {/* Requests */}
            <div className="space-y-3">
              {requests.map((request) => (
                <div key={request.id} className="card">
                  <div className="flex items-start gap-4">
                    {/* Album art */}
                    {request.albumArtUrl ? (
                      <img
                        src={request.albumArtUrl}
                        alt={request.title}
                        className="w-16 h-16 rounded-lg flex-shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Music2 className="w-8 h-8 text-white/40" />
                      </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{request.title}</p>
                      <p className="text-sm text-white/60 truncate mb-2">
                        {request.artist}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={request.status} />
                        <span className="text-xs text-white/40">
                          {formatDate(request.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Message based on status */}
                  {request.status === 'HIGHLIGHTED' && (
                    <p className="mt-3 text-sm text-blue-300 bg-blue-500/10 px-3 py-2 rounded-lg">
                      El DJ destacó tu pedido
                    </p>
                  )}
                  {request.status === 'URGENT' && (
                    <p className="mt-3 text-sm text-orange-300 bg-orange-500/10 px-3 py-2 rounded-lg">
                      ¡Tu pedido está marcado como urgente!
                    </p>
                  )}
                  {request.status === 'PLAYED' && (
                    <p className="mt-3 text-sm text-green-300 bg-green-500/10 px-3 py-2 rounded-lg">
                      Este tema ya fue reproducido
                    </p>
                  )}
                  {request.status === 'DISCARDED' && (
                    <p className="mt-3 text-sm text-gray-400 bg-gray-500/10 px-3 py-2 rounded-lg">
                      Este pedido fue descartado por el DJ
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Add another button */}
            <button
              onClick={() => navigate(`/e/${slug}/musicadj`)}
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
