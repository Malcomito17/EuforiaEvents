/**
 * YouTube Service
 * Integración con YouTube Data API v3 para búsqueda de videos de karaoke
 *
 * Características:
 * - Búsqueda con keywords configurables (ej: "LETRA", "LYRICS")
 * - Normalización de títulos (extrae artista + título)
 * - Obtención de metadatos (thumbnails, duración, etc.)
 */
interface YouTubeVideo {
    youtubeId: string;
    title: string;
    artist: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    channelTitle: string;
}
interface YouTubeSearchResult {
    videos: YouTubeVideo[];
    total: number;
    query: string;
}
/**
 * Verifica si la API de YouTube está configurada
 */
export declare function isYouTubeConfigured(): boolean;
/**
 * Busca videos de karaoke en YouTube
 *
 * @param query - Término de búsqueda (ej: "Queen Bohemian Rhapsody")
 * @param keywords - Keywords adicionales para filtrar (ej: ["letra", "lyrics"])
 * @param limit - Cantidad máxima de resultados (máx 50)
 */
export declare function searchKaraokeVideos(query: string, keywords?: string[], limit?: number): Promise<YouTubeSearchResult>;
/**
 * Obtiene un video específico por su ID
 */
export declare function getVideoById(videoId: string): Promise<YouTubeVideo | null>;
/**
 * Normaliza un título de YouTube para extraer artista y título
 *
 * Patrones comunes:
 * - "Artista - Título (Video Oficial)"
 * - "Título - Artista [Karaoke]"
 * - "Artista: Título | Letra"
 * - "Título (Artista) LYRICS"
 *
 * @returns { title: string, artist: string }
 */
export declare function normalizeTitleAndArtist(rawTitle: string): {
    title: string;
    artist: string;
};
export declare class YouTubeError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export type { YouTubeVideo, YouTubeSearchResult };
//# sourceMappingURL=youtube.service.d.ts.map