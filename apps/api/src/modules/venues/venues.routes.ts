/**
 * EUFORIA EVENTS - Venues Routes
 * Definición de rutas para gestión de venues
 */

import { Router } from 'express'
import { venueController } from './venues.controller'
import { authenticate, requireRole } from '../auth/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Listar venues (cualquier usuario autenticado)
router.get('/', venueController.findAll)

// Obtener venue por ID (cualquier usuario autenticado)
router.get('/:id', venueController.findById)

// Crear venue (ADMIN o MANAGER)
router.post('/', requireRole('ADMIN', 'MANAGER'), venueController.create)

// Actualizar venue (ADMIN o MANAGER)
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), venueController.update)

// Reactivar venue (ADMIN)
router.post('/:id/reactivate', requireRole('ADMIN'), venueController.reactivate)

// Desactivar venue (ADMIN)
router.delete('/:id', requireRole('ADMIN'), venueController.delete)

export default router
