/**
 * EUFORIA EVENTS - Clients Service
 * Lógica de negocio para gestión de clientes/contratantes
 */
import { z } from 'zod';
export declare const createClientSchema: z.ZodObject<{
    name: z.ZodString;
    company: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    phone: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    email: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    cuit: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    notes: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    name: string;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    company?: string | null | undefined;
    phone?: string | null | undefined;
    cuit?: string | null | undefined;
}, {
    name: string;
    email?: string | null | undefined;
    notes?: string | null | undefined;
    company?: string | null | undefined;
    phone?: string | null | undefined;
    cuit?: string | null | undefined;
}>;
export declare const updateClientSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    company: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    phone: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    email: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    cuit: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    notes: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
}, "strip", z.ZodTypeAny, {
    email?: string | null | undefined;
    name?: string | undefined;
    notes?: string | null | undefined;
    company?: string | null | undefined;
    phone?: string | null | undefined;
    cuit?: string | null | undefined;
}, {
    email?: string | null | undefined;
    name?: string | undefined;
    notes?: string | null | undefined;
    company?: string | null | undefined;
    phone?: string | null | undefined;
    cuit?: string | null | undefined;
}>;
export declare const clientFiltersSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    includeInactive: boolean;
    search?: string | undefined;
}, {
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeInactive?: boolean | undefined;
}>;
export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientFilters = z.infer<typeof clientFiltersSchema>;
export declare class ClientError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
declare class ClientService {
    /**
     * Crea un nuevo cliente
     */
    create(input: CreateClientInput): Promise<{
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        company: string | null;
        phone: string | null;
        cuit: string | null;
    }>;
    /**
     * Obtiene un cliente por ID
     */
    findById(id: string): Promise<{
        _count: {
            events: number;
        };
    } & {
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        company: string | null;
        phone: string | null;
        cuit: string | null;
    }>;
    /**
     * Lista clientes con filtros
     */
    findAll(filters: ClientFilters): Promise<{
        clients: ({
            _count: {
                events: number;
            };
        } & {
            id: string;
            email: string | null;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            notes: string | null;
            company: string | null;
            phone: string | null;
            cuit: string | null;
        })[];
        pagination: {
            total: number;
            limit: number;
            offset: number;
            hasMore: boolean;
        };
    }>;
    /**
     * Actualiza un cliente
     */
    update(id: string, input: UpdateClientInput): Promise<{
        id: string;
        email: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        company: string | null;
        phone: string | null;
        cuit: string | null;
    }>;
    /**
     * Desactiva un cliente (soft delete)
     */
    delete(id: string): Promise<{
        message: string;
    }>;
    /**
     * Reactiva un cliente
     */
    reactivate(id: string): Promise<{
        message: string;
    }>;
}
export declare const clientService: ClientService;
export {};
//# sourceMappingURL=clients.service.d.ts.map