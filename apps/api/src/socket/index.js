"use strict";
/**
 * Socket.io Configuration
 * Configura WebSocket server con autenticación y handlers
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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isOperator = exports.isAuthenticated = exports.socketAuthMiddleware = void 0;
exports.initializeSocket = initializeSocket;
exports.getIO = getIO;
const socket_io_1 = require("socket.io");
const auth_1 = require("./auth");
const musicadj_handler_1 = require("./handlers/musicadj.handler");
const karaokeya_handler_1 = require("./handlers/karaokeya.handler");
// Instancia global del servidor Socket.io
let io = null;
/**
 * Inicializa Socket.io con el servidor HTTP
 */
function initializeSocket(httpServer) {
    io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: [
                'http://localhost:5173', // web-client
                'http://localhost:5174', // web-operator
                process.env.CLIENT_URL || '',
                process.env.OPERATOR_URL || '',
            ].filter(Boolean),
            methods: ['GET', 'POST'],
            credentials: true,
        },
        // Configuración de transporte
        transports: ['websocket', 'polling'],
        // Ping cada 25 segundos para mantener conexión
        pingInterval: 25000,
        pingTimeout: 20000,
    });
    // Middleware de autenticación
    io.use(auth_1.socketAuthMiddleware);
    // Handler de conexión
    io.on('connection', (socket) => {
        console.log(`[SOCKET] Nueva conexión: ${socket.id}`);
        // Registrar handlers de cada módulo
        (0, musicadj_handler_1.registerMusicadjHandlers)(io, socket);
        (0, karaokeya_handler_1.registerKaraokeyaHandlers)(io, socket);
        // Evento de desconexión
        socket.on('disconnect', (reason) => {
            console.log(`[SOCKET] Desconexión: ${socket.id} - Razón: ${reason}`);
        });
        // Manejo de errores
        socket.on('error', (error) => {
            console.error(`[SOCKET] Error en ${socket.id}:`, error);
        });
    });
    console.log('[SOCKET] Socket.io inicializado');
    return io;
}
/**
 * Obtiene la instancia de Socket.io
 * Útil para emitir eventos desde otros módulos (services)
 */
function getIO() {
    if (!io) {
        throw new Error('Socket.io no ha sido inicializado. Llamar initializeSocket primero.');
    }
    return io;
}
// Re-exportar utilidades y handlers
var auth_2 = require("./auth");
Object.defineProperty(exports, "socketAuthMiddleware", { enumerable: true, get: function () { return auth_2.socketAuthMiddleware; } });
Object.defineProperty(exports, "isAuthenticated", { enumerable: true, get: function () { return auth_2.isAuthenticated; } });
Object.defineProperty(exports, "isOperator", { enumerable: true, get: function () { return auth_2.isOperator; } });
__exportStar(require("./handlers/musicadj.handler"), exports);
__exportStar(require("./handlers/karaokeya.handler"), exports);
//# sourceMappingURL=index.js.map