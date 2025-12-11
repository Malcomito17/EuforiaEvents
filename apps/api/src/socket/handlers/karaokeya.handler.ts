/**
 * Socket.io Handlers para módulo KARAOKEYA
 * Maneja eventos realtime de solicitudes de karaoke
 */

import { Server, Socket } from 'socket.io'
import { isAuthenticated, isOperator, AuthenticatedSocket } from '../../modules/auth/auth.middleware'

// Tipos de eventos KARAOKEYA
export const KARAOKEYA_EVENTS = {
  // Cliente -> Servidor
  JOIN_EVENT: 'karaokeya:join',
  LEAVE_EVENT: 'karaokeya:leave',

  // Servidor -> Cliente(s)
  REQUEST_NEW: 'karaokeya:request:new',
  REQUEST_UPDATED: 'karaokeya:request:updated',
  REQUEST_DELETED: 'karaokeya:request:deleted',
  QUEUE_REORDERED: 'karaokeya:queue:reordered',

  // Estado del módulo
  CONFIG_UPDATED: 'karaokeya:config:updated',
  MODULE_ENABLED: 'karaokeya:enabled',
  MODULE_DISABLED: 'karaokeya:disabled',
} as const

/**
 * Registra handlers de KARAOKEYA en un socket
 */
export function registerKaraokeyaHandlers(io: Server, socket: Socket): void {
  // Unirse a room de evento
  socket.on(KARAOKEYA_EVENTS.JOIN_EVENT, (eventId: string) => {
    const roomName = `karaokeya:${eventId}`
    socket.join(roomName)

    const username = isAuthenticated(socket)
      ? (socket as AuthenticatedSocket).username
      : 'anónimo'

    console.log(`[KARAOKEYA] ${username} joined room ${roomName}`)

    // Notificar cantidad de usuarios en el room (opcional)
    const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0
    socket.emit('karaokeya:room:joined', { eventId, usersInRoom: roomSize })
  })

  // Salir del room de evento
  socket.on(KARAOKEYA_EVENTS.LEAVE_EVENT, (eventId: string) => {
    const roomName = `karaokeya:${eventId}`
    socket.leave(roomName)
    console.log(`[KARAOKEYA] Socket ${socket.id} left room ${roomName}`)
  })

  // Cleanup al desconectar
  socket.on('disconnect', () => {
    console.log(`[KARAOKEYA] Socket disconnected: ${socket.id}`)
  })
}

/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
export function emitNewKaraokeRequest(io: Server, eventId: string, request: unknown): void {
  const roomName = `karaokeya:${eventId}`
  io.to(roomName).emit(KARAOKEYA_EVENTS.REQUEST_NEW, request)
  console.log(`[KARAOKEYA] Emitted new request to room ${roomName}`)
}

/**
 * Emite actualización de solicitud
 */
export function emitKaraokeRequestUpdated(io: Server, eventId: string, request: unknown): void {
  const roomName = `karaokeya:${eventId}`
  io.to(roomName).emit(KARAOKEYA_EVENTS.REQUEST_UPDATED, request)
}

/**
 * Emite eliminación de solicitud
 */
export function emitKaraokeRequestDeleted(io: Server, eventId: string, requestId: string): void {
  const roomName = `karaokeya:${eventId}`
  io.to(roomName).emit(KARAOKEYA_EVENTS.REQUEST_DELETED, { id: requestId })
}

/**
 * Emite reordenamiento de cola
 */
export function emitKaraokeQueueReordered(io: Server, eventId: string, order: string[]): void {
  const roomName = `karaokeya:${eventId}`
  io.to(roomName).emit(KARAOKEYA_EVENTS.QUEUE_REORDERED, { order })
}

/**
 * Emite cambio de configuración del módulo
 */
export function emitKaraokeConfigUpdated(io: Server, eventId: string, config: unknown): void {
  const roomName = `karaokeya:${eventId}`
  io.to(roomName).emit(KARAOKEYA_EVENTS.CONFIG_UPDATED, config)
}
