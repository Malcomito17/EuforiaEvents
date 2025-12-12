/**
 * KARAOKEYA Service (v1.4)
 * Lógica de negocio para karaoke con búsqueda híbrida (BD + YouTube)
 */
import { YouTubeVideo } from './youtube.service';
interface HybridSearchResult {
    fromCatalog: CatalogSong[];
    fromYouTube: YouTubeVideo[];
    query: string;
}
interface CatalogSong extends YouTubeVideo {
    catalogId: string;
    timesRequested: number;
    isPopular: true;
}
interface CreateKaraokeRequestInput {
    guestId: string;
    songId?: string;
    youtubeId?: string;
    title: string;
    artist?: string;
}
/**
 * Obtiene o crea la configuración del módulo para un evento
 */
export declare function getOrCreateConfig(eventId: string): Promise<{
    enabled: boolean;
    cooldownSeconds: number;
    showQueueToClient: boolean;
    customMessages: string | null;
    eventId: string;
    maxPerPerson: number;
    showNextSinger: boolean;
    suggestionsEnabled: boolean;
    suggestionsCount: number;
    allowedLanguages: string;
    youtubeSearchKeywords: string;
    displayMode: string;
    displayLayout: string;
    displayBreakMessage: string;
    displayStartMessage: string;
    displayPromoImageUrl: string | null;
}>;
/**
 * Actualiza la configuración del módulo
 */
export declare function updateConfig(eventId: string, input: any): Promise<{
    enabled: boolean;
    cooldownSeconds: number;
    showQueueToClient: boolean;
    customMessages: string | null;
    eventId: string;
    maxPerPerson: number;
    showNextSinger: boolean;
    suggestionsEnabled: boolean;
    suggestionsCount: number;
    allowedLanguages: string;
    youtubeSearchKeywords: string;
    displayMode: string;
    displayLayout: string;
    displayBreakMessage: string;
    displayStartMessage: string;
    displayPromoImageUrl: string | null;
}>;
/**
 * Búsqueda híbrida: primero en BD (3 populares), luego YouTube (5 nuevos)
 */
export declare function hybridSearch(eventId: string, query: string): Promise<HybridSearchResult>;
/**
 * Agrega una canción al catálogo (o incrementa contador si ya existe)
 */
export declare function addToCatalog(youtubeId: string, metadata?: {
    title?: string;
    artist?: string;
    youtubeShareUrl?: string;
    thumbnailUrl?: string | null;
    duration?: number | null;
    language?: string;
}): Promise<string>;
/**
 * Obtiene una canción del catálogo
 */
export declare function getCatalogSong(songId: string): Promise<{
    _count: {
        requests: number;
        likes: number;
    };
} & {
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: string;
    ranking: number;
    opinion: string | null;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    likesCount: number;
}>;
/**
 * Lista canciones populares del catálogo filtradas por evento
 */
export declare function getPopularSongs(eventId: string, limit?: number): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: string;
    ranking: number;
    opinion: string | null;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    likesCount: number;
}[]>;
/**
 * Sugerencias inteligentes basadas en contexto del evento y guest
 * Combina: popularidad en el evento, historial personal, tipo de evento
 */
export declare function getSmartSuggestions(eventId: string, guestId?: string, limit?: number): Promise<any[]>;
/**
 * Crea una nueva solicitud de karaoke
 */
export declare function createRequest(eventId: string, input: CreateKaraokeRequestInput): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
        whatsapp: string | null;
    };
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
}>;
/**
 * Lista solicitudes de karaoke de un evento
 */
export declare function listRequests(eventId: string, status?: string): Promise<({
    guest: {
        id: string;
        email: string;
        displayName: string;
        whatsapp: string | null;
    };
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
})[]>;
/**
 * Obtiene las solicitudes de un guest específico
 */
export declare function getGuestRequests(eventId: string, guestId: string): Promise<({
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
})[]>;
/**
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
export declare function getPublicQueue(eventId: string): Promise<({
    guest: {
        id: string;
        displayName: string;
    };
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
})[]>;
/**
 * Obtiene una solicitud específica
 */
export declare function getRequestById(eventId: string, requestId: string): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
        whatsapp: string | null;
    };
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
}>;
/**
 * Actualiza el estado de una solicitud
 */
export declare function updateRequestStatus(eventId: string, requestId: string, status: string): Promise<{
    guest: {
        id: string;
        email: string;
        displayName: string;
        whatsapp: string | null;
    };
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    } | null;
} & {
    id: string;
    createdAt: Date;
    status: string;
    eventId: string;
    title: string;
    artist: string | null;
    guestId: string;
    songId: string | null;
    turnNumber: number;
    queuePosition: number;
    calledAt: Date | null;
}>;
/**
 * Elimina una solicitud
 */
