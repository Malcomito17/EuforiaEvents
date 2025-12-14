/**
 * KARAOKEYA Service (v1.4)
 * Lógica de negocio para karaoke con búsqueda híbrida (BD + YouTube)
 */

import { PrismaClient } from '@prisma/client'
import { searchKaraokeVideos, YouTubeVideo, getVideoById } from './youtube.service'
import { sendNotification, isTwilioConfigured } from '../../shared/services/notifications.service'
import { listSongsQuerySchema } from './karaokeya.types'

const prisma = new PrismaClient()

// ============================================
// Types
// ============================================

interface HybridSearchResult {
  fromCatalog: CatalogSong[]
  fromYouTube: YouTubeVideo[]
  query: string
}

interface CatalogSong extends YouTubeVideo {
  catalogId: string
  timesRequested: number
  isPopular: true
}

interface CreateKaraokeRequestInput {
  guestId: string
  songId?: string // Si viene del catálogo
  youtubeId?: string // Si viene de búsqueda directa
  title: string
  artist?: string
}

// ============================================
// Config Operations
// ============================================

/**
 * Obtiene o crea la configuración del módulo para un evento
 */
export async function getOrCreateConfig(eventId: string) {
  let config = await prisma.karaokeyaConfig.findUnique({
    where: { eventId }
  })

  if (!config) {
    config = await prisma.karaokeyaConfig.create({
      data: { eventId }
    })
    console.log(`[KARAOKEYA] Config creada para evento ${eventId}`)
  }

  return config
}

/**
 * Actualiza la configuración del módulo
 */
export async function updateConfig(eventId: string, input: any) {
  // Asegurar que existe
  await getOrCreateConfig(eventId)

  const config = await prisma.karaokeyaConfig.update({
    where: { eventId },
    data: input
  })

  console.log(`[KARAOKEYA] Config actualizada para evento ${eventId}`)

  return config
}

// ============================================
// Hybrid Search
// ============================================

/**
 * Búsqueda híbrida: primero en BD (3 populares), luego YouTube (5 nuevos)
 */
export async function hybridSearch(
  eventId: string,
  query: string
): Promise<HybridSearchResult> {
  if (!query.trim()) {
    return { fromCatalog: [], fromYouTube: [], query }
  }

  // 1. Obtener configuración para keywords de YouTube
  const config = await getOrCreateConfig(eventId)
  const youtubeKeywords = config.youtubeSearchKeywords
    ? JSON.parse(config.youtubeSearchKeywords)
    : ['letra', 'lyrics']

  // 2. Buscar en catálogo (BD)
  const catalogResults = await searchInCatalog(query, 3)

  // 3. Buscar en YouTube (5 resultados) - con manejo de errores
  let filteredYouTubeResults: YouTubeVideo[] = []
  try {
    const youtubeResults = await searchKaraokeVideos(query, youtubeKeywords, 5)

    // 4. Filtrar duplicados de YouTube que ya están en el catálogo
    const catalogYoutubeIds = new Set(catalogResults.map(song => song.youtubeId))
    filteredYouTubeResults = youtubeResults.videos.filter(
      video => !catalogYoutubeIds.has(video.youtubeId)
    )
  } catch (error) {
    console.warn('[KARAOKEYA] YouTube search failed, returning catalog only:', error instanceof Error ? error.message : String(error))
  }

  console.log(
    `[KARAOKEYA] Búsqueda "${query}": ${catalogResults.length} del catálogo, ${filteredYouTubeResults.length} de YouTube`
  )

  return {
    fromCatalog: catalogResults,
    fromYouTube: filteredYouTubeResults,
    query
  }
}

/**
 * Busca en el catálogo de canciones (BD)
 * Ordena por popularidad (timesRequested DESC)
 */
async function searchInCatalog(query: string, limit: number = 3): Promise<CatalogSong[]> {
  const songs = await prisma.karaokeSong.findMany({
    where: {
      AND: [
        { isActive: true },
        {
          OR: [
            { title: { contains: query } },
            { artist: { contains: query } }
          ]
        }
      ]
    },
    orderBy: { timesRequested: 'desc' },
    take: limit
  })

  // Mapear a formato compatible con YouTubeVideo
  return songs.map(song => ({
    catalogId: song.id,
    youtubeId: song.youtubeId,
    title: song.title,
    artist: song.artist,
    youtubeShareUrl: song.youtubeShareUrl,
    thumbnailUrl: song.thumbnailUrl,
    duration: song.duration,
    channelTitle: '',
    timesRequested: song.timesRequested,
    isPopular: true as const
  }))
}

