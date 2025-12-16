/**
 * EUFORIA EVENTS - Events Service
 * Lógica de negocio para gestión de eventos
 */

import { z } from 'zod'
import crypto from 'crypto'
import QRCode from 'qrcode'
import prisma from '../../config/database'
import { EVENT_STATUS, EVENT_TYPE, type EventStatus } from './events.types'

// ============================================
// SCHEMAS DE VALIDACIÓN
// ============================================

export const createEventDataSchema = z.object({
  eventName: z.string().min(3, 'Nombre del evento debe tener al menos 3 caracteres').max(100),
  eventType: z.enum([
    EVENT_TYPE.WEDDING,
    EVENT_TYPE.BIRTHDAY,
    EVENT_TYPE.QUINCEANERA,
    EVENT_TYPE.CORPORATE,
    EVENT_TYPE.GRADUATION,
    EVENT_TYPE.ANNIVERSARY,
    EVENT_TYPE.FIESTA_PRIVADA,
    EVENT_TYPE.SHOW,
    EVENT_TYPE.EVENTO_ESPECIAL,
    EVENT_TYPE.OTHER,
  ]).default(EVENT_TYPE.OTHER),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  guestCount: z.number().int().positive().optional().nullable(),
  instagramUrl: z.string().url().optional().nullable(),
  instagramUser: z.string().max(50).optional().nullable(),
  instagram: z.string().max(200).optional().nullable(),  // Nuevo: Instagram handle o URL
  facebook: z.string().max(200).optional().nullable(),   // Nuevo: Facebook URL
  twitter: z.string().max(200).optional().nullable(),    // Nuevo: Twitter/X handle o URL
  website: z.string().url().optional().nullable(),       // Nuevo: Website URL
  // Acepta tanto URLs completas como rutas relativas (ej: /uploads/events/imagen.jpg)
  eventImage: z.string().max(500).optional().nullable(),
  hashtag: z.string().max(50).optional().nullable(),
  spotifyPlaylist: z.string().url().optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
  // Colores personalizados (formato hex #RRGGBB)
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color debe ser formato hex (#RRGGBB)').optional(),
})

export const createEventSchema = z.object({
  venueId: z.string().cuid().optional().nullable(),
  clientId: z.string().cuid().optional().nullable(),
  eventData: createEventDataSchema,
})

export const updateEventSchema = z.object({
  venueId: z.string().cuid().optional().nullable(),
  clientId: z.string().cuid().optional().nullable(),
  status: z.enum([
    EVENT_STATUS.DRAFT,
    EVENT_STATUS.ACTIVE,
    EVENT_STATUS.PAUSED,
    EVENT_STATUS.FINISHED,
  ]).optional(),
})

export const updateEventDataSchema = createEventDataSchema.partial()

export const eventFiltersSchema = z.object({
  status: z.enum([
    EVENT_STATUS.DRAFT,
    EVENT_STATUS.ACTIVE,
    EVENT_STATUS.PAUSED,
    EVENT_STATUS.FINISHED,
  ]).optional(),
  eventType: z.string().optional(),
  venueId: z.string().cuid().optional(),
  clientId: z.string().cuid().optional(),
  fromDate: z.coerce.date().optional(),
  toDate: z.coerce.date().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
})

export type CreateEventInput = z.infer<typeof createEventSchema>
export type UpdateEventInput = z.infer<typeof updateEventSchema>
export type UpdateEventDataInput = z.infer<typeof updateEventDataSchema>
export type EventFilters = z.infer<typeof eventFiltersSchema>

// ============================================
// ERROR PERSONALIZADO
// ============================================

export class EventError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'EventError'
  }
}

// ============================================
// UTILIDADES
// ============================================

/**
 * Genera un slug único para el evento
 * Formato: nombre-tipo-MMYY (ej: martina-15-0125)
 */
function generateSlug(eventName: string, startDate: Date): string {
  const namePart = eventName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 20)

  const month = String(startDate.getMonth() + 1).padStart(2, '0')
  const year = String(startDate.getFullYear()).slice(-2)

  return `${namePart}-${month}${year}`
}

