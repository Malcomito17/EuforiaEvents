"use strict";
/**
 * MUSICADJ - Zod Schemas & Types (v1.3)
 * Actualizado para usar Guest model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.spotifySearchSchema = exports.listRequestsQuerySchema = exports.musicadjConfigSchema = exports.reorderQueueSchema = exports.bulkUpdateRequestsSchema = exports.updateSongRequestSchema = exports.createSongRequestSchema = exports.songRequestStatusSchema = void 0;
const zod_1 = require("zod");
// ============================================
// Song Request Schemas
// ============================================
exports.songRequestStatusSchema = zod_1.z.enum([
    'PENDING',
    'HIGHLIGHTED',
    'URGENT',
    'PLAYED',
    'DISCARDED'
]);
/**
 * Schema para crear una solicitud de canción (desde cliente público)
 * v1.3: Usa guestId en lugar de requesterName/Email
 */
exports.createSongRequestSchema = zod_1.z.object({
    // Guest que hace el pedido
    guestId: zod_1.z.string().cuid('Guest ID inválido'),
    // Datos de la canción
    spotifyId: zod_1.z.string().optional().nullable(),
    title: zod_1.z.string().min(1, 'Título requerido').max(200),
    artist: zod_1.z.string().min(1, 'Artista requerido').max(200),
    albumArtUrl: zod_1.z.string().url().optional().nullable(),
});
/**
 * Schema para actualizar solicitud (operador)
 */
exports.updateSongRequestSchema = zod_1.z.object({
    status: exports.songRequestStatusSchema.optional(),
    priority: zod_1.z.number().int().min(0).max(999).optional(),
});
/**
 * Schema para bulk update (múltiples solicitudes)
 */
exports.bulkUpdateRequestsSchema = zod_1.z.object({
    requestIds: zod_1.z.array(zod_1.z.string().cuid()),
    status: exports.songRequestStatusSchema.optional(),
    priority: zod_1.z.number().int().min(0).max(999).optional(),
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
exports.musicadjConfigSchema = zod_1.z.object({
    enabled: zod_1.z.boolean().optional(),
    cooldownSeconds: zod_1.z.number().int().min(0).max(3600).optional(),
    allowWithoutSpotify: zod_1.z.boolean().optional(),
    welcomeMessage: zod_1.z.string().max(500).optional().nullable(),
    showQueueToClient: zod_1.z.boolean().optional(),
});
// ============================================
// Query Schemas
// ============================================
exports.listRequestsQuerySchema = zod_1.z.object({
    status: exports.songRequestStatusSchema.optional(),
    search: zod_1.z.string().optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    offset: zod_1.z.coerce.number().int().min(0).default(0),
});
// ============================================
// Spotify Schemas
// ============================================
exports.spotifySearchSchema = zod_1.z.object({
    query: zod_1.z.string().min(1, 'Query requerido').max(200),
    limit: zod_1.z.coerce.number().int().min(1).max(20).default(10),
});
//# sourceMappingURL=musicadj.types.js.map