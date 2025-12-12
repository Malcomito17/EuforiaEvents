"use strict";
/**
 * EUFORIA EVENTS - Clients Routes
 * Definición de rutas para gestión de clientes
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const clients_controller_1 = require("./clients.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación
router.use(auth_middleware_1.authenticate);
// Listar clientes (cualquier usuario autenticado)
router.get('/', clients_controller_1.clientController.findAll);
// Obtener cliente por ID (cualquier usuario autenticado)
router.get('/:id', clients_controller_1.clientController.findById);
// Crear cliente (ADMIN o MANAGER)
router.post('/', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), clients_controller_1.clientController.create);
// Actualizar cliente (ADMIN o MANAGER)
router.patch('/:id', (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), clients_controller_1.clientController.update);
// Reactivar cliente (ADMIN)
router.post('/:id/reactivate', (0, auth_middleware_1.requireRole)('ADMIN'), clients_controller_1.clientController.reactivate);
// Desactivar cliente (ADMIN)
router.delete('/:id', (0, auth_middleware_1.requireRole)('ADMIN'), clients_controller_1.clientController.delete);
exports.default = router;
//# sourceMappingURL=clients.routes.js.map