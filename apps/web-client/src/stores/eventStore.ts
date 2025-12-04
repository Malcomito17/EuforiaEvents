/**
 * Event Store - Estado global del evento actual
 */

import { create } from 'zustand'
import type { Event, MusicadjConfig } from '../types'
import * as api from '../services/api'

interface EventState {
  // Estado
  event: Event | null
  musicadjConfig: MusicadjConfig | null
  loading: boolean
  error: string | null
  
  // Acciones
  loadEvent: (slug: string) => Promise<void>
  reset: () => void
}

export const useEventStore = create<EventState>((set) => ({
  event: null,
  musicadjConfig: null,
  loading: false,
  error: null,

  loadEvent: async (slug: string) => {
    set({ loading: true, error: null })
    
    try {
      // Cargar evento
      const event = await api.getEventBySlug(slug)
      
      // Cargar config de MUSICADJ si el evento está activo
      let musicadjConfig: MusicadjConfig | null = null
      if (event.status === 'ACTIVE') {
        try {
          musicadjConfig = await api.getMusicadjConfig(event.id)
        } catch {
          // Si falla, el módulo puede no estar habilitado
          console.log('[STORE] MUSICADJ no disponible')
        }
      }
      
      set({ event, musicadjConfig, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar evento'
      set({ error: message, loading: false })
    }
  },

  reset: () => {
    set({ event: null, musicadjConfig: null, loading: false, error: null })
  },
}))