// ============================================
// Catalog Operations
// ============================================

/**
 * Agrega una canción al catálogo (o incrementa contador si ya existe)
 */
export async function addToCatalog(
  youtubeId: string,
  metadata?: {
    title?: string
    artist?: string
    youtubeShareUrl?: string
    thumbnailUrl?: string | null
    duration?: number | null
    language?: string
  }
): Promise<string> {
  // 1. Verificar si ya existe
  const existing = await prisma.karaokeSong.findUnique({
    where: { youtubeId }
  })

  if (existing) {
    // Incrementar contador
    await prisma.karaokeSong.update({
      where: { id: existing.id },
      data: { timesRequested: existing.timesRequested + 1 }
    })
    console.log(`[KARAOKEYA] Canción "${existing.title}" ya existe, contador: ${existing.timesRequested + 1}`)
    return existing.id
  }

  // 2. Si no existe, obtener metadatos de YouTube si no se proveyeron
  let songData = metadata
  if (!songData) {
    const video = await getVideoById(youtubeId)
    if (!video) {
      throw new KaraokeyaError('Video de YouTube no encontrado', 404)
    }
    songData = {
      title: video.title,
      artist: video.artist,
      youtubeShareUrl: video.youtubeShareUrl,
      thumbnailUrl: video.thumbnailUrl,
      duration: video.duration,
      language: 'ES'
    }
  }

  // 3. Crear nueva canción
  const song = await prisma.karaokeSong.create({
    data: {
      youtubeId,
      title: songData.title || 'Sin título',
      artist: songData.artist || 'Desconocido',
      youtubeShareUrl: songData.youtubeShareUrl || `https://youtu.be/${youtubeId}`,
      thumbnailUrl: songData.thumbnailUrl,
      duration: songData.duration,
      language: songData.language || 'ES',
      timesRequested: 1 // Inicia en 1
    }
  })

  console.log(`[KARAOKEYA] Nueva canción agregada al catálogo: "${song.title}" - ${song.artist}`)

  return song.id
}

/**
 * Obtiene una canción del catálogo
 */
export async function getCatalogSong(songId: string) {
  const song = await prisma.karaokeSong.findUnique({
    where: { id: songId },
    include: {
      _count: {
        select: { requests: true, likes: true },
      },
    },
  })

  if (!song) {
    throw new KaraokeyaError('Canción no encontrada', 404)
  }

  return song
}

/**
 * Lista canciones populares del catálogo filtradas por evento
 */
export async function getPopularSongs(eventId: string, limit: number = 10) {
  // Obtener los IDs de canciones solicitadas en este evento
  const requestsInEvent = await prisma.karaokeRequest.findMany({
    where: { eventId },
    select: { songId: true },
    distinct: ['songId']
  })

  const songIds = requestsInEvent
    .map(r => r.songId)
    .filter((id): id is string => id !== null)

  if (songIds.length === 0) {
    // Si no hay canciones en este evento, devolver las más populares globalmente
    return await prisma.karaokeSong.findMany({
      where: { isActive: true },
      orderBy: { timesRequested: 'desc' },
      take: limit
    })
  }

  // Obtener canciones populares específicas de este evento
  const songs = await prisma.karaokeSong.findMany({
    where: {
      id: { in: songIds },
      isActive: true
    },
    orderBy: { timesRequested: 'desc' },
    take: limit
  })

  return songs
}

/**
 * Sugerencias inteligentes basadas en contexto del evento y guest
 * Combina: popularidad en el evento, historial personal, tipo de evento
 */
