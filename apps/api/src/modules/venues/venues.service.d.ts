/**
 * EUFORIA EVENTS - Venues Service
 * Lógica de negocio para gestión de venues (salones/lugares)
 */
import { z } from 'zod';
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
export declare const createVenueSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodDefault<z.ZodEnum<["SALON", "HOTEL", "QUINTA", "RESTAURANT", "BAR", "PUB", "DISCO", "CONFITERIA", "CLUB", "OUTDOOR", "OTHER"]>>;
    address: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    city: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    capacity: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    contactName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    contactPhone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    instagramUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    type: "SALON" | "OTHER" | "HOTEL" | "QUINTA" | "RESTAURANT" | "BAR" | "PUB" | "DISCO" | "CONFITERIA" | "CLUB" | "OUTDOOR";
    address?: string | null | undefined;
    city?: string | null | undefined;
    capacity?: number | null | undefined;
    contactName?: string | null | undefined;
    contactPhone?: string | null | undefined;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name: string;
    type?: "SALON" | "OTHER" | "HOTEL" | "QUINTA" | "RESTAURANT" | "BAR" | "PUB" | "DISCO" | "CONFITERIA" | "CLUB" | "OUTDOOR" | undefined;
    address?: string | null | undefined;
    city?: string | null | undefined;
    capacity?: number | null | undefined;
    contactName?: string | null | undefined;
    contactPhone?: string | null | undefined;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const updateVenueSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    type: z.ZodOptional<z.ZodDefault<z.ZodEnum<["SALON", "HOTEL", "QUINTA", "RESTAURANT", "BAR", "PUB", "DISCO", "CONFITERIA", "CLUB", "OUTDOOR", "OTHER"]>>>;
    address: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    city: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    capacity: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    contactName: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    contactPhone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    instagramUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    type?: "SALON" | "OTHER" | "HOTEL" | "QUINTA" | "RESTAURANT" | "BAR" | "PUB" | "DISCO" | "CONFITERIA" | "CLUB" | "OUTDOOR" | undefined;
    address?: string | null | undefined;
    city?: string | null | undefined;
    capacity?: number | null | undefined;
    contactName?: string | null | undefined;
    contactPhone?: string | null | undefined;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
}, {
    name?: string | undefined;
    type?: "SALON" | "OTHER" | "HOTEL" | "QUINTA" | "RESTAURANT" | "BAR" | "PUB" | "DISCO" | "CONFITERIA" | "CLUB" | "OUTDOOR" | undefined;
    address?: string | null | undefined;
    city?: string | null | undefined;
    capacity?: number | null | undefined;
    contactName?: string | null | undefined;
    contactPhone?: string | null | undefined;
    instagramUrl?: string | null | undefined;
    notes?: string | null | undefined;
}>;
export declare const venueFiltersSchema: z.ZodObject<{
    type: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    search: z.ZodOptional<z.ZodString>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    includeInactive: boolean;
    type?: string | undefined;
    city?: string | undefined;
    search?: string | undefined;
}, {
    type?: string | undefined;
    city?: string | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeInactive?: boolean | undefined;
}>;
export type CreateVenueInput = z.infer<typeof createVenueSchema>;
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>;
export type VenueFilters = z.infer<typeof venueFiltersSchema>;
export declare class VenueError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
declare class VenueService {
    /**
     * Crea un nuevo venue
     */
    create(input: CreateVenueInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        address: string | null;
        city: string | null;
        capacity: number | null;
        contactName: string | null;
        contactPhone: string | null;
        instagramUrl: string | null;
        notes: string | null;
    }>;
    /**
     * Obtiene un venue por ID
     */
    findById(id: string): Promise<{
        _count: {
            events: number;
        };
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        address: string | null;
        city: string | null;
        capacity: number | null;
        contactName: string | null;
        contactPhone: string | null;
        instagramUrl: string | null;
        notes: string | null;
    }>;
    /**
     * Lista venues con filtros
     */
    findAll(filters: VenueFilters): Promise<{
        venues: ({
            _count: {
                events: number;
            };
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            type: string;
            address: string | null;
            city: string | null;
            capacity: number | null;
            contactName: string | null;
            contactPhone: string | null;
            instagramUrl: string | null;
            notes: string | null;
        })[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    /**
     * Actualiza un venue
     */
    update(id: string, input: UpdateVenueInput): Promise<{
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        type: string;
        address: string | null;
        city: string | null;
        capacity: number | null;
        contactName: string | null;
        contactPhone: string | null;
        instagramUrl: string | null;
        notes: string | null;
    }>;
    /**
     * Desactiva un venue (soft delete)
     */
    delete(id: string): Promise<{
        message: string;
    }>;
    /**
     * Reactiva un venue
     */
    reactivate(id: string): Promise<{
        message: string;
    }>;
}
export declare const venueService: VenueService;
export {};
//# sourceMappingURL=venues.service.d.ts.map