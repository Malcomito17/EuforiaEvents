/**
 * KARAOKEYA Routes
 * Rutas públicas y protegidas para el módulo de karaoke
 */

import { Router } from 'express'
import { authenticate, requireModuleAccess } from '../auth'
import * as controller from './karaokeya.controller'

const router = Router({ mergeParams: true })

// ============================================
// Rutas Públicas (Cliente QR)
// ============================================

// Config (para verificar si está habilitado, etc.)
router.get('/config', controller.getConfig)

// Ver cola actual
router.get('/queue', controller.getQueue)

// Ver estadísticas
router.get('/stats', controller.getStats)

// Crear turno (anotarse)
router.post('/requests', controller.createRequest)

// Ver mi turno específico
router.get('/requests/:requestId', controller.getRequest)

// ============================================
// Rutas Protegidas (Operador)
// ============================================

router.use(authenticate)
router.use(requireModuleAccess('KARAOKEYA'))

// Config
router.patch('/config', controller.updateConfig)

// Requests - CRUD
router.get('/requests', controller.listRequests)
router.patch('/requests/:requestId', controller.updateRequest)
router.delete('/requests/:requestId', controller.deleteRequest)

// Llamar al siguiente
router.post('/call-next', controller.callNext)

// Reordenar cola
router.post('/requests/reorder', controller.reorderQueue)

// Error handler específico del módulo
router.use(controller.karaokeyaErrorHandler)

export { router as karaokeyaRoutes }
