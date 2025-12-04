/**
 * Socket.io Handlers para módulo KARAOKEYA
 * Maneja eventos realtime de cola de karaoke
 */

import { Server, Socket } from 'socket.io'
import { Request } from 'express'
import { isAuthenticated, isOperator, AuthenticatedSocket } from '../auth'
import { getIO } from '../index'

// Tipos de eventos KARAOKEYA
export const KARAOKEYA_EVENTS = {
  // Cliente -> Servidor
  JOIN_EVENT: 'karaokeya:join',
  LEAVE_EVENT: 'karaokeya:leave',
  
  // Servidor -> Cliente(s)
  REQUEST_NEW: 'karaokeya:request:new',
  STATUS_CHANGED: 'karaokeya:request:status',
  QUEUE_REORDERED: 'karaokeya:queue:reordered',
  NEXT_CALLED: 'karaokeya:next:called',
  
  // Estado del módulo
  CONFIG_UPDATED: 'karaokeya:config:updated',
  STATS_UPDATED: 'karaokeya:stats:updated',
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
    
    // Notificar cantidad de usuarios en el room
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

// ============================================
// Funciones de emisión para usar desde controllers
// ============================================

/**
 * Emite evento de nuevo turno a todos en el room del evento
 */
export function emitKaraokeNewRequest(req: Request, eventId: string, request: unknown): void {
  try {
    const io = getIO()
    const roomName = `karaokeya:${eventId}`
    io.to(roomName).emit(KARAOKEYA_EVENTS.REQUEST_NEW, request)
    console.log(`[KARAOKEYA] Emitted new request to room ${roomName}`)
  } catch (error) {
    console.error('[KARAOKEYA] Error emitting new request:', error)
  }
}

/**
 * Emite cambio de estado de turno
 */
export function emitKaraokeStatusChanged(req: Request, eventId: string, request: unknown): void {
  try {
    const io = getIO()
    const roomName = `karaokeya:${eventId}`
    io.to(roomName).emit(KARAOKEYA_EVENTS.STATUS_CHANGED, request)
    console.log(`[KARAOKEYA] Emitted status change to room ${roomName}`)
  } catch (error) {
    console.error('[KARAOKEYA] Error emitting status change:', error)
  }
}

/**
 * Emite reordenamiento de cola
 */
export function emitKaraokeQueueReordered(req: Request, eventId: string): void {
  try {
    const io = getIO()
    const roomName = `karaokeya:${eventId}`
    io.to(roomName).emit(KARAOKEYA_EVENTS.QUEUE_REORDERED, { eventId })
    console.log(`[KARAOKEYA] Emitted queue reorder to room ${roomName}`)
  } catch (error) {
    console.error('[KARAOKEYA] Error emitting queue reorder:', error)
  }
}

/**
 * Emite cambio de configuración del módulo
 */
export function emitKaraokeConfigUpdated(req: Request, eventId: string, config: unknown): void {
  try {
    const io = getIO()
    const roomName = `karaokeya:${eventId}`
    io.to(roomName).emit(KARAOKEYA_EVENTS.CONFIG_UPDATED, config)
    console.log(`[KARAOKEYA] Emitted config update to room ${roomName}`)
  } catch (error) {
    console.error('[KARAOKEYA] Error emitting config update:', error)
  }
}

/**
 * Emite actualización de estadísticas
 */
export function emitKaraokeStatsUpdated(eventId: string, stats: unknown): void {
  try {
    const io = getIO()
    const roomName = `karaokeya:${eventId}`
    io.to(roomName).emit(KARAOKEYA_EVENTS.STATS_UPDATED, stats)
  } catch (error) {
    console.error('[KARAOKEYA] Error emitting stats update:', error)
  }
}
