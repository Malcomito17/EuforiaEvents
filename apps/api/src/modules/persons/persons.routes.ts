import { Router } from 'express'
import { personsController } from './persons.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// GET /api/persons/search?q=xxx - Buscar personas (debe ir antes de /:personId)
router.get('/search', (req, res) => personsController.search(req, res))

// GET /api/persons - Listar todas las personas
router.get('/', (req, res) => personsController.listAll(req, res))

// POST /api/persons - Crear persona
router.post('/', (req, res) => personsController.create(req, res))

// GET /api/persons/:personId - Obtener persona por ID
router.get('/:personId', (req, res) => personsController.getById(req, res))

// PUT /api/persons/:personId - Actualizar persona
router.put('/:personId', (req, res) => personsController.update(req, res))

// DELETE /api/persons/:personId - Eliminar persona
router.delete('/:personId', (req, res) => personsController.delete(req, res))

// POST /api/persons/:personId/link-participant - Enlazar con participante
router.post('/:personId/link-participant', (req, res) => personsController.linkParticipant(req, res))

// DELETE /api/persons/:personId/link-participant - Desenlazar de participante
router.delete('/:personId/link-participant', (req, res) => personsController.unlinkParticipant(req, res))

export { router as personRoutes }
