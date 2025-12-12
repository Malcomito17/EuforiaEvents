"use strict";
/**
 * Socket.io Handlers para módulo MUSICADJ
 * Maneja eventos realtime de solicitudes musicales
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MUSICADJ_EVENTS = void 0;
exports.registerMusicadjHandlers = registerMusicadjHandlers;
exports.emitNewRequest = emitNewRequest;
exports.emitRequestUpdated = emitRequestUpdated;
exports.emitRequestDeleted = emitRequestDeleted;
exports.emitQueueReordered = emitQueueReordered;
exports.emitConfigUpdated = emitConfigUpdated;
const auth_middleware_1 = require("../../modules/auth/auth.middleware");
// Tipos de eventos MUSICADJ
exports.MUSICADJ_EVENTS = {
    // Cliente -> Servidor
    JOIN_EVENT: 'musicadj:join',
    LEAVE_EVENT: 'musicadj:leave',
    // Servidor -> Cliente(s)
    REQUEST_NEW: 'musicadj:request:new',
    REQUEST_UPDATED: 'musicadj:request:updated',
    REQUEST_DELETED: 'musicadj:request:deleted',
    QUEUE_REORDERED: 'musicadj:queue:reordered',
    // Estado del módulo
    CONFIG_UPDATED: 'musicadj:config:updated',
    MODULE_ENABLED: 'musicadj:enabled',
    MODULE_DISABLED: 'musicadj:disabled',
};
/**
 * Registra handlers de MUSICADJ en un socket
 */
function registerMusicadjHandlers(io, socket) {
    // Unirse a room de evento
    socket.on(exports.MUSICADJ_EVENTS.JOIN_EVENT, (eventId) => {
        const roomName = `musicadj:${eventId}`;
        socket.join(roomName);
        const username = (0, auth_middleware_1.isAuthenticated)(socket)
            ? socket.username
            : 'anónimo';
        console.log(`[MUSICADJ] ${username} joined room ${roomName}`);
        // Notificar cantidad de usuarios en el room (opcional)
        const roomSize = io.sockets.adapter.rooms.get(roomName)?.size || 0;
        socket.emit('musicadj:room:joined', { eventId, usersInRoom: roomSize });
    });
    // Salir del room de evento
    socket.on(exports.MUSICADJ_EVENTS.LEAVE_EVENT, (eventId) => {
        const roomName = `musicadj:${eventId}`;
        socket.leave(roomName);
        console.log(`[MUSICADJ] Socket ${socket.id} left room ${roomName}`);
    });
    // Cleanup al desconectar
    socket.on('disconnect', () => {
        console.log(`[MUSICADJ] Socket disconnected: ${socket.id}`);
    });
}
/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
function emitNewRequest(io, eventId, request) {
    const roomName = `musicadj:${eventId}`;
    io.to(roomName).emit(exports.MUSICADJ_EVENTS.REQUEST_NEW, request);
    console.log(`[MUSICADJ] Emitted new request to room ${roomName}`);
}
/**
 * Emite actualización de solicitud
 */
function emitRequestUpdated(io, eventId, request) {
    const roomName = `musicadj:${eventId}`;
    io.to(roomName).emit(exports.MUSICADJ_EVENTS.REQUEST_UPDATED, request);
}
/**
 * Emite eliminación de solicitud
 */
function emitRequestDeleted(io, eventId, requestId) {
    const roomName = `musicadj:${eventId}`;
    io.to(roomName).emit(exports.MUSICADJ_EVENTS.REQUEST_DELETED, { id: requestId });
}
/**
 * Emite reordenamiento de cola
 */
function emitQueueReordered(io, eventId, order) {
    const roomName = `musicadj:${eventId}`;
    io.to(roomName).emit(exports.MUSICADJ_EVENTS.QUEUE_REORDERED, { order });
}
/**
 * Emite cambio de configuración del módulo
 */
function emitConfigUpdated(io, eventId, config) {
    const roomName = `musicadj:${eventId}`;
    io.to(roomName).emit(exports.MUSICADJ_EVENTS.CONFIG_UPDATED, config);
}
//# sourceMappingURL=musicadj.handler.js.map