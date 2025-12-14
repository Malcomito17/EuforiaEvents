/**
 * KARAOKEYA - Display Screen (Pantalla pública de karaoke)
 * Muestra la cola actual con 4 modos: QUEUE, BREAK, START, PROMO
 */

import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Maximize, Minimize, Music2, Mic2 } from 'lucide-react'
import clsx from 'clsx'
import QRCode from 'react-qr-code'

// Types
interface DisplayConfig {
  displayMode: 'QUEUE' | 'BREAK' | 'START' | 'PROMO'
  displayLayout: 'VERTICAL' | 'HORIZONTAL'
  displayBreakMessage: string
  displayStartMessage: string
  displayPromoImageUrl: string | null
}

interface KaraokeRequest {
  id: string
  turnNumber: number
  queuePosition: number
  title: string
  artist: string | null
  status: 'QUEUED' | 'CALLED' | 'ON_STAGE'
  guest: {
    id: string
    displayName: string
  }
  song: {
    thumbnailUrl: string | null
    youtubeShareUrl: string
  } | null
}

interface DisplayData {
  event: {
    id: string
    slug: string
    eventName: string
    eventDate: string
    location: string
  }
  config: DisplayConfig
  queue: {
    onStage: KaraokeRequest | null
    called: KaraokeRequest | null
    next: KaraokeRequest | null
    upcoming: KaraokeRequest[]
    total: number
  }
}

