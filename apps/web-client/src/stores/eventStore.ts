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
    set({ loading: true, error: null })
    
    try {
      // Cargar evento
      const event = await api.getEventBySlug(slug)
      
      // Cargar configs de módulos si el evento está activo
      let musicadjConfig: MusicadjConfig | null = null
      let karaokeyaConfig: KaraokeyaConfig | null = null
      
      if (event.status === 'ACTIVE') {
        // MUSICADJ
        try {
          musicadjConfig = await api.getMusicadjConfig(event.id)
        } catch {
          console.log('[STORE] MUSICADJ no disponible')
        }
        
        // KARAOKEYA
        try {
          karaokeyaConfig = await api.getKaraokeyaConfig(event.id)
        } catch {
          console.log('[STORE] KARAOKEYA no disponible')
        }
      }
      
      set({ event, musicadjConfig, karaokeyaConfig, loading: false })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al cargar evento'
      set({ error: message, loading: false })
    }
  },

  reset: () => {
    set({ 
      event: null, 
      musicadjConfig: null, 
      karaokeyaConfig: null,
      loading: false, 
      error: null 
    })
  },
}))
