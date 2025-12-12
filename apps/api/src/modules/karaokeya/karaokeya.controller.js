"use strict";
/**
 * KARAOKEYA Controller
 * Handlers HTTP con búsqueda híbrida (BD + YouTube)
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
exports.getConfig = getConfig;
exports.updateConfig = updateConfig;
exports.hybridSearch = hybridSearch;
exports.getPopularSongs = getPopularSongs;
exports.getSmartSuggestions = getSmartSuggestions;
exports.createRequest = createRequest;
exports.listRequests = listRequests;
exports.getGuestRequests = getGuestRequests;
exports.getPublicQueue = getPublicQueue;
exports.getRequest = getRequest;
exports.updateRequest = updateRequest;
exports.deleteRequest = deleteRequest;
exports.reorderQueue = reorderQueue;
exports.getStats = getStats;
exports.getMessages = getMessages;
exports.listSongs = listSongs;
exports.getSong = getSong;
exports.createSong = createSong;
exports.updateSong = updateSong;
exports.deleteSong = deleteSong;
exports.reactivateSong = reactivateSong;
exports.toggleLike = toggleLike;
exports.getLikeStatus = getLikeStatus;
exports.getGuestLikedSongs = getGuestLikedSongs;
exports.getDisplay = getDisplay;
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const types_1 = require("../../shared/types");
const socket_1 = require("../../socket");
const service = __importStar(require("./karaokeya.service"));
const youtube = __importStar(require("./youtube.service"));
const messages_service_1 = require("../../shared/services/messages.service");
const karaokeya_types_1 = require("./karaokeya.types");
// ============================================
// Config Endpoints
// ============================================
/**
 * GET /api/events/:eventId/karaokeya/config
 */
