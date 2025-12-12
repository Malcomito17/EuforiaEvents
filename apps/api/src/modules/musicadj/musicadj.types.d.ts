/**
 * MUSICADJ - Zod Schemas & Types (v1.3)
 * Actualizado para usar Guest model
 */
import { z } from 'zod';
export declare const songRequestStatusSchema: z.ZodEnum<["PENDING", "HIGHLIGHTED", "URGENT", "PLAYED", "DISCARDED"]>;
export type SongRequestStatus = z.infer<typeof songRequestStatusSchema>;
/**
 * Schema para crear una solicitud de canción (desde cliente público)
 * v1.3: Usa guestId en lugar de requesterName/Email
 */
export declare const createSongRequestSchema: z.ZodObject<{
    guestId: z.ZodString;
    spotifyId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    title: z.ZodString;
    artist: z.ZodString;
    albumArtUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title: string;
    artist: string;
    guestId: string;
    spotifyId?: string | null | undefined;
    albumArtUrl?: string | null | undefined;
}, {
    title: string;
    artist: string;
    guestId: string;
    spotifyId?: string | null | undefined;
    albumArtUrl?: string | null | undefined;
}>;
export type CreateSongRequestInput = z.infer<typeof createSongRequestSchema>;
/**
 * Schema para actualizar solicitud (operador)
 */
export declare const updateSongRequestSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "HIGHLIGHTED", "URGENT", "PLAYED", "DISCARDED"]>>;
    priority: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    priority?: number | undefined;
}, {
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    priority?: number | undefined;
}>;
export type UpdateSongRequestInput = z.infer<typeof updateSongRequestSchema>;
/**
 * Schema para bulk update (múltiples solicitudes)
 */
export declare const bulkUpdateRequestsSchema: z.ZodObject<{
    requestIds: z.ZodArray<z.ZodString, "many">;
    status: z.ZodOptional<z.ZodEnum<["PENDING", "HIGHLIGHTED", "URGENT", "PLAYED", "DISCARDED"]>>;
    priority: z.ZodOptional<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    requestIds: string[];
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    priority?: number | undefined;
}, {
    requestIds: string[];
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    priority?: number | undefined;
}>;
export type BulkUpdateRequestsInput = z.infer<typeof bulkUpdateRequestsSchema>;
/**
 * Schema para reordenar cola
 */
export declare const reorderQueueSchema: z.ZodObject<{
    requestIds: z.ZodArray<z.ZodString, "many">;
}, "strip", z.ZodTypeAny, {
    requestIds: string[];
}, {
    requestIds: string[];
}>;
export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>;
export declare const musicadjConfigSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    cooldownSeconds: z.ZodOptional<z.ZodNumber>;
    allowWithoutSpotify: z.ZodOptional<z.ZodBoolean>;
    welcomeMessage: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    showQueueToClient: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    cooldownSeconds?: number | undefined;
    allowWithoutSpotify?: boolean | undefined;
    welcomeMessage?: string | null | undefined;
    showQueueToClient?: boolean | undefined;
}, {
    enabled?: boolean | undefined;
    cooldownSeconds?: number | undefined;
    allowWithoutSpotify?: boolean | undefined;
    welcomeMessage?: string | null | undefined;
    showQueueToClient?: boolean | undefined;
}>;
export type MusicadjConfigInput = z.infer<typeof musicadjConfigSchema>;
export declare const listRequestsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["PENDING", "HIGHLIGHTED", "URGENT", "PLAYED", "DISCARDED"]>>;
    search: z.ZodOptional<z.ZodString>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    search?: string | undefined;
}, {
    status?: "PENDING" | "HIGHLIGHTED" | "URGENT" | "PLAYED" | "DISCARDED" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
export declare const spotifySearchSchema: z.ZodObject<{
    query: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    query: string;
    limit: number;
}, {
    query: string;
    limit?: number | undefined;
}>;
export type SpotifySearchInput = z.infer<typeof spotifySearchSchema>;
//# sourceMappingURL=musicadj.types.d.ts.map