import { z } from 'zod'

// Tipos de información dietaria
export const DietaryInfoEnum = z.enum([
  'VEGANO',
  'VEGETARIANO',
  'SIN_GLUTEN',
  'SIN_LACTOSA',
  'SIN_FRUTOS_SECOS',
  'HALAL',
  'KOSHER',
  'SIN_AZUCAR',
  'BAJO_SODIO',
])

export type DietaryInfo = z.infer<typeof DietaryInfoEnum>

// Schema para crear plato
export const dishCreateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200),
  descripcion: z.string().optional().nullable(),
  dietaryInfo: z.array(DietaryInfoEnum).optional().default([]),
})

// Schema para actualizar plato
export const dishUpdateSchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(200).optional(),
  descripcion: z.string().optional().nullable(),
  dietaryInfo: z.array(DietaryInfoEnum).optional(),
  isActive: z.boolean().optional(),
})

// Tipos inferidos
export type DishCreateInput = z.infer<typeof dishCreateSchema>
export type DishUpdateInput = z.infer<typeof dishUpdateSchema>

// Response types
export interface DishResponse {
  id: string
  nombre: string
  descripcion: string | null
  dietaryInfo: DietaryInfo[]
  isActive: boolean
  createdAt: string
  updatedAt: string
  createdBy: string | null
  // Contadores opcionales
  _count?: {
    eventDishes: number
  }
}

export interface DishListResponse {
  dishes: DishResponse[]
  total: number
  activeCount: number
  inactiveCount: number
}
