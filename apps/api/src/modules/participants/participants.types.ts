import { z } from 'zod'

// Schema de validación para identificación de participant
export const participantIdentifySchema = z.object({
  email: z.string().email('Email inválido'),
  displayName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  whatsapp: z.string().optional(),
})

export type ParticipantIdentifyInput = z.infer<typeof participantIdentifySchema>

// Tipo de respuesta (sin campos sensibles)
export interface ParticipantResponse {
  id: string
  email: string
  displayName: string
  whatsapp?: string | null
  createdAt: Date
}
