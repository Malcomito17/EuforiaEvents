"use strict";
/**
 * Socket.io Authentication Middleware
 * Verifica JWT en conexiones WebSocket
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthMiddleware = socketAuthMiddleware;
exports.isAuthenticated = isAuthenticated;
exports.isOperator = isOperator;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
/**
 * Middleware de autenticación para Socket.io
 * Extrae y verifica JWT del handshake
 */
function socketAuthMiddleware(socket, next) {
    try {
        // Token puede venir en auth.token o en query.token
        const token = socket.handshake.auth?.token ||
            socket.handshake.query?.token;
        if (!token) {
            // Permitir conexiones sin auth para clientes públicos (QR)
            // Estos solo pueden unirse a rooms de eventos públicos
            console.log(`[SOCKET] Conexión anónima: ${socket.id}`);
            return next();
        }
        // Verificar JWT
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Adjuntar datos del usuario al socket
        const authSocket = socket;
        authSocket.userId = decoded.userId;
        authSocket.username = decoded.username;
        authSocket.role = decoded.role;
        console.log(`[SOCKET] Usuario autenticado: ${decoded.username} (${socket.id})`);
        next();
    }
    catch (error) {
        console.error(`[SOCKET] Auth error:`, error);
        next(new Error('Authentication failed'));
    }
}
/**
 * Verifica si un socket está autenticado
 */
function isAuthenticated(socket) {
    return !!socket.userId;
}
/**
 * Verifica si un socket tiene rol de operador o superior
 */
function isOperator(socket) {
    if (!isAuthenticated(socket))
        return false;
    const authSocket = socket;
    return ['ADMIN', 'MANAGER', 'OPERATOR'].includes(authSocket.role);
}
//# sourceMappingURL=auth.js.map