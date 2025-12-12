/**
 * Spotify Service
 * Integración con Spotify Web API para búsqueda de tracks
 * Usa Client Credentials Flow (no requiere login de usuario)
 */
interface SpotifyTrack {
    id: string;
    name: string;
    artists: string[];
    album: string;
    albumArtUrl: string | null;
    durationMs: number;
    previewUrl: string | null;
    spotifyUrl: string;
}
interface SpotifySearchResult {
    tracks: SpotifyTrack[];
    total: number;
    query: string;
}
/**
 * Verifica si las credenciales de Spotify están configuradas
 */
export declare function isSpotifyConfigured(): boolean;
/**
 * Busca tracks en Spotify
 */
export declare function searchTracks(query: string, limit?: number): Promise<SpotifySearchResult>;
/**
 * Obtiene un track por ID
 */
export declare function getTrackById(trackId: string): Promise<SpotifyTrack | null>;
export declare class SpotifyError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
export type { SpotifyTrack, SpotifySearchResult };
//# sourceMappingURL=spotify.service.d.ts.map