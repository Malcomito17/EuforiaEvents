/**
 * MUSICADJ Routes
 * Rutas públicas y protegidas para el módulo
 */

import { Router } from 'express'
import { authenticate, requireModuleAccess } from '../auth'
import * as controller from './musicadj.controller'

const router = Router({ mergeParams: true }) // mergeParams para acceder a :eventId

// ============================================
// Rutas Públicas (Cliente QR)
// ============================================

/**
 * POST /api/events/:eventId/musicadj/requests
 * Cualquiera con el link del evento puede crear solicitudes
 */
router.post('/requests', controller.createRequest)

/**
 * GET /api/events/:eventId/musicadj/config
 * Para mostrar mensaje de bienvenida, etc.
 */
router.get('/config', controller.getConfig)

// ============================================
// Rutas Protegidas (Operador)
// ============================================

// Aplicar auth a todas las rutas siguientes
router.use(authenticate)
router.use(requireModuleAccess('MUSICADJ'))

// Config
router.patch('/config', controller.updateConfig)

// Requests - CRUD
router.get('/requests', controller.listRequests)
router.get('/requests/:requestId', controller.getRequest)
router.patch('/requests/:requestId', controller.updateRequest)
router.delete('/requests/:requestId', controller.deleteRequest)

// Reordenar cola
router.post('/requests/reorder', controller.reorderQueue)

// Stats
router.get('/stats', controller.getStats)

export { router as musicadjRoutes }
