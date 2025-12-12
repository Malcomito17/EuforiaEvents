/**
 * Socket.io Configuration
 * Configura WebSocket server con autenticación y handlers
 */
import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
/**
 * Inicializa Socket.io con el servidor HTTP
 */
export declare function initializeSocket(httpServer: HttpServer): Server;
/**
 * Obtiene la instancia de Socket.io
 * Útil para emitir eventos desde otros módulos (services)
 */
export declare function getIO(): Server;
export { socketAuthMiddleware, isAuthenticated, isOperator } from './auth';
export type { AuthenticatedSocket } from './auth';
export * from './handlers/musicadj.handler';
export * from './handlers/karaokeya.handler';
//# sourceMappingURL=index.d.ts.map