// Component
export default function DisplayScreen() {
  const { slug } = useParams<{ slug: string }>()
  const [data, setData] = useState<DisplayData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrollPosition, setScrollPosition] = useState(0)

  // Fetch display data
  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/karaokeya/display/${slug}`)
        if (!response.ok) {
          throw new Error('Error al cargar datos del display')
        }
        const result = await response.json()
        setData(result)
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000) // Actualizar cada 5 segundos
    return () => clearInterval(interval)
  }, [slug])

  // Auto-scroll for queue (horizontal layout)
  useEffect(() => {
    if (data?.config.displayMode !== 'QUEUE' || data.config.displayLayout !== 'HORIZONTAL') return

    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev + 1) % 5)
    }, 3000)

    return () => clearInterval(interval)
  }, [data?.config.displayMode, data?.config.displayLayout])

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // QR URL
  const qrUrl = `https://app.euforiateclog.cloud/e/${slug}/karaokeya`

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800 flex items-center justify-center">
        <div className="text-white text-2xl font-bold animate-pulse">
          Cargando pantalla...
        </div>
      </div>
    )
  }

  // Error state
  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-pink-800 flex items-center justify-center">
        <div className="text-white text-2xl font-bold">
          ⚠️ {error || 'Error al cargar datos'}
        </div>
      </div>
    )
  }

  const { config, queue, event } = data
  const isVertical = config.displayLayout === 'VERTICAL'

  return (
    <div className={clsx(
      'min-h-screen relative',
      'bg-gradient-to-br from-purple-900 via-purple-800 to-pink-800',
      'text-white overflow-hidden'
    )}>
      {/* Fullscreen button (discrete) */}
      <button
        onClick={toggleFullscreen}
        className="absolute top-4 right-4 z-50 bg-black/30 hover:bg-black/50 text-white p-2 rounded-lg transition"
        aria-label="Pantalla completa"
      >
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </button>

      {/* MODO BREAK */}
      {config.displayMode === 'BREAK' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          <Music2 className="w-32 h-32 mb-8 text-purple-300 animate-pulse" />
          <h1 className="text-6xl md:text-8xl font-black text-center mb-8">
            {config.displayBreakMessage}
          </h1>
          <p className="text-2xl md:text-4xl text-purple-200 text-center mb-12">
            Volveremos en unos minutos
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <QRCode value={qrUrl} size={200} />
          </div>
          <p className="mt-6 text-xl md:text-2xl text-purple-200 font-semibold">
            Escanea para cantar 🎤
          </p>
        </div>
      )}

      {/* MODO START */}
      {config.displayMode === 'START' && (
        <div className="flex flex-col items-center justify-center min-h-screen px-8">
          <Mic2 className="w-32 h-32 mb-8 text-pink-300 animate-bounce" />
          <h1 className="text-6xl md:text-8xl font-black text-center mb-8">
            {config.displayStartMessage}
          </h1>
          <p className="text-2xl md:text-4xl text-pink-200 text-center mb-12">
            ¡Preparate para cantar!
          </p>
          <div className="bg-white p-6 rounded-2xl shadow-2xl">
            <QRCode value={qrUrl} size={200} />
          </div>
          <p className="mt-6 text-xl md:text-2xl text-pink-200 font-semibold">
            Escanea para sumarte a la cola 🎤
          </p>
        </div>
      )}

      {/* MODO PROMO */}
      {config.displayMode === 'PROMO' && (
        <div className="flex items-center justify-center min-h-screen px-8 py-8">
          {config.displayPromoImageUrl ? (
            <div className="relative w-full h-full max-w-7xl max-h-screen flex items-center justify-center">
              <img
                src={config.displayPromoImageUrl}
                alt="Promoción"
                className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-3xl shadow-2xl"
              />
              <div className="absolute bottom-8 right-8 bg-white p-6 rounded-2xl shadow-2xl">
                <QRCode value={qrUrl} size={150} />
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h1 className="text-6xl font-black mb-8">🎤 KARAOKEYA</h1>
              <div className="bg-white p-6 rounded-2xl shadow-2xl inline-block">
                <QRCode value={qrUrl} size={200} />
              </div>
              <p className="mt-6 text-2xl text-purple-200 font-semibold">
                Escanea para cantar
              </p>
            </div>
          )}
        </div>
      )}

      {/* MODO QUEUE */}
      {config.displayMode === 'QUEUE' && (
        <div className="min-h-screen flex flex-col p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-black mb-2">
              🎤 {event.eventName}
            </h1>
            <p className="text-lg md:text-2xl text-purple-200">
              Cola de Karaoke
            </p>
          </div>

          {/* Layout VERTICAL */}
          {isVertical && (
            <div className="flex-1 flex flex-col gap-8">
              {/* Cantante actual */}
              {queue.onStage && (
                <div className="bg-gradient-to-r from-pink-600 to-pink-700 rounded-3xl p-8 shadow-2xl border-4 border-pink-400">
                  <div className="text-center">
                    <p className="text-2xl font-semibold mb-2 text-pink-100">🎤 EN EL ESCENARIO</p>
                    <p className="text-xl font-bold mb-1">Turno #{queue.onStage.turnNumber}</p>
                    <p className="text-5xl font-black mb-4">{queue.onStage.guest.displayName}</p>
                    <p className="text-3xl font-bold text-pink-100">
                      {queue.onStage.title}
                    </p>
                    {queue.onStage.artist && (
                      <p className="text-2xl text-pink-200 mt-2">{queue.onStage.artist}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Próximo */}
              {queue.called && (
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-3xl p-6 shadow-xl border-4 border-purple-400">
                  <div className="text-center">
                    <p className="text-xl font-semibold mb-1 text-purple-100">👉 PRÓXIMO</p>
                    <p className="text-lg font-bold mb-1">Turno #{queue.called.turnNumber}</p>
                    <p className="text-3xl font-black mb-2">{queue.called.guest.displayName}</p>
                    <p className="text-xl font-bold text-purple-100">{queue.called.title}</p>
                    {queue.called.artist && (
                      <p className="text-lg text-purple-200">{queue.called.artist}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Cola scrollable */}
              <div className="flex-1 bg-white/10 rounded-3xl p-6 backdrop-blur-sm overflow-y-auto">
                <p className="text-2xl font-bold mb-4 text-center text-purple-100">
                  Cola ({queue.total} esperando)
                </p>
                <div className="space-y-3">
                  {queue.upcoming.slice(0, 6).map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/20 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-xl">#{request.turnNumber} - {request.guest.displayName}</p>
                          <p className="text-lg text-purple-100">{request.title}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* QR Code */}
              <div className="text-center">
                <div className="bg-white p-4 rounded-2xl inline-block shadow-2xl">
                  <QRCode value={qrUrl} size={120} />
                </div>
                <p className="mt-3 text-lg font-semibold text-purple-200">
                  Escanea para sumarte 🎤
                </p>
              </div>
            </div>
          )}

          {/* Layout HORIZONTAL */}
          {!isVertical && (
            <div className="flex-1 flex gap-6">
              {/* Izquierda: Cantante actual + Próximo */}
              <div className="w-1/2 flex flex-col gap-6">
                {/* Cantante actual */}
                {queue.onStage && (
                  <div className="flex-1 bg-gradient-to-br from-pink-600 to-pink-700 rounded-3xl p-6 shadow-2xl border-4 border-pink-400 flex flex-col justify-center">
                    <div className="text-center">
                      <p className="text-xl font-semibold mb-2 text-pink-100">🎤 EN EL ESCENARIO</p>
                      <p className="text-lg font-bold mb-1">Turno #{queue.onStage.turnNumber}</p>
                      <p className="text-4xl font-black mb-3">{queue.onStage.guest.displayName}</p>
                      <p className="text-2xl font-bold text-pink-100">{queue.onStage.title}</p>
                      {queue.onStage.artist && (
                        <p className="text-xl text-pink-200 mt-1">{queue.onStage.artist}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Próximo */}
                {queue.called && (
                  <div className="flex-1 bg-gradient-to-br from-purple-600 to-purple-700 rounded-3xl p-6 shadow-xl border-4 border-purple-400 flex flex-col justify-center">
                    <div className="text-center">
                      <p className="text-lg font-semibold mb-1 text-purple-100">👉 PRÓXIMO</p>
                      <p className="text-base font-bold mb-1">Turno #{queue.called.turnNumber}</p>
                      <p className="text-3xl font-black mb-2">{queue.called.guest.displayName}</p>
                      <p className="text-xl font-bold text-purple-100">{queue.called.title}</p>
                      {queue.called.artist && (
                        <p className="text-lg text-purple-200">{queue.called.artist}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Derecha: Cola + QR */}
              <div className="w-1/2 flex flex-col gap-6">
                {/* Cola */}
                <div className="flex-1 bg-white/10 rounded-3xl p-6 backdrop-blur-sm overflow-hidden">
                  <p className="text-2xl font-bold mb-4 text-center text-purple-100">
                    Cola ({queue.total} esperando)
                  </p>
                  <div className="space-y-3 overflow-y-auto max-h-[500px]">
                    {queue.upcoming.slice(0, 8).map((request, index) => (
                      <div
                        key={request.id}
                        className={clsx(
                          'bg-white/20 rounded-xl p-4 backdrop-blur-sm transition-all duration-500',
                          index === scrollPosition && 'scale-105 bg-white/30'
                        )}
                      >
                        <p className="font-bold text-xl">
                          #{request.turnNumber} - {request.guest.displayName}
                        </p>
                        <p className="text-lg text-purple-100">{request.title}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* QR Code */}
                <div className="text-center">
                  <div className="bg-white p-6 rounded-2xl inline-block shadow-2xl">
                    <QRCode value={qrUrl} size={160} />
                  </div>
                  <p className="mt-3 text-xl font-semibold text-purple-200">
                    Escanea para sumarte 🎤
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
