/**
 * EUFORIA EVENTS - DJ Routes
 * Rutas para operaciones del rol DJ
 */

import { Router } from 'express'
import { djController } from './dj.controller'
import { authenticate, requireRole } from '../auth/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación y rol DJ
router.use(authenticate)
router.use(requireRole('DJ', 'ADMIN')) // ADMIN también puede acceder

// ============================================
// EVENTOS
// ============================================

// Obtener eventos asignados
router.get('/events', djController.getEvents)

// ============================================
// MUSICADJ
// ============================================

// Obtener pedidos musicales de un evento
router.get('/events/:eventId/musicadj', djController.getMusicaDJRequests)

// Actualizar estado de pedido musical
router.patch('/events/:eventId/musicadj/:requestId', djController.updateMusicaDJRequestStatus)

// Reordenar cola de pedidos musicales
router.post('/events/:eventId/musicadj/reorder', djController.reorderMusicaDJQueue)

// ============================================
// KARAOKEYA
// ============================================

// Obtener pedidos de karaoke de un evento
router.get('/events/:eventId/karaokeya', djController.getKaraokeyaRequests)

// Actualizar estado de pedido de karaoke
router.patch('/events/:eventId/karaokeya/:requestId', djController.updateKaraokeyaRequestStatus)

// Reordenar cola de karaoke
router.post('/events/:eventId/karaokeya/reorder', djController.reorderKaraokeyaQueue)

// ============================================
// PARTICIPANTES
// ============================================

// Obtener historial de un participante
router.get('/participants/:participantId/history', djController.getParticipantHistory)

export default router
