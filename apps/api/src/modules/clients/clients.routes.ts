/**
 * EUFORIA EVENTS - Clients Routes
 * Definición de rutas para gestión de clientes
 */

import { Router } from 'express'
import { clientController } from './clients.controller'
import { authenticate, requireRole } from '../auth/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// Listar clientes (cualquier usuario autenticado)
router.get('/', clientController.findAll)

// Obtener cliente por ID (cualquier usuario autenticado)
router.get('/:id', clientController.findById)

// Crear cliente (ADMIN o MANAGER)
router.post('/', requireRole('ADMIN', 'MANAGER'), clientController.create)

// Actualizar cliente (ADMIN o MANAGER)
router.patch('/:id', requireRole('ADMIN', 'MANAGER'), clientController.update)

// Reactivar cliente (ADMIN)
router.post('/:id/reactivate', requireRole('ADMIN'), clientController.reactivate)

// Desactivar cliente (ADMIN)
router.delete('/:id', requireRole('ADMIN'), clientController.delete)

export default router
