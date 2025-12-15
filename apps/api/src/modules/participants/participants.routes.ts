import { Router } from 'express'
import { participantsController } from './participants.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// Rutas públicas
// POST /api/participants/identify - Identificar o crear participant
router.post('/identify', (req, res) => participantsController.identify(req, res))

// GET /api/participants/lookup?email=xxx - Buscar participant por email (debe ir antes de /:participantId)
router.get('/lookup', (req, res) => participantsController.lookupByEmail(req, res))

// GET /api/participants/:participantId - Obtener participant por ID
router.get('/:participantId', (req, res) => participantsController.getById(req, res))

// GET /api/participants/:participantId/requests - Obtener pedidos del participant
router.get('/:participantId/requests', (req, res) => participantsController.getRequests(req, res))

// Rutas protegidas (requieren autenticación)
// GET /api/participants - Listar TODOS los participants
router.get('/', authenticate, (req, res) => participantsController.listAll(req, res))

// DELETE /api/participants/:participantId - Eliminar participant
router.delete('/:participantId', authenticate, (req, res) => participantsController.delete(req, res))

// Router para eventos (para usar en event routes)
const eventRouter = Router({ mergeParams: true })

// GET /api/events/:eventId/participants - Listar participants de un evento
eventRouter.get('/', authenticate, (req, res) => participantsController.listByEvent(req, res))

export { router as participantRoutes, eventRouter as eventParticipantRoutes }
