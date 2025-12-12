import { Socket } from 'socket.io-client';
export interface SocketConfig {
    eventId: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onError?: (error: Error) => void;
}
export declare function connectSocket(config: SocketConfig): Socket;
export declare function disconnectSocket(): void;
export declare function getSocket(): Socket | null;
export interface MusicadjSocketEvents {
    onNewRequest?: (request: SongRequestEvent) => void;
    onRequestUpdated?: (request: SongRequestEvent) => void;
    onRequestDeleted?: (data: {
        requestId: string;
    }) => void;
    onQueueReordered?: (data: {
        requests: SongRequestEvent[];
    }) => void;
}
export interface SongRequestEvent {
    id: string;
    eventId: string;
    guestId: string;
    spotifyId: string | null;
    title: string;
    artist: string;
    albumArtUrl: string | null;
    status: string;
    priority: number;
    createdAt: string;
    guest: {
        id: string;
        displayName: string;
        email: string;
    };
}
export declare function subscribeMusicadj(events: MusicadjSocketEvents): () => void;
export interface KaraokeyaSocketEvents {
    onNewRequest?: (request: KaraokeRequestEvent) => void;
    onRequestUpdated?: (request: KaraokeRequestEvent) => void;
    onRequestDeleted?: (data: {
        requestId: string;
    }) => void;
    onQueueReordered?: (data: {
        requests: KaraokeRequestEvent[];
    }) => void;
}
export interface KaraokeRequestEvent {
    id: string;
    eventId: string;
    guestId: string;
    songId: string | null;
    title: string;
    artist: string | null;
    turnNumber: number;
    queuePosition: number;
    status: string;
    createdAt: string;
    calledAt: string | null;
    guest: {
        id: string;
        displayName: string;
        email: string;
        whatsapp: string | null;
    };
    song: {
        id: string;
        title: string;
        artist: string | null;
        youtubeId: string;
        youtubeShareUrl: string;
        thumbnailUrl: string | null;
        duration: number | null;
        timesRequested: number;
    } | null;
}
export declare function subscribeKaraokeya(events: KaraokeyaSocketEvents): () => void;
//# sourceMappingURL=socket.d.ts.map