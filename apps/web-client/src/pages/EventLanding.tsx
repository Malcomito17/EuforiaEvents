/**
 * EventLanding - Página de aterrizaje del evento (QR)
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Music2, Loader2, AlertCircle, Mic2 } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'

export default function EventLanding() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, musicadjConfig, loading, error, loadEvent } = useEventStore()

  useEffect(() => {
    if (slug) {
      loadEvent(slug)
    }
  }, [slug, loadEvent])

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Evento no encontrado</h1>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  // Evento no activo
  if (event && event.status !== 'ACTIVE') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <Music2 className="w-16 h-16 text-primary-500 mx-auto mb-4 opacity-50" />
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          <p className="text-white/60">
            {event.status === 'DRAFT' && 'Este evento aún no ha comenzado'}
            {event.status === 'PAUSED' && 'El evento está pausado temporalmente'}
            {event.status === 'FINISHED' && 'Este evento ya finalizó'}
          </p>
        </div>
      </div>
    )
  }

  if (!event) return null

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Music2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl font-bold mb-2">{event.name}</h1>
        {musicadjConfig?.welcomeMessage && (
          <p className="text-white/70 text-lg">{musicadjConfig.welcomeMessage}</p>
        )}
      </div>

      {/* Módulos disponibles */}
      <div className="w-full max-w-sm space-y-4">
        {/* MUSICADJ */}
        {musicadjConfig?.enabled && (
          <button
            onClick={() => navigate(`/e/${slug}/musicadj`)}
            className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
          >
            <div className="w-14 h-14 bg-primary-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Music2 className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Pedí tu tema</h2>
              <p className="text-white/60 text-sm">Buscá y solicitá tu canción favorita</p>
            </div>
          </button>
        )}

        {/* KARAOKEYA (próximamente) */}
        <button
          disabled
          className="w-full card opacity-50 cursor-not-allowed flex items-center gap-4 text-left"
        >
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Mic2 className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Karaoke</h2>
            <p className="text-white/60 text-sm">Próximamente</p>
          </div>
        </button>
      </div>
    </div>
  )
}
