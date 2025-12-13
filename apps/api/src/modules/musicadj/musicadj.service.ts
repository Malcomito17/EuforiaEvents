/**
 * MUSICADJ Service (v1.3)
 * Lógica de negocio para solicitudes musicales con Guest model
 */

import { PrismaClient } from '@prisma/client'
import {
  CreateSongRequestInput,
  UpdateSongRequestInput,
  BulkUpdateRequestsInput,
  MusicadjConfigInput,
  ListRequestsQuery,
  SongRequestStatus,
  createSongRequestSchema
} from './musicadj.types'
import { getIO } from '../../socket'
import * as spotifyService from './spotify.service'

const prisma = new PrismaClient()

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

  // Notificar cambios via Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:configUpdated', config)
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible para emitir configUpdated')
  }

  return config
}

// ============================================
// Song Request Operations
// ============================================

/**
 * Verifica si el guest puede hacer un nuevo pedido (cooldown)
 */
async function checkCooldown(eventId: string, guestId: string, cooldownSeconds: number): Promise<boolean> {
  if (cooldownSeconds === 0) return true

  const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000)

  const recentRequest = await prisma.songRequest.findFirst({
    where: {
      eventId,
      guestId,
      createdAt: {
        gte: cutoffTime
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  if (recentRequest) {
    const remainingSeconds = Math.ceil(
      (recentRequest.createdAt.getTime() + cooldownSeconds * 1000 - Date.now()) / 1000
    )
    throw new MusicadjError(
      `Debes esperar ${remainingSeconds} segundos antes de pedir otro tema`,
      429
    )
  }

  return true
}

/**
 * Crea una nueva solicitud de canción
 */
export async function createRequest(eventId: string, input: CreateSongRequestInput) {
  // Validar input
  const validated = createSongRequestSchema.parse(input)

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

  // Verificar que el guest existe
  const guest = await prisma.guest.findUnique({
    where: { id: validated.guestId }
  })

  if (!guest) {
    throw new MusicadjError('Guest no encontrado', 404)
  }

  // Verificar cooldown
  await checkCooldown(eventId, validated.guestId, config.cooldownSeconds)

  // Verificar si Spotify es requerido
  if (!config.allowWithoutSpotify && !validated.spotifyId) {
    throw new MusicadjError('Debes seleccionar una canción de Spotify', 400)
  }

  // Crear solicitud
  const request = await prisma.songRequest.create({
    data: {
      eventId,
      guestId: validated.guestId,
      spotifyId: validated.spotifyId,
      title: validated.title,
      artist: validated.artist,
      albumArtUrl: validated.albumArtUrl,
      status: 'PENDING',
      priority: 0
    },
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
    }
  })

  console.log(`[MUSICADJ] Nueva solicitud: "${validated.title}" por ${guest.displayName} (${guest.email})`)

  // Emitir evento Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:newRequest', request)
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible para emitir newRequest')
  }

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
    },
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
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
  const { status, search, limit, offset } = query

  const where: any = { eventId }

  if (status) {
    where.status = status
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { artist: { contains: search, mode: 'insensitive' } },
      { guest: { displayName: { contains: search, mode: 'insensitive' } } },
      { guest: { email: { contains: search, mode: 'insensitive' } } }
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.songRequest.findMany({
      where,
      include: {
        guest: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'asc' }
      ],
      take: limit,
      skip: offset
    }),
    prisma.songRequest.count({ where })
  ])

  // Obtener stats
  const stats = await getStats(eventId)

  return {
    requests,
    total,
    stats,
    pagination: {
      limit,
      offset,
      hasMore: offset + requests.length < total
    }
  }
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
    data: input,
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
    }
  })

  console.log(`[MUSICADJ] Solicitud ${requestId} actualizada: ${JSON.stringify(input)}`)

  // Emitir evento Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:requestUpdated', request)
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible')
  }

  return request
}

/**
 * Actualiza múltiples solicitudes (bulk)
 */
export async function bulkUpdateRequests(
  eventId: string,
  input: BulkUpdateRequestsInput
) {
  const { requestIds, status, priority } = input

  const updateData: any = {}
  if (status) updateData.status = status
  if (priority !== undefined) updateData.priority = priority

  const result = await prisma.songRequest.updateMany({
    where: {
      id: { in: requestIds },
      eventId
    },
    data: updateData
  })

  console.log(`[MUSICADJ] Bulk update: ${result.count} solicitudes actualizadas`)

  // Emitir evento Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:bulkUpdate', { requestIds, ...updateData })
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible')
  }

  return { success: true, count: result.count }
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

  // Emitir evento Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:requestDeleted', { requestId })
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible')
  }

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

  // Emitir evento Socket.io
  try {
    getIO().to(`event:${eventId}`).emit('musicadj:queueReordered', { order: requestIds })
  } catch (e) {
    console.warn('[MUSICADJ] Socket.io no disponible')
  }

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
    pending: byStatus.PENDING || 0,
    highlighted: byStatus.HIGHLIGHTED || 0,
    urgent: byStatus.URGENT || 0,
    played: byStatus.PLAYED || 0,
    discarded: byStatus.DISCARDED || 0
  }
}

// ============================================
// Playlist Import Operations
// ============================================

/**
 * Obtiene o crea el guest especial del sistema para importaciones
 */
