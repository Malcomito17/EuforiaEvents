/**
 * Hook para gestionar notificaciones de karaoke
 * Incluye Browser Notifications, Audio y Vibración (100% gratis)
 */

import { useEffect, useRef } from 'react'

export interface NotificationOptions {
  title: string
  body: string
  icon?: string
  playSound?: boolean
  vibrate?: boolean
}

/**
 * Hook para gestionar notificaciones del navegador
 */
export function useKaraokeNotifications() {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const permissionGranted = useRef<boolean>(false)

  // Inicializar audio (sonido de alerta)
  useEffect(() => {
    // Crear elemento de audio para la notificación
    // Usando un tono de notificación simple
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiDcIF2m98OScTQwOUKnk7bllHAU2jdT0zn0vBSh+zPDdj0IJFl60nH7T4r1rPChKMjQudToI7gSKjYZDJPKDe9eo6dVXQm5LSZVrQ' +
      'iYB69l7oJq6K9CmvBXIhd4gGXVjG4oZR0i+TmQgMj5TKuFLGpQwBGNOBRGX5cj0N8N7Bb7P8N')

    // Solicitar permiso de notificaciones al cargar
    requestNotificationPermission()

    return () => {
      // Cleanup
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  /**
   * Solicita permiso para mostrar notificaciones
   */
  const requestNotificationPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.warn('[NOTIFICATIONS] Browser notifications no están soportadas')
      return false
    }

    if (Notification.permission === 'granted') {
      permissionGranted.current = true
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      permissionGranted.current = permission === 'granted'
      return permission === 'granted'
    }

    return false
  }

  /**
   * Reproduce sonido de alerta
   */
  const playNotificationSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = 0.7
      audioRef.current.play().catch(err => {
        console.warn('[NOTIFICATIONS] No se pudo reproducir el sonido:', err)
      })
    }
  }

  /**
   * Vibra el dispositivo (si está disponible)
   */
  const vibrateDevice = () => {
    if ('vibrate' in navigator) {
      // Patrón de vibración: vibrar 200ms, pausa 100ms, vibrar 200ms
      navigator.vibrate([200, 100, 200])
    }
  }

  /**
   * Muestra una notificación del navegador
   */
  const showNotification = async (options: NotificationOptions): Promise<boolean> => {
    const {
      title,
      body,
      icon = '/logo.png',
      playSound = true,
      vibrate = true
    } = options

    // 1. Intentar mostrar Browser Notification
    if ('Notification' in window) {
      // Solicitar permiso si no lo tenemos
      if (!permissionGranted.current) {
        const granted = await requestNotificationPermission()
        if (!granted) {
          console.warn('[NOTIFICATIONS] Permiso denegado')
        }
      }

      // Si tenemos permiso, mostrar notificación
      if (permissionGranted.current) {
        try {
          const notification = new Notification(title, {
            body,
            icon,
            badge: icon,
            tag: 'karaokeya-turn',
            requireInteraction: true, // No se cierra automáticamente
            silent: !playSound // El navegador no hará sonido, lo manejaremos nosotros
          })

          // Enfocar la ventana cuando se hace clic en la notificación
          notification.onclick = () => {
            window.focus()
            notification.close()
          }

          console.log('[NOTIFICATIONS] Browser notification mostrada')
        } catch (error) {
          console.error('[NOTIFICATIONS] Error al mostrar notificación:', error)
        }
      }
    }

    // 2. Reproducir sonido de alerta
    if (playSound) {
      playNotificationSound()
    }

    // 3. Vibrar dispositivo (si está disponible)
    if (vibrate) {
      vibrateDevice()
    }

    return true
  }

  /**
   * Muestra la notificación de "¡ES TU TURNO!"
   */
  const notifyYourTurn = async (songTitle: string, artist?: string) => {
    const fullTitle = artist ? `${songTitle} - ${artist}` : songTitle

    return showNotification({
      title: '🎤 ¡ES TU TURNO!',
      body: `Es hora de cantar: ${fullTitle}\n¡Acercate al escenario!`,
      playSound: true,
      vibrate: true
    })
  }

  return {
    showNotification,
    notifyYourTurn,
    requestPermission: requestNotificationPermission,
    hasPermission: permissionGranted.current
  }
}
