import { useState } from 'react'
import { X, Upload, Music, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'
import { musicadjApi } from '@/lib/api'

interface ImportPlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  eventId: string
  onSuccess: () => void
}

export function ImportPlaylistModal({ isOpen, onClose, eventId, onSuccess }: ImportPlaylistModalProps) {
  const [playlistUrl, setPlaylistUrl] = useState('')
  const [createRequests, setCreateRequests] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ playlistName: string; tracksCount: number } | null>(null)

  // Extract Spotify playlist ID from URL
  const extractPlaylistId = (url: string): string | null => {
    // Formatos soportados:
    // https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M
    // spotify:playlist:37i9dQZF1DXcBWIGoYBM5M
    const match = url.match(/playlist[:/]([a-zA-Z0-9]+)/)
    return match ? match[1] : null
  }

  const handleImport = async () => {
    setError(null)
    setSuccess(null)

    const playlistId = extractPlaylistId(playlistUrl)

    if (!playlistId) {
      setError('URL de playlist inválida. Pega el enlace de una playlist de Spotify.')
      return
    }

    setIsImporting(true)

    try {
      const result = await musicadjApi.importPlaylist(eventId, {
        spotifyPlaylistId: playlistId,
        createRequests,
      })

      setSuccess({
        playlistName: result.data.playlist.name,
        tracksCount: result.data.tracksCount,
      })

      // Reload data after 2 seconds
      setTimeout(() => {
        onSuccess()
        handleClose()
      }, 2000)
    } catch (err: any) {
      console.error('Error importing playlist:', err)
      setError(err.response?.data?.error || 'Error al importar la playlist')
    } finally {
      setIsImporting(false)
    }
  }

  const handleClose = () => {
    setPlaylistUrl('')
    setCreateRequests(false)
    setError(null)
    setSuccess(null)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Music className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Importar Playlist de Spotify</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Success Message */}
          {success && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">
                  Playlist importada exitosamente
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {success.playlistName} - {success.tracksCount} canciones
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Playlist URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de la Playlist de Spotify
            </label>
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              disabled={isImporting || !!success}
              placeholder="https://open.spotify.com/playlist/..."
              className={clsx(
                'w-full px-4 py-3 border rounded-lg outline-none transition-all',
                'focus:ring-2 focus:ring-green-500 focus:border-green-500',
                'disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed',
                error ? 'border-red-300' : 'border-gray-300'
              )}
            />
            <p className="mt-2 text-sm text-gray-500">
              Pega el enlace de una playlist pública de Spotify
            </p>
          </div>

          {/* Create Requests Option */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              id="createRequests"
              checked={createRequests}
              onChange={(e) => setCreateRequests(e.target.checked)}
              disabled={isImporting || !!success}
              className="mt-1 w-4 h-4 text-green-600 bg-white border-gray-300 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50"
            />
            <label htmlFor="createRequests" className="flex-1 cursor-pointer">
              <p className="text-sm font-medium text-gray-900">
                Crear pedidos automáticamente
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Las canciones de la playlist se agregarán como pedidos pendientes
              </p>
            </label>
          </div>

          {/* Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Nota:</strong> Las playlists privadas no pueden ser importadas. Asegúrate de que la playlist sea pública.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
          <button
            onClick={handleClose}
            disabled={isImporting}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleImport}
            disabled={isImporting || !!success || !playlistUrl.trim()}
            className={clsx(
              'px-6 py-2 bg-green-600 text-white rounded-lg font-medium transition-all',
              'hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'flex items-center gap-2'
            )}
          >
            {isImporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Importar Playlist
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
