/**
 * EUFORIA EVENTS - DJ Service
 * Lógica de negocio para operaciones del rol DJ
 */

import prisma from '../../config/database'

// ============================================
// ERROR PERSONALIZADO
// ============================================

export class DJError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'DJError'
  }
}

// ============================================
// SERVICIO
// ============================================

class DJService {
  /**
   * Obtiene eventos asignados a un DJ (basado en permisos)
   * Para simplificar, por ahora devuelve todos los eventos ACTIVE
   */
  async getAssignedEvents(userId: string) {
    const events = await prisma.event.findMany({
      where: {
        status: 'ACTIVE',
      },
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
          },
        },
        musicadjConfig: {
          select: {
            enabled: true,
          },
        },
        karaokeyaConfig: {
          select: {
            enabled: true,
          },
        },
      },
      orderBy: {
        eventData: {
          startDate: 'asc',
        },
      },
    })

    return events
  }

  /**
   * Obtiene pedidos musicales de un evento (vista simplificada para DJ)
   */
  async getMusicaDJRequests(eventId: string) {
    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { musicadjConfig: true },
    })

    if (!event) {
      throw new DJError('Evento no encontrado', 404)
    }

    if (!event.musicadjConfig?.enabled) {
      throw new DJError('MUSICADJ no está habilitado para este evento', 403)
    }

    const requests = await prisma.songRequest.findMany({
      where: {
        eventId,
        status: {
          in: ['PENDING', 'HIGHLIGHTED', 'URGENT'],
        },
      },
      include: {
        participant: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' },
      ],
    })

    return requests
  }

  /**
   * Actualiza el estado de un pedido musical
   */
  async updateMusicaDJRequestStatus(eventId: string, requestId: string, status: string) {
    const request = await prisma.songRequest.findFirst({
      where: {
        id: requestId,
        eventId,
      },
    })

    if (!request) {
      throw new DJError('Pedido no encontrado', 404)
    }

    const validStatuses = ['PENDING', 'HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']
    if (!validStatuses.includes(status)) {
      throw new DJError('Estado inválido', 400)
    }

    const updated = await prisma.songRequest.update({
      where: { id: requestId },
      data: { status },
    })

    console.log(`[DJ] Estado actualizado: ${requestId} → ${status}`)

    return updated
  }

  /**
   * Reordena la cola de pedidos musicales
   */
  async reorderMusicaDJQueue(eventId: string, requestIds: string[]) {
    // Verificar que todos los requests pertenecen al evento
    const requests = await prisma.songRequest.findMany({
      where: {
        id: { in: requestIds },
        eventId,
      },
    })

    if (requests.length !== requestIds.length) {
      throw new DJError('Algunos pedidos no pertenecen a este evento', 400)
    }

    // Actualizar priority en transacción (mayor priority = primero)
    await prisma.$transaction(
      requestIds.map((id, index) =>
        prisma.songRequest.update({
          where: { id },
          data: { priority: requestIds.length - index },
        })
      )
    )

    console.log(`[DJ] Cola reordenada para evento: ${eventId}`)

    return { message: 'Cola reordenada correctamente' }
  }

  /**
   * Obtiene pedidos de karaoke de un evento (vista simplificada para DJ)
   */
  async getKaraokeyaRequests(eventId: string) {
    // Verificar que el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { karaokeyaConfig: true },
    })

    if (!event) {
      throw new DJError('Evento no encontrado', 404)
    }

    if (!event.karaokeyaConfig?.enabled) {
      throw new DJError('KARAOKEYA no está habilitado para este evento', 403)
    }

    const requests = await prisma.karaokeRequest.findMany({
      where: {
        eventId,
        status: {
          in: ['QUEUED', 'CALLED', 'ON_STAGE'],
        },
      },
      include: {
        participant: {
          select: {
            id: true,
            displayName: true,
            email: true,
          },
        },
        song: {
          select: {
            title: true,
            artist: true,
            youtubeId: true,
          },
        },
      },
      orderBy: [
        { queuePosition: 'asc' },
        { createdAt: 'asc' },
      ],
    })

    return requests
  }

  /**
   * Actualiza el estado de un pedido de karaoke
   */
  async updateKaraokeyaRequestStatus(eventId: string, requestId: string, status: string) {
    const request = await prisma.karaokeRequest.findFirst({
      where: {
        id: requestId,
        eventId,
      },
    })

    if (!request) {
      throw new DJError('Pedido no encontrado', 404)
    }

    const validStatuses = ['QUEUED', 'CALLED', 'ON_STAGE', 'COMPLETED', 'NO_SHOW', 'CANCELLED']
    if (!validStatuses.includes(status)) {
      throw new DJError('Estado inválido', 400)
    }

    const updated = await prisma.karaokeRequest.update({
      where: { id: requestId },
      data: { status },
    })

    console.log(`[DJ] Estado karaoke actualizado: ${requestId} → ${status}`)

    return updated
  }

  /**
   * Reordena la cola de karaoke
   */
  async reorderKaraokeyaQueue(eventId: string, requestIds: string[]) {
    // Verificar que todos los requests pertenecen al evento
    const requests = await prisma.karaokeRequest.findMany({
      where: {
        id: { in: requestIds },
        eventId,
      },
    })

    if (requests.length !== requestIds.length) {
      throw new DJError('Algunos pedidos no pertenecen a este evento', 400)
    }

    // Actualizar queuePosition en transacción
    await prisma.$transaction(
      requestIds.map((id, index) =>
        prisma.karaokeRequest.update({
          where: { id },
          data: { queuePosition: index },
        })
      )
    )

    console.log(`[DJ] Cola karaoke reordenada para evento: ${eventId}`)

    return { message: 'Cola reordenada correctamente' }
  }

  /**
   * Obtiene el historial de pedidos de un participante
   */
  async getParticipantHistory(participantId: string) {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
      select: {
        id: true,
        displayName: true,
        email: true,
      },
    })

    if (!participant) {
      throw new DJError('Participante no encontrado', 404)
    }

    // Obtener pedidos musicales
    const musicRequests = await prisma.songRequest.findMany({
      where: { participantId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    // Obtener pedidos de karaoke
    const karaokeRequests = await prisma.karaokeRequest.findMany({
      where: { participantId },
      include: {
        song: {
          select: {
            title: true,
            artist: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return {
      participant,
      musicRequests,
      karaokeRequests,
    }
  }
}

export const djService = new DJService()
