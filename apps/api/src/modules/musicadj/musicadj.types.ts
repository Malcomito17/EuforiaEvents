import { z } from 'zod'

// Status enum
export type SongRequestStatus = 
  | 'PENDING' 
  | 'HIGHLIGHTED' 
  | 'URGENT' 
  | 'PLAYED' 
  | 'DISCARDED'

// Schemas de validación
export const createSongRequestSchema = z.object({
  guestId: z.string().min(1, 'Guest ID requerido'),
  spotifyId: z.string().optional(),
  title: z.string().min(1, 'Título requerido'),
  artist: z.string().min(1, 'Artista requerido'),
  albumArtUrl: z.string().url().optional(),
})

export const updateSongRequestSchema = z.object({
  status: z.enum(['PENDING', 'HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']).optional(),
  priority: z.number().int().optional(),
})

export const listRequestsQuerySchema = z.object({
  status: z.enum(['PENDING', 'HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export const musicadjConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).optional(),
  allowWithoutSpotify: z.boolean().optional(),
  welcomeMessage: z.string().max(500).optional().nullable(),
  showQueueToClient: z.boolean().optional(),
})

export type CreateSongRequestInput = z.infer<typeof createSongRequestSchema>
export type UpdateSongRequestInput = z.infer<typeof updateSongRequestSchema>
export type ListRequestsQuery = z.infer<typeof listRequestsQuerySchema>
export type MusicadjConfigInput = z.infer<typeof musicadjConfigSchema>

// Response types
export interface SongRequestResponse {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  status: SongRequestStatus
  priority: number
  createdAt: Date
  updatedAt: Date
}

export class MusicadjError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'MusicadjError'
  }
}
