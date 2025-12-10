/**
 * MusicaDJRequest - Identificación + Pedido musical (v1.3)
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Search, ArrowLeft, Music2, Loader2, AlertCircle,
  Check, X, User, Mail
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useGuestStore } from '../stores/guestStore'
import * as api from '../services/api'
import type { SpotifyTrack, CreateSongRequestInput } from '../types'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function MusicaDJRequest() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, musicadjConfig, loadEvent } = useEventStore()
  const { guest, isIdentifying, identifyGuest } = useGuestStore()

  // Estados de identificación
  const [showIdentification, setShowIdentification] = useState(!guest)
  const [identEmail, setIdentEmail] = useState('')
  const [identName, setIdentName] = useState('')
  const [identWhatsapp, setIdentWhatsapp] = useState('')
  const [identError, setIdentError] = useState<string | null>(null)

  // Estados de búsqueda
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SpotifyTrack[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null)

  // Estados del formulario
  const [manualMode, setManualMode] = useState(false)
  const [manualTitle, setManualTitle] = useState('')
  const [manualArtist, setManualArtist] = useState('')

  // Estados de envío
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debouncedQuery = useDebounce(searchQuery, 400)

  // Cargar evento si no está
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Verificar si hay guest al montar
  useEffect(() => {
    if (guest) {
      setShowIdentification(false)
    }
  }, [guest])

  // Manejar identificación
  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIdentError(null)

    try {
      await identifyGuest(identEmail, identName, identWhatsapp || undefined)
      setShowIdentification(false)
    } catch (err) {
      setIdentError(err instanceof Error ? err.message : 'Error al identificarse')
    }
  }

  // Buscar en Spotify
  const searchSpotify = useCallback(async (query: string) => {
    if (!event || !query.trim() || !musicadjConfig?.spotifyAvailable) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const result = await api.searchSpotify(event.id, query)
      setSearchResults(result.tracks)
    } catch (err) {
      console.error('Error buscando:', err)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }, [event, musicadjConfig])

  // Efecto de búsqueda con debounce
  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchSpotify(debouncedQuery)
    } else {
      setSearchResults([])
    }
  }, [debouncedQuery, searchSpotify])

  // Seleccionar track
  const handleSelectTrack = (track: SpotifyTrack) => {
    setSelectedTrack(track)
    setSearchQuery('')
    setSearchResults([])
    setManualMode(false)
  }

  // Limpiar selección
  const handleClearSelection = () => {
    setSelectedTrack(null)
    setManualTitle('')
    setManualArtist('')
  }

  // Enviar pedido
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !guest) return

    const input: CreateSongRequestInput = {
      guestId: guest.id,
      ...(selectedTrack ? {
        spotifyId: selectedTrack.id,
        title: selectedTrack.name,
        artist: selectedTrack.artists.join(', '),
        albumArtUrl: selectedTrack.albumArtUrl || undefined,
      } : {
        title: manualTitle.trim(),
        artist: manualArtist.trim(),
      }),
    }

    setSubmitting(true)
    setError(null)

    try {
      await api.createSongRequest(event.id, input)
      navigate(`/e/${slug}/musicadj/success`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar pedido')
    } finally {
      setSubmitting(false)
    }
  }

  // Validar formulario
  const isValid = selectedTrack || (manualTitle.trim() && manualArtist.trim())

  if (!event || !musicadjConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Mostrar form de identificación
  if (showIdentification || !guest) {
    return (
      <div className="min-h-screen pb-safe">
        {/* Header */}
        <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 z-10">
          <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
            <button
              onClick={() => navigate(`/e/${slug}`)}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="font-semibold">Identificación</h1>
              <p className="text-xs text-white/60">{event.name}</p>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto px-4 py-8">
          {/* Logo corporativo */}
          <div className="text-center mb-8">
            <img
              src="/logo-euforia.png"
              alt="Euforia Events"
              className="h-32 mx-auto mb-8 opacity-90"
            />
          </div>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary-400" />
            </div>
            <h2 className="text-2xl font-bold mb-2">¡Bienvenido!</h2>
            <p className="text-white/70">
              Para pedir tu tema, necesitamos que te identifiques
            </p>
          </div>

          {/* Error */}
          {identError && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-200">{identError}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleIdentify} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                Email *
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  value={identEmail}
                  onChange={(e) => setIdentEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="input-field pl-12"
                  required
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-white/50 mt-1">
                Usaremos tu email para reconocerte en futuros eventos
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                Tu nombre *
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="text"
                  value={identName}
                  onChange={(e) => setIdentName(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="input-field pl-12"
                  required
                  autoComplete="name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-white/80">
                WhatsApp (opcional)
              </label>
              <input
                type="tel"
                value={identWhatsapp}
                onChange={(e) => setIdentWhatsapp(e.target.value)}
                placeholder="+54 9 2901 123456"
                className="input-field"
                autoComplete="tel"
              />
            </div>

            <button
              type="submit"
              disabled={isIdentifying || !identEmail.trim() || !identName.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isIdentifying ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Identificando...
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  Continuar
                </>
              )}
            </button>
          </form>
        </main>
      </div>
    )
  }

  // Form de pedido (ya identificado)
  return (
    <div className="min-h-screen pb-safe">
      {/* Header */}
      <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">Pedí tu tema</h1>
            <p className="text-xs text-white/60">
              {guest.displayName} • {event.name}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Error global */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Track seleccionado */}
        {selectedTrack && (
          <div className="mb-6 card">
            <div className="flex items-center gap-4">
              {selectedTrack.albumArtUrl ? (
                <img
                  src={selectedTrack.albumArtUrl}
                  alt={selectedTrack.album}
                  className="w-16 h-16 rounded-lg"
                />
              ) : (
                <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center">
                  <Music2 className="w-8 h-8 text-white/40" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{selectedTrack.name}</p>
                <p className="text-sm text-white/60 truncate">
                  {selectedTrack.artists.join(', ')}
                </p>
              </div>
              <button
                onClick={handleClearSelection}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Búsqueda o entrada manual */}
        {!selectedTrack && (
          <div className="mb-6">
            {/* Tabs */}
            {musicadjConfig.allowWithoutSpotify && musicadjConfig.spotifyAvailable && (
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setManualMode(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    !manualMode ? 'bg-primary-600 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Buscar en Spotify
                </button>
                <button
                  onClick={() => setManualMode(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    manualMode ? 'bg-primary-600 text-white' : 'bg-white/10 text-white/70'
                  }`}
                >
                  Escribir manualmente
                </button>
              </div>
            )}

            {/* Búsqueda Spotify */}
            {!manualMode && musicadjConfig.spotifyAvailable && (
              <div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar canción o artista..."
                    className="input-field pl-12"
                    autoComplete="off"
                  />
                  {searching && (
                    <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-white/40" />
                  )}
                </div>

                {/* Resultados */}
                {searchResults.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-80 overflow-y-auto">
                    {searchResults.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => handleSelectTrack(track)}
                        className="w-full p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center gap-3 text-left transition-colors"
                      >
                        {track.albumArtUrl ? (
                          <img
                            src={track.albumArtUrl}
                            alt={track.album}
                            className="w-12 h-12 rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center">
                            <Music2 className="w-6 h-6 text-white/40" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.name}</p>
                          <p className="text-sm text-white/60 truncate">
                            {track.artists.join(', ')}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="mt-3 text-center text-white/50 text-sm">
                    No se encontraron resultados
                  </p>
                )}
              </div>
            )}

            {/* Entrada manual */}
            {(manualMode || !musicadjConfig.spotifyAvailable) && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">
                    Nombre del tema *
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej: Blinding Lights"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-white/70">
                    Artista *
                  </label>
                  <input
                    type="text"
                    value={manualArtist}
                    onChange={(e) => setManualArtist(e.target.value)}
                    placeholder="Ej: The Weeknd"
                    className="input-field"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botón enviar */}
        <form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Enviando pedido...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Enviar pedido
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
