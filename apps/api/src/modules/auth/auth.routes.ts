import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate, requireRole } from './auth.middleware'

const router = Router()

// Rutas públicas
router.post('/login', authController.login)

// Rutas protegidas
router.get('/me', authenticate, authController.me)
router.post('/change-password', authenticate, authController.changePassword)

// Solo ADMIN puede registrar usuarios
router.post('/register', authenticate, requireRole('ADMIN'), authController.register)

export default router
