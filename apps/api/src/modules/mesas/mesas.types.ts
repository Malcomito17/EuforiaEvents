import { z } from 'zod'

// Formas de mesa
export const FormaEnum = z.enum(['REDONDA', 'CUADRADA', 'RECTANGULAR', 'OVALADA', 'HERRADURA'])
export type Forma = z.infer<typeof FormaEnum>

// Schema para crear mesa
export const mesaCreateSchema = z.object({
  numero: z.string().min(1, 'El número de mesa es requerido').max(50),
  capacidad: z.number().int().min(1, 'La capacidad debe ser al menos 1').max(100),
  forma: FormaEnum.optional().default('REDONDA'),
  sector: z.string().optional().nullable(),
  posX: z.number().optional().nullable(),
  posY: z.number().optional().nullable(),
  rotation: z.number().min(0).max(360).optional().default(0),
  observaciones: z.string().optional().nullable(),
})

// Schema para actualizar mesa
export const mesaUpdateSchema = z.object({
  numero: z.string().min(1).max(50).optional(),
  capacidad: z.number().int().min(1).max(100).optional(),
  forma: FormaEnum.optional(),
  sector: z.string().optional().nullable(),
  posX: z.number().optional().nullable(),
  posY: z.number().optional().nullable(),
  rotation: z.number().min(0).max(360).optional(),
  observaciones: z.string().optional().nullable(),
})

// Schema para auto-asignación
export const autoAssignMesasSchema = z.object({
  strategy: z.enum(['FILL_FIRST', 'DISTRIBUTE']).optional().default('FILL_FIRST'),
  // FILL_FIRST: Llena cada mesa completamente antes de pasar a la siguiente
  // DISTRIBUTE: Distribuye invitados uniformemente entre todas las mesas
})

// Tipos inferidos
export type MesaCreateInput = z.infer<typeof mesaCreateSchema>
export type MesaUpdateInput = z.infer<typeof mesaUpdateSchema>
export type AutoAssignMesasInput = z.infer<typeof autoAssignMesasSchema>

// Response types
export interface MesaResponse {
  id: string
  eventId: string
  numero: string
  capacidad: number
  forma: Forma
  sector: string | null
  posX: number | null
  posY: number | null
  rotation: number
  observaciones: string | null
  createdAt: string
  updatedAt: string
  createdBy: string | null
  // Contador de invitados asignados
  _count?: {
    invitados: number
  }
  // Invitados asignados (opcional)
  invitados?: Array<{
    id: string
    personId: string
    estadoIngreso: string
    person: {
      nombre: string
      apellido: string
    }
  }>
}

export interface MesaListResponse {
  mesas: MesaResponse[]
  total: number
  ocupadas: number // Mesas con al menos un invitado
  disponibles: number // Mesas sin invitados
  capacidadTotal: number
  invitadosAsignados: number
  invitadosSinMesa: number
}

export interface AutoAssignResultResponse {
  success: boolean
  assigned: number
  skipped: number
  errors: string[]
  mesasUpdated: string[] // IDs de mesas que recibieron nuevos invitados
}
