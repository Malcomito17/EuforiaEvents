/**
 * useKaraokeQueue - Hook para detectar si el usuario tiene turno en karaoke
 */

import { useState, useEffect } from 'react'
import { io, Socket } from 'socket.io-client'
import type { KaraokeRequest } from '../types'

export function useKaraokeQueue(
  eventId: string | undefined,
  guestId: string | undefined,
  enabled: boolean = true
) {
  const [hasTurn, setHasTurn] = useState(false)
  const [socket, setSocket] = useState<Socket | null>(null)

  useEffect(() => {
    if (!enabled || !eventId || !guestId) {
      setHasTurn(false)
      return
    }

    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    const newSocket = io(socketUrl)

    newSocket.on('connect', () => {
      newSocket.emit('join', `event:${eventId}`)
    })

    // Escuchar actualizaciones de pedidos
    newSocket.on('karaokeya:request:updated', (updatedRequest: KaraokeRequest) => {
      // Si es del usuario actual y está en estado CALLED, marcar hasTurn como true
      if (updatedRequest.guestId === guestId && updatedRequest.status === 'CALLED') {
        setHasTurn(true)
      }
      // Si era del usuario y cambió a otro estado, marcar como false
      else if (updatedRequest.guestId === guestId && updatedRequest.status !== 'CALLED') {
        setHasTurn(false)
      }
    })

    // Escuchar eliminación de pedidos
    newSocket.on('karaokeya:request:deleted', () => {
      // Si se eliminó, asumir que ya no hay turno
      // (Podríamos mejorar esto consultando la API, pero por simplicidad...)
      setHasTurn(false)
    })

    setSocket(newSocket)

    // Verificar estado inicial
    const checkInitialStatus = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/events/${eventId}/karaokeya/guests/${guestId}/requests`
        )
        const data = await response.json()
        const hasCalledRequest = data.requests?.some(
          (req: KaraokeRequest) => req.status === 'CALLED'
        )
        setHasTurn(hasCalledRequest)
      } catch (err) {
        console.error('[useKaraokeQueue] Error checking initial status:', err)
      }
    }

    checkInitialStatus()

    return () => {
      newSocket.disconnect()
    }
  }, [enabled, eventId, guestId])

  return { hasTurn, socket }
}
