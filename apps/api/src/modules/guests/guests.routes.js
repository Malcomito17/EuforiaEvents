"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventGuestRoutes = exports.guestRoutes = void 0;
const express_1 = require("express");
const guests_controller_1 = require("./guests.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
exports.guestRoutes = router;
// Rutas públicas
// POST /api/guests/identify - Identificar o crear guest
router.post('/identify', (req, res) => guests_controller_1.guestsController.identify(req, res));
// GET /api/guests/:guestId - Obtener guest por ID
router.get('/:guestId', (req, res) => guests_controller_1.guestsController.getById(req, res));
// GET /api/guests/:guestId/requests - Obtener pedidos del guest
router.get('/:guestId/requests', (req, res) => guests_controller_1.guestsController.getRequests(req, res));
// Rutas protegidas (requieren autenticación)
// GET /api/guests - Listar TODOS los guests (nuevo)
router.get('/', auth_middleware_1.authenticate, (req, res) => guests_controller_1.guestsController.listAll(req, res));
// DELETE /api/guests/:guestId - Eliminar guest
router.delete('/:guestId', auth_middleware_1.authenticate, (req, res) => guests_controller_1.guestsController.delete(req, res));
// Router para eventos (para usar en event routes)
const eventRouter = (0, express_1.Router)({ mergeParams: true });
exports.eventGuestRoutes = eventRouter;
// GET /api/events/:eventId/guests - Listar guests de un evento
eventRouter.get('/', auth_middleware_1.authenticate, (req, res) => guests_controller_1.guestsController.listByEvent(req, res));
//# sourceMappingURL=guests.routes.js.map