export async function getSmartSuggestions(
  eventId: string,
  guestId?: string,
  limit: number = 5
) {
  const suggestions: any[] = []

  // 1. Obtener contexto del evento
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { eventData: true }
  })

  const eventType = event?.eventData?.eventType || 'OTHER'

  // 2. Si hay guest, obtener su historial personal (últimas 3 canciones)
  if (guestId) {
    const guestHistory = await prisma.karaokeRequest.findMany({
      where: { guestId, songId: { not: null } },
      include: { song: true },
      orderBy: { createdAt: 'desc' },
      take: 3
    })

    // Agregar canciones similares al historial del guest (mismo artista o género)
    for (const request of guestHistory) {
      if (request.song) {
        const similarSongs = await prisma.karaokeSong.findMany({
          where: {
            artist: request.song.artist,
            id: { not: request.song.id }, // No sugerir la misma canción
            isActive: true
          },
          orderBy: { timesRequested: 'desc' },
          take: 1
        })

        suggestions.push(...similarSongs.map(s => ({
          ...s,
          catalogId: s.id,
          isPopular: true,
          timesRequested: s.timesRequested || 0,
          ranking: s.ranking,
          difficulty: s.difficulty,
          opinion: s.opinion,
          likesCount: s.likesCount,
          reason: 'similar_to_your_picks'
        })))
      }
    }
  }

  // 3. Canciones populares en eventos del mismo tipo
  const similarEvents = await prisma.event.findMany({
    where: {
      eventData: {
        eventType: eventType
      },
      id: { not: eventId }
    },
    select: { id: true },
    take: 10 // Últimos 10 eventos del mismo tipo
  })

  if (similarEvents.length > 0) {
    const similarEventIds = similarEvents.map(e => e.id)

    // Obtener canciones populares en esos eventos
    const popularInSimilarEvents = await prisma.karaokeRequest.groupBy({
      by: ['songId'],
      where: {
        eventId: { in: similarEventIds },
        songId: { not: null }
      },
      _count: { songId: true },
      orderBy: { _count: { songId: 'desc' } },
      take: 5
    })

    const songIds = popularInSimilarEvents
      .map(r => r.songId)
      .filter((id): id is string => id !== null)

    if (songIds.length > 0) {
      const songs = await prisma.karaokeSong.findMany({
        where: { id: { in: songIds }, isActive: true }
      })
      suggestions.push(...songs.map(s => ({
        ...s,
        catalogId: s.id,
        isPopular: true,
        timesRequested: s.timesRequested || 0,
        ranking: s.ranking,
        difficulty: s.difficulty,
        opinion: s.opinion,
        likesCount: s.likesCount,
        reason: `popular_in_${eventType.toLowerCase()}_events`
      })))
    }
  }

  // 4. Canciones populares en el evento actual
  const eventPopular = await getPopularSongs(eventId, 3)
  suggestions.push(...eventPopular.map(s => ({
    ...s,
    catalogId: s.id,
    isPopular: true,
    timesRequested: s.timesRequested || 0,
    ranking: s.ranking,
    difficulty: s.difficulty,
    opinion: s.opinion,
    likesCount: s.likesCount,
    reason: 'popular_in_this_event'
  })))

  // 5. Trending global (las más solicitadas recientemente en todos los eventos)
  const recentGlobal = await prisma.karaokeRequest.groupBy({
    by: ['songId'],
    where: {
      songId: { not: null },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Últimos 30 días
      }
    },
    _count: { songId: true },
    orderBy: { _count: { songId: 'desc' } },
    take: 5
  })

  const trendingSongIds = recentGlobal
    .map(r => r.songId)
    .filter((id): id is string => id !== null)

  if (trendingSongIds.length > 0) {
    const trendingSongs = await prisma.karaokeSong.findMany({
      where: { id: { in: trendingSongIds }, isActive: true }
    })
    suggestions.push(...trendingSongs.map(s => ({
      ...s,
      catalogId: s.id,
      isPopular: true,
      timesRequested: s.timesRequested || 0,
      ranking: s.ranking,
      difficulty: s.difficulty,
      opinion: s.opinion,
      likesCount: s.likesCount,
      reason: 'trending_now'
    })))
  }

  // 6. Deduplicar y diversificar (evitar repetir artistas)
  const seenSongIds = new Set<string>()
  const seenArtists = new Set<string>()
  const finalSuggestions: any[] = []

  for (const suggestion of suggestions) {
    // Saltar si ya tenemos esta canción
    if (seenSongIds.has(suggestion.id)) continue

    // Saltar si ya tenemos 2+ canciones de este artista (diversidad)
    const artistCount = finalSuggestions.filter(s => s.artist === suggestion.artist).length
    if (artistCount >= 2) continue

    seenSongIds.add(suggestion.id)
    seenArtists.add(suggestion.artist)
    finalSuggestions.push(suggestion)

    if (finalSuggestions.length >= limit) break
  }

  console.log(`[KARAOKEYA] Smart suggestions generadas: ${finalSuggestions.length} canciones`)

  return finalSuggestions
}

