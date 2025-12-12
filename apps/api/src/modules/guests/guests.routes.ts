import { Router } from 'express'
import { guestsController } from './guests.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// Rutas públicas
// POST /api/guests/identify - Identificar o crear guest
router.post('/identify', (req, res) => guestsController.identify(req, res))

// GET /api/guests/lookup?email=xxx - Buscar guest por email (debe ir antes de /:guestId)
router.get('/lookup', (req, res) => guestsController.lookupByEmail(req, res))

// GET /api/guests/:guestId - Obtener guest por ID
router.get('/:guestId', (req, res) => guestsController.getById(req, res))

// GET /api/guests/:guestId/requests - Obtener pedidos del guest
router.get('/:guestId/requests', (req, res) => guestsController.getRequests(req, res))

// Rutas protegidas (requieren autenticación)
// GET /api/guests - Listar TODOS los guests (nuevo)
router.get('/', authenticate, (req, res) => guestsController.listAll(req, res))

// DELETE /api/guests/:guestId - Eliminar guest
router.delete('/:guestId', authenticate, (req, res) => guestsController.delete(req, res))

// Router para eventos (para usar en event routes)
const eventRouter = Router({ mergeParams: true })

// GET /api/events/:eventId/guests - Listar guests de un evento
eventRouter.get('/', authenticate, (req, res) => guestsController.listByEvent(req, res))

export { router as guestRoutes, eventRouter as eventGuestRoutes }
