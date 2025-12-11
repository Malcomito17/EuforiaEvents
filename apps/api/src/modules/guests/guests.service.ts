import { PrismaClient } from '@prisma/client'
import type { GuestIdentifyInput, GuestResponse } from './guests.types'

const prisma = new PrismaClient()

export class GuestsService {
  /**
   * Identifica o crea un guest por email
   * Si el email existe, actualiza displayName y whatsapp
   * Si no existe, crea uno nuevo
   */
  async identify(data: GuestIdentifyInput): Promise<GuestResponse> {
    const guest = await prisma.guest.upsert({
      where: { email: data.email },
      update: {
        displayName: data.displayName,
        whatsapp: data.whatsapp || null,
        lastSeenAt: new Date(),
      },
      create: {
        email: data.email,
        displayName: data.displayName,
        whatsapp: data.whatsapp || null,
      },
    })

    return this.sanitizeGuest(guest)
  }

  /**
   * Obtiene un guest por ID
   */
  async getById(guestId: string): Promise<GuestResponse | null> {
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    })

    return guest ? this.sanitizeGuest(guest) : null
  }

  /**
   * Obtiene los pedidos de un guest (song + karaoke)
   */
  async getRequests(guestId: string, eventId?: string) {
    const where = eventId ? { guestId, eventId } : { guestId }

    const [songRequests, karaokeRequests] = await Promise.all([
      prisma.songRequest.findMany({
        where,
        include: {
          event: {
            include: {
              eventData: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.karaokeRequest.findMany({
        where,
        include: {
          event: {
            include: {
              eventData: true,
            },
          },
          song: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ])

    return {
      songs: songRequests,
      karaoke: karaokeRequests,
    }
  }

  /**
   * Lista todos los guests de un evento
   */
  async listByEvent(eventId: string) {
    // Obtener IDs únicos de guests que tienen requests en este evento
    const [songRequestGuests, karaokeRequestGuests] = await Promise.all([
      prisma.songRequest.findMany({
        where: { eventId },
        distinct: ['guestId'],
        select: { guestId: true },
      }),
      prisma.karaokeRequest.findMany({
        where: { eventId },
        distinct: ['guestId'],
        select: { guestId: true },
      }),
    ])

    // Combinar y deduplicar guest IDs
    const guestIds = Array.from(new Set([
      ...songRequestGuests.map(r => r.guestId),
      ...karaokeRequestGuests.map(r => r.guestId),
    ]))

    if (guestIds.length === 0) {
      return []
    }

    // Obtener datos completos de guests con contadores de requests
    const guests = await prisma.guest.findMany({
      where: { id: { in: guestIds } },
      include: {
        _count: {
          select: {
            songRequests: {
              where: { eventId },
            },
            karaokeRequests: {
              where: { eventId },
            },
          },
        },
      },
      orderBy: { lastSeenAt: 'desc' },
    })

    return guests.map(guest => ({
      ...this.sanitizeGuest(guest),
      songRequestsCount: guest._count.songRequests,
      karaokeRequestsCount: guest._count.karaokeRequests,
    }))
  }

  /**
   * Elimina un guest y todas sus requests
   */
  async delete(guestId: string) {
    // Verificar que existe
    const guest = await prisma.guest.findUnique({
      where: { id: guestId },
    })

    if (!guest) {
      throw new Error('Guest no encontrado')
    }

    // Eliminar guest (cascada elimina requests automáticamente)
    await prisma.guest.delete({
      where: { id: guestId },
    })

    console.log(`[GUESTS] Guest eliminado: ${guestId} (${guest.email})`)

    return { message: 'Guest eliminado correctamente', guest: this.sanitizeGuest(guest) }
  }

  /**
   * Remueve campos sensibles del guest
   */
  private sanitizeGuest(guest: any): GuestResponse {
    return {
      id: guest.id,
      email: guest.email,
      displayName: guest.displayName,
      whatsapp: guest.whatsapp,
      createdAt: guest.createdAt,
    }
  }
}

export const guestsService = new GuestsService()
