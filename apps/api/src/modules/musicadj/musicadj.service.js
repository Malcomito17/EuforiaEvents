"use strict";
/**
 * MUSICADJ Service (v1.3)
 * Lógica de negocio para solicitudes musicales con Guest model
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MusicadjError = void 0;
exports.getOrCreateConfig = getOrCreateConfig;
exports.updateConfig = updateConfig;
exports.createRequest = createRequest;
exports.getRequestById = getRequestById;
exports.listRequests = listRequests;
exports.updateRequest = updateRequest;
exports.bulkUpdateRequests = bulkUpdateRequests;
exports.deleteRequest = deleteRequest;
exports.reorderQueue = reorderQueue;
exports.getStats = getStats;
const client_1 = require("@prisma/client");
const musicadj_types_1 = require("./musicadj.types");
const socket_1 = require("../../socket");
const prisma = new client_1.PrismaClient();
// ============================================
// Config Operations
// ============================================
/**
 * Obtiene o crea la configuración del módulo para un evento
 */
async function getOrCreateConfig(eventId) {
    let config = await prisma.musicadjConfig.findUnique({
        where: { eventId }
    });
    if (!config) {
        config = await prisma.musicadjConfig.create({
            data: { eventId }
        });
        console.log(`[MUSICADJ] Config creada para evento ${eventId}`);
    }
    return config;
}
/**
 * Actualiza la configuración del módulo
 */
async function updateConfig(eventId, input) {
    // Asegurar que existe
    await getOrCreateConfig(eventId);
    const config = await prisma.musicadjConfig.update({
        where: { eventId },
        data: input
    });
    console.log(`[MUSICADJ] Config actualizada para evento ${eventId}`);
    // Notificar cambios via Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:configUpdated', config);
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible para emitir configUpdated');
    }
    return config;
}
// ============================================
// Song Request Operations
// ============================================
/**
 * Verifica si el guest puede hacer un nuevo pedido (cooldown)
 */
async function checkCooldown(eventId, guestId, cooldownSeconds) {
    if (cooldownSeconds === 0)
        return true;
    const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000);
    const recentRequest = await prisma.songRequest.findFirst({
        where: {
            eventId,
            guestId,
            createdAt: {
                gte: cutoffTime
            }
        },
        orderBy: { createdAt: 'desc' }
    });
    if (recentRequest) {
        const remainingSeconds = Math.ceil((recentRequest.createdAt.getTime() + cooldownSeconds * 1000 - Date.now()) / 1000);
        throw new MusicadjError(`Debes esperar ${remainingSeconds} segundos antes de pedir otro tema`, 429);
    }
    return true;
}
/**
 * Crea una nueva solicitud de canción
 */
async function createRequest(eventId, input) {
    // Validar input
    const validated = musicadj_types_1.createSongRequestSchema.parse(input);
    // Verificar que el evento existe y está activo
    const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: { musicadjConfig: true }
    });
    if (!event) {
        throw new MusicadjError('Evento no encontrado', 404);
    }
    if (event.status !== 'ACTIVE') {
        throw new MusicadjError('El evento no está activo', 400);
    }
    // Verificar que el módulo está habilitado
    const config = event.musicadjConfig || await getOrCreateConfig(eventId);
    if (!config.enabled) {
        throw new MusicadjError('El módulo de pedidos no está habilitado', 400);
    }
    // Verificar que el guest existe
    const guest = await prisma.guest.findUnique({
        where: { id: validated.guestId }
    });
    if (!guest) {
        throw new MusicadjError('Guest no encontrado', 404);
    }
    // Verificar cooldown
    await checkCooldown(eventId, validated.guestId, config.cooldownSeconds);
    // Verificar si Spotify es requerido
    if (!config.allowWithoutSpotify && !validated.spotifyId) {
        throw new MusicadjError('Debes seleccionar una canción de Spotify', 400);
    }
    // Crear solicitud
    const request = await prisma.songRequest.create({
        data: {
            eventId,
            guestId: validated.guestId,
            spotifyId: validated.spotifyId,
            title: validated.title,
            artist: validated.artist,
            albumArtUrl: validated.albumArtUrl,
            status: 'PENDING',
            priority: 0
        },
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true
                }
            }
        }
    });
    console.log(`[MUSICADJ] Nueva solicitud: "${validated.title}" por ${guest.displayName} (${guest.email})`);
    // Emitir evento Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:newRequest', request);
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible para emitir newRequest');
    }
    return request;
}
/**
 * Obtiene una solicitud por ID
 */
