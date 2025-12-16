/**
 * MUSICADJ Service (v1.4)
 * Lógica de negocio para solicitudes musicales con Participant model
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
 * Verifica si el participant puede hacer un nuevo pedido (cooldown)
 */
async function checkCooldown(eventId: string, participantId: string, cooldownSeconds: number): Promise<boolean> {
  if (cooldownSeconds === 0) return true

  const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000)

  const recentRequest = await prisma.songRequest.findFirst({
    where: {
      eventId,
      participantId,
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

  // Verificar que el participant existe
  const participant = await prisma.participant.findUnique({
    where: { id: validated.participantId }
  })

  if (!participant) {
    throw new MusicadjError('Participant no encontrado', 404)
  }

  // Verificar cooldown
  await checkCooldown(eventId, validated.participantId, config.cooldownSeconds)

  // Verificar si Spotify es requerido
  if (!config.allowWithoutSpotify && !validated.spotifyId) {
    throw new MusicadjError('Debes seleccionar una canción de Spotify', 400)
  }

  // Crear solicitud
  const request = await prisma.songRequest.create({
    data: {
      eventId,
      participantId: validated.participantId,
      spotifyId: validated.spotifyId,
      title: validated.title,
      artist: validated.artist,
      albumArtUrl: validated.albumArtUrl,
      status: 'PENDING',
      priority: 0
    },
    include: {
      participant: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
    }
  })

  console.log(`[MUSICADJ] Nueva solicitud: "${validated.title}" por ${participant.displayName} (${participant.email})`)

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
      participant: {
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
  const { status, search, limit, offset, excludePlaylistTracks } = query

  const where: any = { eventId }

  if (status) {
    where.status = status
  }

  // Por defecto excluir tracks que vienen de playlists importadas
  if (excludePlaylistTracks) {
    where.fromClientPlaylist = false
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { artist: { contains: search, mode: 'insensitive' } },
      { participant: { displayName: { contains: search, mode: 'insensitive' } } },
      { participant: { email: { contains: search, mode: 'insensitive' } } }
    ]
  }

  const [requests, total] = await Promise.all([
    prisma.songRequest.findMany({
      where,
      include: {
        participant: {
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
      participant: {
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
 * Obtiene o crea el participant especial del sistema para importaciones
 */
async function getOrCreateSystemParticipant(): Promise<string> {
  const SYSTEM_EMAIL = 'system-import@euforia.internal'
  const SYSTEM_NAME = 'IMPORTACION'

  let systemParticipant = await prisma.participant.findUnique({
    where: { email: SYSTEM_EMAIL }
  })

  if (!systemParticipant) {
    systemParticipant = await prisma.participant.create({
      data: {
        email: SYSTEM_EMAIL,
        displayName: SYSTEM_NAME,
        isSystemParticipant: true
      }
    })
    console.log('[MUSICADJ] Participant del sistema creado:', SYSTEM_NAME)
  }

  return systemParticipant.id
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
    participantId?: string
  } = {}
) {
  const { createRequests = false } = options
  let { participantId } = options

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
    where: { spotifyPlaylistId },
    include: {
      _count: {
        select: { songRequests: true }
      }
    }
  })

  if (existingPlaylist && existingPlaylist.eventId === eventId) {
    // Si existe pero no tiene requests (importación fallida), permitir eliminar y reimportar
    if (existingPlaylist._count.songRequests === 0) {
      console.log('[MUSICADJ] Playlist existente sin requests, eliminando registro corrupto...')
      await prisma.clientPlaylist.delete({
        where: { id: existingPlaylist.id }
      })
    } else {
      throw new MusicadjError('Esta playlist ya fue importada a este evento', 409)
    }
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

  // Crear el registro de ClientPlaylist con los tracks guardados en JSON
  const clientPlaylist = await prisma.clientPlaylist.create({
    data: {
      eventId,
      spotifyPlaylistId,
      name: playlistData.playlistName,
      description: playlistData.playlistDescription,
      trackCount: playlistData.totalTracks,
      tracksData: JSON.stringify(playlistData.tracks), // Guardar tracks como JSON
      importedBy: userId
    }
  })

  console.log(
    `[MUSICADJ] Playlist importada: "${playlistData.playlistName}" (${playlistData.totalTracks} tracks)`
  )

  let createdRequests: any[] = []

  // Opcionalmente crear song requests
  if (createRequests) {
    // Si no se proporciona participantId, usar el participant del sistema
    if (!participantId) {
      participantId = await getOrCreateSystemParticipant()
      console.log('[MUSICADJ] Usando participant del sistema para requests de playlist importada')
    } else {
      // Verificar que el participant proporcionado existe
      const participant = await prisma.participant.findUnique({
        where: { id: participantId }
      })

      if (!participant) {
        throw new MusicadjError('Participant no encontrado', 404)
      }
    }

    // Crear requests en batch (participantId está garantizado por el código anterior)
    const requestsData = playlistData.tracks.map((track) => ({
      eventId,
      participantId: participantId!,
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
      data: requestsData
    })

    // Obtener los requests creados para retornar
    createdRequests = await prisma.songRequest.findMany({
      where: {
        eventId,
        playlistId: clientPlaylist.id
      },
      include: {
        participant: {
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
 * Obtiene los tracks de una playlist específica
 */
export async function getPlaylistTracks(eventId: string, playlistId: string) {
  // Verificar que la playlist existe y pertenece al evento
  const playlist = await prisma.clientPlaylist.findFirst({
    where: {
      id: playlistId,
      eventId
    }
  })

  if (!playlist) {
    throw new MusicadjError('Playlist no encontrada', 404)
  }

  // Primero intentar obtener los SongRequests creados de esta playlist
  const songRequests = await prisma.songRequest.findMany({
    where: {
      playlistId,
      eventId
    },
    include: {
      participant: {
        select: {
          id: true,
          displayName: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'asc' }
  })

  // Si hay SongRequests, devolver esos
  if (songRequests.length > 0) {
    return {
      playlist,
      tracks: songRequests,
      tracksCount: songRequests.length
    }
  }

  // Si no hay SongRequests, devolver los tracks guardados en tracksData (JSON)
  if (playlist.tracksData) {
    try {
      const tracksFromJSON = JSON.parse(playlist.tracksData)
      // Formatear los tracks para que tengan la misma estructura que SongRequest
      const formattedTracks = tracksFromJSON.map((track: any, index: number) => ({
        id: `track-${index}`,
        spotifyId: track.spotifyId,
        title: track.title,
        artist: track.artist,
        albumArtUrl: track.albumArtUrl,
        status: 'N/A', // No es un request real
        fromClientPlaylist: true,
        participant: null // No tiene participant porque no se creó como request
      }))

      return {
        playlist,
        tracks: formattedTracks,
        tracksCount: formattedTracks.length
      }
    } catch (error) {
      console.error('[MUSICADJ] Error parsing tracksData:', error)
    }
  }

  // Si no hay ni requests ni tracksData, devolver vacío
  return {
    playlist,
    tracks: [],
    tracksCount: 0
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
