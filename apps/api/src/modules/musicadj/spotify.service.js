"use strict";
/**
 * Spotify Service
 * Integración con Spotify Web API para búsqueda de tracks
 * Usa Client Credentials Flow (no requiere login de usuario)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpotifyError = void 0;
exports.isSpotifyConfigured = isSpotifyConfigured;
exports.searchTracks = searchTracks;
exports.getTrackById = getTrackById;
const env_1 = require("../../config/env");
// ============================================
// Token Cache
// ============================================
let cachedToken = null;
/**
 * Verifica si las credenciales de Spotify están configuradas
 */
function isSpotifyConfigured() {
    return !!(env_1.env.SPOTIFY_CLIENT_ID && env_1.env.SPOTIFY_CLIENT_SECRET);
}
/**
 * Obtiene un token de acceso (con cache)
 */
async function getAccessToken() {
    // Verificar cache
    if (cachedToken && Date.now() < cachedToken.expiresAt) {
        return cachedToken.accessToken;
    }
    if (!isSpotifyConfigured()) {
        throw new SpotifyError('Spotify no está configurado', 503);
    }
    console.log('[SPOTIFY] Obteniendo nuevo token...');
    const credentials = Buffer.from(`${env_1.env.SPOTIFY_CLIENT_ID}:${env_1.env.SPOTIFY_CLIENT_SECRET}`).toString('base64');
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    if (!response.ok) {
        const error = await response.text();
        console.error('[SPOTIFY] Error de autenticación:', error);
        throw new SpotifyError('Error al autenticar con Spotify', 502);
    }
    const data = await response.json();
    // Guardar en cache (expira 5 minutos antes para seguridad)
    cachedToken = {
        accessToken: data.access_token,
        expiresAt: Date.now() + (data.expires_in - 300) * 1000,
    };
    console.log('[SPOTIFY] Token obtenido, expira en', data.expires_in, 'segundos');
    return cachedToken.accessToken;
}
// ============================================
// Search
// ============================================
/**
 * Busca tracks en Spotify
 */
async function searchTracks(query, limit = 10) {
    if (!query.trim()) {
        return { tracks: [], total: 0, query };
    }
    const token = await getAccessToken();
    const params = new URLSearchParams({
        q: query,
        type: 'track',
        limit: String(Math.min(limit, 50)),
        market: 'AR', // Argentina
    });
    const response = await fetch(`https://api.spotify.com/v1/search?${params}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        if (response.status === 401) {
            // Token expirado, limpiar cache e intentar de nuevo
            cachedToken = null;
            return searchTracks(query, limit);
        }
        const error = await response.text();
        console.error('[SPOTIFY] Error de búsqueda:', error);
        throw new SpotifyError('Error al buscar en Spotify', 502);
    }
    const data = await response.json();
    const tracks = data.tracks.items.map((item) => ({
        id: item.id,
        name: item.name,
        artists: item.artists.map((a) => a.name),
        album: item.album.name,
        albumArtUrl: item.album.images?.[0]?.url || null,
        durationMs: item.duration_ms,
        previewUrl: item.preview_url,
        spotifyUrl: item.external_urls.spotify,
    }));
    console.log(`[SPOTIFY] Búsqueda "${query}": ${tracks.length} resultados`);
    return {
        tracks,
        total: data.tracks.total,
        query,
    };
}
/**
 * Obtiene un track por ID
 */
async function getTrackById(trackId) {
    const token = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}?market=AR`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });
    if (!response.ok) {
        if (response.status === 404) {
            return null;
        }
        if (response.status === 401) {
            cachedToken = null;
            return getTrackById(trackId);
        }
        throw new SpotifyError('Error al obtener track de Spotify', 502);
    }
    const item = await response.json();
    return {
        id: item.id,
        name: item.name,
        artists: item.artists.map((a) => a.name),
        album: item.album.name,
        albumArtUrl: item.album.images?.[0]?.url || null,
        durationMs: item.duration_ms,
        previewUrl: item.preview_url,
        spotifyUrl: item.external_urls.spotify,
    };
}
// ============================================
// Error Class
// ============================================
class SpotifyError extends Error {
    statusCode;
    constructor(message, statusCode = 502) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'SpotifyError';
    }
}
exports.SpotifyError = SpotifyError;
//# sourceMappingURL=spotify.service.js.map