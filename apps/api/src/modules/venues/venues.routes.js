"use strict";
/**
 * EUFORIA EVENTS - Venues Routes
 * Definición de rutas para gestión de venues
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venues_controller_1 = require("./venues.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Listar venues (cualquier usuario autenticado)
router.get('/', venues_controller_1.venueController.findAll);
// Obtener venue por ID (cualquier usuario autenticado)
router.get('/:id', venues_controller_1.venueController.findById);
// Crear venue (ADMIN o MANAGER)
router.post('/', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), venues_controller_1.venueController.create);
// Actualizar venue (ADMIN o MANAGER)
router.patch('/:id', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), venues_controller_1.venueController.update);
// Reactivar venue (ADMIN)
router.post('/:id/reactivate', (0, auth_middleware_1.requireRole)('ADMIN'), venues_controller_1.venueController.reactivate);
// Desactivar venue (ADMIN)
router.delete('/:id', (0, auth_middleware_1.requireRole)('ADMIN'), venues_controller_1.venueController.delete);
exports.default = router;
//# sourceMappingURL=venues.routes.js.map