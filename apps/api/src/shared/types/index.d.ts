import { Request, Application } from 'express';
import { Server as SocketServer } from 'socket.io';
export interface JwtPayload {
    userId: string;
    username: string;
    role: string;
}
export interface AuthenticatedRequest extends Request {
    user?: JwtPayload;
}
export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR';
export type Module = 'MUSICADJ' | 'KARAOKEYA';
/**
 * Extiende Express Application para incluir Socket.io
 */
export interface AppWithIO extends Application {
    get(name: 'io'): SocketServer;
}
/**
 * Request que incluye acceso a Socket.io via app.get('io')
 */
export interface RequestWithIO extends AuthenticatedRequest {
    app: AppWithIO;
}
/**
 * Helper para obtener io desde un request
 */
export declare function getIOFromRequest(req: Request): SocketServer;
export type SongRequestStatus = 'PENDING' | 'HIGHLIGHTED' | 'URGENT' | 'PLAYED' | 'DISCARDED';
export type KaraokeRequestStatus = 'QUEUED' | 'CALLED' | 'ON_STAGE' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
//# sourceMappingURL=index.d.ts.map