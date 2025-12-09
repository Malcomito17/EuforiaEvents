import { z } from 'zod'

// Schema de validación para identificación de guest
export const guestIdentifySchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  whatsapp: z.string().optional(),
})

export type GuestIdentifyInput = z.infer<typeof guestIdentifySchema>

// Tipo de respuesta (sin campos sensibles)
export interface GuestResponse {
  id: string
  email: string
  displayName: string
  whatsapp?: string | null
  createdAt: Date
}
