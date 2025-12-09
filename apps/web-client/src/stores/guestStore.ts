/**
 * Guest Store - Manejo de identificación y persistencia (v1.3)
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Guest } from '../types'
import * as api from '../services/api'

interface GuestStore {
  guest: Guest | null
  isIdentifying: boolean
  error: string | null

  // Actions
  identifyGuest: (email: string, displayName: string, whatsapp?: string) => Promise<void>
  clearGuest: () => void
  updateGuestFromStorage: () => void
}

export const useGuestStore = create<GuestStore>()(
  persist(
    (set, get) => ({
      guest: null,
      isIdentifying: false,
      error: null,

      identifyGuest: async (email: string, displayName: string, whatsapp?: string) => {
        set({ isIdentifying: true, error: null })

        try {
          const guest = await api.identifyGuest({
            email: email.trim(),
            displayName: displayName.trim(),
            whatsapp: whatsapp?.trim(),
          })

          set({ guest, isIdentifying: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Error al identificarse'
          set({ error: message, isIdentifying: false })
          throw err
        }
      },

      clearGuest: () => {
        set({ guest: null, error: null })
      },

      updateGuestFromStorage: () => {
        // Esta función se ejecuta automáticamente por el middleware persist
        // Solo forzamos un re-render
        const state = get()
        set({ ...state })
      },
    }),
    {
      name: 'euforia-guest',
      partialize: (state) => ({
        guest: state.guest,
      }),
    }
  )
)