async function getRequestById(eventId, requestId) {
    const request = await prisma.songRequest.findFirst({
        where: {
            id: requestId,
            eventId
        },
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true
                }
            }
        }
    });
    if (!request) {
        throw new MusicadjError('Solicitud no encontrada', 404);
    }
    return request;
}
/**
 * Lista solicitudes de un evento
 */
async function listRequests(eventId, query) {
    const { status, search, limit, offset } = query;
    const where = { eventId };
    if (status) {
        where.status = status;
    }
    if (search) {
        where.OR = [
            { title: { contains: search, mode: 'insensitive' } },
            { artist: { contains: search, mode: 'insensitive' } },
            { guest: { displayName: { contains: search, mode: 'insensitive' } } },
            { guest: { email: { contains: search, mode: 'insensitive' } } }
        ];
    }
    const [requests, total] = await Promise.all([
        prisma.songRequest.findMany({
            where,
            include: {
                guest: {
                    select: {
                        id: true,
                        displayName: true,
                        email: true
                    }
                }
            },
            orderBy: [
                { priority: 'desc' },
                { createdAt: 'asc' }
            ],
            take: limit,
            skip: offset
        }),
        prisma.songRequest.count({ where })
    ]);
    // Obtener stats
    const stats = await getStats(eventId);
    return {
        requests,
        total,
        stats,
        pagination: {
            limit,
            offset,
            hasMore: offset + requests.length < total
        }
    };
}
/**
 * Actualiza una solicitud (estado, prioridad)
 */
async function updateRequest(eventId, requestId, input) {
    // Verificar que existe
    await getRequestById(eventId, requestId);
    const request = await prisma.songRequest.update({
        where: { id: requestId },
        data: input,
        include: {
            guest: {
                select: {
                    id: true,
                    displayName: true,
                    email: true
                }
            }
        }
    });
    console.log(`[MUSICADJ] Solicitud ${requestId} actualizada: ${JSON.stringify(input)}`);
    // Emitir evento Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:requestUpdated', request);
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible');
    }
    return request;
}
/**
 * Actualiza múltiples solicitudes (bulk)
 */
async function bulkUpdateRequests(eventId, input) {
    const { requestIds, status, priority } = input;
    const updateData = {};
    if (status)
        updateData.status = status;
    if (priority !== undefined)
        updateData.priority = priority;
    const result = await prisma.songRequest.updateMany({
        where: {
            id: { in: requestIds },
            eventId
        },
        data: updateData
    });
    console.log(`[MUSICADJ] Bulk update: ${result.count} solicitudes actualizadas`);
    // Emitir evento Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:bulkUpdate', { requestIds, ...updateData });
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible');
    }
    return { success: true, count: result.count };
}
/**
 * Elimina una solicitud
 */
async function deleteRequest(eventId, requestId) {
    // Verificar que existe
    await getRequestById(eventId, requestId);
    await prisma.songRequest.delete({
        where: { id: requestId }
    });
    console.log(`[MUSICADJ] Solicitud ${requestId} eliminada`);
    // Emitir evento Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:requestDeleted', { requestId });
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible');
    }
    return { success: true };
}
/**
 * Reordena la cola de solicitudes
 */
async function reorderQueue(eventId, requestIds) {
    // Actualizar prioridades en orden inverso (mayor prioridad = primero)
    const updates = requestIds.map((id, index) => prisma.songRequest.update({
        where: { id },
        data: { priority: requestIds.length - index }
    }));
    await prisma.$transaction(updates);
    console.log(`[MUSICADJ] Cola reordenada: ${requestIds.length} items`);
    // Emitir evento Socket.io
    try {
        (0, socket_1.getIO)().to(`event:${eventId}`).emit('musicadj:queueReordered', { order: requestIds });
    }
    catch (e) {
        console.warn('[MUSICADJ] Socket.io no disponible');
    }
    return { success: true, order: requestIds };
}
/**
 * Obtiene estadísticas del módulo para un evento
 */
async function getStats(eventId) {
    const stats = await prisma.songRequest.groupBy({
        by: ['status'],
        where: { eventId },
        _count: { status: true }
    });
    const total = await prisma.songRequest.count({ where: { eventId } });
    const byStatus = stats.reduce((acc, curr) => {
        acc[curr.status] = curr._count.status;
        return acc;
    }, {});
    return {
        total,
        pending: byStatus.PENDING || 0,
        highlighted: byStatus.HIGHLIGHTED || 0,
        urgent: byStatus.URGENT || 0,
        played: byStatus.PLAYED || 0,
        discarded: byStatus.DISCARDED || 0
    };
}
// ============================================
// Error Class
// ============================================
class MusicadjError extends Error {
    statusCode;
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'MusicadjError';
    }
}
exports.MusicadjError = MusicadjError;
//# sourceMappingURL=musicadj.service.js.map