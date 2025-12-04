/**
 * EUFORIA EVENTS - Clients Service
 * Lógica de negocio para gestión de clientes/contratantes
 */

import { z } from 'zod'
import prisma from '../../config/database'

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

export const createClientSchema = z.object({
  name: z.string().min(2, 'Nombre debe tener al menos 2 caracteres').max(100),
  company: z.string().max(100).optional().nullable(),
  phone: z.string().max(50).optional().nullable(),
  email: z.string().email('Email inválido').optional().nullable(),
  cuit: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})

export const updateClientSchema = createClientSchema.partial()

export const clientFiltersSchema = z.object({
  search: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateClientInput = z.infer<typeof createClientSchema>
export type UpdateClientInput = z.infer<typeof updateClientSchema>
export type ClientFilters = z.infer<typeof clientFiltersSchema>

// ============================================
// ERROR PERSONALIZADO
// ============================================

export class ClientError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'ClientError'
  }
}

// ============================================
// SERVICIO
// ============================================

class ClientService {
  /**
   * Crea un nuevo cliente
   */
  async create(input: CreateClientInput) {
    const data = createClientSchema.parse(input)

    // Verificar email único si se proporciona
    if (data.email) {
      const existing = await prisma.client.findFirst({
        where: { email: data.email, isActive: true },
      })
      if (existing) {
        throw new ClientError('Ya existe un cliente con ese email', 409)
      }
    }

    // Verificar CUIT único si se proporciona
    if (data.cuit) {
      const existing = await prisma.client.findFirst({
        where: { cuit: data.cuit, isActive: true },
      })
      if (existing) {
        throw new ClientError('Ya existe un cliente con ese CUIT', 409)
      }
    }

    const client = await prisma.client.create({
      data,
    })

    console.log(`[CLIENTS] Cliente creado: ${client.id} (${client.name})`)

    return client
  }

  /**
   * Obtiene un cliente por ID
   */
  async findById(id: string) {
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        _count: {
          select: { events: true },
        },
      },
    })

    if (!client) {
      throw new ClientError('Cliente no encontrado', 404)
    }

    return client
  }

  /**
   * Lista clientes con filtros
   */
  async findAll(filters: ClientFilters) {
    const { search, includeInactive, limit, offset } =
      clientFiltersSchema.parse(filters)

    const where: any = {}

    // Por defecto solo activos
    if (!includeInactive) {
      where.isActive = true
    }

    // Búsqueda en nombre, empresa o email
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { company: { contains: search } },
        { email: { contains: search } },
      ]
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
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
      prisma.client.count({ where }),
    ])

    return {
      clients,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + clients.length < total,
      },
    }
  }

  /**
   * Actualiza un cliente
   */
  async update(id: string, input: UpdateClientInput) {
    const data = updateClientSchema.parse(input)

    // Verificar que existe
    const existing = await this.findById(id)

    // Verificar email único si se cambia
    if (data.email && data.email !== existing.email) {
      const emailExists = await prisma.client.findFirst({
        where: { email: data.email, isActive: true, id: { not: id } },
      })
      if (emailExists) {
        throw new ClientError('Ya existe un cliente con ese email', 409)
      }
    }

    // Verificar CUIT único si se cambia
    if (data.cuit && data.cuit !== existing.cuit) {
      const cuitExists = await prisma.client.findFirst({
        where: { cuit: data.cuit, isActive: true, id: { not: id } },
      })
      if (cuitExists) {
        throw new ClientError('Ya existe un cliente con ese CUIT', 409)
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data,
    })

    console.log(`[CLIENTS] Cliente actualizado: ${client.id}`)

    return client
  }

  /**
   * Desactiva un cliente (soft delete)
   */
  async delete(id: string) {
    await this.findById(id)

    // Verificar si tiene eventos activos
    const activeEvents = await prisma.event.count({
      where: {
        clientId: id,
        status: { in: ['DRAFT', 'ACTIVE', 'PAUSED'] },
      },
    })

    if (activeEvents > 0) {
      throw new ClientError(
        `No se puede desactivar: tiene ${activeEvents} evento(s) activo(s)`,
        400
      )
    }

    await prisma.client.update({
      where: { id },
      data: { isActive: false },
    })

    console.log(`[CLIENTS] Cliente desactivado: ${id}`)

    return { message: 'Cliente desactivado correctamente' }
  }

  /**
   * Reactiva un cliente
   */
  async reactivate(id: string) {
    const client = await prisma.client.findUnique({ where: { id } })

    if (!client) {
      throw new ClientError('Cliente no encontrado', 404)
    }

    if (client.isActive) {
      throw new ClientError('El cliente ya está activo', 400)
    }

    await prisma.client.update({
      where: { id },
      data: { isActive: true },
    })

    console.log(`[CLIENTS] Cliente reactivado: ${id}`)

    return { message: 'Cliente reactivado correctamente' }
  }
}

export const clientService = new ClientService()
