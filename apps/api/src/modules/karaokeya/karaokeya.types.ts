/**
 * KARAOKEYA - Zod Schemas & Types (v1.4)
 * Esquemas de validación para módulo de karaoke
 */

import { z } from 'zod'

// ============================================
// Karaoke Request Schemas
// ============================================

export const karaokeRequestStatusSchema = z.enum([
  'QUEUED',
  'CALLED',
  'ON_STAGE',
  'COMPLETED',
  'NO_SHOW',
  'CANCELLED'
])

export type KaraokeRequestStatus = z.infer<typeof karaokeRequestStatusSchema>

/**
 * Schema para crear una solicitud de karaoke (desde cliente público)
 */
export const createKaraokeRequestSchema = z.object({
  // Guest que hace el pedido
  guestId: z.string().cuid('Guest ID inválido'),

  // Datos de la canción
  songId: z.string().cuid().optional(), // Si viene del catálogo
  youtubeId: z.string().optional(), // Si viene de búsqueda directa
  title: z.string().min(1, 'Título requerido').max(200),
  artist: z.string().max(200).optional(),
})

export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>

/**
 * Schema para actualizar solicitud (operador)
 */
export const updateKaraokeRequestSchema = z.object({
  status: karaokeRequestStatusSchema,
})

export type UpdateKaraokeRequestInput = z.infer<typeof updateKaraokeRequestSchema>

/**
 * Schema para reordenar cola
 */
export const reorderQueueSchema = z.object({
  requestIds: z.array(z.string().cuid()),
})

export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>

// ============================================
// Config Schemas
// ============================================

export const karaokeyaConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).max(3600).optional(),
  maxPerPerson: z.number().int().min(0).max(20).optional(),
  showQueueToClient: z.boolean().optional(),
  showNextSinger: z.boolean().optional(),
  suggestionsEnabled: z.boolean().optional(),
  suggestionsCount: z.number().int().min(0).max(5).optional(),
  allowedLanguages: z.string().optional(), // JSON string: ["ES", "EN"]
  youtubeSearchKeywords: z.string().optional(), // JSON string: ["letra", "lyrics"]
  customMessages: z.string().optional().nullable(), // JSON string opcional
  // v2.0: Display Screen
  displayMode: z.enum(['QUEUE', 'BREAK', 'START', 'PROMO']).optional(),
  displayLayout: z.enum(['VERTICAL', 'HORIZONTAL']).optional(),
  displayBreakMessage: z.string().max(200).optional(),
  displayStartMessage: z.string().max(200).optional(),
  displayPromoImageUrl: z.string().url().optional().nullable(),
})

export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>

// ============================================
// Query Schemas
// ============================================

export const listRequestsQuerySchema = z.object({
  status: karaokeRequestStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>

export const searchQuerySchema = z.object({
  q: z.string().min(1, 'Query requerido').max(100),
  limit: z.coerce.number().int().min(1).max(20).default(5),
})

export type SearchQuery = z.infer<typeof searchQuerySchema>

export const popularSongsQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(10),
})

export type PopularSongsQuery = z.infer<typeof popularSongsQuerySchema>

// ============================================
// CATALOG CRUD - KARAOKE SONGS (v2.0)
// ============================================

/**
 * Enum de dificultad vocal
 */
export const difficultySchema = z.enum(['FACIL', 'MEDIO', 'DIFICIL', 'PAVAROTTI'])
export type Difficulty = z.infer<typeof difficultySchema>

/**
 * Schema para crear una canción en el catálogo
 */
export const createKaraokeSongSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  artist: z.string().min(1, 'Artista requerido').max(200),
  youtubeId: z.string().min(1, 'YouTube ID requerido'),
  youtubeShareUrl: z.string().url().optional(),
  thumbnailUrl: z.string().url().optional().nullable(),
  duration: z.number().int().min(0).optional().nullable(),
  language: z.enum(['ES', 'EN', 'PT']).default('ES'),
  difficulty: difficultySchema.default('MEDIO'),
  ranking: z.number().int().min(1).max(5).default(3),
  opinion: z.string().max(500).optional().nullable(),
  source: z.string().default('YOUTUBE'),
  moods: z.string().default('[]'),  // JSON array
  tags: z.string().default('[]'),   // JSON array
})

export type CreateKaraokeSongInput = z.infer<typeof createKaraokeSongSchema>

/**
 * Schema para actualizar una canción del catálogo
 */
export const updateKaraokeSongSchema = createKaraokeSongSchema.partial()

export type UpdateKaraokeSongInput = z.infer<typeof updateKaraokeSongSchema>

/**
 * Schema para listar canciones con filtros
 */
export const listSongsQuerySchema = z.object({
  search: z.string().optional(),           // Buscar en title/artist
  difficulty: difficultySchema.optional(),
  minRanking: z.coerce.number().int().min(1).max(5).optional(),
  language: z.enum(['ES', 'EN', 'PT']).optional(),
  sortBy: z.enum(['title', 'ranking', 'likesCount', 'timesRequested', 'createdAt']).default('title'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListSongsQuery = z.infer<typeof listSongsQuerySchema>

// ============================================
// LIKE SYSTEM
// ============================================

/**
 * Schema para toggle de like
 */
export const toggleLikeSchema = z.object({
  songId: z.string().cuid('Song ID inválido'),
  guestId: z.string().cuid('Guest ID inválido'),
})

export type ToggleLikeInput = z.infer<typeof toggleLikeSchema>
