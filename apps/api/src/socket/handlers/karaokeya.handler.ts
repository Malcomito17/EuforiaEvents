import { Server, Socket } from 'socket.io'
import { PrismaClient, KaraokeRequestStatus } from '@prisma/client'
import { KaraokeyaService, KaraokeyaError } from '../../modules/karaokeya'
import { createKaraokeRequestSchema } from '../../modules/karaokeya/karaokeya.types'

// ============================================
// KARAOKEYA SOCKET HANDLER
// Eventos en tiempo real para karaoke
// ============================================

interface KaraokeyaSocketEvents {
  // Cliente -> Servidor
  'karaokeya:join': { eventId: string }
  'karaokeya:leave': { eventId: string }
  'karaokeya:submit': {
    eventId: string
    data: {
      title: string
      artist?: string
      singerName: string
      singerLastname?: string
      singerEmail?: string
      singerWhatsapp?: string
    }
  }

  // Servidor -> Cliente
  'karaokeya:queue-updated': { eventId: string }
  'karaokeya:new-request': { eventId: string; request: any }
  'karaokeya:status-changed': { eventId: string; request: any }
  'karaokeya:next-called': { eventId: string; request: any }
  'karaokeya:stats-updated': { eventId: string; stats: any }
}

export function setupKaraokeyaHandler(io: Server, prisma: PrismaClient) {
  const service = new KaraokeyaService(prisma)

  // Room naming convention: karaokeya:{eventId}
  const getRoom = (eventId: string) => `karaokeya:${eventId}`

  io.on('connection', (socket: Socket) => {
    console.log(`[SOCKET] Cliente conectado: ${socket.id}`)

    // ============================================
    // JOIN/LEAVE ROOMS
    // ============================================

    socket.on('karaokeya:join', async ({ eventId }) => {
      const room = getRoom(eventId)
      socket.join(room)
      console.log(`[KARAOKEYA:SOCKET] ${socket.id} joined ${room}`)

      // Enviar estado actual de la cola
      try {
        const [queue, stats] = await Promise.all([
          service.getQueue(eventId),
          service.getQueueStats(eventId),
        ])

        socket.emit('karaokeya:queue-updated', { eventId, queue })
        socket.emit('karaokeya:stats-updated', { eventId, stats })
      } catch (error) {
        console.error('[KARAOKEYA:SOCKET] Error al enviar estado inicial:', error)
      }
    })

    socket.on('karaokeya:leave', ({ eventId }) => {
      const room = getRoom(eventId)
      socket.leave(room)
      console.log(`[KARAOKEYA:SOCKET] ${socket.id} left ${room}`)
    })

    // ============================================
    // SUBMIT REQUEST (desde cliente)
    // ============================================

    socket.on('karaokeya:submit', async ({ eventId, data }) => {
      try {
        const input = createKaraokeRequestSchema.parse(data)
        const request = await service.createRequest(eventId, input)

        // Notificar a todos en el room
        const room = getRoom(eventId)
        io.to(room).emit('karaokeya:new-request', { eventId, request })

        // Actualizar stats
        const stats = await service.getQueueStats(eventId)
        io.to(room).emit('karaokeya:stats-updated', { eventId, stats })

        // Confirmar al emisor
        socket.emit('karaokeya:submit:success', { request })

        console.log(
          `[KARAOKEYA:SOCKET] Nuevo turno #${request.turnNumber} desde socket ${socket.id}`
        )
      } catch (error) {
        const errorMessage =
          error instanceof KaraokeyaError ? error.message : 'Error al crear turno'
        socket.emit('karaokeya:submit:error', { error: errorMessage })
        console.error('[KARAOKEYA:SOCKET] Error en submit:', error)
      }
    })

    // ============================================
    // DISCONNECT
    // ============================================

    socket.on('disconnect', () => {
      console.log(`[SOCKET] Cliente desconectado: ${socket.id}`)
    })
  })

  // ============================================
  // FUNCIONES HELPER PARA EMITIR DESDE CONTROLLER
  // ============================================

  return {
    /**
     * Notificar actualización de cola a todos los clientes del evento
     */
    notifyQueueUpdate: async (eventId: string) => {
      const room = getRoom(eventId)
      const queue = await service.getQueue(eventId)
      const stats = await service.getQueueStats(eventId)

      io.to(room).emit('karaokeya:queue-updated', { eventId, queue })
      io.to(room).emit('karaokeya:stats-updated', { eventId, stats })
    },

    /**
     * Notificar cambio de estado de un turno
     */
    notifyStatusChange: async (eventId: string, request: any) => {
      const room = getRoom(eventId)
      io.to(room).emit('karaokeya:status-changed', { eventId, request })

      // También actualizar stats
      const stats = await service.getQueueStats(eventId)
      io.to(room).emit('karaokeya:stats-updated', { eventId, stats })
    },

    /**
     * Notificar que se llamó al siguiente turno
     */
    notifyNextCalled: async (eventId: string, request: any) => {
      const room = getRoom(eventId)
      io.to(room).emit('karaokeya:next-called', { eventId, request })

      // Actualizar cola y stats
      const [queue, stats] = await Promise.all([
        service.getQueue(eventId),
        service.getQueueStats(eventId),
      ])

      io.to(room).emit('karaokeya:queue-updated', { eventId, queue })
      io.to(room).emit('karaokeya:stats-updated', { eventId, stats })
    },

    /**
     * Notificar nuevo request
     */
    notifyNewRequest: async (eventId: string, request: any) => {
      const room = getRoom(eventId)
      io.to(room).emit('karaokeya:new-request', { eventId, request })

      const stats = await service.getQueueStats(eventId)
      io.to(room).emit('karaokeya:stats-updated', { eventId, stats })
    },
  }
}

export type KaraokeyaSocketHandler = ReturnType<typeof setupKaraokeyaHandler>
