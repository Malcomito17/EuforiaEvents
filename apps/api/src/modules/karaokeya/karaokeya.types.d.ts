/**
 * KARAOKEYA - Zod Schemas & Types (v1.4)
 * Esquemas de validación para módulo de karaoke
 */
import { z } from 'zod';
export declare const karaokeRequestStatusSchema: z.ZodEnum<["QUEUED", "CALLED", "ON_STAGE", "COMPLETED", "NO_SHOW", "CANCELLED"]>;
export type KaraokeRequestStatus = z.infer<typeof karaokeRequestStatusSchema>;
/**
 * Schema para crear una solicitud de karaoke (desde cliente público)
 */
export declare const createKaraokeRequestSchema: z.ZodObject<{
    guestId: z.ZodString;
    songId: z.ZodOptional<z.ZodString>;
    youtubeId: z.ZodOptional<z.ZodString>;
    title: z.ZodString;
    artist: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    guestId: string;
    artist?: string | undefined;
    youtubeId?: string | undefined;
    songId?: string | undefined;
}, {
    title: string;
    guestId: string;
    artist?: string | undefined;
    youtubeId?: string | undefined;
    songId?: string | undefined;
}>;
export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>;
/**
 * Schema para actualizar solicitud (operador)
 */
export declare const updateKaraokeRequestSchema: z.ZodObject<{
    status: z.ZodEnum<["QUEUED", "CALLED", "ON_STAGE", "COMPLETED", "NO_SHOW", "CANCELLED"]>;
}, "strip", z.ZodTypeAny, {
    status: "QUEUED" | "CALLED" | "ON_STAGE" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
}, {
    status: "QUEUED" | "CALLED" | "ON_STAGE" | "COMPLETED" | "NO_SHOW" | "CANCELLED";
}>;
export type UpdateKaraokeRequestInput = z.infer<typeof updateKaraokeRequestSchema>;
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
export declare const karaokeyaConfigSchema: z.ZodObject<{
    enabled: z.ZodOptional<z.ZodBoolean>;
    cooldownSeconds: z.ZodOptional<z.ZodNumber>;
    maxPerPerson: z.ZodOptional<z.ZodNumber>;
    showQueueToClient: z.ZodOptional<z.ZodBoolean>;
    showNextSinger: z.ZodOptional<z.ZodBoolean>;
    suggestionsEnabled: z.ZodOptional<z.ZodBoolean>;
    suggestionsCount: z.ZodOptional<z.ZodNumber>;
    allowedLanguages: z.ZodOptional<z.ZodString>;
    youtubeSearchKeywords: z.ZodOptional<z.ZodString>;
    customMessages: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    displayMode: z.ZodOptional<z.ZodEnum<["QUEUE", "BREAK", "START", "PROMO"]>>;
    displayLayout: z.ZodOptional<z.ZodEnum<["VERTICAL", "HORIZONTAL"]>>;
    displayBreakMessage: z.ZodOptional<z.ZodString>;
    displayStartMessage: z.ZodOptional<z.ZodString>;
    displayPromoImageUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    enabled?: boolean | undefined;
    cooldownSeconds?: number | undefined;
    showQueueToClient?: boolean | undefined;
    customMessages?: string | null | undefined;
    maxPerPerson?: number | undefined;
    showNextSinger?: boolean | undefined;
    suggestionsEnabled?: boolean | undefined;
    suggestionsCount?: number | undefined;
    allowedLanguages?: string | undefined;
    youtubeSearchKeywords?: string | undefined;
    displayMode?: "QUEUE" | "BREAK" | "START" | "PROMO" | undefined;
    displayLayout?: "VERTICAL" | "HORIZONTAL" | undefined;
    displayBreakMessage?: string | undefined;
    displayStartMessage?: string | undefined;
    displayPromoImageUrl?: string | null | undefined;
}, {
    enabled?: boolean | undefined;
    cooldownSeconds?: number | undefined;
    showQueueToClient?: boolean | undefined;
    customMessages?: string | null | undefined;
    maxPerPerson?: number | undefined;
    showNextSinger?: boolean | undefined;
    suggestionsEnabled?: boolean | undefined;
    suggestionsCount?: number | undefined;
    allowedLanguages?: string | undefined;
    youtubeSearchKeywords?: string | undefined;
    displayMode?: "QUEUE" | "BREAK" | "START" | "PROMO" | undefined;
    displayLayout?: "VERTICAL" | "HORIZONTAL" | undefined;
    displayBreakMessage?: string | undefined;
    displayStartMessage?: string | undefined;
    displayPromoImageUrl?: string | null | undefined;
}>;
export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>;
export declare const listRequestsQuerySchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<["QUEUED", "CALLED", "ON_STAGE", "COMPLETED", "NO_SHOW", "CANCELLED"]>>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    status?: "QUEUED" | "CALLED" | "ON_STAGE" | "COMPLETED" | "NO_SHOW" | "CANCELLED" | undefined;
}, {
    status?: "QUEUED" | "CALLED" | "ON_STAGE" | "COMPLETED" | "NO_SHOW" | "CANCELLED" | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
}>;
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>;
export declare const searchQuerySchema: z.ZodObject<{
    q: z.ZodString;
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    q: string;
}, {
    q: string;
    limit?: number | undefined;
}>;
export type SearchQuery = z.infer<typeof searchQuerySchema>;
export declare const popularSongsQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
}, {
    limit?: number | undefined;
}>;
export type PopularSongsQuery = z.infer<typeof popularSongsQuerySchema>;
/**
 * Enum de dificultad vocal
 */
