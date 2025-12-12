"use strict";
/**
 * Socket.io Handlers para módulo KARAOKEYA
 * Maneja eventos realtime de solicitudes de karaoke
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.KARAOKEYA_EVENTS = void 0;
exports.registerKaraokeyaHandlers = registerKaraokeyaHandlers;
exports.emitNewKaraokeRequest = emitNewKaraokeRequest;
exports.emitKaraokeRequestUpdated = emitKaraokeRequestUpdated;
exports.emitKaraokeRequestDeleted = emitKaraokeRequestDeleted;
exports.emitKaraokeQueueReordered = emitKaraokeQueueReordered;
exports.emitKaraokeConfigUpdated = emitKaraokeConfigUpdated;
const auth_middleware_1 = require("../../modules/auth/auth.middleware");
// Tipos de eventos KARAOKEYA
exports.KARAOKEYA_EVENTS = {
    // Cliente -> Servidor
    JOIN_EVENT: 'karaokeya:join',
    LEAVE_EVENT: 'karaokeya:leave',
    // Servidor -> Cliente(s)
    REQUEST_NEW: 'karaokeya:request:new',
    REQUEST_UPDATED: 'karaokeya:request:updated',
    REQUEST_DELETED: 'karaokeya:request:deleted',
    QUEUE_REORDERED: 'karaokeya:queue:reordered',
    // Estado del módulo
    CONFIG_UPDATED: 'karaokeya:config:updated',
    MODULE_ENABLED: 'karaokeya:enabled',
    MODULE_DISABLED: 'karaokeya:disabled',
};
/**
 * Registra handlers de KARAOKEYA en un socket
 */
function registerKaraokeyaHandlers(io, socket) {
    // Unirse a room de evento
    socket.on(exports.KARAOKEYA_EVENTS.JOIN_EVENT, (eventId) => {
        const roomName = `karaokeya:${eventId}`;
        socket.join(roomName);
        const username = (0, auth_middleware_1.isAuthenticated)(socket)
            ? socket.username
            : 'anónimo';
        console.log(`[KARAOKEYA] ${username} joined room ${roomName}`);
        // Notificar cantidad de usuarios en el room (opcional)
        const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        socket.emit('karaokeya:room:joined', { eventId, usersInRoom: roomSize });
    });
    // Salir del room de evento
    socket.on(exports.KARAOKEYA_EVENTS.LEAVE_EVENT, (eventId) => {
        const roomName = `karaokeya:${eventId}`;
        socket.leave(roomName);
        console.log(`[KARAOKEYA] Socket ${socket.id} left room ${roomName}`);
    });
    // Cleanup al desconectar
    socket.on('disconnect', () => {
        console.log(`[KARAOKEYA] Socket disconnected: ${socket.id}`);
    });
}
/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
function emitNewKaraokeRequest(io, eventId, request) {
    const roomName = `karaokeya:${eventId}`;
    io.to(roomName).emit(exports.KARAOKEYA_EVENTS.REQUEST_NEW, request);
    console.log(`[KARAOKEYA] Emitted new request to room ${roomName}`);
}
/**
 * Emite actualización de solicitud
 */
function emitKaraokeRequestUpdated(io, eventId, request) {
    const roomName = `karaokeya:${eventId}`;
    io.to(roomName).emit(exports.KARAOKEYA_EVENTS.REQUEST_UPDATED, request);
}
/**
 * Emite eliminación de solicitud
 */
function emitKaraokeRequestDeleted(io, eventId, requestId) {
    const roomName = `karaokeya:${eventId}`;
    io.to(roomName).emit(exports.KARAOKEYA_EVENTS.REQUEST_DELETED, { id: requestId });
}
/**
 * Emite reordenamiento de cola
 */
function emitKaraokeQueueReordered(io, eventId, order) {
    const roomName = `karaokeya:${eventId}`;
    io.to(roomName).emit(exports.KARAOKEYA_EVENTS.QUEUE_REORDERED, { order });
}
/**
 * Emite cambio de configuración del módulo
 */
function emitKaraokeConfigUpdated(io, eventId, config) {
    const roomName = `karaokeya:${eventId}`;
    io.to(roomName).emit(exports.KARAOKEYA_EVENTS.CONFIG_UPDATED, config);
}
//# sourceMappingURL=karaokeya.handler.js.map