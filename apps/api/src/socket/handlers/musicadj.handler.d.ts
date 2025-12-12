/**
 * Socket.io Handlers para módulo MUSICADJ
 * Maneja eventos realtime de solicitudes musicales
 */
import { Server, Socket } from 'socket.io';
export declare const MUSICADJ_EVENTS: {
    readonly JOIN_EVENT: "musicadj:join";
    readonly LEAVE_EVENT: "musicadj:leave";
    readonly REQUEST_NEW: "musicadj:request:new";
    readonly REQUEST_UPDATED: "musicadj:request:updated";
    readonly REQUEST_DELETED: "musicadj:request:deleted";
    readonly QUEUE_REORDERED: "musicadj:queue:reordered";
    readonly CONFIG_UPDATED: "musicadj:config:updated";
    readonly MODULE_ENABLED: "musicadj:enabled";
    readonly MODULE_DISABLED: "musicadj:disabled";
};
/**
 * Registra handlers de MUSICADJ en un socket
 */
export declare function registerMusicadjHandlers(io: Server, socket: Socket): void;
/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
export declare function emitNewRequest(io: Server, eventId: string, request: unknown): void;
/**
 * Emite actualización de solicitud
 */
export declare function emitRequestUpdated(io: Server, eventId: string, request: unknown): void;
/**
 * Emite eliminación de solicitud
 */
export declare function emitRequestDeleted(io: Server, eventId: string, requestId: string): void;
/**
 * Emite reordenamiento de cola
 */
export declare function emitQueueReordered(io: Server, eventId: string, order: string[]): void;
/**
 * Emite cambio de configuración del módulo
 */
export declare function emitConfigUpdated(io: Server, eventId: string, config: unknown): void;
//# sourceMappingURL=musicadj.handler.d.ts.map