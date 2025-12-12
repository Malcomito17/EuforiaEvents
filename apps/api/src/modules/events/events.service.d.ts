/**
 * EUFORIA EVENTS - Events Service
 * Lógica de negocio para gestión de eventos
 */
import { z } from 'zod';
import { type EventStatus } from './events.types';
export declare const createEventDataSchema: z.ZodObject<{
    eventName: z.ZodString;
    eventType: z.ZodDefault<z.ZodEnum<["WEDDING", "BIRTHDAY", "QUINCEANERA", "CORPORATE", "GRADUATION", "ANNIVERSARY", "FIESTA_PRIVADA", "SHOW", "EVENTO_ESPECIAL", "OTHER"]>>;
    startDate: z.ZodDate;
    endDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
    guestCount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    instagramUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    instagramUser: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    hashtag: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    spotifyPlaylist: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    primaryColor: z.ZodOptional<z.ZodString>;
    secondaryColor: z.ZodOptional<z.ZodString>;
    accentColor: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    eventName: string;
    eventType: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER";
    startDate: Date;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
    endDate?: Date | null | undefined;
    guestCount?: number | null | undefined;
    instagramUser?: string | null | undefined;
    hashtag?: string | null | undefined;
    spotifyPlaylist?: string | null | undefined;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
}, {
    eventName: string;
    startDate: Date;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
    eventType?: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER" | undefined;
    endDate?: Date | null | undefined;
    guestCount?: number | null | undefined;
    instagramUser?: string | null | undefined;
    hashtag?: string | null | undefined;
    spotifyPlaylist?: string | null | undefined;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
}>;
export declare const createEventSchema: z.ZodObject<{
    venueId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    clientId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    eventData: z.ZodObject<{
        eventName: z.ZodString;
        eventType: z.ZodDefault<z.ZodEnum<["WEDDING", "BIRTHDAY", "QUINCEANERA", "CORPORATE", "GRADUATION", "ANNIVERSARY", "FIESTA_PRIVADA", "SHOW", "EVENTO_ESPECIAL", "OTHER"]>>;
        startDate: z.ZodDate;
        endDate: z.ZodNullable<z.ZodOptional<z.ZodDate>>;
        guestCount: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
        instagramUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        instagramUser: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        hashtag: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        spotifyPlaylist: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        primaryColor: z.ZodOptional<z.ZodString>;
        secondaryColor: z.ZodOptional<z.ZodString>;
        accentColor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        eventName: string;
        eventType: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER";
        startDate: Date;
        instagramUrl?: string | null | undefined;
        notes?: string | null | undefined;
        endDate?: Date | null | undefined;
        guestCount?: number | null | undefined;
        instagramUser?: string | null | undefined;
        hashtag?: string | null | undefined;
        spotifyPlaylist?: string | null | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
    }, {
        eventName: string;
        startDate: Date;
        instagramUrl?: string | null | undefined;
        notes?: string | null | undefined;
        eventType?: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER" | undefined;
        endDate?: Date | null | undefined;
        guestCount?: number | null | undefined;
        instagramUser?: string | null | undefined;
        hashtag?: string | null | undefined;
        spotifyPlaylist?: string | null | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    eventData: {
        eventName: string;
        eventType: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER";
        startDate: Date;
        instagramUrl?: string | null | undefined;
        notes?: string | null | undefined;
        endDate?: Date | null | undefined;
        guestCount?: number | null | undefined;
        instagramUser?: string | null | undefined;
        hashtag?: string | null | undefined;
        spotifyPlaylist?: string | null | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
    };
    venueId?: string | null | undefined;
    clientId?: string | null | undefined;
}, {
    eventData: {
        eventName: string;
        startDate: Date;
        instagramUrl?: string | null | undefined;
        notes?: string | null | undefined;
        eventType?: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER" | undefined;
        endDate?: Date | null | undefined;
        guestCount?: number | null | undefined;
        instagramUser?: string | null | undefined;
        hashtag?: string | null | undefined;
        spotifyPlaylist?: string | null | undefined;
        primaryColor?: string | undefined;
        secondaryColor?: string | undefined;
        accentColor?: string | undefined;
    };
    venueId?: string | null | undefined;
    clientId?: string | null | undefined;
}>;
export declare const updateEventSchema: z.ZodObject<{
    venueId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    clientId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "PAUSED", "FINISHED"]>>;
}, "strip", z.ZodTypeAny, {
    status?: "ACTIVE" | "DRAFT" | "PAUSED" | "FINISHED" | undefined;
    venueId?: string | null | undefined;
    clientId?: string | null | undefined;
}, {
    status?: "ACTIVE" | "DRAFT" | "PAUSED" | "FINISHED" | undefined;
    venueId?: string | null | undefined;
    clientId?: string | null | undefined;
}>;
export declare const updateEventDataSchema: z.ZodObject<{
    eventName: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodDefault<z.ZodEnum<["WEDDING", "BIRTHDAY", "QUINCEANERA", "CORPORATE", "GRADUATION", "ANNIVERSARY", "FIESTA_PRIVADA", "SHOW", "EVENTO_ESPECIAL", "OTHER"]>>>;
    startDate: z.ZodOptional<z.ZodDate>;
    endDate: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodDate>>>;
    guestCount: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    instagramUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    instagramUser: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    hashtag: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    spotifyPlaylist: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    primaryColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    secondaryColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    accentColor: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
    eventName?: string | undefined;
    eventType?: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER" | undefined;
    startDate?: Date | undefined;
    endDate?: Date | null | undefined;
    guestCount?: number | null | undefined;
    instagramUser?: string | null | undefined;
    hashtag?: string | null | undefined;
    spotifyPlaylist?: string | null | undefined;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
}, {
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
    eventName?: string | undefined;
    eventType?: "CORPORATE" | "WEDDING" | "BIRTHDAY" | "QUINCEANERA" | "GRADUATION" | "ANNIVERSARY" | "FIESTA_PRIVADA" | "SHOW" | "EVENTO_ESPECIAL" | "OTHER" | undefined;
    startDate?: Date | undefined;
    endDate?: Date | null | undefined;
    guestCount?: number | null | undefined;
    instagramUser?: string | null | undefined;
    hashtag?: string | null | undefined;
    spotifyPlaylist?: string | null | undefined;
    primaryColor?: string | undefined;
    secondaryColor?: string | undefined;
    accentColor?: string | undefined;
}>;
export declare const eventFiltersSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["DRAFT", "ACTIVE", "PAUSED", "FINISHED"]>>;
    eventType: z.ZodOptional<z.ZodString>;
    venueId: z.ZodOptional<z.ZodString>;
    clientId: z.ZodOptional<z.ZodString>;
    fromDate: z.ZodOptional<z.ZodDate>;
    toDate: z.ZodOptional<z.ZodDate>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "ACTIVE" | "DRAFT" | "PAUSED" | "FINISHED" | undefined;
    venueId?: string | undefined;
    clientId?: string | undefined;
    eventType?: string | undefined;
    search?: string | undefined;
    fromDate?: Date | undefined;
    toDate?: Date | undefined;
}, {
    status?: "ACTIVE" | "DRAFT" | "PAUSED" | "FINISHED" | undefined;
    venueId?: string | undefined;
    clientId?: string | undefined;
    eventType?: string | undefined;
    search?: string | undefined;
    fromDate?: Date | undefined;
    toDate?: Date | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
export type UpdateEventDataInput = z.infer<typeof updateEventDataSchema>;
export type EventFilters = z.infer<typeof eventFiltersSchema>;
export declare class EventError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
declare class EventService {
    /**
     * Crea un nuevo evento con sus datos
     */
    create(input: CreateEventInput, userId: string): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    /**
     * Obtiene un evento por ID con todos sus datos
     */
    findById(id: string): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    /**
     * Obtiene un evento por slug (para acceso público via QR)
     */
    findBySlug(slug: string): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    /**
     * Lista eventos con filtros
     */
    findAll(filters: EventFilters): Promise<{
        events: ({
            venue: {
                name: string;
                city: string | null;
            } | null;
            client: {
                name: string;
            } | null;
            eventData: {
                eventName: string;
                eventType: string;
                startDate: Date;
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
        })[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    /**
     * Actualiza datos del evento (no eventData)
     */
    update(id: string, input: UpdateEventInput): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    /**
     * Actualiza eventData específicamente
     */
    updateEventData(eventId: string, input: UpdateEventDataInput): Promise<{
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
    }>;
    /**
     * Cambia el estado del evento
     */
    updateStatus(id: string, status: EventStatus): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    /**
     * Elimina un evento (soft delete via status FINISHED)
     */
    delete(id: string): Promise<{
        message: string;
        event: {
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
    }>;
    /**
     * Duplica un evento con nueva fecha
     * Copia: venue, client, eventData, configs de módulos
     * NO copia: requests, datos operativos
     */
    duplicate(id: string, userId: string, newStartDate?: Date): Promise<{
        venue: {
            id: string;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            contactName: string | null;
            contactPhone: string | null;
        } | null;
        client: {
            id: string;
            email: string | null;
            name: string;
            company: string | null;
            phone: string | null;
        } | null;
        clonedFrom: {
            id: string;
            slug: string;
        } | null;
        createdBy: {
            id: string;
            username: string;
        };
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
        musicadjConfig: {
            enabled: boolean;
            cooldownSeconds: number;
            allowWithoutSpotify: boolean;
            welcomeMessage: string | null;
            showQueueToClient: boolean;
            customMessages: string | null;
            eventId: string;
        } | null;
        karaokeyaConfig: {
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
    }>;
    private getIncludeClause;
    private validateStatusTransition;
}
export declare const eventService: EventService;
export {};
//# sourceMappingURL=events.service.d.ts.map