import { useState } from 'react'
import { Music, Clock, User, Eye } from 'lucide-react'
import { SongRequest, SongRequestStatus } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DJRequestCardProps {
  request: SongRequest
  onStatusChange: (requestId: string, newStatus: SongRequestStatus) => void
  onViewHistory: (guestId: string) => void
}

const statusConfig: Record<SongRequestStatus, { label: string; color: string; next?: SongRequestStatus }> = {
  PENDING: { label: 'Pendiente', color: 'bg-gray-100 text-gray-800', next: 'HIGHLIGHTED' },
  HIGHLIGHTED: { label: 'Destacado', color: 'bg-yellow-100 text-yellow-800', next: 'URGENT' },
  URGENT: { label: 'Urgente', color: 'bg-red-100 text-red-800', next: 'PLAYED' },
  PLAYED: { label: 'Reproducido', color: 'bg-green-100 text-green-800' },
  DISCARDED: { label: 'Descartado', color: 'bg-gray-100 text-gray-500' },
}

export function DJRequestCard({ request, onStatusChange, onViewHistory }: DJRequestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const config = statusConfig[request.status]

  const handleStatusChange = async (newStatus: SongRequestStatus) => {
    setIsUpdating(true)
    try {
      await onStatusChange(request.id, newStatus)
    } finally {
      setIsUpdating(false)
    }
  }

  const timeAgo = formatDistanceToNow(new Date(request.createdAt), {
    addSuffix: true,
    locale: es,
  })

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Album Art / Header */}
      <div className="flex gap-3 p-4 bg-gradient-to-r from-purple-50 to-pink-50">
        {request.albumArtUrl ? (
          <img
            src={request.albumArtUrl}
            alt={request.title}
            className="w-16 h-16 rounded-lg object-cover shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
            <Music className="w-8 h-8 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate">{request.title}</h3>
          <p className="text-sm text-gray-600 truncate">{request.artist}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{request.guest.displayName}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{timeAgo}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Next Status Button */}
          {config.next && (
            <button
              onClick={() => handleStatusChange(config.next!)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{statusConfig[config.next].label}</span>
              )}
            </button>
          )}

          {/* Discard Button (only if not played) */}
          {request.status !== 'PLAYED' && request.status !== 'DISCARDED' && (
            <button
              onClick={() => handleStatusChange('DISCARDED')}
              disabled={isUpdating}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              Descartar
            </button>
          )}

          {/* View History Button */}
          <button
            onClick={() => onViewHistory(request.guestId)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-all min-h-[48px] ${
              config.next ? '' : 'col-span-2'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Historial</span>
          </button>
        </div>

        {/* Quick Status Buttons (if played or discarded, show options to undo) */}
        {(request.status === 'PLAYED' || request.status === 'DISCARDED') && (
          <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange('PENDING')}
              disabled={isUpdating}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Regresar a Pendiente
            </button>
            <button
              onClick={() => handleStatusChange('URGENT')}
              disabled={isUpdating}
              className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all disabled:opacity-50"
            >
              Marcar Urgente
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
