/**
 * EUFORIA EVENTS - Events Module Types
 * Tipos y constantes específicos del módulo de eventos
 */
export declare const EVENT_STATUS: {
    readonly DRAFT: "DRAFT";
    readonly ACTIVE: "ACTIVE";
    readonly PAUSED: "PAUSED";
    readonly FINISHED: "FINISHED";
};
export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS];
export declare const EVENT_TYPE: {
    readonly WEDDING: "WEDDING";
    readonly BIRTHDAY: "BIRTHDAY";
    readonly QUINCEANERA: "QUINCEANERA";
    readonly CORPORATE: "CORPORATE";
    readonly GRADUATION: "GRADUATION";
    readonly ANNIVERSARY: "ANNIVERSARY";
    readonly FIESTA_PRIVADA: "FIESTA_PRIVADA";
    readonly SHOW: "SHOW";
    readonly EVENTO_ESPECIAL: "EVENTO_ESPECIAL";
    readonly OTHER: "OTHER";
};
export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE];
export declare const VENUE_TYPE: {
    readonly SALON: "SALON";
    readonly HOTEL: "HOTEL";
    readonly QUINTA: "QUINTA";
    readonly RESTAURANT: "RESTAURANT";
    readonly BAR: "BAR";
    readonly PUB: "PUB";
    readonly DISCO: "DISCO";
    readonly CONFITERIA: "CONFITERIA";
    readonly CLUB: "CLUB";
    readonly OUTDOOR: "OUTDOOR";
    readonly OTHER: "OTHER";
};
export type VenueType = (typeof VENUE_TYPE)[keyof typeof VENUE_TYPE];
export interface EventWithDetails {
    id: string;
    slug: string;
    status: EventStatus;
    createdAt: Date;
    updatedAt: Date;
    createdBy: {
        id: string;
        username: string;
    };
    venue: {
        id: string;
        name: string;
        type: string;
        city?: string | null;
    } | null;
    client: {
        id: string;
        name: string;
        company?: string | null;
    } | null;
    eventData: {
        eventName: string;
        eventType: string;
        startDate: Date;
        endDate?: Date | null;
        guestCount?: number | null;
    } | null;
    clonedFrom?: {
        id: string;
        slug: string;
    } | null;
}
export interface EventListItem {
    id: string;
    slug: string;
    status: EventStatus;
    createdAt: Date;
    eventData: {
        eventName: string;
        eventType: string;
        startDate: Date;
    } | null;
    venue: {
        name: string;
        city?: string | null;
    } | null;
    client: {
        name: string;
    } | null;
}
//# sourceMappingURL=events.types.d.ts.map