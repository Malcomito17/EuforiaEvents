import { useState } from 'react'
import { Mic2, Clock, User, Eye, Hash } from 'lucide-react'
import { KaraokeRequest, KaraokeRequestStatus } from '@/lib/api'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface DJKaraokeCardProps {
  request: KaraokeRequest
  onStatusChange: (requestId: string, newStatus: KaraokeRequestStatus) => void
  onViewHistory: (guestId: string) => void
}

const statusConfig: Record<KaraokeRequestStatus, { label: string; color: string; next?: KaraokeRequestStatus }> = {
  QUEUED: { label: 'En Cola', color: 'bg-blue-100 text-blue-800', next: 'CALLED' },
  CALLED: { label: 'Llamado', color: 'bg-yellow-100 text-yellow-800', next: 'ON_STAGE' },
  ON_STAGE: { label: 'En Escenario', color: 'bg-purple-100 text-purple-800', next: 'COMPLETED' },
  COMPLETED: { label: 'Completado', color: 'bg-green-100 text-green-800' },
  NO_SHOW: { label: 'No se presentó', color: 'bg-red-100 text-red-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500' },
}

export function DJKaraokeCard({ request, onStatusChange, onViewHistory }: DJKaraokeCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const config = statusConfig[request.status]

  const handleStatusChange = async (newStatus: KaraokeRequestStatus) => {
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
      {/* Header */}
      <div className="flex gap-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50">
        {request.song?.thumbnailUrl ? (
          <img
            src={request.song.thumbnailUrl}
            alt={request.title}
            className="w-16 h-16 rounded-lg object-cover shadow-sm"
          />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center">
            <Mic2 className="w-8 h-8 text-white" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-sm">
              #{request.turnNumber}
            </span>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 truncate">{request.title}</h3>
          <p className="text-sm text-gray-600 truncate">{request.artist || 'Artista desconocido'}</p>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <User className="w-4 h-4" />
          <span className="font-medium">{request.guest.displayName}</span>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{timeAgo}</span>
          </div>
          <div className="flex items-center gap-1 text-indigo-600 font-medium">
            <Hash className="w-4 h-4" />
            <span>Pos: {request.queuePosition}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          {/* Next Status Button */}
          {config.next && (
            <button
              onClick={() => handleStatusChange(config.next!)}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              {isUpdating ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>{statusConfig[config.next].label}</span>
              )}
            </button>
          )}

          {/* No Show Button (only if queued or called) */}
          {(request.status === 'QUEUED' || request.status === 'CALLED') && (
            <button
              onClick={() => handleStatusChange('NO_SHOW')}
              disabled={isUpdating}
              className="px-4 py-3 border-2 border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              No vino
            </button>
          )}

          {/* Cancel Button (only if not completed) */}
          {request.status !== 'COMPLETED' && request.status !== 'CANCELLED' && request.status !== 'NO_SHOW' && (
            <button
              onClick={() => handleStatusChange('CANCELLED')}
              disabled={isUpdating}
              className="px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
            >
              Cancelar
            </button>
          )}

          {/* View History Button */}
          <button
            onClick={() => onViewHistory(request.guestId)}
            className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-indigo-300 text-indigo-700 rounded-lg font-medium hover:bg-indigo-50 transition-all min-h-[48px] ${
              config.next ? '' : 'col-span-2'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Historial</span>
          </button>
        </div>

        {/* Quick Status Buttons (if completed, no_show or cancelled, show options to undo) */}
        {(request.status === 'COMPLETED' || request.status === 'NO_SHOW' || request.status === 'CANCELLED') && (
          <div className="pt-2 border-t border-gray-200 grid grid-cols-2 gap-2">
            <button
              onClick={() => handleStatusChange('QUEUED')}
              disabled={isUpdating}
              className="px-3 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Regresar a Cola
            </button>
            <button
              onClick={() => handleStatusChange('CALLED')}
              disabled={isUpdating}
              className="px-3 py-2 text-sm border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-all disabled:opacity-50"
            >
              Llamar de Nuevo
            </button>
          </div>
        )}

        {/* YouTube Link (if available) */}
        {request.song?.youtubeShareUrl && (
          <a
            href={request.song.youtubeShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center px-4 py-2 mt-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
          >
            Abrir en YouTube
          </a>
        )}
      </div>
    </div>
  )
}
