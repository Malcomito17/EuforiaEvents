/**
 * Upload Routes - Rutas para subir archivos
 */

import { Router } from 'express'
import { authenticate, requireModuleAccess } from '../auth/auth.middleware'
import { upload } from '../../shared/services/upload.service'
import * as controller from './upload.controller'

const router = Router()

// Middleware de autenticación para todas las rutas
const protectedMiddleware = [authenticate]

// Event image upload/delete (cualquier usuario autenticado puede subir)
router.post(
  '/events/:eventId/upload-image',
  ...protectedMiddleware,
  upload.single('image'),
  controller.uploadEventImage
)

router.delete(
  '/events/:eventId/delete-image',
  ...protectedMiddleware,
  controller.deleteEventImage
)

// Karaokeya promo image upload/delete (requiere acceso al módulo)
const karaokeyaMiddleware = [authenticate, requireModuleAccess('KARAOKEYA')]

router.post(
  '/events/:eventId/karaokeya/upload-promo',
  ...karaokeyaMiddleware,
  upload.single('image'),
  controller.uploadKaraokeyaPromoImage
)

router.delete(
  '/events/:eventId/karaokeya/delete-promo',
  ...karaokeyaMiddleware,
  controller.deleteKaraokeyaPromoImage
)

export { router as uploadRoutes }
