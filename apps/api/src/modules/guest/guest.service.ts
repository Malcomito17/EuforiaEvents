import { prisma } from '../../config/database'
import { IdentifyGuestInput, GuestResponse, GuestRequestsResponse, GuestError } from './guest.types'

/**
 * Identifica o crea un guest por email
 * Si existe, actualiza displayName/whatsapp y lastSeenAt
 */
export async function identifyGuest(input: IdentifyGuestInput): Promise<GuestResponse> {
  const guest = await prisma.guest.upsert({
    where: { email: input.email.toLowerCase() },
    update: {
      displayName: input.displayName,
      whatsapp: input.whatsapp || null,
      lastSeenAt: new Date(),
    },
    create: {
      email: input.email.toLowerCase(),
      displayName: input.displayName,
      whatsapp: input.whatsapp || null,
    },
  })

  console.log(`[GUEST] Identificado: ${guest.displayName} (${guest.email})`)

  return guest
}

/**
 * Obtiene un guest por ID
 */
export async function getGuestById(guestId: string): Promise<GuestResponse> {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
  })

  if (!guest) {
    throw new GuestError('Guest no encontrado', 404, 'GUEST_NOT_FOUND')
  }

  return guest
}

/**
 * Obtiene un guest por email
 */
export async function getGuestByEmail(email: string): Promise<GuestResponse | null> {
  const guest = await prisma.guest.findUnique({
    where: { email: email.toLowerCase() },
  })

  return guest
}

/**
 * Obtiene todos los requests de un guest (ambos módulos)
 */
export async function getGuestRequests(guestId: string, eventId?: string): Promise<GuestRequestsResponse> {
  const whereClause = eventId 
    ? { guestId, eventId } 
    : { guestId }

  const [songRequests, karaokeRequests] = await Promise.all([
    prisma.songRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        title: true,
        artist: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.karaokeRequest.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        eventId: true,
        title: true,
        artist: true,
        turnNumber: true,
        status: true,
        createdAt: true,
      },
    }),
  ])

  return { songRequests, karaokeRequests }
}