export declare function deleteRequest(eventId: string, requestId: string): Promise<{
    success: boolean;
}>;
/**
 * Reordena la cola
 */
export declare function reorderQueue(eventId: string, requestIds: string[]): Promise<{
    success: boolean;
    order: string[];
}>;
/**
 * Obtiene estadísticas del módulo
 */
export declare function getStats(eventId: string): Promise<{
    total: number;
    queued: number;
    called: number;
    onStage: number;
    completed: number;
    noShow: number;
    cancelled: number;
}>;
/**
 * Lista canciones del catálogo con filtros y paginación
 */
export declare function listCatalogSongs(filters: any): Promise<{
    songs: ({
        _count: {
            requests: number;
            likes: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    })[];
    pagination: {
        total: number;
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}>;
/**
 * Crea una nueva canción en el catálogo
 */
export declare function createCatalogSong(input: any): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: string;
    ranking: number;
    opinion: string | null;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    likesCount: number;
}>;
/**
 * Actualiza una canción del catálogo
 */
export declare function updateCatalogSong(songId: string, input: any): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: string;
    ranking: number;
    opinion: string | null;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    likesCount: number;
}>;
/**
 * Soft delete de una canción
 */
export declare function deleteCatalogSong(songId: string): Promise<{
    message: string;
    song: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    };
}>;
/**
 * Reactivar una canción
 */
export declare function reactivateCatalogSong(songId: string): Promise<{
    id: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: string;
    ranking: number;
    opinion: string | null;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    likesCount: number;
}>;
/**
 * Toggle like (idempotente): si existe lo elimina, si no existe lo crea
 * Actualiza el contador likesCount
 */
export declare function toggleSongLike(songId: string, guestId: string): Promise<{
    liked: boolean;
    likesCount: number;
}>;
/**
 * Obtiene el estado de like de un guest para una canción
 */
export declare function getSongLikeStatus(songId: string, guestId: string): Promise<{
    liked: boolean;
}>;
/**
 * Obtiene todas las canciones que le gustaron a un guest
 */
export declare function getGuestLikedSongs(guestId: string, limit?: number): Promise<{
    songs: {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        artist: string;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        source: string;
        language: string;
        difficulty: string;
        ranking: number;
        opinion: string | null;
        moods: string;
        tags: string;
        timesRequested: number;
        timesCompleted: number;
        likesCount: number;
    }[];
    total: number;
}>;
/**
 * Obtiene todos los datos necesarios para el Display Screen público
 * Usado por la pantalla grande de karaoke en el evento
 */
export declare function getDisplayData(eventSlug: string): Promise<{
    event: {
        id: string;
        slug: string;
        eventName: string;
        eventDate: any;
        location: string;
    };
    config: {
        displayMode: string;
        displayLayout: string;
        displayBreakMessage: string;
        displayStartMessage: string;
        displayPromoImageUrl: string | null;
    };
    queue: {
        onStage: ({
            guest: {
                id: string;
                displayName: string;
            };
            song: {
                youtubeShareUrl: string;
                thumbnailUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: string;
            eventId: string;
            title: string;
            artist: string | null;
            guestId: string;
            songId: string | null;
            turnNumber: number;
            queuePosition: number;
            calledAt: Date | null;
        }) | null;
        called: ({
            guest: {
                id: string;
                displayName: string;
            };
            song: {
                youtubeShareUrl: string;
                thumbnailUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: string;
            eventId: string;
            title: string;
            artist: string | null;
            guestId: string;
            songId: string | null;
            turnNumber: number;
            queuePosition: number;
            calledAt: Date | null;
        }) | null;
        next: {
            guest: {
                id: string;
                displayName: string;
            };
            song: {
                youtubeShareUrl: string;
                thumbnailUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: string;
            eventId: string;
            title: string;
            artist: string | null;
            guestId: string;
            songId: string | null;
            turnNumber: number;
            queuePosition: number;
            calledAt: Date | null;
        };
        upcoming: ({
            guest: {
                id: string;
                displayName: string;
            };
            song: {
                youtubeShareUrl: string;
                thumbnailUrl: string | null;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            status: string;
            eventId: string;
            title: string;
            artist: string | null;
            guestId: string;
            songId: string | null;
            turnNumber: number;
            queuePosition: number;
            calledAt: Date | null;
        })[];
        total: number;
    };
}>;
export declare class KaraokeyaError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export {};
//# sourceMappingURL=karaokeya.service.d.ts.map