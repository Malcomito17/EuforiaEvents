import { z } from 'zod'

// Estados de ingreso
export const EstadoIngresoEnum = z.enum(['PENDIENTE', 'INGRESADO', 'NO_ASISTIO'])
export type EstadoIngreso = z.infer<typeof EstadoIngresoEnum>

// Tipos de accesibilidad
export const AccesibilidadEnum = z.enum(['NINGUNA', 'MOVILIDAD_REDUCIDA', 'VISUAL', 'AUDITIVA', 'OTRA'])
export type Accesibilidad = z.infer<typeof AccesibilidadEnum>

// Schema para agregar invitado a evento
export const eventGuestCreateSchema = z.object({
  personId: z.string().cuid(),
  mesaId: z.string().cuid().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  accesibilidad: AccesibilidadEnum.optional().default('NINGUNA'),
})

// Schema para actualizar invitado
export const eventGuestUpdateSchema = z.object({
  mesaId: z.string().cuid().optional().nullable(),
  estadoIngreso: EstadoIngresoEnum.optional(),
  observaciones: z.string().optional().nullable(),
  accesibilidad: AccesibilidadEnum.optional(),
})

// Schema para check-in
export const checkInSchema = z.object({
  eventGuestId: z.string().cuid(),
})

// Schema para check-out
export const checkOutSchema = z.object({
  eventGuestId: z.string().cuid(),
})

// Schema para un guest en CSV
export const csvGuestSchema = z.object({
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  mesaNumero: z.string().optional(),
  dietaryRestrictions: z.array(z.string()).optional().default([]),
  observaciones: z.string().optional(),
  accesibilidad: AccesibilidadEnum.optional().default('NINGUNA'),
})

// Schema para importación CSV
export const importCSVSchema = z.object({
  guests: z.array(csvGuestSchema).min(1, 'Debe incluir al menos un invitado'),
})

// Tipos inferidos
export type EventGuestCreateInput = z.infer<typeof eventGuestCreateSchema>
export type EventGuestUpdateInput = z.infer<typeof eventGuestUpdateSchema>
export type CSVGuestInput = z.infer<typeof csvGuestSchema>
export type ImportCSVInput = z.infer<typeof importCSVSchema>

// Response types
export interface EventGuestResponse {
  id: string
  eventId: string
  personId: string
  mesaId: string | null
  estadoIngreso: EstadoIngreso
  checkedInAt: string | null
  checkedInBy: string | null
  checkedOutAt: string | null
  checkedOutBy: string | null
  observaciones: string | null
  accesibilidad: Accesibilidad | null
  createdAt: string
  updatedAt: string
  addedBy: string | null
  person?: {
    id: string
    nombre: string
    apellido: string
    email: string | null
    phone: string | null
    company: string | null
    dietaryRestrictions: string[]
  }
  mesa?: {
    id: string
    numero: string
    capacidad: number
    forma: string
  }
  assignedDishes?: {
    id: string
    eventDishId: string
    dish?: {
      id: string
      nombre: string
      categoria: string
    }
  }[]
}

export interface GuestlistStatsResponse {
  total: number
  ingresados: number
  pendientes: number
  noAsistieron: number
  porcentajeAsistencia: number
  conMesaAsignada: number
  sinMesaAsignada: number
}

export interface ImportResultResponse {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  guests: EventGuestResponse[]
}
