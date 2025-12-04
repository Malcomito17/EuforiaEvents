import { PrismaClient, KaraokeRequestStatus, Prisma } from '@prisma/client'
import {
  CreateKaraokeRequestInput,
  KaraokeyaConfigInput,
  ListKaraokeRequestsQuery,
  KaraokeRequestResponse,
  KaraokeQueueStats,
  KaraokeyaConfigResponse,
  KaraokeyaError,
} from './karaokeya.types'

// ============================================
// KARAOKEYA SERVICE
// Gestión de cola de karaoke con sistema de turnos
// ============================================

export class KaraokeyaService {
  constructor(private prisma: PrismaClient) {}

  // ============================================
  // CONFIGURACIÓN DEL MÓDULO
  // ============================================

  async getConfig(eventId: string): Promise<KaraokeyaConfigResponse | null> {
    const config = await this.prisma.karaokeyaConfig.findUnique({
      where: { eventId },
    })

    if (!config) return null

    return {
      eventId: config.eventId,
      enabled: config.enabled,
      cooldownSeconds: config.cooldownSeconds,
      maxPerPerson: config.maxPerPerson,
      showQueueToClient: config.showQueueToClient,
      showNextSinger: config.showNextSinger,
    }
  }

  async createOrUpdateConfig(
    eventId: string,
    input: KaraokeyaConfigInput
  ): Promise<KaraokeyaConfigResponse> {
    // Verificar que el evento existe
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      throw new KaraokeyaError('Evento no encontrado', 404, 'EVENT_NOT_FOUND')
    }

    const config = await this.prisma.karaokeyaConfig.upsert({
      where: { eventId },
      update: {
        enabled: input.enabled,
        cooldownSeconds: input.cooldownSeconds,
        maxPerPerson: input.maxPerPerson,
        showQueueToClient: input.showQueueToClient,
        showNextSinger: input.showNextSinger,
      },
      create: {
        eventId,
        enabled: input.enabled ?? true,
        cooldownSeconds: input.cooldownSeconds ?? 600,
        maxPerPerson: input.maxPerPerson ?? 0,
        showQueueToClient: input.showQueueToClient ?? true,
        showNextSinger: input.showNextSinger ?? true,
      },
    })

    console.log(`[KARAOKEYA] Config actualizada para evento ${eventId}`)

