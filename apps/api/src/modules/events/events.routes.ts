/**
 * EUFORIA EVENTS - Events Routes
 * Definición de rutas para gestión de eventos
 */

import { Router } from 'express'
import { eventController } from './events.controller'
import { authenticate, requireRole } from '../auth/auth.middleware'

const router = Router()

// ============================================
// RUTAS PÚBLICAS (para clientes via QR)
// ============================================

// Obtener evento por slug (acceso público)
router.get('/slug/:slug', eventController.findBySlug)

// ============================================
// RUTAS PROTEGIDAS
// ============================================

// Listar eventos (cualquier usuario autenticado)
router.get('/', authenticate, eventController.findAll)

// Obtener evento por ID (cualquier usuario autenticado)
router.get('/:id', authenticate, eventController.findById)

// Crear evento (ADMIN o MANAGER)
router.post(
  '/',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.create
)

// Actualizar evento (ADMIN o MANAGER)
router.patch(
  '/:id',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.update
)

// Actualizar eventData (ADMIN o MANAGER)
router.patch(
  '/:id/data',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.updateEventData
)

// Cambiar estado (ADMIN o MANAGER)
router.patch(
  '/:id/status',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.updateStatus
)

// Duplicar evento (ADMIN o MANAGER)
router.post(
  '/:id/duplicate',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.duplicate
)

// Eliminar evento (solo ADMIN)
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  eventController.delete
)

export default router
