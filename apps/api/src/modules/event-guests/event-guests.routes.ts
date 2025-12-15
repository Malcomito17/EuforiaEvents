import { Router } from 'express'
import { EventGuestsController } from './event-guests.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router({ mergeParams: true }) // Importante para acceder a :eventId
const controller = new EventGuestsController()

// Todas las rutas requieren autenticación
router.use(authenticate)

// POST /api/events/:eventId/guests/import - Importar CSV (debe ir antes de /:guestId)
router.post('/import', (req, res) => controller.importCSV(req, res))

// GET /api/events/:eventId/guests/stats - Estadísticas (debe ir antes de /:guestId)
router.get('/stats', (req, res) => controller.getStats(req, res))

// POST /api/events/:eventId/guests - Agregar invitado
router.post('/', (req, res) => controller.addGuest(req, res))

// GET /api/events/:eventId/guests - Listar guestlist
router.get('/', (req, res) => controller.getGuestlist(req, res))

// PUT /api/events/:eventId/guests/:guestId - Actualizar invitado
router.put('/:guestId', (req, res) => controller.updateGuest(req, res))

// DELETE /api/events/:eventId/guests/:guestId - Quitar invitado
router.delete('/:guestId', (req, res) => controller.removeGuest(req, res))

// POST /api/events/:eventId/guests/:guestId/checkin - Check-in
router.post('/:guestId/checkin', (req, res) => controller.checkIn(req, res))

// POST /api/events/:eventId/guests/:guestId/checkout - Check-out
router.post('/:guestId/checkout', (req, res) => controller.checkOut(req, res))

export { router as eventGuestRoutes }