// ============================================
// Karaoke Request Operations
// ============================================

/**
 * Crea una nueva solicitud de karaoke
 */
export async function createRequest(eventId: string, input: CreateKaraokeRequestInput) {
  // Verificar que el evento existe y está activo
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { karaokeyaConfig: true }
  })

  if (!event) {
    throw new KaraokeyaError('Evento no encontrado', 404)
  }

  if (event.status !== 'ACTIVE') {
    throw new KaraokeyaError('El evento no está activo', 400)
  }

  // Verificar que el módulo está habilitado
  const config = event.karaokeyaConfig || await getOrCreateConfig(eventId)
  if (!config.enabled) {
    throw new KaraokeyaError('El módulo de karaoke no está habilitado', 400)
  }

  // Verificar que el guest existe
  const guest = await prisma.guest.findUnique({
    where: { id: input.guestId }
  })

  if (!guest) {
    throw new KaraokeyaError('Guest no encontrado', 404)
  }

  // Verificar cooldown
  await checkCooldown(eventId, input.guestId, config.cooldownSeconds)

  // Verificar límite de canciones por persona
  if (config.maxPerPerson > 0) {
    const count = await prisma.karaokeRequest.count({
      where: {
        eventId,
        guestId: input.guestId,
        status: { in: ['QUEUED', 'CALLED', 'ON_STAGE'] }
      }
    })

    if (count >= config.maxPerPerson) {
      throw new KaraokeyaError(
        `Alcanzaste el límite de ${config.maxPerPerson} canciones por persona`,
        429
      )
    }
  }

  // Determinar songId (agregar al catálogo si viene de YouTube)
  let songId = input.songId
  if (!songId && input.youtubeId) {
    songId = await addToCatalog(input.youtubeId, {
      title: input.title,
      artist: input.artist
    })
  }

  // Obtener el siguiente número de turno
  const lastRequest = await prisma.karaokeRequest.findFirst({
    where: { eventId },
    orderBy: { turnNumber: 'desc' }
  })
  const turnNumber = (lastRequest?.turnNumber || 0) + 1

  // Obtener la siguiente posición en cola
  const queuePosition = await getNextQueuePosition(eventId)

  // Crear solicitud
  const request = await prisma.karaokeRequest.create({
    data: {
      eventId,
      guestId: input.guestId,
      songId,
      title: input.title,
      artist: input.artist,
      turnNumber,
      queuePosition,
      status: 'QUEUED'
    },
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true,
          whatsapp: true
        }
      },
      song: true
    }
  })

  console.log(`[KARAOKEYA] Nueva solicitud: "${input.title}" por ${guest.displayName} (turno #${turnNumber})`)

  return request
}

/**
 * Obtiene la siguiente posición en la cola
 */
async function getNextQueuePosition(eventId: string): Promise<number> {
  const lastInQueue = await prisma.karaokeRequest.findFirst({
    where: {
      eventId,
      status: { in: ['QUEUED', 'CALLED'] }
    },
    orderBy: { queuePosition: 'desc' }
  })

  return (lastInQueue?.queuePosition || 0) + 1
}

/**
 * Verifica el cooldown para un guest
 */
async function checkCooldown(eventId: string, guestId: string, cooldownSeconds: number): Promise<boolean> {
  if (cooldownSeconds === 0) return true

  const cutoffTime = new Date(Date.now() - cooldownSeconds * 1000)

  const recentRequest = await prisma.karaokeRequest.findFirst({
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
    throw new KaraokeyaError(
      `Debes esperar ${remainingSeconds} segundos antes de pedir otro tema`,
      429
    )
  }

  return true
}

/**
 * Lista solicitudes de karaoke de un evento
 */
export async function listRequests(eventId: string, status?: string) {
  const where: any = { eventId }

  if (status) {
    where.status = status
  }

  const requests = await prisma.karaokeRequest.findMany({
    where,
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true,
          whatsapp: true
        }
      },
      song: true
    },
    orderBy: { queuePosition: 'asc' }
  })

  return requests
}

/**
 * Obtiene las solicitudes de un guest específico
 */
