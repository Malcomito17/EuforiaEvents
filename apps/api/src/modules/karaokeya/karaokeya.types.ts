import { z } from 'zod'

// Status type
export type KaraokeRequestStatus = 
  | 'QUEUED' 
  | 'CALLED' 
  | 'ON_STAGE' 
  | 'COMPLETED' 
  | 'NO_SHOW' 
  | 'CANCELLED'

// Schemas
export const createKaraokeRequestSchema = z.object({
  guestId: z.string().min(1, 'Guest ID requerido'),
  title: z.string().min(1, 'Título requerido'),
  artist: z.string().optional(),
})

export const karaokeyaConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).optional(),
  maxPerPerson: z.number().int().min(0).optional(),
  showQueueToClient: z.boolean().optional(),
  showNextSinger: z.boolean().optional(),
})

export const listKaraokeRequestsQuerySchema = z.object({
  status: z.enum(['QUEUED', 'CALLED', 'ON_STAGE', 'COMPLETED', 'NO_SHOW', 'CANCELLED']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>
export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>
export type ListKaraokeRequestsQuery = z.infer<typeof listKaraokeRequestsQuerySchema>

// Response types
export interface KaraokeRequestResponse {
  id: string
  eventId: string
  guestId: string
  guest?: {
    id: string
    displayName: string
    email: string
  }
  title: string
  artist: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: Date
  calledAt: Date | null
}

export interface KaraokeyaConfigResponse {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  showNextSinger: boolean
}

export interface KaraokeQueueStats {
  total: number
  queued: number
  called: number
  onStage: number
  completed: number
  noShow: number
  cancelled: number
  nextTurnNumber: number
  estimatedWaitMinutes: number | null
}

export class KaraokeyaError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'KaraokeyaError'
  }
}
