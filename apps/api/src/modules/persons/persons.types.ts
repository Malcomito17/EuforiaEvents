import { z } from 'zod'

// Schema de validación para crear persona
export const personCreateSchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50),
  apellido: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50),
  email: z.string().email('Email inválido').optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  dietaryRestrictions: z.array(z.string()).optional().default([]),
})

// Schema de validación para actualizar persona
export const personUpdateSchema = personCreateSchema.partial()

export type PersonCreateInput = z.infer<typeof personCreateSchema>
export type PersonUpdateInput = z.infer<typeof personUpdateSchema>

// Tipo de respuesta
export interface PersonResponse {
  id: string
  nombre: string
  apellido: string
  email?: string | null
  phone?: string | null
  company?: string | null
  dietaryRestrictions: string[]
  identityHash: string
  createdAt: Date
  updatedAt: Date
  createdBy?: string | null
  participantId?: string | null
}