export async function getGuestRequests(eventId: string, guestId: string) {
  return await prisma.karaokeRequest.findMany({
    where: {
      eventId,
      guestId
    },
    include: {
      song: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

/**
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
export async function getPublicQueue(eventId: string) {
  return await prisma.karaokeRequest.findMany({
    where: {
      eventId,
      status: {
        in: ['QUEUED', 'CALLED', 'ON_STAGE']
      }
    },
    include: {
      song: true,
      guest: {
        select: {
          id: true,
          displayName: true
        }
      }
    },
    orderBy: [
      { queuePosition: 'asc' },
      { createdAt: 'asc' }
    ]
  })
}

/**
 * Obtiene una solicitud específica
 */
export async function getRequestById(eventId: string, requestId: string) {
  const request = await prisma.karaokeRequest.findFirst({
    where: {
      id: requestId,
      eventId
    },
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true,
          whatsapp: true
        }
      },
      song: true
    }
  })

  if (!request) {
    throw new KaraokeyaError('Solicitud no encontrada', 404)
  }

  return request
}

/**
 * Actualiza el estado de una solicitud
 */
export async function updateRequestStatus(
  eventId: string,
  requestId: string,
  status: string
) {
  await getRequestById(eventId, requestId)

  const updateData: any = { status }

  if (status === 'CALLED') {
    updateData.calledAt = new Date()
  }

  const request = await prisma.karaokeRequest.update({
    where: { id: requestId },
    data: updateData,
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
          email: true,
          whatsapp: true
        }
      },
      song: true
    }
  })

  console.log(`[KARAOKEYA] Request ${requestId} actualizado a ${status}`)

  // Enviar notificación por WhatsApp/SMS si el status es CALLED
  // (solo si Twilio está configurado - es opcional)
  if (status === 'CALLED' && request.guest.whatsapp && isTwilioConfigured()) {
    const message = `🎤 ¡Hola ${request.guest.displayName}! Es tu turno de cantar "${request.title}"${request.artist ? ` - ${request.artist}` : ''}. ¡Acercate al escenario! 🎉`

    // Enviar notificación de forma asíncrona (no bloqueante)
    sendNotification({
      phoneNumber: request.guest.whatsapp,
      message,
      preferWhatsApp: true
    }).catch(error => {
      console.error(`[KARAOKEYA] Error al enviar notificación a ${request.guest.displayName}:`, error)
    })
  }

  return request
}

/**
 * Elimina una solicitud
 * @param guestId - ID del guest (si viene de cliente público)
 * @param isOperator - true si es operador autenticado
 */
export async function deleteRequest(
  eventId: string,
  requestId: string,
  guestId?: string,
  isOperator: boolean = false
) {
  const request = await getRequestById(eventId, requestId)

  // Si no es operador, validar que el guest sea dueño del pedido
  if (!isOperator) {
    if (!guestId) {
      throw new KaraokeyaError('Se requiere guestId para cancelar el pedido', 400)
    }

    if (request.guestId !== guestId) {
      throw new KaraokeyaError('No podés cancelar un pedido que no es tuyo', 403)
    }
  }

  await prisma.karaokeRequest.delete({
    where: { id: requestId }
  })

  console.log(`[KARAOKEYA] Request ${requestId} eliminado${guestId ? ` por guest ${guestId}` : ' por operador'}`)

  return { success: true }
}

/**
 * Reordena la cola
 */
export async function reorderQueue(eventId: string, requestIds: string[]) {
  const updates = requestIds.map((id, index) =>
    prisma.karaokeRequest.update({
      where: { id },
      data: { queuePosition: index + 1 }
    })
  )

  await prisma.$transaction(updates)

  console.log(`[KARAOKEYA] Cola reordenada: ${requestIds.length} items`)

  return { success: true, order: requestIds }
}

/**
 * Obtiene estadísticas del módulo
 */
export async function getStats(eventId: string) {
  const stats = await prisma.karaokeRequest.groupBy({
    by: ['status'],
    where: { eventId },
    _count: { status: true }
  })

  const total = await prisma.karaokeRequest.count({ where: { eventId } })

  const byStatus = stats.reduce((acc, curr) => {
    acc[curr.status] = curr._count.status
    return acc
  }, {} as Record<string, number>)

  return {
    total,
    queued: byStatus.QUEUED || 0,
    called: byStatus.CALLED || 0,
    onStage: byStatus.ON_STAGE || 0,
    completed: byStatus.COMPLETED || 0,
    noShow: byStatus.NO_SHOW || 0,
    cancelled: byStatus.CANCELLED || 0
  }
}

