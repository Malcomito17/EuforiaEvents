"use strict";
/**
 * EUFORIA EVENTS - Events Routes
 * Definición de rutas para gestión de eventos
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const events_controller_1 = require("./events.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// ============================================
// RUTAS PÚBLICAS (para clientes via QR)
// ============================================
// Obtener evento por slug (acceso público)
router.get('/slug/:slug', events_controller_1.eventController.findBySlug);
// ============================================
// RUTAS PROTEGIDAS
// ============================================
// Listar eventos (cualquier usuario autenticado)
router.get('/', auth_middleware_1.authenticate, events_controller_1.eventController.findAll);
// Obtener evento por ID (cualquier usuario autenticado)
router.get('/:id', auth_middleware_1.authenticate, events_controller_1.eventController.findById);
// Crear evento (ADMIN o MANAGER)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), events_controller_1.eventController.create);
// Actualizar evento (ADMIN o MANAGER)
router.patch('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), events_controller_1.eventController.update);
// Actualizar eventData (ADMIN o MANAGER)
router.patch('/:id/data', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), events_controller_1.eventController.updateEventData);
// Cambiar estado (ADMIN o MANAGER)
router.patch('/:id/status', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), events_controller_1.eventController.updateStatus);
// Duplicar evento (ADMIN o MANAGER)
router.post('/:id/duplicate', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN', 'MANAGER'), events_controller_1.eventController.duplicate);
// ============================================
// QR CODE ROUTES
// ============================================
// Obtener QR data (JSON con dataUrl, svg, url)
router.get('/:id/qr', auth_middleware_1.authenticate, events_controller_1.eventController.getQRCode);
// Descargar QR como PNG (Content-Disposition: attachment)
router.get('/:id/qr/download', auth_middleware_1.authenticate, events_controller_1.eventController.downloadQR);
// Preview QR como imagen (para mostrar inline en browser)
router.get('/:id/qr/preview', auth_middleware_1.authenticate, events_controller_1.eventController.previewQR);
// ============================================
// DANGER ZONE
// ============================================
// Eliminar evento (solo ADMIN)
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)('ADMIN'), events_controller_1.eventController.delete);
exports.default = router;
//# sourceMappingURL=events.routes.js.map