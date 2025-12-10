import { Router } from 'express'
import * as controller from './users.controller'
import { authenticate } from '../auth'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// CRUD de usuarios (solo ADMIN puede gestionar usuarios)
router.get('/', controller.listUsers)
router.post('/', controller.createUser)
router.get('/:userId', controller.getUser)
router.patch('/:userId', controller.updateUser)
router.delete('/:userId', controller.deleteUser)
router.post('/:userId/reactivate', controller.reactivateUser)

// Gestión de permisos
router.patch('/:userId/permissions', controller.updatePermissions)

// Helpers
router.get('/roles/:role/preset', controller.getRolePresets)

// Error handler
router.use(controller.errorHandler)

export default router
