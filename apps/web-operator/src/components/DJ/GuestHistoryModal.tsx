import { useEffect, useState } from 'react'
import { X, Music, Mic2, Clock, Calendar } from 'lucide-react'
import { djApi } from '@/lib/api'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface GuestHistoryModalProps {
  guestId: string | null
  isOpen: boolean
  onClose: () => void
}

interface HistoryItem {
  id: string
  type: 'musicadj' | 'karaokeya'
  title: string
  artist?: string
  status: string
  createdAt: string
  eventName?: string
}

interface GuestHistoryResponse {
  guest: {
    id: string
    displayName: string
    email: string
  }
  history: {
    musicRequests: Array<{
      id: string
      title: string
      artist: string
      status: string
      createdAt: string
      event: {
        eventData: {
          eventName: string
        }
      }
    }>
    karaokeRequests: Array<{
      id: string
      title: string
      artist: string | null
      status: string
      createdAt: string
      event: {
        eventData: {
          eventName: string
        }
      }
    }>
  }
}

const statusLabels: Record<string, string> = {
  PENDING: 'Pendiente',
  HIGHLIGHTED: 'Destacado',
  URGENT: 'Urgente',
  PLAYED: 'Reproducido',
  DISCARDED: 'Descartado',
  QUEUED: 'En Cola',
  CALLED: 'Llamado',
  ON_STAGE: 'En Escenario',
  COMPLETED: 'Completado',
  NO_SHOW: 'No vino',
  CANCELLED: 'Cancelado',
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-gray-100 text-gray-800',
  HIGHLIGHTED: 'bg-yellow-100 text-yellow-800',
  URGENT: 'bg-red-100 text-red-800',
  PLAYED: 'bg-green-100 text-green-800',
  DISCARDED: 'bg-gray-100 text-gray-500',
  QUEUED: 'bg-blue-100 text-blue-800',
  CALLED: 'bg-yellow-100 text-yellow-800',
  ON_STAGE: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  NO_SHOW: 'bg-red-100 text-red-800',
  CANCELLED: 'bg-gray-100 text-gray-500',
}

export function GuestHistoryModal({ guestId, isOpen, onClose }: GuestHistoryModalProps) {
  const [loading, setLoading] = useState(false)
  const [guest, setGuest] = useState<{ displayName: string; email: string } | null>(null)
  const [items, setItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    if (isOpen && guestId) {
      loadHistory()
    }
  }, [isOpen, guestId])

  const loadHistory = async () => {
    if (!guestId) return

    setLoading(true)
    try {
      const res = await djApi.getGuestHistory(guestId)
      const data = res.data as GuestHistoryResponse

      setGuest({
        displayName: data.guest.displayName,
        email: data.guest.email,
      })

      // Combine and sort all requests
      const combined: HistoryItem[] = [
        ...data.history.musicRequests.map((req) => ({
          id: req.id,
          type: 'musicadj' as const,
          title: req.title,
          artist: req.artist,
          status: req.status,
          createdAt: req.createdAt,
          eventName: req.event?.eventData?.eventName,
        })),
        ...data.history.karaokeRequests.map((req) => ({
          id: req.id,
          type: 'karaokeya' as const,
          title: req.title,
          artist: req.artist || undefined,
          status: req.status,
          createdAt: req.createdAt,
          eventName: req.event?.eventData?.eventName,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

      setItems(combined)
    } catch (error) {
      console.error('Error loading guest history:', error)
    } finally {
      setLoading(false)
    }
  }

  // Group items by date
  const groupedItems = items.reduce((acc, item) => {
    const date = format(new Date(item.createdAt), 'yyyy-MM-dd')
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(item)
    return acc
  }, {} as Record<string, HistoryItem[]>)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />

        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="text-white">
              <h2 className="text-xl font-bold">Historial del invitado</h2>
              {guest && (
                <div className="mt-1">
                  <p className="text-sm font-medium">{guest.displayName}</p>
                  <p className="text-xs text-white/80">{guest.email}</p>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[60vh] overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No hay historial disponible</p>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(groupedItems).map(([date, dateItems]) => (
                  <div key={date}>
                    {/* Date Header */}
                    <div className="flex items-center gap-2 mb-3 text-sm font-medium text-gray-700">
                      <Calendar className="w-4 h-4" />
                      <span>{format(new Date(date), "d 'de' MMMM, yyyy", { locale: es })}</span>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {dateItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-start gap-3">
                            {/* Icon */}
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                item.type === 'musicadj'
                                  ? 'bg-gradient-to-br from-purple-400 to-pink-400'
                                  : 'bg-gradient-to-br from-indigo-400 to-purple-400'
                              }`}
                            >
                              {item.type === 'musicadj' ? (
                                <Music className="w-5 h-5 text-white" />
                              ) : (
                                <Mic2 className="w-5 h-5 text-white" />
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <div className="min-w-0 flex-1">
                                  <h4 className="font-semibold text-gray-900 truncate">
                                    {item.title}
                                  </h4>
                                  {item.artist && (
                                    <p className="text-sm text-gray-600 truncate">{item.artist}</p>
                                  )}
                                </div>
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                                    statusColors[item.status] || 'bg-gray-100 text-gray-800'
                                  }`}
                                >
                                  {statusLabels[item.status] || item.status}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  <span>
                                    {formatDistanceToNow(new Date(item.createdAt), {
                                      addSuffix: true,
                                      locale: es,
                                    })}
                                  </span>
                                </div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 font-medium">
                                  {item.type === 'musicadj' ? 'MUSICADJ' : 'KARAOKEYA'}
                                </span>
                                {item.eventName && (
                                  <span className="truncate">{item.eventName}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
