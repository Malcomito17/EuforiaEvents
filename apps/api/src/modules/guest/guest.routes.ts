import { Router } from 'express'
import * as controller from './guest.controller'

const router = Router()

// POST /api/guests/identify - Identificar o crear guest
router.post('/identify', controller.identify)

// GET /api/guests/by-email?email=xxx - Buscar por email
router.get('/by-email', controller.getByEmail)

// GET /api/guests/:guestId - Obtener por ID
router.get('/:guestId', controller.getById)

// GET /api/guests/:guestId/requests?eventId=xxx - Obtener requests
router.get('/:guestId/requests', controller.getRequests)

export default router