/**
 * Genera un slug único verificando en BD
 */
async function generateUniqueSlug(eventName: string, startDate: Date): Promise<string> {
  const baseSlug = generateSlug(eventName, startDate)
  let slug = baseSlug
  let counter = 1

  while (await prisma.event.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${counter}`
    counter++
    if (counter > 100) {
      throw new EventError('No se pudo generar slug único', 500)
    }
  }

  return slug
}

// ============================================
// SERVICIO
// ============================================

class EventService {
  /**
   * Crea un nuevo evento con sus datos
   */
  async create(input: CreateEventInput, userId: string) {
    const data = createEventSchema.parse(input)

    // Validar que startDate sea futura (opcional, depende del caso de uso)
    // if (data.eventData.startDate < new Date()) {
    //   throw new EventError('La fecha de inicio debe ser futura', 400)
    // }

    // Validar venue si se proporciona
    if (data.venueId) {
      const venue = await prisma.venue.findUnique({ where: { id: data.venueId } })
      if (!venue || !venue.isActive) {
        throw new EventError('Venue no encontrado o inactivo', 404)
      }
    }

    // Validar client si se proporciona
    if (data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } })
      if (!client || !client.isActive) {
        throw new EventError('Cliente no encontrado o inactivo', 404)
      }
    }

    // Generar slug único
    const slug = await generateUniqueSlug(data.eventData.eventName, data.eventData.startDate)

    // Crear evento con datos en transacción
    const event = await prisma.event.create({
      data: {
        slug,
        status: EVENT_STATUS.DRAFT,
        venueId: data.venueId,
        clientId: data.clientId,
        createdById: userId,
        eventData: {
          create: data.eventData,
        },
      },
      include: this.getIncludeClause(),
    })

    console.log(`[EVENTS] Evento creado: ${event.id} (${slug}) por usuario ${userId}`)

    return event
  }

  /**
   * Obtiene un evento por ID con todos sus datos
   */
  async findById(id: string) {
    const event = await prisma.event.findUnique({
      where: { id },
      include: this.getIncludeClause(),
    })

    if (!event) {
      throw new EventError('Evento no encontrado', 404)
    }

    return event
  }

  /**
   * Obtiene un evento por slug (para acceso público via QR)
   */
  async findBySlug(slug: string) {
    const event = await prisma.event.findUnique({
      where: { slug },
      include: this.getIncludeClause(),
    })

    if (!event) {
      throw new EventError('Evento no encontrado', 404)
    }

    return event
  }

  /**
   * Lista eventos con filtros
   */
  async findAll(filters: EventFilters) {
    const {
      status,
      eventType,
      venueId,
      clientId,
      fromDate,
      toDate,
      search,
      limit,
      offset,
    } = eventFiltersSchema.parse(filters)

    const where: any = {}

    if (status) where.status = status
    if (venueId) where.venueId = venueId
    if (clientId) where.clientId = clientId

    // Filtros en eventData
    if (eventType || fromDate || toDate || search) {
      where.eventData = {}
      if (eventType) where.eventData.eventType = eventType
      if (fromDate) where.eventData.startDate = { gte: fromDate }
      if (toDate) {
        where.eventData.startDate = {
          ...where.eventData.startDate,
          lte: toDate,
        }
      }
      if (search) {
        where.eventData.eventName = { contains: search }
      }
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          eventData: {
            select: {
              eventName: true,
              eventType: true,
              startDate: true,
            },
          },
          venue: {
            select: {
              name: true,
              city: true,
            },
          },
          client: {
            select: {
              name: true,
            },
          },
        },
        orderBy: [
          { eventData: { startDate: 'desc' } },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.event.count({ where }),
    ])

    return {
      events,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + events.length < total,
      },
    }
  }

  /**
   * Actualiza datos del evento (no eventData)
   */
  async update(id: string, input: UpdateEventInput) {
    const data = updateEventSchema.parse(input)

    // Verificar que existe
    await this.findById(id)

    // Validar venue si se cambia
    if (data.venueId) {
      const venue = await prisma.venue.findUnique({ where: { id: data.venueId } })
      if (!venue || !venue.isActive) {
        throw new EventError('Venue no encontrado o inactivo', 404)
      }
    }

    // Validar client si se cambia
    if (data.clientId) {
      const client = await prisma.client.findUnique({ where: { id: data.clientId } })
      if (!client || !client.isActive) {
        throw new EventError('Cliente no encontrado o inactivo', 404)
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data,
      include: this.getIncludeClause(),
    })

    console.log(`[EVENTS] Evento actualizado: ${event.id}`)

    return event
  }

  /**
   * Actualiza eventData específicamente
   */
  async updateEventData(eventId: string, input: UpdateEventDataInput) {
    const data = updateEventDataSchema.parse(input)

    // Verificar que existe
    await this.findById(eventId)

    const eventData = await prisma.eventData.update({
      where: { eventId },
      data,
    })

    console.log(`[EVENTS] EventData actualizado para evento: ${eventId}`)

    return eventData
  }

  /**
   * Cambia el estado del evento
   */
  async updateStatus(id: string, status: EventStatus) {
    const event = await this.findById(id)

    // Validar transiciones de estado
    this.validateStatusTransition(event.status as EventStatus, status)

    const updated = await prisma.event.update({
      where: { id },
      data: { status },
      include: this.getIncludeClause(),
    })

    console.log(`[EVENTS] Estado cambiado: ${id} (${event.status} → ${status})`)

    return updated
  }

  /**
   * Elimina un evento (soft delete via status FINISHED)
   */
  async delete(id: string) {
    await this.findById(id)

    // Opción 1: Soft delete cambiando status
    const event = await prisma.event.update({
      where: { id },
      data: { status: EVENT_STATUS.FINISHED },
    })

    console.log(`[EVENTS] Evento finalizado (soft delete): ${id}`)

    return { message: 'Evento finalizado correctamente', event }
  }

  /**
   * Duplica un evento con nueva fecha
   * Copia: venue, client, eventData, configs de módulos
   * NO copia: requests, datos operativos
   */
  async duplicate(id: string, userId: string, newStartDate?: Date) {
    const source = await this.findById(id)

    if (!source.eventData) {
      throw new EventError('El evento no tiene datos para duplicar', 400)
    }

    const startDate = newStartDate || source.eventData.startDate
    const newSlug = await generateUniqueSlug(source.eventData.eventName, startDate)

    // Crear nuevo evento con datos copiados
    const newEvent = await prisma.$transaction(async (tx) => {
      // 1. Crear evento base
      const event = await tx.event.create({
        data: {
          slug: newSlug,
          status: EVENT_STATUS.DRAFT,
          venueId: source.venueId,
          clientId: source.clientId,
          clonedFromId: source.id,
          createdById: userId,
          // Copiar eventData
          eventData: {
            create: {
              eventName: `${source.eventData!.eventName} (copia)`,
              eventType: source.eventData!.eventType,
              startDate,
              endDate: null, // Nueva fecha de fin debe configurarse
              guestCount: source.eventData!.guestCount,
              instagramUrl: null,
              instagramUser: source.eventData!.instagramUser,
              hashtag: null,
              spotifyPlaylist: source.eventData!.spotifyPlaylist,
              notes: source.eventData!.notes,
            },
          },
        },
      })

      // 2. Copiar config MUSICADJ si existe
      const musicadjConfig = await tx.musicadjConfig.findUnique({
        where: { eventId: source.id },
      })
      if (musicadjConfig) {
        await tx.musicadjConfig.create({
          data: {
            eventId: event.id,
            enabled: musicadjConfig.enabled,
            cooldownSeconds: musicadjConfig.cooldownSeconds,
            allowWithoutSpotify: musicadjConfig.allowWithoutSpotify,
            welcomeMessage: musicadjConfig.welcomeMessage,
            showQueueToClient: musicadjConfig.showQueueToClient,
          },
        })
      }

      // 3. Copiar config KARAOKEYA si existe
      const karaokeyaConfig = await tx.karaokeyaConfig.findUnique({
        where: { eventId: source.id },
      })
      if (karaokeyaConfig) {
        await tx.karaokeyaConfig.create({
          data: {
            eventId: event.id,
            enabled: karaokeyaConfig.enabled,
            cooldownSeconds: karaokeyaConfig.cooldownSeconds,
            maxPerPerson: karaokeyaConfig.maxPerPerson,
            showQueueToClient: karaokeyaConfig.showQueueToClient,
            showNextSinger: karaokeyaConfig.showNextSinger,
          },
        })
      }

      return event
    })

    const result = await this.findById(newEvent.id)

    console.log(`[EVENTS] Evento duplicado: ${source.id} → ${newEvent.id} por usuario ${userId}`)

    return result
  }

  // ============================================
  // HELPERS PRIVADOS
  // ============================================

  private getIncludeClause() {
    return {
      createdBy: {
        select: { id: true, username: true },
      },
      venue: {
        select: {
          id: true,
          name: true,
          type: true,
          city: true,
          address: true,
          contactName: true,
          contactPhone: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
          company: true,
          phone: true,
          email: true,
        },
      },
      eventData: true,
      musicadjConfig: true,
      karaokeyaConfig: true,
      clonedFrom: {
        select: { id: true, slug: true },
      },
    }
  }

  /**
   * Genera o regenera el token de acceso para check-in
   */
  async generateCheckinAccessToken(eventId: string): Promise<string> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new EventError('Evento no encontrado', 404)
    }

    // Generar token seguro aleatorio
    const token = crypto.randomBytes(32).toString('hex')

    await prisma.event.update({
      where: { id: eventId },
      data: { checkinAccessToken: token },
    })

    return token
  }

  /**
   * Obtiene el link de acceso directo para check-in
   */
  async getCheckinAccessLink(eventId: string): Promise<{ url: string; token: string }> {
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { id: true, slug: true, checkinAccessToken: true },
    })

    if (!event) {
      throw new EventError('Evento no encontrado', 404)
    }

    // Si no tiene token, generar uno nuevo
    let token = event.checkinAccessToken
    if (!token) {
      token = await this.generateCheckinAccessToken(eventId)
    }

    // URL base del check-in (usa PUBLIC_DOMAIN en producción)
    const baseUrl = process.env.CHECKIN_APP_URL || process.env.PUBLIC_DOMAIN || 'http://localhost:5175'
    // La ruta en web-client es /e/:slug
    const url = `${baseUrl}/e/${event.slug}?token=${token}`

    return { url, token }
  }

  /**
   * Genera un código QR para acceso directo al check-in
   */
  async getCheckinQRCode(eventId: string): Promise<string> {
    const { url } = await this.getCheckinAccessLink(eventId)

    try {
      // Generar QR code como data URL (base64)
      const qrDataUrl = await QRCode.toDataURL(url, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      })

      return qrDataUrl
    } catch (error) {
      throw new EventError('Error al generar código QR', 500)
    }
  }

  /**
   * Valida un token de acceso para check-in
   */
  async validateCheckinAccessToken(eventSlug: string, token: string): Promise<boolean> {
    const event = await prisma.event.findUnique({
      where: { slug: eventSlug },
      select: { checkinAccessToken: true },
    })

    if (!event || !event.checkinAccessToken) {
      return false
    }

    return event.checkinAccessToken === token
  }

  private validateStatusTransition(from: EventStatus, to: EventStatus) {
    const allowed: Record<EventStatus, EventStatus[]> = {
      DRAFT: ['ACTIVE', 'FINISHED'],
      ACTIVE: ['PAUSED', 'FINISHED'],
      PAUSED: ['ACTIVE', 'FINISHED'],
      FINISHED: [], // No se puede cambiar desde FINISHED
    }

    if (!allowed[from].includes(to)) {
      throw new EventError(
        `Transición de estado no permitida: ${from} → ${to}`,
        400
      )
    }
  }
}

export const eventService = new EventService()
