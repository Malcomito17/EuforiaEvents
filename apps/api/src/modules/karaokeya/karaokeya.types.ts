import { z } from 'zod'
import { KaraokeRequestStatus } from '@prisma/client'

// ============================================
// Schemas de Validación - KARAOKEYA
// ============================================

export const createKaraokeRequestSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200),
  artist: z.string().max(200).optional(),
  singerName: z.string().min(1, 'Nombre requerido').max(100),
  singerLastname: z.string().max(100).optional(),
  singerEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  singerWhatsapp: z.string().max(20).optional(),
})

export const updateKaraokeRequestStatusSchema = z.object({
  status: z.nativeEnum(KaraokeRequestStatus),
})

export const reorderQueueSchema = z.object({
  requestId: z.string().cuid(),
  newPosition: z.number().int().positive(),
})

export const batchReorderSchema = z.object({
  orderedIds: z.array(z.string().cuid()).min(1),
})

export const karaokeyaConfigSchema = z.object({
  enabled: z.boolean().optional(),
  cooldownSeconds: z.number().int().min(0).max(3600).optional(),
  maxPerPerson: z.number().int().min(0).max(10).optional(),
  showQueueToClient: z.boolean().optional(),
  showNextSinger: z.boolean().optional(),
})

export const listKaraokeRequestsQuerySchema = z.object({
  status: z.nativeEnum(KaraokeRequestStatus).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
})

// ============================================
// Types Inferidos
// ============================================

export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>
export type UpdateKaraokeRequestStatusInput = z.infer<typeof updateKaraokeRequestStatusSchema>
export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>
export type BatchReorderInput = z.infer<typeof batchReorderSchema>
export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>
export type ListKaraokeRequestsQuery = z.infer<typeof listKaraokeRequestsQuerySchema>

// ============================================
// Interfaces de Respuesta
// ============================================

export interface KaraokeRequestResponse {
  id: string
  eventId: string
  title: string
  artist: string | null
  singerName: string
  singerLastname: string | null
  singerEmail: string | null
  singerWhatsapp: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: Date
  calledAt: Date | null
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

export interface KaraokeyaConfigResponse {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  showNextSinger: boolean
}

// ============================================
// Errores Personalizados
// ============================================

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
