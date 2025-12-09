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
