import { Router } from 'express'
import { menuController } from './menu.controller'
import { authenticate } from '../auth/auth.middleware'

const router = Router({ mergeParams: true }) // Importante para acceder a :eventId

// Todas las rutas requieren autenticación
router.use(authenticate)

// GET /api/events/:eventId/menu/alerts - Dashboard de alertas (antes de rutas genéricas)
router.get('/alerts', (req, res) => menuController.getAlerts(req, res))

// GET /api/events/:eventId/menu/guest/:eventGuestId - Menú de invitado (antes de rutas genéricas)
router.get('/guest/:eventGuestId', (req, res) => menuController.getGuestMenu(req, res))

// POST /api/events/:eventId/menu/categories - Crear categoría
router.post('/categories', (req, res) => menuController.createCategory(req, res))

// POST /api/events/:eventId/menu/assign - Asignar plato a invitado
router.post('/assign', (req, res) => menuController.assignDish(req, res))

// DELETE /api/events/:eventId/menu/assign/:guestDishId - Desasignar plato
router.delete('/assign/:guestDishId', (req, res) => menuController.unassignDish(req, res))

// POST /api/events/:eventId/menu/assign-auto - Asignación automática
router.post('/assign-auto', (req, res) => menuController.autoAssign(req, res))

// POST /api/events/:eventId/menu/dishes - Agregar plato al menú
router.post('/dishes', (req, res) => menuController.addDish(req, res))

// DELETE /api/events/:eventId/menu/dishes/:dishId - Quitar plato del menú
router.delete('/dishes/:dishId', (req, res) => menuController.removeDish(req, res))

// PATCH /api/events/:eventId/menu/dishes/:eventDishId/default - Marcar como default
router.patch('/dishes/:eventDishId/default', (req, res) => menuController.setDefault(req, res))

// GET /api/events/:eventId/menu - Obtener menú completo
router.get('/', (req, res) => menuController.getMenu(req, res))

export { router as menuRoutes }
