"use strict";
/**
 * KARAOKEYA Routes
 * Rutas públicas y protegidas para el módulo
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.karaokeyaGlobalRoutes = exports.karaokeyaRoutes = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../auth/auth.middleware");
const controller = __importStar(require("./karaokeya.controller"));
// Router para rutas relacionadas con eventos (incluye :eventId en params)
const eventRouter = (0, express_1.Router)({ mergeParams: true });
exports.karaokeyaRoutes = eventRouter;
// Router para rutas globales (catálogo, no requiere eventId)
const globalRouter = (0, express_1.Router)();
exports.karaokeyaGlobalRoutes = globalRouter;
// ============================================
// RUTAS DE EVENTOS (con eventId)
// ============================================
// Rutas Públicas (Cliente QR)
eventRouter.get('/config', controller.getConfig);
eventRouter.get('/search', controller.hybridSearch);
eventRouter.get('/popular', controller.getPopularSongs);
eventRouter.get('/suggestions', controller.getSmartSuggestions);
eventRouter.get('/messages', controller.getMessages);
eventRouter.post('/requests', controller.createRequest);
eventRouter.get('/guests/:guestId/requests', controller.getGuestRequests);
eventRouter.get('/queue', controller.getPublicQueue);
// Rutas Protegidas (Operador)
eventRouter.use(auth_middleware_1.authenticate);
eventRouter.use((0, auth_middleware_1.requireModuleAccess)('KARAOKEYA'));
eventRouter.patch('/config', controller.updateConfig);
eventRouter.get('/requests', controller.listRequests);
eventRouter.get('/requests/:requestId', controller.getRequest);
eventRouter.patch('/requests/:requestId', controller.updateRequest);
eventRouter.delete('/requests/:requestId', controller.deleteRequest);
eventRouter.post('/requests/reorder', controller.reorderQueue);
eventRouter.get('/stats', controller.getStats);
// ============================================
// RUTAS GLOBALES (sin eventId - para CRUD de catálogo)
// ============================================
// Sistema de "Me Gusta" (público para invitados)
globalRouter.post('/songs/:songId/like', controller.toggleLike);
globalRouter.get('/songs/:songId/like-status', controller.getLikeStatus);
globalRouter.get('/guests/:guestId/liked-songs', controller.getGuestLikedSongs);
// Display Screen (público - para pantalla grande)
globalRouter.get('/display/:eventSlug', controller.getDisplay);
// CRUD de Catálogo de Canciones (protegido)
globalRouter.use(auth_middleware_1.authenticate);
globalRouter.use((0, auth_middleware_1.requireModuleAccess)('KARAOKEYA'));
globalRouter.get('/songs', controller.listSongs);
globalRouter.post('/songs', controller.createSong);
globalRouter.get('/songs/:songId', controller.getSong);
globalRouter.patch('/songs/:songId', controller.updateSong);
globalRouter.delete('/songs/:songId', controller.deleteSong);
globalRouter.post('/songs/:songId/reactivate', controller.reactivateSong);
// Error handlers
eventRouter.use(controller.errorHandler);
globalRouter.use(controller.errorHandler);
//# sourceMappingURL=karaokeya.routes.js.map