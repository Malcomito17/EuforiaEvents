export declare const api: import("axios").AxiosInstance;
export interface LoginInput {
    username: string;
    password: string;
}
export interface User {
    id: string;
    username: string;
    email: string | null;
    role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}
export interface LoginResponse {
    token: string;
    user: User;
}
export declare const authApi: {
    login: (data: LoginInput) => Promise<import("axios").AxiosResponse<LoginResponse, any, {}>>;
    me: () => Promise<import("axios").AxiosResponse<User, any, {}>>;
    changePassword: (data: {
        currentPassword: string;
        newPassword: string;
    }) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export interface EventData {
    id: string;
    eventName: string;
    eventType: string;
    startDate: string;
    endDate: string | null;
    guestCount: number | null;
    instagramUrl: string | null;
    instagramUser: string | null;
    hashtag: string | null;
    spotifyPlaylist: string | null;
    notes: string | null;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
}
export interface Event {
    id: string;
    slug: string;
    status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED';
    venueId: string | null;
    clientId: string | null;
    createdAt: string;
    updatedAt: string;
    eventData: EventData | null;
    venue?: Venue | null;
    client?: Client | null;
}
export interface EventFilters {
    status?: string;
    eventType?: string;
    venueId?: string;
    clientId?: string;
    fromDate?: string;
    toDate?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
export interface CreateEventInput {
    venueId?: string;
    clientId?: string;
    eventData: {
        eventName: string;
        eventType: string;
        startDate: string;
        endDate?: string;
        guestCount?: number;
        instagramUrl?: string;
        instagramUser?: string;
        hashtag?: string;
        spotifyPlaylist?: string;
        notes?: string;
        primaryColor?: string;
        secondaryColor?: string;
        accentColor?: string;
    };
}
export interface QRResponse {
    eventId: string;
    slug: string;
    eventName: string | null;
    qr: {
        url: string;
        dataUrl: string;
        svg: string;
    };
}
export declare const eventsApi: {
    list: (filters?: EventFilters) => Promise<import("axios").AxiosResponse<{
        events: Event[];
        total: number;
        hasMore: boolean;
    }, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<Event, any, {}>>;
    create: (data: CreateEventInput) => Promise<import("axios").AxiosResponse<Event, any, {}>>;
    update: (id: string, data: Partial<CreateEventInput>) => Promise<import("axios").AxiosResponse<Event, any, {}>>;
    updateEventData: (id: string, data: Partial<EventData>) => Promise<import("axios").AxiosResponse<EventData, any, {}>>;
    updateStatus: (id: string, status: string) => Promise<import("axios").AxiosResponse<Event, any, {}>>;
    duplicate: (id: string, newStartDate?: string) => Promise<import("axios").AxiosResponse<Event, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getQR: (id: string) => Promise<import("axios").AxiosResponse<QRResponse, any, {}>>;
};
export interface Venue {
    id: string;
    name: string;
    type: string;
    address: string | null;
    city: string | null;
    capacity: number | null;
    contactName: string | null;
    contactPhone: string | null;
    instagramUrl: string | null;
    notes: string | null;
    isActive: boolean;
    _count?: {
        events: number;
    };
}
export interface CreateVenueInput {
    name: string;
    type: string;
    address?: string;
    city?: string;
    capacity?: number;
    contactName?: string;
    contactPhone?: string;
    instagramUrl?: string;
    notes?: string;
}
export declare const venuesApi: {
    list: (filters?: {
        type?: string;
        city?: string;
        search?: string;
        includeInactive?: boolean;
    }) => Promise<import("axios").AxiosResponse<{
        venues: Venue[];
        pagination: {
            total: number;
        };
    }, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<Venue, any, {}>>;
    create: (data: CreateVenueInput) => Promise<import("axios").AxiosResponse<Venue, any, {}>>;
    update: (id: string, data: Partial<CreateVenueInput>) => Promise<import("axios").AxiosResponse<Venue, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reactivate: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export interface Client {
    id: string;
    name: string;
    company: string | null;
    phone: string | null;
    email: string | null;
    cuit: string | null;
    notes: string | null;
    isActive: boolean;
    _count?: {
        events: number;
    };
}
export interface CreateClientInput {
    name: string;
    company?: string;
    phone?: string;
    email?: string;
    cuit?: string;
    notes?: string;
}
export declare const clientsApi: {
    list: (filters?: {
        search?: string;
        includeInactive?: boolean;
    }) => Promise<import("axios").AxiosResponse<{
        clients: Client[];
        pagination: {
            total: number;
        };
    }, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<Client, any, {}>>;
    create: (data: CreateClientInput) => Promise<import("axios").AxiosResponse<Client, any, {}>>;
    update: (id: string, data: Partial<CreateClientInput>) => Promise<import("axios").AxiosResponse<Client, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reactivate: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export type SongRequestStatus = 'PENDING' | 'HIGHLIGHTED' | 'URGENT' | 'PLAYED' | 'DISCARDED';
export interface SongRequest {
    id: string;
    eventId: string;
    guestId: string;
    spotifyId: string | null;
    title: string;
    artist: string;
    albumArtUrl: string | null;
    status: SongRequestStatus;
    priority: number;
    createdAt: string;
    updatedAt: string;
    guest: {
        id: string;
        displayName: string;
        email: string;
    };
    event?: {
        id: string;
        slug: string;
        eventData: EventData | null;
    };
}
export interface MusicadjConfig {
    eventId: string;
    enabled: boolean;
    cooldownSeconds: number;
    allowWithoutSpotify: boolean;
    welcomeMessage: string | null;
    showQueueToClient: boolean;
    spotifyAvailable: boolean;
}
export interface SongRequestFilters {
    status?: SongRequestStatus | SongRequestStatus[];
    search?: string;
    limit?: number;
    offset?: number;
}
export interface UpdateSongRequestInput {
    status?: SongRequestStatus;
    priority?: number;
}
export interface MusicadjStats {
    total: number;
    pending: number;
    highlighted: number;
    urgent: number;
    played: number;
    discarded: number;
}
export declare const musicadjApi: {
    getConfig: (eventId: string) => Promise<import("axios").AxiosResponse<MusicadjConfig, any, {}>>;
    updateConfig: (eventId: string, data: Partial<MusicadjConfig>) => Promise<import("axios").AxiosResponse<MusicadjConfig, any, {}>>;
    listRequests: (eventId: string, filters?: SongRequestFilters) => Promise<import("axios").AxiosResponse<{
        requests: SongRequest[];
        total: number;
        stats: MusicadjStats;
    }, any, {}>>;
    getRequest: (eventId: string, requestId: string) => Promise<import("axios").AxiosResponse<SongRequest, any, {}>>;
    updateRequest: (eventId: string, requestId: string, data: UpdateSongRequestInput) => Promise<import("axios").AxiosResponse<SongRequest, any, {}>>;
    deleteRequest: (eventId: string, requestId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updateManyRequests: (eventId: string, requestIds: string[], data: UpdateSongRequestInput) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reorderRequests: (eventId: string, orderedIds: string[]) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export type KaraokeRequestStatus = 'QUEUED' | 'CALLED' | 'ON_STAGE' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED';
export interface KaraokeRequest {
    id: string;
    eventId: string;
    guestId: string;
    songId: string | null;
    title: string;
    artist: string | null;
    turnNumber: number;
    queuePosition: number;
    status: KaraokeRequestStatus;
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
    event?: {
        id: string;
        slug: string;
        eventData: EventData | null;
    };
}
export interface KaraokeyaConfig {
    eventId: string;
    enabled: boolean;
    cooldownSeconds: number;
    maxPerPerson: number;
    showQueueToClient: boolean;
    youtubeAvailable: boolean;
}
export interface KaraokeRequestFilters {
    status?: KaraokeRequestStatus | KaraokeRequestStatus[];
    search?: string;
    limit?: number;
    offset?: number;
}
export interface UpdateKaraokeRequestInput {
    status?: KaraokeRequestStatus;
}
export interface KaraokeyaStats {
    total: number;
    queued: number;
    called: number;
    onStage: number;
    completed: number;
    noShow: number;
    cancelled: number;
}
export declare const karaokeyaApi: {
    getConfig: (eventId: string) => Promise<import("axios").AxiosResponse<KaraokeyaConfig, any, {}>>;
    updateConfig: (eventId: string, data: Partial<KaraokeyaConfig>) => Promise<import("axios").AxiosResponse<KaraokeyaConfig, any, {}>>;
    getStats: (eventId: string) => Promise<import("axios").AxiosResponse<KaraokeyaStats, any, {}>>;
    listRequests: (eventId: string, filters?: KaraokeRequestFilters) => Promise<import("axios").AxiosResponse<{
        requests: KaraokeRequest[];
        total: number;
    }, any, {}>>;
    getRequest: (eventId: string, requestId: string) => Promise<import("axios").AxiosResponse<KaraokeRequest, any, {}>>;
    updateRequest: (eventId: string, requestId: string, data: UpdateKaraokeRequestInput) => Promise<import("axios").AxiosResponse<KaraokeRequest, any, {}>>;
    deleteRequest: (eventId: string, requestId: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reorderQueue: (eventId: string, requestIds: string[]) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'PAVAROTTI';
export interface KaraokeSong {
    id: string;
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl: string;
    thumbnailUrl: string | null;
    duration: number | null;
    source: string;
    language: string;
    difficulty: Difficulty;
    ranking: number;
    opinion: string | null;
    likesCount: number;
    moods: string;
    tags: string;
    timesRequested: number;
    timesCompleted: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        requests: number;
        likes: number;
    };
}
export interface CreateKaraokeSongInput {
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl?: string;
    thumbnailUrl?: string | null;
    duration?: number | null;
    language?: 'ES' | 'EN' | 'PT';
    difficulty?: Difficulty;
    ranking?: number;
    opinion?: string | null;
    source?: string;
    moods?: string;
    tags?: string;
}
export interface ListSongsFilters {
    search?: string;
    difficulty?: Difficulty;
    minRanking?: number;
    language?: 'ES' | 'EN' | 'PT';
    sortBy?: 'title' | 'ranking' | 'likesCount' | 'timesRequested' | 'createdAt';
    sortOrder?: 'asc' | 'desc';
    includeInactive?: boolean;
    limit?: number;
    offset?: number;
}
export declare const karaokeSongsApi: {
    list: (filters?: ListSongsFilters) => Promise<import("axios").AxiosResponse<{
        songs: KaraokeSong[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<KaraokeSong, any, {}>>;
    create: (data: CreateKaraokeSongInput) => Promise<import("axios").AxiosResponse<KaraokeSong, any, {}>>;
    update: (id: string, data: Partial<CreateKaraokeSongInput>) => Promise<import("axios").AxiosResponse<KaraokeSong, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reactivate: (id: string) => Promise<import("axios").AxiosResponse<KaraokeSong, any, {}>>;
    toggleLike: (songId: string, guestId: string) => Promise<import("axios").AxiosResponse<{
        liked: boolean;
        likesCount: number;
    }, any, {}>>;
    getLikeStatus: (songId: string, guestId: string) => Promise<import("axios").AxiosResponse<{
        liked: boolean;
    }, any, {}>>;
    getGuestLikedSongs: (guestId: string, limit?: number) => Promise<import("axios").AxiosResponse<{
        songs: KaraokeSong[];
        total: number;
    }, any, {}>>;
};
export interface Guest {
    id: string;
    email: string;
    displayName: string;
    whatsapp: string | null;
    createdAt: string;
    songRequestsCount?: number;
    karaokeRequestsCount?: number;
}
export interface GuestRequests {
    songs: SongRequest[];
    karaoke: KaraokeRequest[];
}
export declare const guestsApi: {
    listAll: () => Promise<import("axios").AxiosResponse<{
        success: boolean;
        guests: Guest[];
    }, any, {}>>;
    listByEvent: (eventId: string) => Promise<import("axios").AxiosResponse<{
        success: boolean;
        guests: Guest[];
    }, any, {}>>;
    get: (guestId: string) => Promise<import("axios").AxiosResponse<{
        success: boolean;
        guest: Guest;
    }, any, {}>>;
    getRequests: (guestId: string, eventId?: string) => Promise<import("axios").AxiosResponse<{
        success: boolean;
        requests: GuestRequests;
    }, any, {}>>;
    delete: (guestId: string) => Promise<import("axios").AxiosResponse<{
        success: boolean;
        message: string;
        guest: Guest;
    }, any, {}>>;
};
export type { Role, Module, Permission, CreateUserInput, UpdateUserInput } from './types/users';
export declare const usersApi: {
    list: (filters?: {
        role?: string;
        isActive?: boolean;
        search?: string;
        includeInactive?: boolean;
    }) => Promise<import("axios").AxiosResponse<{
        users: any[];
        pagination: any;
    }, any, {}>>;
    get: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    create: (data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    update: (id: string, data: any) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    updatePermissions: (id: string, permissions: any[]) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    reactivate: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
    getRolePreset: (role: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
//# sourceMappingURL=api.d.ts.map