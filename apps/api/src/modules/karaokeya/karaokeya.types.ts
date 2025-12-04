/**
 * KARAOKEYA Types & Schemas
 * Definiciones de tipos y validación Zod para el módulo
 */

import { z } from 'zod'
import { KaraokeRequestStatus } from '@prisma/client'

// ============================================
// ZOD SCHEMAS - Validación de entrada
// ============================================

export const createKaraokeRequestSchema = z.object({
  title: z.string().min(1, 'El título es requerido').max(200),
  artist: z.string().max(200).optional(),
  singerName: z.string().min(1, 'El nombre es requerido').max(100),
  singerLastname: z.string().max(100).optional(),
  singerEmail: z.string().email('Email inválido').optional(),
  singerWhatsapp: z.string().max(20).optional(),
})

export const updateKaraokeRequestStatusSchema = z.object({
  status: z.enum(['QUEUED', 'CALLED', 'ON_STAGE', 'COMPLETED', 'NO_SHOW', 'CANCELLED']),
})

export const reorderQueueSchema = z.object({
  newPosition: z.number().int().positive('La posición debe ser positiva'),
})

export const batchReorderSchema = z.object({
  orderedIds: z.array(z.string()).min(1, 'Se requiere al menos un ID'),
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

// ============================================
// TIPOS DERIVADOS DE SCHEMAS
// ============================================

export type CreateKaraokeRequestInput = z.infer<typeof createKaraokeRequestSchema>
export type UpdateKaraokeRequestStatusInput = z.infer<typeof updateKaraokeRequestStatusSchema>
export type ReorderQueueInput = z.infer<typeof reorderQueueSchema>
export type BatchReorderInput = z.infer<typeof batchReorderSchema>
export type KaraokeyaConfigInput = z.infer<typeof karaokeyaConfigSchema>
export type ListKaraokeRequestsQuery = z.infer<typeof listKaraokeRequestsQuerySchema>

// ============================================
// INTERFACES DE RESPUESTA
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
// ERROR PERSONALIZADO
// ============================================

export class KaraokeyaError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code: string = 'KARAOKEYA_ERROR'
  ) {
    super(message)
    this.name = 'KaraokeyaError'
  }
}
