/**
 * EventDetails - Página de detalles del evento
 * Muestra información completa, redes sociales, módulos, y venue
 */

import {
  Calendar, MapPin, Music2, Mic2, Instagram,
  Facebook, Twitter, Globe, ExternalLink
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { ClientHeader } from '../components/ClientHeader'
import { Footer } from '../components/Footer'

export default function EventDetails() {
  const { event, musicadjConfig, karaokeyaConfig } = useEventStore()

  if (!event) return null

  // Extract event colors with fallbacks
  const primaryColor = event.eventData?.primaryColor || '#8b5cf6'
  const secondaryColor = event.eventData?.secondaryColor || '#a855f7'

  // Parse social media links if they exist (assuming they're in eventData as JSON)
  const socialMedia = event.eventData ? {
    instagram: (event.eventData as any).instagram,
    facebook: (event.eventData as any).facebook,
    twitter: (event.eventData as any).twitter,
    website: (event.eventData as any).website,
  } : {}

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen pb-20">
      <ClientHeader title="Detalles del Evento" />

      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Event Header */}
        <div className="card text-center">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: primaryColor }}
          >
            <Music2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">{event.name}</h1>
          {event.eventData?.eventType && (
            <p className="text-white/60">{event.eventData.eventType}</p>
          )}
          {event.eventData?.hashtag && (
            <p className="text-primary-400 mt-2 font-medium">
              {event.eventData.hashtag}
            </p>
          )}
        </div>

        {/* Event Info */}
        <div className="card space-y-4">
          <h2 className="text-lg font-semibold mb-3">Información</h2>

          {/* Dates */}
          {event.startDate && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/60">Inicio</p>
                <p className="font-medium">{formatDate(event.startDate)}</p>
              </div>
            </div>
          )}

          {event.endDate && (
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/60">Fin</p>
                <p className="font-medium">{formatDate(event.endDate)}</p>
              </div>
            </div>
          )}

          {/* Venue */}
          {event.venue && (
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-white/60">Lugar</p>
                <p className="font-medium">{event.venue.name}</p>
              </div>
            </div>
          )}
        </div>

        {/* Social Media */}
        {(socialMedia.instagram || socialMedia.facebook || socialMedia.twitter || socialMedia.website) && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Redes Sociales</h2>
            <div className="grid grid-cols-2 gap-3">
              {socialMedia.instagram && (
                <a
                  href={socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Instagram className="w-5 h-5 text-pink-400" />
                  <span className="text-sm">Instagram</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-white/40" />
                </a>
              )}

              {socialMedia.facebook && (
                <a
                  href={socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5 text-blue-400" />
                  <span className="text-sm">Facebook</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-white/40" />
                </a>
              )}

              {socialMedia.twitter && (
                <a
                  href={socialMedia.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 text-sky-400" />
                  <span className="text-sm">Twitter</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-white/40" />
                </a>
              )}

              {socialMedia.website && (
                <a
                  href={socialMedia.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Globe className="w-5 h-5 text-green-400" />
                  <span className="text-sm">Sitio Web</span>
                  <ExternalLink className="w-3 h-3 ml-auto text-white/40" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Active Modules */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-4">Módulos Activos</h2>
          <div className="space-y-3">
            {musicadjConfig?.enabled && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Music2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">MusicaDJ</h3>
                  <p className="text-xs text-white/60">Pedí tu tema musical</p>
                </div>
                {musicadjConfig.spotifyAvailable && (
                  <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded-full">
                    Spotify
                  </span>
                )}
              </div>
            )}

            {karaokeyaConfig?.enabled && (
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: secondaryColor }}
                >
                  <Mic2 className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">KaraokeYa</h3>
                  <p className="text-xs text-white/60">Cantá tu canción favorita</p>
                </div>
                <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">
                  Activo
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Music Configuration (if MusicaDJ is enabled) */}
        {musicadjConfig?.enabled && musicadjConfig.welcomeMessage && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-3">Mensaje de Bienvenida</h2>
            <p className="text-white/80 leading-relaxed">
              {musicadjConfig.welcomeMessage}
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
