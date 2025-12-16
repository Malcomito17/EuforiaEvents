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

// Obtener evento por slug con token de checkin
router.get('/by-slug/:slug', eventController.findBySlugWithToken)

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

// ============================================
// QR CODE ROUTES
// ============================================

// Obtener QR data (JSON con dataUrl, svg, url)
router.get(
  '/:id/qr',
  authenticate,
  eventController.getQRCode
)

// Descargar QR como PNG (Content-Disposition: attachment)
router.get(
  '/:id/qr/download',
  authenticate,
  eventController.downloadQR
)

// Preview QR como imagen (para mostrar inline en browser)
router.get(
  '/:id/qr/preview',
  authenticate,
  eventController.previewQR
)

// ============================================
// CHECK-IN ACCESS ROUTES
// ============================================

// Generar o regenerar token de acceso para check-in (ADMIN/MANAGER)
router.post(
  '/:id/checkin/generate-token',
  authenticate,
  requireRole('ADMIN', 'MANAGER'),
  eventController.generateCheckinToken
)

// Obtener link de acceso directo para check-in
router.get(
  '/:id/checkin/link',
  authenticate,
  eventController.getCheckinLink
)

// Obtener QR code para acceso directo al check-in
router.get(
  '/:id/checkin/qr',
  authenticate,
  eventController.getCheckinQR
)

// ============================================
// DANGER ZONE
// ============================================

// Eliminar evento (solo ADMIN)
router.delete(
  '/:id',
  authenticate,
  requireRole('ADMIN'),
  eventController.delete
)

export default router
