/**
 * MUSICADJ Service (v1.3)
 * Lógica de negocio para solicitudes musicales con Guest model
 */
import { CreateSongRequestInput, UpdateSongRequestInput, BulkUpdateRequestsInput, MusicadjConfigInput, ListRequestsQuery } from './musicadj.types';
/**
 * Obtiene o crea la configuración del módulo para un evento
 */
export declare function getOrCreateConfig(eventId: string): Promise<{
    enabled: boolean;
    cooldownSeconds: number;
    allowWithoutSpotify: boolean;
    welcomeMessage: string | null;
    showQueueToClient: boolean;
    customMessages: string | null;
    eventId: string;
}>;
/**
 * Actualiza la configuración del módulo
 */
export declare function updateConfig(eventId: string, input: MusicadjConfigInput): Promise<{
    enabled: boolean;
    cooldownSeconds: number;
    allowWithoutSpotify: boolean;
    welcomeMessage: string | null;
    showQueueToClient: boolean;
    customMessages: string | null;
    eventId: string;
}>;
/**
 * Crea una nueva solicitud de canción
 */
export declare function createRequest(eventId: string, input: CreateSongRequestInput): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string;
    guestId: string;
    spotifyId: string | null;
    albumArtUrl: string | null;
    priority: number;
}>;
/**
 * Obtiene una solicitud por ID
 */
export declare function getRequestById(eventId: string, requestId: string): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string;
    guestId: string;
    spotifyId: string | null;
    albumArtUrl: string | null;
    priority: number;
}>;
/**
 * Lista solicitudes de un evento
 */
export declare function listRequests(eventId: string, query: ListRequestsQuery): Promise<{
    requests: ({
        guest: {
            id: string;
            email: string;
            displayName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
        eventId: string;
        title: string;
        artist: string;
        guestId: string;
        spotifyId: string | null;
        albumArtUrl: string | null;
        priority: number;
    })[];
    total: number;
    stats: {
        total: number;
        pending: number;
        highlighted: number;
        urgent: number;
        played: number;
        discarded: number;
    };
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}>;
/**
 * Actualiza una solicitud (estado, prioridad)
 */
export declare function updateRequest(eventId: string, requestId: string, input: UpdateSongRequestInput): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
    };
} & {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string;
    guestId: string;
    spotifyId: string | null;
    albumArtUrl: string | null;
    priority: number;
}>;
/**
 * Actualiza múltiples solicitudes (bulk)
 */
export declare function bulkUpdateRequests(eventId: string, input: BulkUpdateRequestsInput): Promise<{
    success: boolean;
    count: number;
}>;
/**
 * Elimina una solicitud
 */
export declare function deleteRequest(eventId: string, requestId: string): Promise<{
    success: boolean;
}>;
/**
 * Reordena la cola de solicitudes
 */
export declare function reorderQueue(eventId: string, requestIds: string[]): Promise<{
    success: boolean;
    order: string[];
}>;
/**
 * Obtiene estadísticas del módulo para un evento
 */
export declare function getStats(eventId: string): Promise<{
    total: number;
    pending: number;
    highlighted: number;
    urgent: number;
    played: number;
    discarded: number;
}>;
export declare class MusicadjError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=musicadj.service.d.ts.map