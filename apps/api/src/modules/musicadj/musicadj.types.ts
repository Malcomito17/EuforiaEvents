/**
 * MUSICADJ - Zod Schemas & Types (v1.3)
 * Actualizado para usar Guest model
 */

import { z } from 'zod'

// ============================================
// Song Request Schemas
// ============================================

export const songRequestStatusSchema = z.enum([
  'PENDING',
  'HIGHLIGHTED',
  'URGENT',
  'PLAYED',
  'DISCARDED'
])

export type SongRequestStatus = z.infer<typeof songRequestStatusSchema>

/**
 * Schema para crear una solicitud de canción (desde cliente público)
 * v1.3: Usa guestId en lugar de requesterName/Email
 */
export const createSongRequestSchema = z.object({
  // Guest que hace el pedido
  guestId: z.string().cuid('Guest ID inválido'),

  // Datos de la canción
  spotifyId: z.string().optional().nullable(),
  title: z.string().min(1, 'Título requerido').max(200),
  artist: z.string().min(1, 'Artista requerido').max(200),
  albumArtUrl: z.string().url().optional().nullable(),
})

export type CreateSongRequestInput = z.infer<typeof createSongRequestSchema>

/**
 * Schema para actualizar solicitud (operador)
 */
export const updateSongRequestSchema = z.object({
  status: songRequestStatusSchema.optional(),
  priority: z.number().int().min(0).max(999).optional(),
})

export type UpdateSongRequestInput = z.infer<typeof updateSongRequestSchema>

/**
 * Schema para bulk update (múltiples solicitudes)
 */
export const bulkUpdateRequestsSchema = z.object({
  requestIds: z.array(z.string().cuid()),
  status: songRequestStatusSchema.optional(),
  priority: z.number().int().min(0).max(999).optional(),
})

export type BulkUpdateRequestsInput = z.infer<typeof bulkUpdateRequestsSchema>

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

export const musicadjConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).max(3600).optional(),
  allowWithoutSpotify: z.boolean().optional(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  showQueueToClient: z.boolean().optional(),
})

export type MusicadjConfigInput = z.infer<typeof musicadjConfigSchema>

// ============================================
// Query Schemas
// ============================================

export const listRequestsQuerySchema = z.object({
  status: songRequestStatusSchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>

// ============================================
// Spotify Schemas
// ============================================

export const spotifySearchSchema = z.object({
  query: z.string().min(1, 'Query requerido').max(200),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

export type SpotifySearchInput = z.infer<typeof spotifySearchSchema>
