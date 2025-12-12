/**
 * API Service - Cliente HTTP para el backend (v1.3)
 */
import type { Event, MusicadjConfig, SpotifySearchResult, SongRequest, CreateSongRequestInput, Guest, GuestIdentifyInput, GuestRequestsResponse, KaraokeyaConfig, HybridSearchResult, CreateKaraokeRequestInput, KaraokeRequest, CatalogSong } from '../types';
declare const api: import("axios").AxiosInstance;
export declare function identifyGuest(input: GuestIdentifyInput): Promise<Guest>;
export declare function getGuestRequests(guestId: string, eventId?: string): Promise<GuestRequestsResponse>;
export declare function getEventBySlug(slug: string): Promise<Event>;
export declare function getMusicadjConfig(eventId: string): Promise<MusicadjConfig>;
export declare function searchSpotify(eventId: string, query: string, limit?: number): Promise<SpotifySearchResult>;
export declare function createSongRequest(eventId: string, input: CreateSongRequestInput): Promise<SongRequest>;
export declare function getKaraokeyaConfig(eventId: string): Promise<KaraokeyaConfig>;
export declare function searchKaraoke(eventId: string, query: string): Promise<HybridSearchResult>;
export declare function createKaraokeRequest(eventId: string, input: CreateKaraokeRequestInput): Promise<KaraokeRequest>;
export declare function deleteKaraokeRequest(eventId: string, requestId: string): Promise<void>;
export declare function getGuestKaraokeQueue(eventId: string, guestId: string): Promise<{
    requests: KaraokeRequest[];
    total: number;
}>;
export declare function getPublicKaraokeQueue(eventId: string): Promise<{
    requests: KaraokeRequest[];
    total: number;
}>;
export declare function getPopularSongs(eventId: string, limit?: number): Promise<{
    songs: CatalogSong[];
    total: number;
}>;
export declare function getSmartSuggestions(eventId: string, guestId?: string, limit?: number): Promise<{
    suggestions: (CatalogSong & {
        reason?: string;
    })[];
    total: number;
}>;
export declare function toggleSongLike(songId: string, guestId: string): Promise<{
    liked: boolean;
    likesCount: number;
}>;
export declare function getSongLikeStatus(songId: string, guestId: string): Promise<{
    liked: boolean;
}>;
export declare function batchGetLikeStatuses(songIds: string[], guestId: string): Promise<Record<string, boolean>>;
export { api };
//# sourceMappingURL=api.d.ts.map