// ============================================
// CATALOG MANAGEMENT (CRUD)
// ============================================

/**
 * Lista canciones del catálogo con filtros y paginación
 */
export async function listCatalogSongs(filters: any) {
  // Parse and validate query parameters (converts strings to proper types)
  const parsed = listSongsQuerySchema.parse(filters)

  const {
    search,
    difficulty,
    minRanking,
    language,
    sortBy,
    sortOrder,
    includeInactive,
    limit,
    offset,
  } = parsed

  const where: any = {}

  if (!includeInactive) {
    where.isActive = true
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { artist: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (difficulty) {
    where.difficulty = difficulty
  }

  if (minRanking) {
    where.ranking = { gte: minRanking }
  }

  if (language) {
    where.language = language
  }

  const orderBy: any = {}
  orderBy[sortBy] = sortOrder

  const [songs, total] = await Promise.all([
    prisma.karaokeSong.findMany({
      where,
      orderBy,
      take: limit,
      skip: offset,
      include: {
        _count: {
          select: { requests: true, likes: true },
        },
      },
    }),
    prisma.karaokeSong.count({ where }),
  ])

  return {
    songs,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + songs.length < total,
    },
  }
}

/**
 * Crea una nueva canción en el catálogo
 */
export async function createCatalogSong(input: any) {
  // Verificar que no exista el youtubeId
  const existing = await prisma.karaokeSong.findUnique({
    where: { youtubeId: input.youtubeId },
  })

  if (existing) {
    throw new KaraokeyaError('Ya existe una canción con ese YouTube ID', 409)
  }

  // Auto-generar youtubeShareUrl si no se proporciona
  if (!input.youtubeShareUrl) {
    input.youtubeShareUrl = `https://youtu.be/${input.youtubeId}`
  }

  const song = await prisma.karaokeSong.create({
    data: input,
  })

  console.log(`[KARAOKEYA] Canción creada: ${song.id} (${song.title})`)

  return song
}

/**
 * Actualiza una canción del catálogo
 */
export async function updateCatalogSong(songId: string, input: any) {
  // Verificar que existe
  const existing = await prisma.karaokeSong.findUnique({
    where: { id: songId },
  })

  if (!existing) {
    throw new KaraokeyaError('Canción no encontrada', 404)
  }

  // Si se cambia youtubeId, verificar que no exista
  if (input.youtubeId && input.youtubeId !== existing.youtubeId) {
    const duplicate = await prisma.karaokeSong.findUnique({
      where: { youtubeId: input.youtubeId },
    })

    if (duplicate) {
      throw new KaraokeyaError('Ya existe una canción con ese YouTube ID', 409)
    }
  }

  const song = await prisma.karaokeSong.update({
    where: { id: songId },
    data: input,
  })

  console.log(`[KARAOKEYA] Canción actualizada: ${song.id}`)

  return song
}

/**
 * Soft delete de una canción
 */
export async function deleteCatalogSong(songId: string) {
  const existing = await prisma.karaokeSong.findUnique({
    where: { id: songId },
  })

  if (!existing) {
    throw new KaraokeyaError('Canción no encontrada', 404)
  }

  const song = await prisma.karaokeSong.update({
    where: { id: songId },
    data: { isActive: false },
  })

  console.log(`[KARAOKEYA] Canción desactivada: ${song.id}`)

  return { message: 'Canción desactivada correctamente', song }
}

/**
 * Reactivar una canción
 */
export async function reactivateCatalogSong(songId: string) {
  const existing = await prisma.karaokeSong.findUnique({
    where: { id: songId },
  })

  if (!existing) {
    throw new KaraokeyaError('Canción no encontrada', 404)
  }

  const song = await prisma.karaokeSong.update({
    where: { id: songId },
    data: { isActive: true },
  })

  console.log(`[KARAOKEYA] Canción reactivada: ${song.id}`)

  return song
}

// ============================================
// LIKE SYSTEM
// ============================================

/**
 * Toggle like (idempotente): si existe lo elimina, si no existe lo crea
 * Actualiza el contador likesCount
 */
export async function toggleSongLike(songId: string, guestId: string) {
  // Verificar que exista la canción
  const song = await prisma.karaokeSong.findUnique({
    where: { id: songId },
  })

  if (!song) {
    throw new KaraokeyaError('Canción no encontrada', 404)
  }

  // Verificar que exista el guest
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
  })

  if (!guest) {
    throw new KaraokeyaError('Invitado no encontrado', 404)
  }

  // Buscar like existente
  const existingLike = await prisma.karaokeSongLike.findUnique({
    where: {
      songId_guestId: { songId, guestId },
    },
  })

  let liked: boolean
  let likesCount: number

  if (existingLike) {
    // UNLIKE: Eliminar el like y decrementar contador
    await prisma.$transaction([
      prisma.karaokeSongLike.delete({
        where: { id: existingLike.id },
      }),
      prisma.karaokeSong.update({
        where: { id: songId },
        data: { likesCount: { decrement: 1 } },
      }),
    ])
    liked = false
    likesCount = Math.max(0, song.likesCount - 1)
    console.log(`[KARAOKEYA] Unlike: ${guestId} → ${songId}`)
  } else {
    // LIKE: Crear el like e incrementar contador
    await prisma.$transaction([
      prisma.karaokeSongLike.create({
        data: { songId, guestId },
      }),
      prisma.karaokeSong.update({
        where: { id: songId },
        data: { likesCount: { increment: 1 } },
      }),
    ])
    liked = true
    likesCount = song.likesCount + 1
    console.log(`[KARAOKEYA] Like: ${guestId} → ${songId}`)
  }

  return {
    liked,
    likesCount,
  }
}

