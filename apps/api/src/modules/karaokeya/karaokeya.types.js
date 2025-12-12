"use strict";
/**
 * KARAOKEYA - Zod Schemas & Types (v1.4)
 * Esquemas de validación para módulo de karaoke
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleLikeSchema = exports.listSongsQuerySchema = exports.updateKaraokeSongSchema = exports.createKaraokeSongSchema = exports.difficultySchema = exports.popularSongsQuerySchema = exports.searchQuerySchema = exports.listRequestsQuerySchema = exports.karaokeyaConfigSchema = exports.reorderQueueSchema = exports.updateKaraokeRequestSchema = exports.createKaraokeRequestSchema = exports.karaokeRequestStatusSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Karaoke Request Schemas
// ============================================
exports.karaokeRequestStatusSchema = zod_1.z.enum([
    'QUEUED',
    'CALLED',
    'ON_STAGE',
    'COMPLETED',
    'NO_SHOW',
    'CANCELLED'
]);
/**
 * Schema para crear una solicitud de karaoke (desde cliente público)
 */
exports.createKaraokeRequestSchema = zod_1.z.object({
    // Guest que hace el pedido
    guestId: zod_1.z.string().cuid('Guest ID inválido'),
    // Datos de la canción
    songId: zod_1.z.string().cuid().optional(), // Si viene del catálogo
    youtubeId: zod_1.z.string().optional(), // Si viene de búsqueda directa
    title: zod_1.z.string().min(1, 'Título requerido').max(200),
    artist: zod_1.z.string().max(200).optional(),
});
/**
 * Schema para actualizar solicitud (operador)
 */
exports.updateKaraokeRequestSchema = zod_1.z.object({
    status: exports.karaokeRequestStatusSchema,
});
/**
 * Schema para reordenar cola
 */
exports.reorderQueueSchema = zod_1.z.object({
    requestIds: zod_1.z.array(zod_1.z.string().cuid()),
});
// ============================================
// Config Schemas
// ============================================
exports.karaokeyaConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    cooldownSeconds: zod_1.z.number().int().min(0).max(3600).optional(),
    maxPerPerson: zod_1.z.number().int().min(0).max(20).optional(),
    showQueueToClient: zod_1.z.boolean().optional(),
    showNextSinger: zod_1.z.boolean().optional(),
    suggestionsEnabled: zod_1.z.boolean().optional(),
    suggestionsCount: zod_1.z.number().int().min(0).max(5).optional(),
    allowedLanguages: zod_1.z.string().optional(), // JSON string: ["ES", "EN"]
    youtubeSearchKeywords: zod_1.z.string().optional(), // JSON string: ["letra", "lyrics"]
    customMessages: zod_1.z.string().optional().nullable(), // JSON string opcional
    // v2.0: Display Screen
    displayMode: zod_1.z.enum(['QUEUE', 'BREAK', 'START', 'PROMO']).optional(),
    displayLayout: zod_1.z.enum(['VERTICAL', 'HORIZONTAL']).optional(),
    displayBreakMessage: zod_1.z.string().max(200).optional(),
    displayStartMessage: zod_1.z.string().max(200).optional(),
    displayPromoImageUrl: zod_1.z.string().url().optional().nullable(),
});
// ============================================
// Query Schemas
// ============================================
exports.listRequestsQuerySchema = zod_1.z.object({
    status: exports.karaokeRequestStatusSchema.optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
exports.searchQuerySchema = zod_1.z.object({
    q: zod_1.z.string().min(1, 'Query requerido').max(100),
    limit: zod_1.z.coerce.number().int().min(1).max(20).default(5),
});
exports.popularSongsQuerySchema = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(10),
});
// ============================================
// CATALOG CRUD - KARAOKE SONGS (v2.0)
// ============================================
/**
 * Enum de dificultad vocal
 */
exports.difficultySchema = zod_1.z.enum(['FACIL', 'MEDIO', 'DIFICIL', 'PAVAROTTI']);
/**
 * Schema para crear una canción en el catálogo
 */
exports.createKaraokeSongSchema = zod_1.z.object({
    title: zod_1.z.string().min(1, 'Título requerido').max(200),
    artist: zod_1.z.string().min(1, 'Artista requerido').max(200),
    youtubeId: zod_1.z.string().min(1, 'YouTube ID requerido'),
    youtubeShareUrl: zod_1.z.string().url().optional(),
    thumbnailUrl: zod_1.z.string().url().optional().nullable(),
    duration: zod_1.z.number().int().min(0).optional().nullable(),
    language: zod_1.z.enum(['ES', 'EN', 'PT']).default('ES'),
    difficulty: exports.difficultySchema.default('MEDIO'),
    ranking: zod_1.z.number().int().min(1).max(5).default(3),
    opinion: zod_1.z.string().max(500).optional().nullable(),
    source: zod_1.z.string().default('YOUTUBE'),
    moods: zod_1.z.string().default('[]'), // JSON array
    tags: zod_1.z.string().default('[]'), // JSON array
});
/**
 * Schema para actualizar una canción del catálogo
 */
exports.updateKaraokeSongSchema = exports.createKaraokeSongSchema.partial();
/**
 * Schema para listar canciones con filtros
 */
exports.listSongsQuerySchema = zod_1.z.object({
    search: zod_1.z.string().optional(), // Buscar en title/artist
    difficulty: exports.difficultySchema.optional(),
    minRanking: zod_1.z.coerce.number().int().min(1).max(5).optional(),
    language: zod_1.z.enum(['ES', 'EN', 'PT']).optional(),
    sortBy: zod_1.z.enum(['title', 'ranking', 'likesCount', 'timesRequested', 'createdAt']).default('title'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc'),
    includeInactive: zod_1.z.coerce.boolean().default(false),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(20),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// LIKE SYSTEM
// ============================================
/**
 * Schema para toggle de like
 */
exports.toggleLikeSchema = zod_1.z.object({
    songId: zod_1.z.string().cuid('Song ID inválido'),
    guestId: zod_1.z.string().cuid('Guest ID inválido'),
});
//# sourceMappingURL=karaokeya.types.js.map