    return {
      eventId: config.eventId,
      enabled: config.enabled,
      cooldownSeconds: config.cooldownSeconds,
      maxPerPerson: config.maxPerPerson,
      showQueueToClient: config.showQueueToClient,
      showNextSinger: config.showNextSinger,
    }
  }

  // ============================================
  // REQUESTS DE KARAOKE
  // ============================================

  async createRequest(
    eventId: string,
    input: CreateKaraokeRequestInput
  ): Promise<KaraokeRequestResponse> {
    // 1. Verificar evento activo
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
      include: { karaokeyaConfig: true },
    })

    if (!event) {
      throw new KaraokeyaError('Evento no encontrado', 404, 'EVENT_NOT_FOUND')
    }

    if (event.status !== 'ACTIVE') {
      throw new KaraokeyaError('El evento no está activo', 400, 'EVENT_NOT_ACTIVE')
    }

    // 2. Verificar módulo habilitado
    if (!event.karaokeyaConfig?.enabled) {
      throw new KaraokeyaError('El karaoke no está habilitado', 400, 'MODULE_DISABLED')
    }

    const config = event.karaokeyaConfig

    // 3. Verificar límite por persona (si aplica)
    if (config.maxPerPerson > 0 && input.singerEmail) {
      const existingCount = await this.prisma.karaokeRequest.count({
        where: {
          eventId,
          singerEmail: input.singerEmail,
          status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] },
        },
      })

      if (existingCount >= config.maxPerPerson) {
        throw new KaraokeyaError(
          `Ya tenés ${existingCount} turno(s) activo(s). Máximo permitido: ${config.maxPerPerson}`,
          400,
          'MAX_PER_PERSON_EXCEEDED'
        )
      }
    }

    // 4. Obtener siguiente número de turno y posición en cola
    const [lastTurn, lastPosition] = await Promise.all([
      this.prisma.karaokeRequest.findFirst({
        where: { eventId },
        orderBy: { turnNumber: 'desc' },
        select: { turnNumber: true },
      }),
      this.prisma.karaokeRequest.findFirst({
        where: { eventId, status: 'QUEUED' },
        orderBy: { queuePosition: 'desc' },
        select: { queuePosition: true },
      }),
    ])

    const nextTurnNumber = (lastTurn?.turnNumber ?? 0) + 1
    const nextQueuePosition = (lastPosition?.queuePosition ?? 0) + 1

    // 5. Crear request
    const request = await this.prisma.karaokeRequest.create({
      data: {
        eventId,
        title: input.title,
        artist: input.artist || null,
        singerName: input.singerName,
        singerLastname: input.singerLastname || null,
        singerEmail: input.singerEmail || null,
        singerWhatsapp: input.singerWhatsapp || null,
        turnNumber: nextTurnNumber,
        queuePosition: nextQueuePosition,
        status: 'QUEUED',
      },
    })

    console.log(
      `[KARAOKEYA] Nuevo turno #${nextTurnNumber} - "${input.title}" por ${input.singerName} (evento: ${eventId})`
    )

    return this.mapToResponse(request)
  }

  async getRequestById(requestId: string): Promise<KaraokeRequestResponse | null> {
    const request = await this.prisma.karaokeRequest.findUnique({
      where: { id: requestId },
    })

    return request ? this.mapToResponse(request) : null
  }

  async listRequests(
    eventId: string,
    query: ListKaraokeRequestsQuery
  ): Promise<{ requests: KaraokeRequestResponse[]; total: number }> {
    const where: Prisma.KaraokeRequestWhereInput = {
      eventId,
      ...(query.status && { status: query.status }),
    }

    const [requests, total] = await Promise.all([
      this.prisma.karaokeRequest.findMany({
        where,
        orderBy: [{ queuePosition: 'asc' }, { createdAt: 'asc' }],
        take: query.limit,
        skip: query.offset,
      }),
      this.prisma.karaokeRequest.count({ where }),
    ])

    return {
      requests: requests.map(this.mapToResponse),
      total,
    }
  }

  async getQueue(eventId: string): Promise<KaraokeRequestResponse[]> {
    const requests = await this.prisma.karaokeRequest.findMany({
      where: {
        eventId,
        status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] },
      },
      orderBy: [
        { status: 'asc' }, // ON_STAGE primero, luego CALLED, luego QUEUED
        { queuePosition: 'asc' },
      ],
    })

    return requests.map(this.mapToResponse)
  }

  async getQueueStats(eventId: string): Promise<KaraokeQueueStats> {
    const counts = await this.prisma.karaokeRequest.groupBy({
      by: ['status'],
      where: { eventId },
      _count: true,
    })

    const lastTurn = await this.prisma.karaokeRequest.findFirst({
      where: { eventId },
      orderBy: { turnNumber: 'desc' },
      select: { turnNumber: true },
    })

    const queuedCount = counts.find((c) => c.status === 'QUEUED')?._count ?? 0

    // Estimación simple: 3 minutos promedio por canción
    const AVG_SONG_MINUTES = 3
    const estimatedWaitMinutes = queuedCount > 0 ? queuedCount * AVG_SONG_MINUTES : null

    return {
      total: counts.reduce((sum, c) => sum + c._count, 0),
      queued: queuedCount,
      called: counts.find((c) => c.status === 'CALLED')?._count ?? 0,
      onStage: counts.find((c) => c.status === 'ON_STAGE')?._count ?? 0,
      completed: counts.find((c) => c.status === 'COMPLETED')?._count ?? 0,
      noShow: counts.find((c) => c.status === 'NO_SHOW')?._count ?? 0,
      cancelled: counts.find((c) => c.status === 'CANCELLED')?._count ?? 0,
      nextTurnNumber: (lastTurn?.turnNumber ?? 0) + 1,
      estimatedWaitMinutes,
    }
  }

  // ============================================
  // GESTIÓN DE ESTADOS Y COLA
  // ============================================

  async updateStatus(
    requestId: string,
    status: KaraokeRequestStatus
  ): Promise<KaraokeRequestResponse> {
    const request = await this.prisma.karaokeRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      throw new KaraokeyaError('Turno no encontrado', 404, 'REQUEST_NOT_FOUND')
    }

    // Validar transiciones de estado
    this.validateStatusTransition(request.status, status)

    const updateData: Prisma.KaraokeRequestUpdateInput = { status }

    // Si está siendo llamado, registrar timestamp
    if (status === 'CALLED') {
      updateData.calledAt = new Date()
    }

    const updated = await this.prisma.karaokeRequest.update({
      where: { id: requestId },
      data: updateData,
    })

    console.log(
      `[KARAOKEYA] Turno #${request.turnNumber} cambió de ${request.status} a ${status}`
    )

    return this.mapToResponse(updated)
  }

  async callNext(eventId: string): Promise<KaraokeRequestResponse | null> {
    // Buscar el siguiente en cola (menor queuePosition con status QUEUED)
    const next = await this.prisma.karaokeRequest.findFirst({
      where: {
        eventId,
        status: 'QUEUED',
      },
      orderBy: { queuePosition: 'asc' },
    })

    if (!next) {
      return null
    }

    const updated = await this.prisma.karaokeRequest.update({
      where: { id: next.id },
      data: {
        status: 'CALLED',
        calledAt: new Date(),
      },
    })

    console.log(
      `[KARAOKEYA] Llamando turno #${next.turnNumber} - ${next.singerName} para "${next.title}"`
    )

    return this.mapToResponse(updated)
  }

  async reorderQueue(requestId: string, newPosition: number): Promise<void> {
    const request = await this.prisma.karaokeRequest.findUnique({
      where: { id: requestId },
    })

    if (!request) {
      throw new KaraokeyaError('Turno no encontrado', 404, 'REQUEST_NOT_FOUND')
    }

    if (request.status !== 'QUEUED') {
      throw new KaraokeyaError(
        'Solo se pueden reordenar turnos en cola',
        400,
        'INVALID_STATUS'
      )
    }

    const oldPosition = request.queuePosition

    // Usar transacción para mantener consistencia
    await this.prisma.$transaction(async (tx) => {
      if (newPosition > oldPosition) {
        // Moviendo hacia abajo: decrementar posiciones intermedias
        await tx.karaokeRequest.updateMany({
          where: {
            eventId: request.eventId,
            status: 'QUEUED',
            queuePosition: { gt: oldPosition, lte: newPosition },
          },
          data: { queuePosition: { decrement: 1 } },
        })
      } else if (newPosition < oldPosition) {
        // Moviendo hacia arriba: incrementar posiciones intermedias
        await tx.karaokeRequest.updateMany({
          where: {
            eventId: request.eventId,
            status: 'QUEUED',
            queuePosition: { gte: newPosition, lt: oldPosition },
          },
          data: { queuePosition: { increment: 1 } },
        })
      }

      // Actualizar posición del request movido
      await tx.karaokeRequest.update({
        where: { id: requestId },
        data: { queuePosition: newPosition },
      })
    })

    console.log(
      `[KARAOKEYA] Turno #${request.turnNumber} movido de posición ${oldPosition} a ${newPosition}`
    )
  }

  async batchReorder(eventId: string, orderedIds: string[]): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await tx.karaokeRequest.update({
          where: { id: orderedIds[i] },
          data: { queuePosition: i + 1 },
        })
      }
    })

    console.log(`[KARAOKEYA] Cola reordenada - ${orderedIds.length} items`)
  }

  async cancelRequest(requestId: string): Promise<KaraokeRequestResponse> {
    return this.updateStatus(requestId, 'CANCELLED')
  }

  // ============================================
  // UTILIDADES PRIVADAS
  // ============================================

  private mapToResponse(request: any): KaraokeRequestResponse {
    return {
      id: request.id,
      eventId: request.eventId,
      title: request.title,
      artist: request.artist,
      singerName: request.singerName,
      singerLastname: request.singerLastname,
      singerEmail: request.singerEmail,
      singerWhatsapp: request.singerWhatsapp,
      turnNumber: request.turnNumber,
      queuePosition: request.queuePosition,
      status: request.status,
      createdAt: request.createdAt,
      calledAt: request.calledAt,
    }
  }

  private validateStatusTransition(
    current: KaraokeRequestStatus,
    next: KaraokeRequestStatus
  ): void {
    const validTransitions: Record<KaraokeRequestStatus, KaraokeRequestStatus[]> = {
      QUEUED: ['CALLED', 'CANCELLED'],
      CALLED: ['ON_STAGE', 'NO_SHOW', 'QUEUED'], // QUEUED permite volver a la cola
      ON_STAGE: ['COMPLETED', 'CANCELLED'],
      COMPLETED: [], // Estado final
      NO_SHOW: ['QUEUED'], // Permite reinsertar
      CANCELLED: ['QUEUED'], // Permite reinsertar
    }

    if (!validTransitions[current].includes(next)) {
      throw new KaraokeyaError(
        `Transición inválida: ${current} -> ${next}`,
        400,
        'INVALID_TRANSITION'
      )
    }
  }
}
