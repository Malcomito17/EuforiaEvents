/**
 * MUSICADJ Service
 * Lógica de negocio para solicitudes musicales
 */

import { prisma } from '../../config/database'
import { 
  CreateSongRequestInput, 
  UpdateSongRequestInput,
  MusicadjConfigInput,
  ListRequestsQuery,
  SongRequestStatus
} from './musicadj.types'

// ============================================
// Config Operations
// ============================================

/**
 * Obtiene o crea la configuración del módulo para un evento
 */
export async function getOrCreateConfig(eventId: string) {
  let config = await prisma.musicadjConfig.findUnique({
    where: { eventId }
  })

  if (!config) {
    config = await prisma.musicadjConfig.create({
      data: { eventId }
    })
    console.log(`[MUSICADJ] Config creada para evento ${eventId}`)
  }

  return config
}

/**
 * Actualiza la configuración del módulo
 */
export async function updateConfig(eventId: string, input: MusicadjConfigInput) {
  // Asegurar que existe
  await getOrCreateConfig(eventId)

  const config = await prisma.musicadjConfig.update({
    where: { eventId },
    data: input
  })

  console.log(`[MUSICADJ] Config actualizada para evento ${eventId}`)
  return config
}

// ============================================
// Song Request Operations
// ============================================

/**
 * Crea una nueva solicitud de canción
 */
export async function createRequest(eventId: string, input: CreateSongRequestInput) {
  // Verificar que el evento existe y está activo
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { musicadjConfig: true }
  })

  if (!event) {
    throw new MusicadjError('Evento no encontrado', 404)
  }

  if (event.status !== 'ACTIVE') {
    throw new MusicadjError('El evento no está activo', 400)
  }

  // Verificar que el módulo está habilitado
  const config = event.musicadjConfig || await getOrCreateConfig(eventId)
  if (!config.enabled) {
    throw new MusicadjError('El módulo de pedidos no está habilitado', 400)
  }

  // TODO: Verificar cooldown por requester

  const request = await prisma.songRequest.create({
    data: {
      eventId,
      ...input,
      status: 'PENDING',
      priority: 0
    }
  })

  console.log(`[MUSICADJ] Nueva solicitud: "${input.title}" por ${input.requesterName}`)
  return request
}

/**
 * Obtiene una solicitud por ID
 */
export async function getRequestById(eventId: string, requestId: string) {
  const request = await prisma.songRequest.findFirst({
    where: { 
      id: requestId,
      eventId 
    }
  })

  if (!request) {
    throw new MusicadjError('Solicitud no encontrada', 404)
  }

  return request
}

/**
 * Lista solicitudes de un evento
 */
export async function listRequests(eventId: string, query: ListRequestsQuery) {
  const { status, limit, offset } = query

  const where = {
    eventId,
    ...(status && { status })
  }

  const [requests, total] = await Promise.all([
    prisma.songRequest.findMany({
      where,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.songRequest.count({ where })
  ])

  return { requests, total, limit, offset }
}

/**
 * Actualiza una solicitud (estado, prioridad)
 */
export async function updateRequest(
  eventId: string, 
  requestId: string, 
  input: UpdateSongRequestInput
) {
  // Verificar que existe
  await getRequestById(eventId, requestId)

  const request = await prisma.songRequest.update({
    where: { id: requestId },
    data: input
  })

  console.log(`[MUSICADJ] Solicitud ${requestId} actualizada: ${JSON.stringify(input)}`)
  return request
}

/**
 * Elimina una solicitud
 */
export async function deleteRequest(eventId: string, requestId: string) {
  // Verificar que existe
  await getRequestById(eventId, requestId)

  await prisma.songRequest.delete({
    where: { id: requestId }
  })

  console.log(`[MUSICADJ] Solicitud ${requestId} eliminada`)
  return { success: true }
}

/**
 * Reordena la cola de solicitudes
 */
export async function reorderQueue(eventId: string, requestIds: string[]) {
  // Actualizar prioridades en orden inverso (mayor prioridad = primero)
  const updates = requestIds.map((id, index) => 
    prisma.songRequest.update({
      where: { id },
      data: { priority: requestIds.length - index }
    })
  )

  await prisma.$transaction(updates)
  
  console.log(`[MUSICADJ] Cola reordenada: ${requestIds.length} items`)
  return { success: true, order: requestIds }
}

/**
 * Obtiene estadísticas del módulo para un evento
 */
export async function getStats(eventId: string) {
  const stats = await prisma.songRequest.groupBy({
    by: ['status'],
    where: { eventId },
    _count: { status: true }
  })

  const total = await prisma.songRequest.count({ where: { eventId } })

  const byStatus = stats.reduce((acc, curr) => {
    acc[curr.status as SongRequestStatus] = curr._count.status
    return acc
  }, {} as Record<SongRequestStatus, number>)

  return {
    total,
    byStatus: {
      PENDING: byStatus.PENDING || 0,
      HIGHLIGHTED: byStatus.HIGHLIGHTED || 0,
      URGENT: byStatus.URGENT || 0,
      PLAYED: byStatus.PLAYED || 0,
      DISCARDED: byStatus.DISCARDED || 0
    }
  }
}

// ============================================
// Error Class
// ============================================

export class MusicadjError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'MusicadjError'
  }
}
