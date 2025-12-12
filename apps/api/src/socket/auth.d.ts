/**
 * Socket.io Authentication Middleware
 * Verifica JWT en conexiones WebSocket
 */
import { Socket } from 'socket.io';
export interface AuthenticatedSocket extends Socket {
    userId: string;
    username: string;
    role: string;
}
/**
 * Middleware de autenticación para Socket.io
 * Extrae y verifica JWT del handshake
 */
export declare function socketAuthMiddleware(socket: Socket, next: (err?: Error) => void): void;
/**
 * Verifica si un socket está autenticado
 */
export declare function isAuthenticated(socket: Socket): socket is AuthenticatedSocket;
/**
 * Verifica si un socket tiene rol de operador o superior
 */
export declare function isOperator(socket: Socket): boolean;
//# sourceMappingURL=auth.d.ts.map