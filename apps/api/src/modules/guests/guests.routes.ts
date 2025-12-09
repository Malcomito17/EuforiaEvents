import { Router } from 'express'
import { guestsController } from './guests.controller'

const router = Router()

// POST /api/guests/identify - Identificar o crear guest
router.post('/identify', (req, res) => guestsController.identify(req, res))

// GET /api/guests/:guestId - Obtener guest por ID
router.get('/:guestId', (req, res) => guestsController.getById(req, res))

// GET /api/guests/:guestId/requests - Obtener pedidos del guest
router.get('/:guestId/requests', (req, res) => guestsController.getRequests(req, res))

export { router as guestRoutes }
