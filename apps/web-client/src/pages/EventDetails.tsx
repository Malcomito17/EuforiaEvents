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

      <main className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* NOMBRE DEL EVENTO */}
        <h1 className="text-3xl font-bold text-center">{event.name}</h1>

        {/* IMAGEN DEL EVENTO (si existe) */}
        {event.eventData?.eventImage && (
          <div className="flex justify-center">
            <img
              src={(event.eventData as any).eventImage}
              alt={event.name}
              className="w-full max-w-md aspect-square object-cover rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Separador */}
        <div className="h-px bg-white/10 my-4" />

        {/* VENUE */}
        {event.venue && (
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <MapPin className="w-6 h-6 text-primary-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/60">Lugar</p>
              <p className="font-semibold text-lg">{event.venue.name}</p>
            </div>
          </div>
        )}

        {/* CLIENTE */}
        {event.client && (
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <p className="text-sm text-white/60">Cliente</p>
              <p className="font-semibold text-lg">{event.client.name}</p>
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="h-px bg-white/10 my-4" />

        {/* FECHA DE INICIO */}
        {event.startDate && (
          <div className="flex items-center gap-3 p-4 bg-white/5 rounded-xl">
            <Calendar className="w-6 h-6 text-primary-400 flex-shrink-0" />
            <div>
              <p className="text-sm text-white/60">Fecha y Hora</p>
              <p className="font-semibold text-lg">{formatDate(event.startDate)}</p>
            </div>
          </div>
        )}

        {/* Separador */}
        <div className="h-px bg-white/10 my-4" />

        {/* REDES SOCIALES (Instagram, Spotify, Hashtag) */}
        <div className="space-y-3">
          {/* Instagram */}
          {socialMedia.instagram && (
            <a
              href={socialMedia.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 rounded-xl transition-colors border border-pink-500/30"
            >
              <Instagram className="w-6 h-6 text-pink-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Instagram</p>
                <p className="text-sm text-white/60">Seguinos en Instagram</p>
              </div>
              <ExternalLink className="w-5 h-5 text-white/40" />
            </a>
          )}

          {/* Spotify */}
          {musicadjConfig?.spotifyAvailable && (
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/30">
              <Music2 className="w-6 h-6 text-green-400 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-semibold">Spotify Disponible</p>
                <p className="text-sm text-white/60">Pedí música desde Spotify</p>
              </div>
            </div>
          )}

          {/* Hashtag */}
          {event.eventData?.hashtag && (
            <div className="flex items-center gap-3 p-4 bg-primary-500/10 rounded-xl border border-primary-500/30">
              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">#</span>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-primary-300">{(event.eventData as any).hashtag}</p>
                <p className="text-sm text-white/60">Usá este hashtag en tus publicaciones</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
