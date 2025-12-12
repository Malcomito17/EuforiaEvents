"use strict";
/**
 * YouTube Service
 * Integración con YouTube Data API v3 para búsqueda de videos de karaoke
 *
 * Características:
 * - Búsqueda con keywords configurables (ej: "LETRA", "LYRICS")
 * - Normalización de títulos (extrae artista + título)
 * - Obtención de metadatos (thumbnails, duración, etc.)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.YouTubeError = void 0;
exports.isYouTubeConfigured = isYouTubeConfigured;
exports.searchKaraokeVideos = searchKaraokeVideos;
exports.getVideoById = getVideoById;
exports.normalizeTitleAndArtist = normalizeTitleAndArtist;
const env_1 = require("../../config/env");
// ============================================
// Configuration
// ============================================
/**
 * Verifica si la API de YouTube está configurada
 */
function isYouTubeConfigured() {
    return !!env_1.env.YOUTUBE_API_KEY;
}
// ============================================
// Search
// ============================================
/**
 * Busca videos de karaoke en YouTube
 *
 * @param query - Término de búsqueda (ej: "Queen Bohemian Rhapsody")
 * @param keywords - Keywords adicionales para filtrar (ej: ["letra", "lyrics"])
 * @param limit - Cantidad máxima de resultados (máx 50)
 */
async function searchKaraokeVideos(query, keywords = ['letra', 'lyrics'], limit = 5) {
    if (!query.trim()) {
        return { videos: [], total: 0, query };
    }
    if (!isYouTubeConfigured()) {
        throw new YouTubeError('YouTube API no está configurada', 503);
    }
    // 1. Construir query con keywords
    const searchQuery = `${query} ${keywords.join(' OR ')}`;
    console.log(`[YOUTUBE] Buscando: "${searchQuery}"`);
    // 2. Buscar videos (solo IDs y snippets)
    const searchParams = new URLSearchParams({
        part: 'snippet',
        q: searchQuery,
        type: 'video',
        maxResults: String(Math.min(limit, 50)),
        videoCategoryId: '10', // Música
        key: env_1.env.YOUTUBE_API_KEY,
    });
    const searchResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?${searchParams}`);
    if (!searchResponse.ok) {
        const error = await searchResponse.text();
        console.error('[YOUTUBE] Error de búsqueda:', error);
        if (searchResponse.status === 403) {
            throw new YouTubeError('API key inválida o límite de cuota excedido', 403);
        }
        throw new YouTubeError('Error al buscar en YouTube', 502);
    }
    const searchData = await searchResponse.json();
    if (!searchData.items || searchData.items.length === 0) {
        console.log('[YOUTUBE] No se encontraron resultados');
        return { videos: [], total: 0, query };
    }
    // 3. Obtener detalles de los videos (duración)
    const videoIds = searchData.items.map((item) => item.id.videoId);
    const videos = await getVideoDetails(videoIds);
    console.log(`[YOUTUBE] Búsqueda "${query}": ${videos.length} resultados`);
    return {
        videos,
        total: searchData.pageInfo?.totalResults || videos.length,
        query: searchQuery,
    };
}
/**
 * Obtiene detalles completos de videos por sus IDs
 */
async function getVideoDetails(videoIds) {
    if (videoIds.length === 0)
        return [];
    const detailsParams = new URLSearchParams({
        part: 'snippet,contentDetails',
        id: videoIds.join(','),
        key: env_1.env.YOUTUBE_API_KEY,
    });
    const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`);
    if (!detailsResponse.ok) {
        console.error('[YOUTUBE] Error al obtener detalles de videos');
        throw new YouTubeError('Error al obtener detalles de videos', 502);
    }
    const detailsData = await detailsResponse.json();
    return detailsData.items.map((item) => {
        const { title, artist } = normalizeTitleAndArtist(item.snippet.title);
        return {
            youtubeId: item.id,
            title,
            artist,
            youtubeShareUrl: `https://youtu.be/${item.id}`,
            thumbnailUrl: item.snippet.thumbnails?.high?.url ||
                item.snippet.thumbnails?.medium?.url ||
                item.snippet.thumbnails?.default?.url ||
                null,
            duration: parseDuration(item.contentDetails?.duration),
            channelTitle: item.snippet.channelTitle,
        };
    });
}
/**
 * Obtiene un video específico por su ID
 */
async function getVideoById(videoId) {
    if (!isYouTubeConfigured()) {
        throw new YouTubeError('YouTube API no está configurada', 503);
    }
    const videos = await getVideoDetails([videoId]);
    return videos[0] || null;
}
// ============================================
// Normalization
// ============================================
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
function normalizeTitleAndArtist(rawTitle) {
    // 1. Limpiar sufijos comunes
    let cleaned = rawTitle
        .replace(/\s*\(.*?(?:oficial|official|video|lyrics?|letra|karaoke).*?\)/gi, '')
        .replace(/\s*\[.*?(?:oficial|official|video|lyrics?|letra|karaoke).*?\]/gi, '')
        .replace(/\s*\|.*?(?:oficial|official|video|lyrics?|letra|karaoke).*$/gi, '')
        .trim();
    // 2. Intentar detectar separador artista-título
    let artist = 'Desconocido';
    let title = cleaned;
    // Patrón: "Artista - Título" o "Artista: Título"
    const dashMatch = cleaned.match(/^([^-:]+)\s*[-:]\s*(.+)$/);
    if (dashMatch) {
        artist = dashMatch[1].trim();
        title = dashMatch[2].trim();
    }
    // Patrón: "Título (Artista)"
    const parensMatch = cleaned.match(/^(.+?)\s*\(([^)]+)\)\s*$/);
    if (parensMatch) {
        title = parensMatch[1].trim();
        artist = parensMatch[2].trim();
    }
    return {
        title: title || cleaned,
        artist,
    };
}
/**
 * Parsea duración ISO 8601 de YouTube a segundos
 * Ejemplo: "PT4M33S" -> 273 segundos
 */
function parseDuration(isoDuration) {
    if (!isoDuration)
        return null;
    const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match)
        return null;
    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
}
// ============================================
// Error Class
// ============================================
class YouTubeError extends Error {
    statusCode;
    constructor(message, statusCode = 502) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'YouTubeError';
    }
}
exports.YouTubeError = YouTubeError;
//# sourceMappingURL=youtube.service.js.map