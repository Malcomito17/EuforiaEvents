import { z } from 'zod'

// Schema para agregar plato al menú del evento
export const addDishToMenuSchema = z.object({
  dishId: z.string().cuid(),
  categoryId: z.string().cuid().optional(), // Si no se envía, se usará la categoría "PRINCIPAL" por defecto
  isDefault: z.boolean().optional().default(false),
  orden: z.number().int().min(0).optional().default(0),
})

// Schema para crear categoría custom
export const createCategorySchema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido').max(100),
  orden: z.number().int().min(0).optional().default(0),
})

// Schema para asignar plato a invitado
export const assignDishToGuestSchema = z.object({
  eventGuestId: z.string().cuid(),
  eventDishId: z.string().cuid(),
})

// Schema para asignación automática
export const autoAssignDishesSchema = z.object({
  overwrite: z.boolean().optional().default(false), // Si true, reemplaza asignaciones existentes
})

// Tipos inferidos
export type AddDishToMenuInput = z.infer<typeof addDishToMenuSchema>
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type AssignDishToGuestInput = z.infer<typeof assignDishToGuestSchema>
export type AutoAssignDishesInput = z.infer<typeof autoAssignDishesSchema>

// Response types
export interface EventDishResponse {
  id: string
  eventId: string
  dishId: string
  categoryId: string
  isDefault: boolean
  orden: number
  createdAt: string
  dish: {
    id: string
    nombre: string
    descripcion: string | null
    dietaryInfo: string[]
    isActive: boolean
  }
  category: {
    id: string
    nombre: string
    orden: number
    isSystemDefault: boolean
  }
  _count?: {
    guestDishes: number
  }
}

export interface DishCategoryResponse {
  id: string
  eventId: string | null
  nombre: string
  orden: number
  isSystemDefault: boolean
  createdAt: string
  _count?: {
    eventDishes: number
  }
}

export interface MenuResponse {
  categories: Array<{
    category: DishCategoryResponse
    dishes: EventDishResponse[]
  }>
  totalDishes: number
  totalCategories: number
}

export interface GuestDishResponse {
  id: string
  eventGuestId: string
  eventDishId: string
  assignedAt: string
  assignedBy: string | null
  eventDish: EventDishResponse
}

export interface GuestMenuResponse {
  eventGuestId: string
  guestName: string
  dishes: GuestDishResponse[]
  totalDishes: number
}

export interface MenuAlert {
  type: 'MISSING_COMPATIBLE_DISH' | 'NO_DISH_ASSIGNED' | 'INCOMPATIBLE_DISH'
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  eventGuestId: string
  guestName: string
  restriction: string
  message: string
  suggestedDishes?: string[] // IDs de platos compatibles
}

export interface MenuAlertsResponse {
  alerts: MenuAlert[]
  totalAlerts: number
  highSeverity: number
  mediumSeverity: number
  lowSeverity: number
  guestsWithIssues: number
}

export interface AutoAssignResultResponse {
  success: boolean
  assigned: number
  skipped: number
  errors: string[]
  assignments: GuestDishResponse[]
}
