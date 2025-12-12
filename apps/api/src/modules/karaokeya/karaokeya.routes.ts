/**
 * KARAOKEYA Routes
 * Rutas públicas y protegidas para el módulo
 */

import { Router } from 'express'
import { authenticate, requireModuleAccess } from '../auth/auth.middleware'
import * as controller from './karaokeya.controller'

// Router para rutas relacionadas con eventos (incluye :eventId en params)
const eventRouter = Router({ mergeParams: true })

// Router para rutas globales (catálogo, no requiere eventId)
const globalRouter = Router()

// ============================================
// RUTAS DE EVENTOS (con eventId)
// ============================================

// Rutas Públicas (Cliente QR)
eventRouter.get('/config', controller.getConfig)
eventRouter.get('/search', controller.hybridSearch)
eventRouter.get('/popular', controller.getPopularSongs)
eventRouter.get('/suggestions', controller.getSmartSuggestions)
eventRouter.get('/messages', controller.getMessages)
eventRouter.post('/requests', controller.createRequest)
eventRouter.get('/guests/:guestId/requests', controller.getGuestRequests)
// TODO: Fix this - getPublicQueue is not defined in controller
// eventRouter.get('/queue', controller.getPublicQueue)

// Rutas Protegidas (Operador)
eventRouter.use(authenticate)
eventRouter.use(requireModuleAccess('KARAOKEYA'))
eventRouter.patch('/config', controller.updateConfig)
eventRouter.get('/requests', controller.listRequests)
eventRouter.get('/requests/:requestId', controller.getRequest)
eventRouter.patch('/requests/:requestId', controller.updateRequest)
eventRouter.delete('/requests/:requestId', controller.deleteRequest)
eventRouter.post('/requests/reorder', controller.reorderQueue)
eventRouter.get('/stats', controller.getStats)

// ============================================
// RUTAS GLOBALES (sin eventId - para CRUD de catálogo)
// ============================================

// Sistema de "Me Gusta" (público para invitados)
globalRouter.post('/songs/:songId/like', controller.toggleLike)
globalRouter.get('/songs/:songId/like-status', controller.getLikeStatus)
globalRouter.get('/guests/:guestId/liked-songs', controller.getGuestLikedSongs)

// Display Screen (público - para pantalla grande)
globalRouter.get('/display/:eventSlug', controller.getDisplay)

// CRUD de Catálogo de Canciones (protegido)
globalRouter.use(authenticate)
globalRouter.use(requireModuleAccess('KARAOKEYA'))
globalRouter.get('/songs', controller.listSongs)
globalRouter.post('/songs', controller.createSong)
globalRouter.get('/songs/:songId', controller.getSong)
globalRouter.patch('/songs/:songId', controller.updateSong)
globalRouter.delete('/songs/:songId', controller.deleteSong)
globalRouter.post('/songs/:songId/reactivate', controller.reactivateSong)

// Error handlers
eventRouter.use(controller.errorHandler)
globalRouter.use(controller.errorHandler)

export { eventRouter as karaokeyaRoutes, globalRouter as karaokeyaGlobalRoutes }
