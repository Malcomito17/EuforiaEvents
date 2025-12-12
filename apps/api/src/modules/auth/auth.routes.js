"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const auth_middleware_1 = require("./auth.middleware");
const router = (0, express_1.Router)();
// Rutas públicas
router.post('/login', auth_controller_1.authController.login);
// Rutas protegidas
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.me);
router.post('/change-password', auth_middleware_1.authenticate, auth_controller_1.authController.changePassword);
// Solo ADMIN puede registrar usuarios
router.post('/register', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), auth_controller_1.authController.register);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map