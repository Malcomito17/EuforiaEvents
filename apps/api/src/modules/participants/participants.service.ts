import { PrismaClient } from '@prisma/client'
import type { ParticipantIdentifyInput, ParticipantResponse } from './participants.types'

const prisma = new PrismaClient()

export class ParticipantsService {
  /**
   * Identifica o crea un participant por email
   * Si el email existe, actualiza displayName y whatsapp
   * Si no existe, crea uno nuevo
   */
  async identify(data: ParticipantIdentifyInput): Promise<ParticipantResponse> {
    const participant = await prisma.participant.upsert({
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

    return this.sanitizeParticipant(participant)
  }

  /**
   * Obtiene un participant por ID
   */
  async getById(participantId: string): Promise<ParticipantResponse | null> {
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    return participant ? this.sanitizeParticipant(participant) : null
  }

  /**
   * Busca un participant por email (para autocompletar formularios)
   */
  async lookupByEmail(email: string): Promise<ParticipantResponse | null> {
    const participant = await prisma.participant.findUnique({
      where: { email },
    })

    return participant ? this.sanitizeParticipant(participant) : null
  }

  /**
   * Obtiene los pedidos de un participant (song + karaoke)
   */
  async getRequests(participantId: string, eventId?: string) {
    const where = eventId ? { participantId, eventId } : { participantId }

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
   * Lista TODOS los participants (sin filtrar por evento)
   * Excluye participants del sistema
   */
  async listAll() {
    // Obtener todos los participants que tienen al menos un request
    const participants = await prisma.participant.findMany({
      where: {
        isSystemParticipant: false,  // Excluir participants del sistema
        OR: [
          { songRequests: { some: {} } },
          { karaokeRequests: { some: {} } },
        ],
      },
      include: {
        _count: {
          select: {
            songRequests: true,
            karaokeRequests: true,
          },
        },
      },
      orderBy: { lastSeenAt: 'desc' },
    })

    return participants.map(participant => ({
      ...this.sanitizeParticipant(participant),
      songRequestsCount: participant._count.songRequests,
      karaokeRequestsCount: participant._count.karaokeRequests,
    }))
  }

  /**
   * Lista todos los participants de un evento
   * Excluye participants del sistema
   */
  async listByEvent(eventId: string) {
    // Obtener IDs únicos de participants que tienen requests en este evento
    const [songRequestParticipants, karaokeRequestParticipants] = await Promise.all([
      prisma.songRequest.findMany({
        where: { eventId },
        distinct: ['participantId'],
        select: { participantId: true },
      }),
      prisma.karaokeRequest.findMany({
        where: { eventId },
        distinct: ['participantId'],
        select: { participantId: true },
      }),
    ])

    // Combinar y deduplicar participant IDs
    const participantIds = Array.from(new Set([
      ...songRequestParticipants.map(r => r.participantId),
      ...karaokeRequestParticipants.map(r => r.participantId),
    ]))

    if (participantIds.length === 0) {
      return []
    }

    // Obtener datos completos de participants con contadores de requests
    // Excluir participants del sistema
    const participants = await prisma.participant.findMany({
      where: {
        id: { in: participantIds },
        isSystemParticipant: false  // Excluir participants del sistema
      },
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

    return participants.map(participant => ({
      ...this.sanitizeParticipant(participant),
      songRequestsCount: participant._count.songRequests,
      karaokeRequestsCount: participant._count.karaokeRequests,
    }))
  }

  /**
   * Elimina un participant y todas sus requests
   */
  async delete(participantId: string) {
    // Verificar que existe
    const participant = await prisma.participant.findUnique({
      where: { id: participantId },
    })

    if (!participant) {
      throw new Error('Participant no encontrado')
    }

    // Eliminar participant (cascada elimina requests automáticamente)
    await prisma.participant.delete({
      where: { id: participantId },
    })

    console.log(`[PARTICIPANTS] Participant eliminado: ${participantId} (${participant.email})`)

    return { message: 'Participant eliminado correctamente', participant: this.sanitizeParticipant(participant) }
  }

  /**
   * Remueve campos sensibles del participant
   */
  private sanitizeParticipant(participant: any): ParticipantResponse {
    return {
      id: participant.id,
      email: participant.email,
      displayName: participant.displayName,
      whatsapp: participant.whatsapp,
      createdAt: participant.createdAt,
    }
  }
}

export const participantsService = new ParticipantsService()
