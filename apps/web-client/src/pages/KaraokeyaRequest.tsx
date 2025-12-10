/**
 * KaraokeyaRequest - Búsqueda híbrida + Pedido de karaoke (v1.4)
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, Mic2, Star, Play, User, Mail, ArrowLeft } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useGuestStore } from '../stores/guestStore'
import { Footer } from '../components/Footer'
import { StarRating } from '../components/StarRating'
import { DifficultyBadge } from '../components/DifficultyBadge'
import { LikeButton } from '../components/LikeButton'
import * as api from '../services/api'
import type { YouTubeVideo, CatalogSong, CreateKaraokeRequestInput } from '../types'

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}

export default function KaraokeyaRequest() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, loadEvent } = useEventStore()
  const { guest, isIdentifying, identifyGuest } = useGuestStore()

  const [showIdentification, setShowIdentification] = useState(!guest)
  const [identEmail, setIdentEmail] = useState('')
  const [identName, setIdentName] = useState('')
  const [identError, setIdentError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [catalogResults, setCatalogResults] = useState<CatalogSong[]>([])
  const [youtubeResults, setYoutubeResults] = useState<YouTubeVideo[]>([])
  const [suggestions, setSuggestions] = useState<CatalogSong[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedSong, setSelectedSong] = useState<YouTubeVideo | CatalogSong | null>(null)
  const [config, setConfig] = useState<any>(null)

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [likeStatuses, setLikeStatuses] = useState<Record<string, boolean>>({})

  const debouncedQuery = useDebounce(searchQuery, 500)

  useEffect(() => {
    if (slug && !event) loadEvent(slug)
  }, [slug, event, loadEvent])

  useEffect(() => {
    if (event) {
      api.getKaraokeyaConfig(event.id).then(setConfig)
      // Usar sugerencias inteligentes en vez de solo populares
      api.getSmartSuggestions(event.id, guest?.id, 5).then(res => {
        setSuggestions(res.suggestions)

        // Cargar estados de likes para las sugerencias
        if (guest && res.suggestions.length > 0) {
          const songIds = res.suggestions
            .map(s => s.catalogId || s.id)
            .filter(Boolean) as string[]
          api.batchGetLikeStatuses(songIds, guest.id)
            .then(setLikeStatuses)
            .catch(console.error)
        }
      })
    }
  }, [event, guest])

  useEffect(() => {
    if (guest) setShowIdentification(false)
  }, [guest])

  const handleIdentify = async (e: React.FormEvent) => {
    e.preventDefault()
    setIdentError(null)
    try {
      await identifyGuest(identEmail, identName)
      setShowIdentification(false)
    } catch (err) {
      setIdentError(err instanceof Error ? err.message : 'Error al identificarse')
    }
  }

  const searchKaraoke = useCallback(async (query: string) => {
    if (!event || !query.trim()) {
      setCatalogResults([])
      setYoutubeResults([])
      return
    }

    setSearching(true)
    try {
      const result = await api.searchKaraoke(event.id, query)
      setCatalogResults(result.fromCatalog)
      setYoutubeResults(result.fromYouTube)
    } catch (err) {
      console.error('Error buscando:', err)
      setCatalogResults([])
      setYoutubeResults([])
    } finally {
      setSearching(false)
    }
  }, [event])

  useEffect(() => {
    if (debouncedQuery.length >= 2) {
      searchKaraoke(debouncedQuery)
    } else {
      setCatalogResults([])
      setYoutubeResults([])
    }
  }, [debouncedQuery, searchKaraoke])

  const handleSelectSong = (song: YouTubeVideo | CatalogSong) => {
    setSelectedSong(song)
    setSearchQuery('')
    setCatalogResults([])
    setYoutubeResults([])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !guest || !selectedSong) return

    const input: CreateKaraokeRequestInput = {
      guestId: guest.id,
      ...('catalogId' in selectedSong ? { songId: selectedSong.catalogId } : { youtubeId: selectedSong.youtubeId }),
      title: selectedSong.title,
      artist: selectedSong.artist,
    }

    setSubmitting(true)
    setError(null)

    try {
      await api.createKaraokeRequest(event.id, input)
      navigate(`/e/${slug}/karaokeya/mi-cola`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar pedido')
      setSubmitting(false)
    }
  }

  if (showIdentification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          {/* Logo corporativo */}
          <div className="text-center mb-8">
            <img
              src="/logo-euforia.png"
              alt="Euforia Events"
              className="h-32 mx-auto mb-6"
            />
          </div>

          <div className="text-center mb-6">
            <Mic2 className="w-16 h-16 text-purple-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900">¡Cantá tu tema!</h1>
            <p className="text-gray-600 mt-2">Identificate para pedir tu karaoke</p>
          </div>

          <form onSubmit={handleIdentify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input type="email" required value={identEmail} onChange={e => setIdentEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tu nombre artístico</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input type="text" required value={identName} onChange={e => setIdentName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500" />
              </div>
            </div>

            {identError && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{identError}</div>
            )}

            <button type="submit" disabled={isIdentifying}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
              {isIdentifying ? 'Identificando...' : 'Continuar'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-600 to-red-600">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          {/* Back button */}
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="mb-4 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Volver al inicio</span>
          </button>

          <div className="text-center mb-6">
            <Mic2 className="w-12 h-12 text-purple-600 mx-auto mb-3" />
            <h1 className="text-2xl font-bold text-gray-900">Buscá tu tema de karaoke</h1>
            <p className="text-gray-600 text-sm mt-1">Hola, {guest?.displayName}</p>
          </div>

          {!selectedSong ? (
            <>
              <div className="relative mb-4">
                <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Nombre de la canción o artista..." autoFocus
                  className="w-full pl-12 pr-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none" />
              </div>

              {searching && <div className="text-center py-8 text-gray-500">Buscando en YouTube...</div>}

              {!searching && catalogResults.length > 0 && (
                <div className="mb-4">
                  <div className="text-sm font-semibold text-purple-700 mb-2 flex items-center gap-1">
                    <Star className="w-4 h-4 fill-purple-700" />
                    Otras estrellas eligieron anteriormente
                  </div>
                  <div className="space-y-2">
                    {catalogResults.map(song => (
                      <button key={song.catalogId} onClick={() => handleSelectSong(song)}
                        className="w-full flex items-center gap-3 p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition text-left border border-purple-200">
                        {song.thumbnailUrl && <img src={song.thumbnailUrl} alt="" className="w-16 h-16 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                          <div className="text-sm text-gray-600 truncate">{song.artist}</div>

                          {/* Rating + Difficulty */}
                          <div className="flex items-center gap-2 mt-1">
                            {song.ranking && <StarRating rating={song.ranking} size="sm" />}
                            {song.difficulty && <DifficultyBadge difficulty={song.difficulty as any} size="sm" />}
                          </div>

                          {/* Opinion */}
                          {song.opinion && (
                            <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                              "{song.opinion}"
                            </p>
                          )}

                          <div className="text-xs text-purple-600 mt-1">{song.timesRequested} veces pedida</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!searching && youtubeResults.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2">Desde YouTube</div>
                  <div className="space-y-2">
                    {youtubeResults.map(song => (
                      <button key={song.youtubeId} onClick={() => handleSelectSong(song)}
                        className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left border border-gray-200">
                        {song.thumbnailUrl && <img src={song.thumbnailUrl} alt="" className="w-16 h-16 rounded object-cover" />}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                          <div className="text-sm text-gray-600 truncate">{song.artist}</div>
                        </div>
                        <Play className="w-5 h-5 text-gray-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {!searching && searchQuery.length >= 2 && catalogResults.length === 0 && youtubeResults.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No encontramos ese tema. Probá con otro nombre.
                </div>
              )}

              {!searching && searchQuery.length === 0 && config?.suggestionsEnabled && suggestions.length > 0 && (
                <div>
                  <div className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    Sugerencias para vos
                  </div>
                  <div className="space-y-2">
                    {suggestions.map(song => {
                      const songId = song.catalogId || song.id
                      const reasonText = song.reason === 'similar_to_your_picks' ? 'Similar a tus elecciones' :
                                        song.reason === 'popular_in_this_event' ? 'Popular en este evento' :
                                        song.reason?.startsWith('popular_in_') ? `Popular en ${song.reason.split('_').pop()?.replace('events', 'eventos')}` :
                                        song.reason === 'trending_now' ? 'Tendencia' : null

                      return (
                        <button key={songId} onClick={() => handleSelectSong(song)}
                          className="relative w-full flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 rounded-lg transition text-left border border-purple-200">

                          {/* Like button - absolute top-right */}
                          {guest && songId && (
                            <div className="absolute top-2 right-2">
                              <LikeButton
                                songId={songId}
                                guestId={guest.id}
                                initialLiked={likeStatuses[songId] || false}
                                initialLikesCount={song.likesCount || 0}
                                size="sm"
                              />
                            </div>
                          )}

                          {/* Thumbnail */}
                          {song.thumbnailUrl && (
                            <img src={song.thumbnailUrl} alt="" className="w-16 h-16 rounded object-cover" />
                          )}

                          {/* Song info */}
                          <div className="flex-1 min-w-0 pr-8">
                            <div className="font-semibold text-gray-900 truncate">{song.title}</div>
                            <div className="text-sm text-gray-600 truncate">{song.artist}</div>

                            {/* Rating + Difficulty */}
                            <div className="flex items-center gap-2 mt-1">
                              {song.ranking && <StarRating rating={song.ranking} size="sm" />}
                              {song.difficulty && <DifficultyBadge difficulty={song.difficulty as any} size="sm" />}
                            </div>

                            {/* Opinion */}
                            {song.opinion && (
                              <p className="text-xs text-gray-500 italic mt-1 line-clamp-2">
                                "{song.opinion}"
                              </p>
                            )}

                            {/* Reason + Times Requested */}
                            <div className="flex items-center gap-2 mt-1">
                              {reasonText && (
                                <span className="text-xs bg-purple-600 text-white px-2 py-0.5 rounded-full">
                                  {reasonText}
                                </span>
                              )}
                              {song.timesRequested > 0 && (
                                <span className="text-xs text-purple-600 flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-purple-600" />
                                  {song.timesRequested}x
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3">
                  {selectedSong.thumbnailUrl && <img src={selectedSong.thumbnailUrl} alt="" className="w-20 h-20 rounded" />}
                  <div className="flex-1">
                    <div className="font-bold text-gray-900">{selectedSong.title}</div>
                    <div className="text-gray-600">{selectedSong.artist}</div>
                    {'isPopular' in selectedSong && (
                      <div className="text-xs text-purple-600 mt-1 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-purple-600" />
                        Popular en este evento
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">{error}</div>}

              <div className="flex gap-3">
                <button type="button" onClick={() => setSelectedSong(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg">
                  Cambiar
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg disabled:opacity-50">
                  {submitting ? 'Enviando...' : 'Pedir tema'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}
