/**
 * EventLanding - Página de aterrizaje del evento (QR)
 */

import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Music2, Loader2, AlertCircle, Mic2, ListMusic } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { useGuestStore } from '../stores/guestStore'
import { Footer } from '../components/Footer'

export default function EventLanding() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, musicadjConfig, karaokeyaConfig, loading, error, loadEvent } = useEventStore()
  const { guest, clearGuest } = useGuestStore()

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
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Icono animado */}
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-500/20 blur-3xl rounded-full animate-pulse"></div>
            <div className="relative w-24 h-24 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center mx-auto">
              <Music2 className="w-12 h-12 opacity-70" />
            </div>
          </div>

          {/* Título del evento */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-3 bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              {event.name}
            </h1>

            {/* Mensaje según estado */}
            <div className="card border-2 border-white/10">
              {event.status === 'DRAFT' && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-full">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-yellow-300">Próximamente</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Este evento aún no ha comenzado.
                  </p>
                  <p className="text-white/50 text-sm">
                    ¡Volvé pronto! En breve podrás pedir tus temas favoritos.
                  </p>
                </div>
              )}

              {event.status === 'PAUSED' && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-orange-300">En Pausa</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    El evento está pausado temporalmente.
                  </p>
                  <p className="text-white/50 text-sm">
                    Esperá un momento, pronto volveremos a estar activos.
                  </p>
                </div>
              )}

              {event.status === 'FINISHED' && (
                <div className="space-y-3">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-500/20 rounded-full">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-300">Finalizado</span>
                  </div>
                  <p className="text-white/80 text-lg leading-relaxed">
                    Este evento ya ha finalizado.
                  </p>
                  <p className="text-white/50 text-sm">
                    ¡Gracias por participar! Esperamos verte en el próximo evento.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Información del evento si existe */}
          {event.eventData && (
            <div className="card bg-white/5 border border-white/10">
              <div className="space-y-2 text-sm">
                {event.venue && (
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    <span>{event.venue.name}</span>
                  </div>
                )}
                {event.startDate && (
                  <div className="flex items-center gap-2 text-white/60">
                    <div className="w-1.5 h-1.5 bg-primary-500 rounded-full"></div>
                    <span>{new Date(event.startDate).toLocaleDateString('es-AR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <Footer />
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

        {/* Botón de cambio de usuario */}
        {guest && (
          <button
            onClick={() => clearGuest()}
            className="mt-3 text-sm text-white/50 hover:text-white/80 transition-colors underline"
          >
            ¿No sos {guest.displayName}? Volver a ingresar
          </button>
        )}
      </div>

      {/* Módulos disponibles */}
      <div className="w-full max-w-sm space-y-6">
        {/* MUSICADJ Section */}
        {musicadjConfig?.enabled && (
          <div className="bg-gradient-to-br from-primary-600/20 to-primary-800/20 rounded-2xl p-4 backdrop-blur-sm border border-primary-400/30">
            <div className="flex items-center gap-2 mb-3">
              <Music2 className="w-5 h-5 text-primary-300" />
              <h3 className="font-semibold text-primary-100 text-sm uppercase tracking-wide">
                MUSICADJ
              </h3>
            </div>
            <div className="space-y-2">
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

              {/* Mis pedidos - solo si está identificado */}
              {guest && (
                <button
                  onClick={() => navigate(`/e/${slug}/musicadj/mis-pedidos`)}
                  className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
                >
                  <div className="w-14 h-14 bg-primary-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ListMusic className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">Mis pedidos</h2>
                    <p className="text-white/60 text-sm">Ver el estado de tus solicitudes</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* KARAOKEYA Section */}
        {karaokeyaConfig?.enabled && (
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-4 backdrop-blur-sm border border-purple-400/30">
            <div className="flex items-center gap-2 mb-3">
              <Mic2 className="w-5 h-5 text-purple-300" />
              <h3 className="font-semibold text-purple-100 text-sm uppercase tracking-wide">
                KARAOKEYA
              </h3>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate(`/e/${slug}/karaokeya`)}
                className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
              >
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mic2 className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">Pedí tu canción</h2>
                  <p className="text-white/60 text-sm">Elegí y cantá tu tema favorito</p>
                </div>
              </button>

              {/* Mi Cola - solo si está identificado */}
              {guest && (
                <button
                  onClick={() => navigate(`/e/${slug}/karaokeya/mi-cola`)}
                  className="w-full card hover:bg-white/20 transition-all flex items-center gap-4 text-left"
                >
                  <div className="w-14 h-14 bg-purple-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Mic2 className="w-7 h-7" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold">Mi Cola</h2>
                    <p className="text-white/60 text-sm">Ver el estado de tus solicitudes</p>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer />
    </div>
  )
}
