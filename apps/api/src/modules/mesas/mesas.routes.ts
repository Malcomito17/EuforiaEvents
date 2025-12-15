import { Router } from 'express'
import { mesasController } from './mesas.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router({ mergeParams: true }) // Importante para acceder a :eventId

// Todas las rutas requieren autenticación
router.use(authenticate)

// POST /api/events/:eventId/mesas/auto-assign - Auto-asignación (antes de /:mesaId)
router.post('/auto-assign', (req, res) => mesasController.autoAssign(req, res))

// POST /api/events/:eventId/mesas - Crear mesa
router.post('/', (req, res) => mesasController.create(req, res))

// GET /api/events/:eventId/mesas - Listar mesas
router.get('/', (req, res) => mesasController.listAll(req, res))

// GET /api/events/:eventId/mesas/:mesaId - Obtener mesa por ID
router.get('/:mesaId', (req, res) => mesasController.getById(req, res))

// PUT /api/events/:eventId/mesas/:mesaId - Actualizar mesa
router.put('/:mesaId', (req, res) => mesasController.update(req, res))

// DELETE /api/events/:eventId/mesas/:mesaId - Eliminar mesa
router.delete('/:mesaId', (req, res) => mesasController.delete(req, res))

export { router as mesasRoutes }
