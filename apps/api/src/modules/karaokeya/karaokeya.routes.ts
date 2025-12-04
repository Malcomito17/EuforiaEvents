import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { KaraokeyaService } from './karaokeya.service'
import { KaraokeyaController, karaokeyaErrorHandler } from './karaokeya.controller'

// ============================================
// KARAOKEYA ROUTES
// ============================================

export function createKaraokeyaRouter(prisma: PrismaClient): Router {
  const router = Router()
  const service = new KaraokeyaService(prisma)
  const controller = new KaraokeyaController(service)

  // ============================================
  // RUTAS PÚBLICAS (Clientes via QR)
  // ============================================

  // POST /api/events/:eventId/karaokeya/requests
  // Anotarse para cantar
  router.post('/events/:eventId/karaokeya/requests', controller.createRequest)

  // GET /api/events/:eventId/karaokeya/queue
  // Ver cola actual (si showQueueToClient está habilitado)
  router.get('/events/:eventId/karaokeya/queue', controller.getQueue)

  // GET /api/events/:eventId/karaokeya/stats
  // Estadísticas de la cola
  router.get('/events/:eventId/karaokeya/stats', controller.getQueueStats)

  // GET /api/karaokeya/requests/:requestId
  // Ver estado de mi turno
  router.get('/karaokeya/requests/:requestId', controller.getRequest)

  // ============================================
  // RUTAS PROTEGIDAS (Operador)
  // Nota: El middleware de auth se aplica en app.ts
  // ============================================

  // GET /api/events/:eventId/karaokeya/config
  // Obtener configuración del módulo
  router.get('/events/:eventId/karaokeya/config', controller.getConfig)

  // PUT /api/events/:eventId/karaokeya/config
  // Actualizar configuración
  router.put('/events/:eventId/karaokeya/config', controller.updateConfig)

  // GET /api/events/:eventId/karaokeya/requests
  // Listar todos los requests con filtros
  router.get('/events/:eventId/karaokeya/requests', controller.listRequests)

  // PATCH /api/karaokeya/requests/:requestId/status
  // Cambiar estado de un turno
  router.patch('/karaokeya/requests/:requestId/status', controller.updateStatus)

  // POST /api/events/:eventId/karaokeya/call-next
  // Llamar al siguiente de la cola
  router.post('/events/:eventId/karaokeya/call-next', controller.callNext)

  // DELETE /api/karaokeya/requests/:requestId
  // Cancelar un turno
  router.delete('/karaokeya/requests/:requestId', controller.cancelRequest)

  // PATCH /api/karaokeya/requests/:requestId/reorder
  // Mover un turno a otra posición
  router.patch('/karaokeya/requests/:requestId/reorder', controller.reorderRequest)

  // POST /api/events/:eventId/karaokeya/reorder
  // Reordenar toda la cola (batch)
  router.post('/events/:eventId/karaokeya/reorder', controller.batchReorder)

  // Aplicar error handler específico
  router.use(karaokeyaErrorHandler)

  return router
}

// Export service y controller para uso en socket handlers
export { KaraokeyaService, KaraokeyaController }