async function getConfig(req, res, next) {
    try {
        const { eventId } = req.params;
        const config = await service.getOrCreateConfig(eventId);
        // Incluir info de si YouTube está disponible
        res.json({
            ...config,
            youtubeAvailable: youtube.isYouTubeConfigured(),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PATCH /api/events/:eventId/karaokeya/config
 */
async function updateConfig(req, res, next) {
    try {
        const { eventId } = req.params;
        const input = karaokeya_types_1.karaokeyaConfigSchema.parse(req.body);
        const config = await service.updateConfig(eventId, input);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitKaraokeConfigUpdated)(io, eventId, config);
        res.json(config);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Search Endpoints
// ============================================
/**
 * GET /api/events/:eventId/karaokeya/search
 * Búsqueda híbrida: BD (3 populares) + YouTube (5 nuevos)
 */
async function hybridSearch(req, res, next) {
    try {
        const { eventId } = req.params;
        const { q } = karaokeya_types_1.searchQuerySchema.parse(req.query);
        // Permitir búsqueda en catálogo incluso si YouTube no está configurado
        const result = await service.hybridSearch(eventId, q);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/popular
 * Obtiene canciones populares del catálogo filtradas por evento
 */
async function getPopularSongs(req, res, next) {
    try {
        const { eventId } = req.params;
        const { limit } = karaokeya_types_1.popularSongsQuerySchema.parse(req.query);
        const songs = await service.getPopularSongs(eventId, limit);
        res.json({ songs, total: songs.length });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/suggestions
 * Obtiene sugerencias inteligentes basadas en contexto y guest
 */
async function getSmartSuggestions(req, res, next) {
    try {
        const { eventId } = req.params;
        const schema = zod_1.z.object({
            guestId: zod_1.z.string().cuid().optional(),
            limit: zod_1.z.coerce.number().int().min(1).max(10).default(5),
        });
        const { guestId, limit } = schema.parse(req.query);
        const suggestions = await service.getSmartSuggestions(eventId, guestId, limit);
        res.json({ suggestions, total: suggestions.length });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Request Endpoints
// ============================================
/**
 * POST /api/events/:eventId/karaokeya/requests
 * Crea una nueva solicitud de karaoke
 */
async function createRequest(req, res, next) {
    try {
        const { eventId } = req.params;
        const input = karaokeya_types_1.createKaraokeRequestSchema.parse(req.body);
        const request = await service.createRequest(eventId, input);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitNewKaraokeRequest)(io, eventId, request);
        res.status(201).json(request);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/requests
 * Lista solicitudes de un evento
 */
async function listRequests(req, res, next) {
    try {
        const { eventId } = req.params;
        const { status } = karaokeya_types_1.listRequestsQuerySchema.parse(req.query);
        const requests = await service.listRequests(eventId, status);
        res.json({ requests, total: requests.length });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/guests/:guestId/requests
 * Obtiene solicitudes de un guest específico
 */
async function getGuestRequests(req, res, next) {
    try {
        const { eventId, guestId } = req.params;
        const requests = await service.getGuestRequests(eventId, guestId);
        res.json({ requests, total: requests.length });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/queue
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
async function getPublicQueue(req, res, next) {
    try {
        const { eventId } = req.params;
        const requests = await service.getPublicQueue(eventId);
        res.json({ requests, total: requests.length });
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/requests/:requestId
 * Obtiene una solicitud específica
 */
async function getRequest(req, res, next) {
    try {
        const { eventId, requestId } = req.params;
        const request = await service.getRequestById(eventId, requestId);
        res.json(request);
    }
    catch (error) {
        next(error);
    }
}
/**
 * PATCH /api/events/:eventId/karaokeya/requests/:requestId
 * Actualiza el estado de una solicitud
 */
async function updateRequest(req, res, next) {
    try {
        const { eventId, requestId } = req.params;
        const { status } = karaokeya_types_1.updateKaraokeRequestSchema.parse(req.body);
        const request = await service.updateRequestStatus(eventId, requestId, status);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitKaraokeRequestUpdated)(io, eventId, request);
        res.json(request);
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/events/:eventId/karaokeya/requests/:requestId
 * Elimina una solicitud
 */
async function deleteRequest(req, res, next) {
    try {
        const { eventId, requestId } = req.params;
        const result = await service.deleteRequest(eventId, requestId);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitKaraokeRequestDeleted)(io, eventId, requestId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/events/:eventId/karaokeya/requests/reorder
 * Reordena la cola
 */
async function reorderQueue(req, res, next) {
    try {
        const { eventId } = req.params;
        const { requestIds } = karaokeya_types_1.reorderQueueSchema.parse(req.body);
        const result = await service.reorderQueue(eventId, requestIds);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitKaraokeQueueReordered)(io, eventId, requestIds);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/karaokeya/stats
 * Obtiene estadísticas del módulo
 */
async function getStats(req, res, next) {
    try {
        const { eventId } = req.params;
        const stats = await service.getStats(eventId);
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Messages Endpoint
// ============================================
/**
 * GET /api/events/:eventId/karaokeya/messages
 * Obtiene mensajes configurables del módulo
 */
async function getMessages(req, res, next) {
    try {
        const { eventId } = req.params;
        const langSchema = zod_1.z.object({
            lang: zod_1.z.enum(['es', 'en', 'formal']).default('es'),
        });
        const { lang } = langSchema.parse(req.query);
        // Obtener config para mensajes custom
        const config = await service.getOrCreateConfig(eventId);
        // Cargar mensajes por defecto
        const defaultMessages = (0, messages_service_1.getDefaultMessages)('karaokeya', lang);
        // TODO: Merge con customMessages de la config
        res.json(defaultMessages);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// CATALOG CRUD CONTROLLERS
// ============================================
async function listSongs(req, res, next) {
    try {
        const result = await service.listCatalogSongs(req.query);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getSong(req, res, next) {
    try {
        const song = await service.getCatalogSong(req.params.songId);
        res.json(song);
    }
    catch (error) {
        next(error);
    }
}
async function createSong(req, res, next) {
    try {
        const song = await service.createCatalogSong(req.body);
        res.status(201).json(song);
    }
    catch (error) {
        next(error);
    }
}
async function updateSong(req, res, next) {
    try {
        const song = await service.updateCatalogSong(req.params.songId, req.body);
        res.json(song);
    }
    catch (error) {
        next(error);
    }
}
async function deleteSong(req, res, next) {
    try {
        const result = await service.deleteCatalogSong(req.params.songId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function reactivateSong(req, res, next) {
    try {
        const song = await service.reactivateCatalogSong(req.params.songId);
        res.json(song);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// LIKE SYSTEM CONTROLLERS
// ============================================
async function toggleLike(req, res, next) {
    try {
        const { songId } = req.params;
        const { guestId } = req.body;
        if (!guestId) {
            return res.status(400).json({ error: 'guestId es requerido' });
        }
        const result = await service.toggleSongLike(songId, guestId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getLikeStatus(req, res, next) {
    try {
        const { songId } = req.params;
        const { guestId } = req.query;
        if (!guestId || typeof guestId !== 'string') {
            return res.status(400).json({ error: 'guestId query param es requerido' });
        }
        const result = await service.getSongLikeStatus(songId, guestId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
async function getGuestLikedSongs(req, res, next) {
    try {
        const { guestId } = req.params;
        const limit = req.query.limit ? parseInt(req.query.limit) : 50;
        const result = await service.getGuestLikedSongs(guestId, limit);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// DISPLAY SCREEN (Pantalla pública)
// ============================================
async function getDisplay(req, res, next) {
    try {
        const { eventSlug } = req.params;
        const data = await service.getDisplayData(eventSlug);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Error Handler
// ============================================
function errorHandler(err, req, res, next) {
    console.error('[KARAOKEYA] Error:', err);
    if (err.name === 'KaraokeyaError') {
        return res.status(err.statusCode || 400).json({
            error: err.message
        });
    }
    if (err.name === 'YouTubeError') {
        return res.status(err.statusCode || 502).json({
            error: err.message
        });
    }
    if (err.name === 'ZodError') {
        return res.status(400).json({
            error: 'Datos inválidos',
            details: err.errors
        });
    }
    res.status(500).json({
        error: 'Error interno del servidor'
    });
}
//# sourceMappingURL=karaokeya.controller.js.map