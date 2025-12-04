/**
 * Socket.io Authentication Middleware
 * Verifica JWT en conexiones WebSocket
 */

import { Socket } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env'
import { JwtPayload } from '../shared/types'

export interface AuthenticatedSocket extends Socket {
  userId: string
  username: string
  role: string
}

/**
 * Middleware de autenticación para Socket.io
 * Extrae y verifica JWT del handshake
 */
export function socketAuthMiddleware(
  socket: Socket,
  next: (err?: Error) => void
): void {
  try {
    // Token puede venir en auth.token o en query.token
    const token = 
      socket.handshake.auth?.token || 
      socket.handshake.query?.token as string

    if (!token) {
      // Permitir conexiones sin auth para clientes públicos (QR)
      // Estos solo pueden unirse a rooms de eventos públicos
      console.log(`[SOCKET] Conexión anónima: ${socket.id}`)
      return next()
    }

    // Verificar JWT
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload

    // Adjuntar datos del usuario al socket
    const authSocket = socket as AuthenticatedSocket
    authSocket.userId = decoded.userId
    authSocket.username = decoded.username
    authSocket.role = decoded.role

    console.log(`[SOCKET] Usuario autenticado: ${decoded.username} (${socket.id})`)
    next()
  } catch (error) {
    console.error(`[SOCKET] Auth error:`, error)
    next(new Error('Authentication failed'))
  }
}

/**
 * Verifica si un socket está autenticado
 */
export function isAuthenticated(socket: Socket): socket is AuthenticatedSocket {
  return !!(socket as AuthenticatedSocket).userId
}

/**
 * Verifica si un socket tiene rol de operador o superior
 */
export function isOperator(socket: Socket): boolean {
  if (!isAuthenticated(socket)) return false
  const authSocket = socket as AuthenticatedSocket
  return ['ADMIN', 'MANAGER', 'OPERATOR'].includes(authSocket.role)
}