async function getOrCreateSystemGuest(): Promise<string> {
  const SYSTEM_EMAIL = 'system-import@euforia.internal'
  const SYSTEM_NAME = 'IMPORTACION'

  let systemGuest = await prisma.guest.findUnique({
    where: { email: SYSTEM_EMAIL }
  })

  if (!systemGuest) {
    systemGuest = await prisma.guest.create({
      data: {
        email: SYSTEM_EMAIL,
        displayName: SYSTEM_NAME,
        isSystemGuest: true
      }
    })
    console.log('[MUSICADJ] Guest del sistema creado:', SYSTEM_NAME)
  }

  return systemGuest.id
}

/**
 * Importa una playlist de Spotify y opcionalmente crea song requests
 */
export async function importPlaylistToEvent(
  eventId: string,
  spotifyPlaylistId: string,
  userId: string,
  options: {
    createRequests?: boolean
    guestId?: string
  } = {}
) {
  const { createRequests = false } = options
  let { guestId } = options

  // Verificar que el evento existe
  const event = await prisma.event.findUnique({
    where: { id: eventId }
  })

  if (!event) {
    throw new MusicadjError('Evento no encontrado', 404)
  }

  // Verificar que Spotify está configurado
  if (!spotifyService.isSpotifyConfigured()) {
    throw new MusicadjError('Spotify no está configurado en el servidor', 503)
  }

  // Verificar si la playlist ya fue importada
  const existingPlaylist = await prisma.clientPlaylist.findUnique({
    where: { spotifyPlaylistId }
  })

  if (existingPlaylist && existingPlaylist.eventId === eventId) {
    throw new MusicadjError('Esta playlist ya fue importada a este evento', 409)
  }

  // Obtener tracks de Spotify
  console.log(`[MUSICADJ] Importando playlist ${spotifyPlaylistId} al evento ${eventId}...`)

  let playlistData
  try {
    playlistData = await spotifyService.getPlaylistTracks(spotifyPlaylistId)
  } catch (error: any) {
    if (error.statusCode === 404) {
      throw new MusicadjError('Playlist no encontrada en Spotify', 404)
    }
    if (error.statusCode === 403) {
      throw new MusicadjError('La playlist es privada o no tienes acceso', 403)
    }
    throw new MusicadjError(`Error al obtener playlist: ${error.message}`, 502)
  }

  // Crear el registro de ClientPlaylist
  const clientPlaylist = await prisma.clientPlaylist.create({
    data: {
      eventId,
      spotifyPlaylistId,
      name: playlistData.playlistName,
      description: playlistData.playlistDescription,
      trackCount: playlistData.totalTracks,
      importedBy: userId
    }
  })

  console.log(
    `[MUSICADJ] Playlist importada: "${playlistData.playlistName}" (${playlistData.totalTracks} tracks)`
  )

  let createdRequests: any[] = []

  // Opcionalmente crear song requests
  if (createRequests) {
    // Si no se proporciona guestId, usar el guest del sistema
    if (!guestId) {
      guestId = await getOrCreateSystemGuest()
      console.log('[MUSICADJ] Usando guest del sistema para requests de playlist importada')
    } else {
      // Verificar que el guest proporcionado existe
      const guest = await prisma.guest.findUnique({
        where: { id: guestId }
      })

      if (!guest) {
        throw new MusicadjError('Guest no encontrado', 404)
      }
    }

    // Crear requests en batch
    const requestsData = playlistData.tracks.map((track) => ({
      eventId,
      guestId,
      spotifyId: track.spotifyId,
      title: track.title,
      artist: track.artist,
      albumArtUrl: track.albumArtUrl,
      status: 'PENDING' as const,
      priority: 0,
      playlistId: clientPlaylist.id,
      fromClientPlaylist: true
    }))

    // Usar createMany para inserción en batch
    await prisma.songRequest.createMany({
      data: requestsData,
      skipDuplicates: true
    })

    // Obtener los requests creados para retornar
    createdRequests = await prisma.songRequest.findMany({
      where: {
        eventId,
        playlistId: clientPlaylist.id
      },
      include: {
        guest: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    })

    console.log(
      `[MUSICADJ] ${createdRequests.length} song requests creados desde la playlist`
    )

    // Emitir evento Socket.io para cada request (o un bulk event)
    try {
      getIO().to(`event:${eventId}`).emit('musicadj:playlistImported', {
        playlist: clientPlaylist,
        requestsCount: createdRequests.length
      })
    } catch (e) {
      console.warn('[MUSICADJ] Socket.io no disponible')
    }
  }

  return {
    playlist: clientPlaylist,
    tracksCount: playlistData.totalTracks,
    requestsCreated: createdRequests.length,
    requests: createRequests ? createdRequests : undefined
  }
}

/**
 * Lista las playlists importadas para un evento
 */
export async function listEventPlaylists(eventId: string) {
  const playlists = await prisma.clientPlaylist.findMany({
    where: { eventId },
    include: {
      _count: {
        select: { songRequests: true }
      }
    },
    orderBy: { importedAt: 'desc' }
  })

  return {
    playlists,
    total: playlists.length
  }
}

/**
 * Elimina una playlist importada (soft delete de requests asociados)
 */
export async function deleteEventPlaylist(eventId: string, playlistId: string) {
  const playlist = await prisma.clientPlaylist.findFirst({
    where: {
      id: playlistId,
      eventId
    }
  })

  if (!playlist) {
    throw new MusicadjError('Playlist no encontrada', 404)
  }

  // Eliminar la playlist (cascade eliminará los requests asociados)
  await prisma.clientPlaylist.delete({
    where: { id: playlistId }
  })

  console.log(`[MUSICADJ] Playlist ${playlistId} eliminada`)

  return { success: true }
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
