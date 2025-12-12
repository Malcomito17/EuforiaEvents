/**
 * Socket.io Handlers para módulo KARAOKEYA
 * Maneja eventos realtime de solicitudes de karaoke
 */
import { Server, Socket } from 'socket.io';
export declare const KARAOKEYA_EVENTS: {
    readonly JOIN_EVENT: "karaokeya:join";
    readonly LEAVE_EVENT: "karaokeya:leave";
    readonly REQUEST_NEW: "karaokeya:request:new";
    readonly REQUEST_UPDATED: "karaokeya:request:updated";
    readonly REQUEST_DELETED: "karaokeya:request:deleted";
    readonly QUEUE_REORDERED: "karaokeya:queue:reordered";
    readonly CONFIG_UPDATED: "karaokeya:config:updated";
    readonly MODULE_ENABLED: "karaokeya:enabled";
    readonly MODULE_DISABLED: "karaokeya:disabled";
};
/**
 * Registra handlers de KARAOKEYA en un socket
 */
export declare function registerKaraokeyaHandlers(io: Server, socket: Socket): void;
/**
 * Emite evento de nueva solicitud a todos en el room del evento
 */
export declare function emitNewKaraokeRequest(io: Server, eventId: string, request: unknown): void;
/**
 * Emite actualización de solicitud
 */
export declare function emitKaraokeRequestUpdated(io: Server, eventId: string, request: unknown): void;
/**
 * Emite eliminación de solicitud
 */
export declare function emitKaraokeRequestDeleted(io: Server, eventId: string, requestId: string): void;
/**
 * Emite reordenamiento de cola
 */
export declare function emitKaraokeQueueReordered(io: Server, eventId: string, order: string[]): void;
/**
 * Emite cambio de configuración del módulo
 */
export declare function emitKaraokeConfigUpdated(io: Server, eventId: string, config: unknown): void;
//# sourceMappingURL=karaokeya.handler.d.ts.map