export declare const difficultySchema: z.ZodEnum<["FACIL", "MEDIO", "DIFICIL", "PAVAROTTI"]>;
export type Difficulty = z.infer<typeof difficultySchema>;
/**
 * Schema para crear una canción en el catálogo
 */
export declare const createKaraokeSongSchema: z.ZodObject<{
    title: z.ZodString;
    artist: z.ZodString;
    youtubeId: z.ZodString;
    youtubeShareUrl: z.ZodOptional<z.ZodString>;
    thumbnailUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    duration: z.ZodNullable<z.ZodOptional<z.ZodNumber>>;
    language: z.ZodDefault<z.ZodEnum<["ES", "EN", "PT"]>>;
    difficulty: z.ZodDefault<z.ZodEnum<["FACIL", "MEDIO", "DIFICIL", "PAVAROTTI"]>>;
    ranking: z.ZodDefault<z.ZodNumber>;
    opinion: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    source: z.ZodDefault<z.ZodString>;
    moods: z.ZodDefault<z.ZodString>;
    tags: z.ZodDefault<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    title: string;
    artist: string;
    youtubeId: string;
    source: string;
    language: "ES" | "EN" | "PT";
    difficulty: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI";
    ranking: number;
    moods: string;
    tags: string;
    youtubeShareUrl?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    duration?: number | null | undefined;
    opinion?: string | null | undefined;
}, {
    title: string;
    artist: string;
    youtubeId: string;
    youtubeShareUrl?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    duration?: number | null | undefined;
    source?: string | undefined;
    language?: "ES" | "EN" | "PT" | undefined;
    difficulty?: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI" | undefined;
    ranking?: number | undefined;
    opinion?: string | null | undefined;
    moods?: string | undefined;
    tags?: string | undefined;
}>;
export type CreateKaraokeSongInput = z.infer<typeof createKaraokeSongSchema>;
/**
 * Schema para actualizar una canción del catálogo
 */
export declare const updateKaraokeSongSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    artist: z.ZodOptional<z.ZodString>;
    youtubeId: z.ZodOptional<z.ZodString>;
    youtubeShareUrl: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    thumbnailUrl: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    duration: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodNumber>>>;
    language: z.ZodOptional<z.ZodDefault<z.ZodEnum<["ES", "EN", "PT"]>>>;
    difficulty: z.ZodOptional<z.ZodDefault<z.ZodEnum<["FACIL", "MEDIO", "DIFICIL", "PAVAROTTI"]>>>;
    ranking: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    opinion: z.ZodOptional<z.ZodNullable<z.ZodOptional<z.ZodString>>>;
    source: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    moods: z.ZodOptional<z.ZodDefault<z.ZodString>>;
    tags: z.ZodOptional<z.ZodDefault<z.ZodString>>;
}, "strip", z.ZodTypeAny, {
    title?: string | undefined;
    artist?: string | undefined;
    youtubeId?: string | undefined;
    youtubeShareUrl?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    duration?: number | null | undefined;
    source?: string | undefined;
    language?: "ES" | "EN" | "PT" | undefined;
    difficulty?: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI" | undefined;
    ranking?: number | undefined;
    opinion?: string | null | undefined;
    moods?: string | undefined;
    tags?: string | undefined;
}, {
    title?: string | undefined;
    artist?: string | undefined;
    youtubeId?: string | undefined;
    youtubeShareUrl?: string | undefined;
    thumbnailUrl?: string | null | undefined;
    duration?: number | null | undefined;
    source?: string | undefined;
    language?: "ES" | "EN" | "PT" | undefined;
    difficulty?: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI" | undefined;
    ranking?: number | undefined;
    opinion?: string | null | undefined;
    moods?: string | undefined;
    tags?: string | undefined;
}>;
export type UpdateKaraokeSongInput = z.infer<typeof updateKaraokeSongSchema>;
/**
 * Schema para listar canciones con filtros
 */
export declare const listSongsQuerySchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
    difficulty: z.ZodOptional<z.ZodEnum<["FACIL", "MEDIO", "DIFICIL", "PAVAROTTI"]>>;
    minRanking: z.ZodOptional<z.ZodNumber>;
    language: z.ZodOptional<z.ZodEnum<["ES", "EN", "PT"]>>;
    sortBy: z.ZodDefault<z.ZodEnum<["title", "ranking", "likesCount", "timesRequested", "createdAt"]>>;
    sortOrder: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
    includeInactive: z.ZodDefault<z.ZodBoolean>;
    limit: z.ZodDefault<z.ZodNumber>;
    offset: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    limit: number;
    offset: number;
    includeInactive: boolean;
    sortBy: "createdAt" | "title" | "ranking" | "timesRequested" | "likesCount";
    sortOrder: "asc" | "desc";
    language?: "ES" | "EN" | "PT" | undefined;
    difficulty?: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI" | undefined;
    search?: string | undefined;
    minRanking?: number | undefined;
}, {
    language?: "ES" | "EN" | "PT" | undefined;
    difficulty?: "FACIL" | "MEDIO" | "DIFICIL" | "PAVAROTTI" | undefined;
    search?: string | undefined;
    limit?: number | undefined;
    offset?: number | undefined;
    includeInactive?: boolean | undefined;
    minRanking?: number | undefined;
    sortBy?: "createdAt" | "title" | "ranking" | "timesRequested" | "likesCount" | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export type ListSongsQuery = z.infer<typeof listSongsQuerySchema>;
/**
 * Schema para toggle de like
 */
export declare const toggleLikeSchema: z.ZodObject<{
    songId: z.ZodString;
    guestId: z.ZodString;
}, "strip", z.ZodTypeAny, {
    guestId: string;
    songId: string;
}, {
    guestId: string;
    songId: string;
}>;
export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>;
//# sourceMappingURL=karaokeya.types.d.ts.map