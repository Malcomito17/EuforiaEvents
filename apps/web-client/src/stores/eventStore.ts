/**
 * Event Store - Estado global del evento actual
 */

import { create } from 'zustand'
import type { Event, MusicadjConfig, KaraokeyaConfig } from '../types'
import * as api from '../services/api'

interface EventState {
  // Estado
  event: Event | null
  musicadjConfig: MusicadjConfig | null
  karaokeyaConfig: KaraokeyaConfig | null
  loading: boolean
  error: string | null

  // Acciones
  loadEvent: (slug: string) => Promise<void>
  reset: () => void
}

export const useEventStore = create<EventState>((set) => ({
  event: null,
  musicadjConfig: null,
  karaokeyaConfig: null,
  loading: false,
  error: null,

  loadEvent: async (slug: string) => {
    console.log('[EventStore] Loading event:', slug)
    set({ loading: true, error: null })

    try {
      // Cargar evento
      console.log('[EventStore] Fetching event from API...')
      const event = await api.getEventBySlug(slug)
      console.log('[EventStore] Event received:', {
        id: event.id,
        name: event.name,
        slug: event.slug,
        status: event.status,
        hasEventData: !!event.eventData,
        eventData: event.eventData
      })

      // Cargar configs de módulos si el evento está activo
      let musicadjConfig: MusicadjConfig | null = null
      let karaokeyaConfig: KaraokeyaConfig | null = null

      if (event.status === 'ACTIVE') {
        // Cargar ambas configs en paralelo
        const [musicadjResult, karaokeyaResult] = await Promise.allSettled([
          api.getMusicadjConfig(event.id),
          api.getKaraokeyaConfig(event.id),
        ])

        if (musicadjResult.status === 'fulfilled') {
          musicadjConfig = musicadjResult.value
        } else {
          console.log('[STORE] MUSICADJ no disponible')
        }

        if (karaokeyaResult.status === 'fulfilled') {
          karaokeyaConfig = karaokeyaResult.value
        } else {
          console.log('[STORE] KARAOKEYA no disponible')
        }
      }

      console.log('[EventStore] Setting event in store')
      set({ event, musicadjConfig, karaokeyaConfig, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar evento'
      console.error('[EventStore] Error loading event:', err)
      set({ error: message, loading: false })
    }
  },

  reset: () => {
    set({ event: null, musicadjConfig: null, karaokeyaConfig: null, loading: false, error: null })
  },
}))