/**
 * Obtiene el estado de like de un guest para una canción
 */
export async function getSongLikeStatus(songId: string, guestId: string) {
  const like = await prisma.karaokeSongLike.findUnique({
    where: {
      songId_guestId: { songId, guestId },
    },
  })

  return {
    liked: !!like,
  }
}

/**
 * Obtiene todas las canciones que le gustaron a un guest
 */
export async function getGuestLikedSongs(guestId: string, limit: number = 50) {
  const likes = await prisma.karaokeSongLike.findMany({
    where: { guestId },
    include: {
      song: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  })

  return {
    songs: likes.map((like) => like.song),
    total: likes.length,
  }
}

// ============================================
// DISPLAY SCREEN (Pantalla pública)
// ============================================

/**
 * Obtiene todos los datos necesarios para el Display Screen público
 * Usado por la pantalla grande de karaoke en el evento
 */
export async function getDisplayData(eventSlug: string) {
  // Buscar evento por slug
  const event = await prisma.event.findUnique({
    where: { slug: eventSlug },
    include: {
      eventData: true,
      venue: true,
    },
  })

  if (!event) {
    throw new KaraokeyaError('Evento no encontrado', 404)
  }

  // Obtener configuración de karaokeya
  const config = await getOrCreateConfig(event.id)

  // Obtener requests según el estado (solo mostrar QUEUED, CALLED, ON_STAGE)
  const allRequests = await prisma.karaokeRequest.findMany({
    where: {
      eventId: event.id,
      status: {
        in: ['QUEUED', 'CALLED', 'ON_STAGE'],
      },
    },
    include: {
      guest: {
        select: {
          id: true,
          displayName: true,
        },
      },
      song: {
        select: {
          thumbnailUrl: true,
          youtubeShareUrl: true,
        },
      },
    },
    orderBy: { queuePosition: 'asc' },
  })

  // Separar por estado
  const onStage = allRequests.find((r) => r.status === 'ON_STAGE') || null
  const called = allRequests.find((r) => r.status === 'CALLED') || null
  const queued = allRequests.filter((r) => r.status === 'QUEUED')

  return {
    event: {
      id: event.id,
      slug: event.slug,
      eventName: event.eventData?.eventName || 'Evento',
      eventDate: event.eventData?.eventDate || event.createdAt,
      location: event.venue?.name || 'Venue',
    },
    config: {
      displayMode: config.displayMode,
      displayLayout: config.displayLayout,
      displayBreakMessage: config.displayBreakMessage,
      displayStartMessage: config.displayStartMessage,
      displayPromoImageUrl: config.displayPromoImageUrl,
    },
    queue: {
      onStage,
      called,
      next: queued[0] || null,
      upcoming: queued, // Mostrar TODOS los items QUEUED en la cola
      total: queued.length,
    },
  }
}

// ============================================
// Error Class
// ============================================

export class KaraokeyaError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400
  ) {
    super(message)
    this.name = 'KaraokeyaError'
  }
}
