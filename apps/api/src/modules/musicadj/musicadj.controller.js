"use strict";
/**
 * MUSICADJ Controller
 * Handlers HTTP con integración Socket.io y Spotify
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
exports.searchSpotify = searchSpotify;
exports.getSpotifyTrack = getSpotifyTrack;
exports.createRequest = createRequest;
exports.listRequests = listRequests;
exports.getRequest = getRequest;
exports.updateRequest = updateRequest;
exports.deleteRequest = deleteRequest;
exports.reorderQueue = reorderQueue;
exports.getStats = getStats;
const zod_1 = require("zod");
const types_1 = require("../../shared/types");
const socket_1 = require("../../socket");
const service = __importStar(require("./musicadj.service"));
const spotify = __importStar(require("./spotify.service"));
const musicadj_types_1 = require("./musicadj.types");
// ============================================
// Config Endpoints
// ============================================
/**
 * GET /api/events/:eventId/musicadj/config
 */
async function getConfig(req, res, next) {
    try {
        const { eventId } = req.params;
        const config = await service.getOrCreateConfig(eventId);
        // Incluir info de si Spotify está disponible
        res.json({
            ...config,
            spotifyAvailable: spotify.isSpotifyConfigured(),
        });
    }
    catch (error) {
        next(error);
    }
}
/**
 * PATCH /api/events/:eventId/musicadj/config
 */
async function updateConfig(req, res, next) {
    try {
        const { eventId } = req.params;
        const input = musicadj_types_1.musicadjConfigSchema.parse(req.body);
        const config = await service.updateConfig(eventId, input);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitConfigUpdated)(io, eventId, config);
        res.json(config);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Spotify Search Endpoints
// ============================================
const searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1).max(100),
    limit: zod_1.z.coerce.number().int().min(1).max(20).default(10),
});
/**
 * GET /api/events/:eventId/musicadj/search
 * Busca tracks en Spotify (público)
 */
async function searchSpotify(req, res, next) {
    try {
        const { q, limit } = searchQuerySchema.parse(req.query);
        // Verificar si Spotify está configurado
        if (!spotify.isSpotifyConfigured()) {
            return res.status(503).json({
                error: 'Búsqueda de Spotify no disponible',
                spotifyAvailable: false,
            });
        }
        const result = await spotify.searchTracks(q, limit);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/musicadj/track/:trackId
 * Obtiene info de un track específico
 */
async function getSpotifyTrack(req, res, next) {
    try {
        const { trackId } = req.params;
        if (!spotify.isSpotifyConfigured()) {
            return res.status(503).json({
                error: 'Spotify no disponible',
                spotifyAvailable: false,
            });
        }
        const track = await spotify.getTrackById(trackId);
        if (!track) {
            return res.status(404).json({ error: 'Track no encontrado' });
        }
        res.json(track);
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// Song Request Endpoints
// ============================================
/**
 * POST /api/events/:eventId/musicadj/requests
 */
async function createRequest(req, res, next) {
    try {
        const { eventId } = req.params;
        const input = musicadj_types_1.createSongRequestSchema.parse(req.body);
        const request = await service.createRequest(eventId, input);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitNewRequest)(io, eventId, request);
        res.status(201).json(request);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/musicadj/requests
 */
async function listRequests(req, res, next) {
    try {
        const { eventId } = req.params;
        const query = musicadj_types_1.listRequestsQuerySchema.parse(req.query);
        const result = await service.listRequests(eventId, query);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/musicadj/requests/:requestId
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
 * PATCH /api/events/:eventId/musicadj/requests/:requestId
 */
async function updateRequest(req, res, next) {
    try {
        const { eventId, requestId } = req.params;
        const input = musicadj_types_1.updateSongRequestSchema.parse(req.body);
        const request = await service.updateRequest(eventId, requestId, input);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitRequestUpdated)(io, eventId, request);
        res.json(request);
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/events/:eventId/musicadj/requests/:requestId
 */
async function deleteRequest(req, res, next) {
    try {
        const { eventId, requestId } = req.params;
        await service.deleteRequest(eventId, requestId);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitRequestDeleted)(io, eventId, requestId);
        res.status(204).send();
    }
    catch (error) {
        next(error);
    }
}
/**
 * POST /api/events/:eventId/musicadj/requests/reorder
 */
async function reorderQueue(req, res, next) {
    try {
        const { eventId } = req.params;
        const { requestIds } = musicadj_types_1.reorderQueueSchema.parse(req.body);
        const result = await service.reorderQueue(eventId, requestIds);
        const io = (0, types_1.getIOFromRequest)(req);
        (0, socket_1.emitQueueReordered)(io, eventId, requestIds);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/events/:eventId/musicadj/stats
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
//# sourceMappingURL=musicadj.controller.js.map