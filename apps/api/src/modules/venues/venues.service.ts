/**
 * EUFORIA EVENTS - Venues Service
 * Lógica de negocio para gestión de venues (salones/lugares)
 */

import { z } from 'zod'
import prisma from '../../config/database'

// ============================================
// CONSTANTES
// ============================================

export const VENUE_TYPE = {
  SALON: 'SALON',
  HOTEL: 'HOTEL',
  QUINTA: 'QUINTA',
  RESTAURANT: 'RESTAURANT',
  BAR: 'BAR',
  PUB: 'PUB',
  DISCO: 'DISCO',
  CONFITERIA: 'CONFITERIA',
  CLUB: 'CLUB',
  OUTDOOR: 'OUTDOOR',
  OTHER: 'OTHER',
} as const

export type VenueType = (typeof VENUE_TYPE)[keyof typeof VENUE_TYPE]

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

export const createVenueSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  type: z.enum([
    VENUE_TYPE.SALON,
    VENUE_TYPE.HOTEL,
    VENUE_TYPE.QUINTA,
    VENUE_TYPE.RESTAURANT,
    VENUE_TYPE.BAR,
    VENUE_TYPE.PUB,
    VENUE_TYPE.DISCO,
    VENUE_TYPE.CONFITERIA,
    VENUE_TYPE.CLUB,
    VENUE_TYPE.OUTDOOR,
    VENUE_TYPE.OTHER,
  ]).default(VENUE_TYPE.OTHER),
  address: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  capacity: z.number().int().positive().optional().nullable(),
  contactName: z.string().max(100).optional().nullable(),
  contactPhone: z.string().max(50).optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const updateVenueSchema = createVenueSchema.partial()

export const venueFiltersSchema = z.object({
  type: z.string().optional(),
  city: z.string().optional(),
  search: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateVenueInput = z.infer<typeof createVenueSchema>
export type UpdateVenueInput = z.infer<typeof updateVenueSchema>
export type VenueFilters = z.infer<typeof venueFiltersSchema>

// ============================================
// ERROR PERSONALIZADO
// ============================================

export class VenueError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'VenueError'
  }
}

// ============================================
// SERVICIO
// ============================================

class VenueService {
  /**
   * Crea un nuevo venue
   */
  async create(input: CreateVenueInput) {
    const data = createVenueSchema.parse(input)

    const venue = await prisma.venue.create({
      data,
    })

    console.log(`[VENUES] Venue creado: ${venue.id} (${venue.name})`)

    return venue
  }

  /**
   * Obtiene un venue por ID
   */
  async findById(id: string) {
    const venue = await prisma.venue.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })

    if (!venue) {
      throw new VenueError('Venue no encontrado', 404)
    }

    return venue
  }

  /**
   * Lista venues con filtros
   */
  async findAll(filters: VenueFilters) {
    const { type, city, search, includeInactive, limit, offset } =
      venueFiltersSchema.parse(filters)

    const where: any = {}

    // Por defecto solo activos
    if (!includeInactive) {
      where.isActive = true
    }

    if (type) where.type = type
    if (city) where.city = { contains: city }
    if (search) where.name = { contains: search }

    const [venues, total] = await Promise.all([
      prisma.venue.findMany({
        where,
        include: {
          _count: {
            select: { events: true },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.venue.count({ where }),
    ])

    return {
      venues,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + venues.length < total,
      },
    }
  }

  /**
   * Actualiza un venue
   */
  async update(id: string, input: UpdateVenueInput) {
    const data = updateVenueSchema.parse(input)

    // Verificar que existe
    await this.findById(id)

    const venue = await prisma.venue.update({
      where: { id },
      data,
    })

    console.log(`[VENUES] Venue actualizado: ${venue.id}`)

    return venue
  }

  /**
   * Desactiva un venue (soft delete)
   */
  async delete(id: string) {
    const venue = await this.findById(id)

    // Verificar si tiene eventos activos
    const activeEvents = await prisma.event.count({
      where: {
        venueId: id,
        status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] },
      },
    })

    if (activeEvents > 0) {
      throw new VenueError(
        `No se puede desactivar: tiene ${activeEvents} evento(s) activo(s)`,
        400
      )
    }

    await prisma.venue.update({
      where: { id },
      data: { isActive: false },
    })

    console.log(`[VENUES] Venue desactivado: ${id}`)

    return { message: 'Venue desactivado correctamente' }
  }

  /**
   * Reactiva un venue
   */
  async reactivate(id: string) {
    const venue = await prisma.venue.findUnique({ where: { id } })

    if (!venue) {
      throw new VenueError('Venue no encontrado', 404)
    }

    if (venue.isActive) {
      throw new VenueError('El venue ya está activo', 400)
    }

    await prisma.venue.update({
      where: { id },
      data: { isActive: true },
    })

    console.log(`[VENUES] Venue reactivado: ${id}`)

    return { message: 'Venue reactivado correctamente' }
  }
}

export const venueService = new VenueService()
