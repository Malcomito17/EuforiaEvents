import { Router } from 'express'
import { dishesController } from './dishes.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router()

// Todas las rutas requieren autenticación
router.use(authenticate)

// GET /api/dishes/search?q=xxx - Buscar platos (debe ir antes de /:dishId)
router.get('/search', (req, res) => dishesController.search(req, res))

// POST /api/dishes - Crear plato
router.post('/', (req, res) => dishesController.create(req, res))

// GET /api/dishes - Listar platos
router.get('/', (req, res) => dishesController.listAll(req, res))

// GET /api/dishes/:dishId - Obtener plato por ID
router.get('/:dishId', (req, res) => dishesController.getById(req, res))

// PUT /api/dishes/:dishId - Actualizar plato
router.put('/:dishId', (req, res) => dishesController.update(req, res))

// DELETE /api/dishes/:dishId - Desactivar plato
router.delete('/:dishId', (req, res) => dishesController.delete(req, res))

export { router as dishRoutes }
