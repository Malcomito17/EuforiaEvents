import { z } from 'zod'

// Schemas de validación
export const identifyGuestSchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().min(2, 'Nombre muy corto').max(50),
  whatsapp: z.string().optional(),
})

export type IdentifyGuestInput = z.infer<typeof identifyGuestSchema>

// Response types
export interface GuestResponse {
  id: string
  email: string
  displayName: string
  whatsapp: string | null
  createdAt: Date
  lastSeenAt: Date
}

export interface GuestRequestsResponse {
  songRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string
    status: string
    createdAt: Date
  }>
  karaokeRequests: Array<{
    id: string
    eventId: string
    title: string
    artist: string | null
    turnNumber: number
    status: string
    createdAt: Date
  }>
}

export class GuestError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string
  ) {
    super(message)
    this.name = 'GuestError'
  }
}
