/**
 * Socket.io Handlers para módulo MUSICADJ
 * Maneja eventos realtime de solicitudes musicales
 */

import { Server, Socket } from 'socket.io'
import { isAuthenticated, isOperator, AuthenticatedSocket } from '../auth'

// Tipos de eventos MUSICADJ
export const MUSICADJ_EVENTS = {
  // Cliente -> Servidor
  JOIN_EVENT: 'musicadj:join',
  LEAVE_EVENT: 'musicadj:leave',
  
  // Servidor -> Cliente(s)
  REQUEST_NEW: 'musicadj:request:new',
  REQUEST_UPDATED: 'musicadj:request:updated',
  REQUEST_DELETED: 'musicadj:request:deleted',
  QUEUE_REORDERED: 'musicadj:queue:reordered',
  
  // Estado del módulo
  CONFIG_UPDATED: 'musicadj:config:updated',
  MODULE_ENABLED: 'musicadj:enabled',
  MODULE_DISABLED: 'musicadj:disabled',
} as const

/**
 * Registra handlers de MUSICADJ en un socket
 */
export function registerMusicadjHandlers(io: Server, socket: Socket): void {
  // Unirse a room de evento
  socket.on(MUSICADJ_EVENTS.JOIN_EVENT, (eventId: string) => {
    const roomName = `musicadj:${eventId}`
    socket.join(roomName)
    
    const username = isAuthenticated(socket) 
      ? (socket as AuthenticatedSocket).username 
      : 'anónimo'
    
    console.log(`[MUSICADJ] ${username} joined room ${roomName}`)
    
    // Notificar cantidad de usuarios en el room (opcional)
    const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0
    socket.emit('musicadj:room:joined', { eventId, usersInRoom: roomSize })
  })

  // Salir del room de evento
  socket.on(MUSICADJ_EVENTS.LEAVE_EVENT, (eventId: string) => {
    const roomName = `musicadj:${eventId}`
    socket.leave(roomName)
    console.log(`[MUSICADJ] Socket ${socket.id} left room ${roomName}`)
  })

  // Cleanup al desconectar
  socket.on('disconnect', () => {
    console.log(`[MUSICADJ] Socket disconnected: ${socket.id}`)
  })
}

/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
export function emitNewRequest(io: Server, eventId: string, request: unknown): void {
  const roomName = `musicadj:${eventId}`
  io.to(roomName).emit(MUSICADJ_EVENTS.REQUEST_NEW, request)
  console.log(`[MUSICADJ] Emitted new request to room ${roomName}`)
}

/**
 * Emite actualización de solicitud
 */
export function emitRequestUpdated(io: Server, eventId: string, request: unknown): void {
  const roomName = `musicadj:${eventId}`
  io.to(roomName).emit(MUSICADJ_EVENTS.REQUEST_UPDATED, request)
}

/**
 * Emite eliminación de solicitud
 */
export function emitRequestDeleted(io: Server, eventId: string, requestId: string): void {
  const roomName = `musicadj:${eventId}`
  io.to(roomName).emit(MUSICADJ_EVENTS.REQUEST_DELETED, { id: requestId })
}

/**
 * Emite reordenamiento de cola
 */
export function emitQueueReordered(io: Server, eventId: string, order: string[]): void {
  const roomName = `musicadj:${eventId}`
  io.to(roomName).emit(MUSICADJ_EVENTS.QUEUE_REORDERED, { order })
}

/**
 * Emite cambio de configuración del módulo
 */
export function emitConfigUpdated(io: Server, eventId: string, config: unknown): void {
  const roomName = `musicadj:${eventId}`
  io.to(roomName).emit(MUSICADJ_EVENTS.CONFIG_UPDATED, config)
}
