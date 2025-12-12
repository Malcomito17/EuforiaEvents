import type { GuestIdentifyInput, GuestResponse } from './guests.types';
export declare class GuestsService {
    /**
     * Identifica o crea un guest por email
     * Si el email existe, actualiza displayName y whatsapp
     * Si no existe, crea uno nuevo
     */
    identify(data: GuestIdentifyInput): Promise<GuestResponse>;
    /**
     * Obtiene un guest por ID
     */
    getById(guestId: string): Promise<GuestResponse | null>;
    /**
     * Busca un guest por email (para autocompletar formularios)
     */
    lookupByEmail(email: string): Promise<GuestResponse | null>;
    /**
     * Obtiene los pedidos de un guest (song + karaoke)
     */
    getRequests(guestId: string, eventId?: string): Promise<{
        songs: ({
            event: {
                eventData: {
                    id: string;
                    instagramUrl: string | null;
                    notes: string | null;
                    eventName: string;
                    eventType: string;
                    startDate: Date;
                    endDate: Date | null;
                    guestCount: number | null;
                    instagramUser: string | null;
                    hashtag: string | null;
                    spotifyPlaylist: string | null;
                    customFields: string | null;
                    primaryColor: string;
                    secondaryColor: string;
                    accentColor: string;
                    eventId: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                status: string;
                venueId: string | null;
                clientId: string | null;
                clonedFromId: string | null;
                createdById: string;
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
        karaoke: ({
            event: {
                eventData: {
                    id: string;
                    instagramUrl: string | null;
                    notes: string | null;
                    eventName: string;
                    eventType: string;
                    startDate: Date;
                    endDate: Date | null;
                    guestCount: number | null;
                    instagramUser: string | null;
                    hashtag: string | null;
                    spotifyPlaylist: string | null;
                    customFields: string | null;
                    primaryColor: string;
                    secondaryColor: string;
                    accentColor: string;
                    eventId: string;
                } | null;
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                slug: string;
                status: string;
                venueId: string | null;
                clientId: string | null;
                clonedFromId: string | null;
                createdById: string;
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
        })[];
    }>;
    /**
     * Lista TODOS los guests (sin filtrar por evento)
     */
    listAll(): Promise<{
        songRequestsCount: number;
        karaokeRequestsCount: number;
        id: string;
        email: string;
        displayName: string;
        whatsapp?: string | null;
        createdAt: Date;
    }[]>;
    /**
     * Lista todos los guests de un evento
     */
    listByEvent(eventId: string): Promise<{
        songRequestsCount: number;
        karaokeRequestsCount: number;
        id: string;
        email: string;
        displayName: string;
        whatsapp?: string | null;
        createdAt: Date;
    }[]>;
    /**
     * Elimina un guest y todas sus requests
     */
    delete(guestId: string): Promise<{
        message: string;
        guest: GuestResponse;
    }>;
    /**
     * Remueve campos sensibles del guest
     */
    private sanitizeGuest;
}
export declare const guestsService: GuestsService;
//# sourceMappingURL=guests.service.d.ts.map