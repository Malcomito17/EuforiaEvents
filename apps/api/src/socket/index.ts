/**
 * Socket.io Configuration
 * Configura WebSocket server con autenticación y handlers
 */

import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { socketAuthMiddleware } from './auth'
import { registerMusicadjHandlers } from './handlers/musicadj.handler'

// Instancia global del servidor Socket.io
let io: Server | null = null

/**
 * Inicializa Socket.io con el servidor HTTP
 */
export function initializeSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: [
        'http://localhost:5173',  // web-client
        'http://localhost:5174',  // web-operator
        process.env.CLIENT_URL || '',
        process.env.OPERATOR_URL || '',
      ].filter(Boolean),
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Configuración de transporte
    transports: ['websocket', 'polling'],
    // Ping cada 25 segundos para mantener conexión
    pingInterval: 25000,
    pingTimeout: 20000,
  })

  // Middleware de autenticación
  io.use(socketAuthMiddleware)

  // Handler de conexión
  io.on('connection', (socket: Socket) => {
    console.log(`[SOCKET] Nueva conexión: ${socket.id}`)

    // Registrar handlers de cada módulo
    registerMusicadjHandlers(io!, socket)
    // TODO: registerKaraokeyaHandlers(io!, socket)

    // Evento de desconexión
    socket.on('disconnect', (reason) => {
      console.log(`[SOCKET] Desconexión: ${socket.id} - Razón: ${reason}`)
    })

    // Manejo de errores
    socket.on('error', (error) => {
      console.error(`[SOCKET] Error en ${socket.id}:`, error)
    })
  })

  console.log('[SOCKET] Socket.io inicializado')
  return io
}

/**
 * Obtiene la instancia de Socket.io
 * Útil para emitir eventos desde otros módulos (services)
 */
export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io no ha sido inicializado. Llamar initializeSocket primero.')
  }
  return io
}

// Re-exportar utilidades y handlers
export { socketAuthMiddleware, isAuthenticated, isOperator } from './auth'
export type { AuthenticatedSocket } from './auth'
export * from './handlers/musicadj.handler'
