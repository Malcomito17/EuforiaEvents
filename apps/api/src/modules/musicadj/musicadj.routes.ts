/**
 * MUSICADJ Routes
 * Rutas públicas y protegidas para el módulo
 */

import { Router } from 'express'
import { authenticate, requireModuleAccess } from '../auth/auth.middleware'
import * as controller from './musicadj.controller'

const router = Router({ mergeParams: true })

// ============================================
// Rutas Públicas (Cliente QR)
// ============================================

// Config (para mensaje de bienvenida, etc.)
router.get('/config', controller.getConfig)

// Búsqueda de Spotify
router.get('/search', controller.searchSpotify)
router.get('/track/:trackId', controller.getSpotifyTrack)

// Crear solicitud
router.post('/requests', controller.createRequest)

// ============================================
// Rutas Protegidas (Operador)
// ============================================

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
