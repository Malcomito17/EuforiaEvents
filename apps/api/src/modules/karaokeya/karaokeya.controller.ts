/**
 * KARAOKEYA Controller
 * Handlers HTTP con búsqueda híbrida (BD + YouTube)
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getIOFromRequest } from '../../shared/types'
import {
  emitNewKaraokeRequest,
  emitKaraokeRequestUpdated,
  emitKaraokeRequestDeleted,
  emitKaraokeQueueReordered,
  emitKaraokeConfigUpdated
} from '../../socket'
import * as service from './karaokeya.service'
import * as youtube from './youtube.service'
import { getDefaultMessages } from '../../shared/services/messages.service'
import {
  createKaraokeRequestSchema,
  updateKaraokeRequestSchema,
  reorderQueueSchema,
  karaokeyaConfigSchema,
  listRequestsQuerySchema,
  searchQuerySchema,
  popularSongsQuerySchema
} from './karaokeya.types'

// ============================================
// Config Endpoints
// ============================================

/**
 * GET /api/events/:eventId/karaokeya/config
 */
export async function getConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const config = await service.getOrCreateConfig(eventId)

    // Incluir info de si YouTube está disponible
    res.json({
      ...config,
      youtubeAvailable: youtube.isYouTubeConfigured(),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/events/:eventId/karaokeya/config
 */
export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = karaokeyaConfigSchema.parse(req.body)

    const config = await service.updateConfig(eventId, input)

    const io = getIOFromRequest(req)
    emitKaraokeConfigUpdated(io, eventId, config)

    res.json(config)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Search Endpoints
// ============================================

/**
 * GET /api/events/:eventId/karaokeya/search
 * Búsqueda híbrida: BD (3 populares) + YouTube (5 nuevos)
 */
export async function hybridSearch(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { q } = searchQuerySchema.parse(req.query)

    // Permitir búsqueda en catálogo incluso si YouTube no está configurado
    const result = await service.hybridSearch(eventId, q)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/popular
 * Obtiene canciones populares del catálogo filtradas por evento
 */
export async function getPopularSongs(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { limit } = popularSongsQuerySchema.parse(req.query)
    const songs = await service.getPopularSongs(eventId, limit)

    res.json({ songs, total: songs.length })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/suggestions
 * Obtiene sugerencias inteligentes basadas en contexto y guest
 */
export async function getSmartSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const schema = z.object({
      guestId: z.string().cuid().optional(),
      limit: z.coerce.number().int().min(1).max(10).default(5),
    })

    const { guestId, limit } = schema.parse(req.query)
    const suggestions = await service.getSmartSuggestions(eventId, guestId, limit)

    res.json({ suggestions, total: suggestions.length })
  } catch (error) {
    next(error)
  }
}

// ============================================
// Request Endpoints
// ============================================

/**
 * POST /api/events/:eventId/karaokeya/requests
 * Crea una nueva solicitud de karaoke
 */
export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = createKaraokeRequestSchema.parse(req.body)

    const request = await service.createRequest(eventId, input)

    const io = getIOFromRequest(req)
    emitNewKaraokeRequest(io, eventId, request)

    res.status(201).json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/requests
 * Lista solicitudes de un evento
 */
export async function listRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { status } = listRequestsQuerySchema.parse(req.query)
    const requests = await service.listRequests(eventId, status)

    res.json({ requests, total: requests.length })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/guests/:guestId/requests
 * Obtiene solicitudes de un guest específico
 */
export async function getGuestRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, guestId } = req.params

    const requests = await service.getGuestRequests(eventId, guestId)

    res.json({ requests, total: requests.length })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/queue
 * Obtiene la cola pública del evento (solo QUEUED, CALLED, ON_STAGE)
 */
export async function getPublicQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    const requests = await service.getPublicQueue(eventId)

    res.json({ requests, total: requests.length })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/requests/:requestId
 * Obtiene una solicitud específica
 */
export async function getRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params

    const request = await service.getRequestById(eventId, requestId)

    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/events/:eventId/karaokeya/requests/:requestId
 * Actualiza el estado de una solicitud
 */
export async function updateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    const { status } = updateKaraokeRequestSchema.parse(req.body)

    const request = await service.updateRequestStatus(eventId, requestId, status)

    const io = getIOFromRequest(req)
    emitKaraokeRequestUpdated(io, eventId, request)

    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/karaokeya/requests/:requestId
 * Elimina una solicitud
 * Si viene con guestId en el body, valida que sea del guest (público)
 * Si viene autenticado (req.user), permite eliminar cualquier solicitud (operador)
 */
export async function deleteRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    const { guestId } = req.body
    const isOperator = !!(req as any).user

    const result = await service.deleteRequest(eventId, requestId, guestId, isOperator)

    const io = getIOFromRequest(req)
    emitKaraokeRequestDeleted(io, eventId, requestId)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/events/:eventId/karaokeya/requests/reorder
 * Reordena la cola
 */
export async function reorderQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { requestIds } = reorderQueueSchema.parse(req.body)

    const result = await service.reorderQueue(eventId, requestIds)

    const io = getIOFromRequest(req)
    emitKaraokeQueueReordered(io, eventId, requestIds)

    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/stats
 * Obtiene estadísticas del módulo
 */
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params

    const stats = await service.getStats(eventId)

    res.json(stats)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Messages Endpoint
// ============================================

/**
 * GET /api/events/:eventId/karaokeya/messages
 * Obtiene mensajes configurables del módulo
 */
export async function getMessages(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const langSchema = z.object({
      lang: z.enum(['es', 'en', 'formal']).default('es'),
    })

    const { lang } = langSchema.parse(req.query)

    // Obtener config para mensajes custom
    const config = await service.getOrCreateConfig(eventId)

    // Cargar mensajes por defecto
    const defaultMessages = getDefaultMessages('karaokeya', lang)

    // TODO: Merge con customMessages de la config

    res.json(defaultMessages)
  } catch (error) {
    next(error)
  }
}

// ============================================
// CATALOG CRUD CONTROLLERS
// ============================================

export async function listSongs(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.listCatalogSongs(req.query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getSong(req: Request, res: Response, next: NextFunction) {
  try {
    const song = await service.getCatalogSong(req.params.songId)
    res.json(song)
  } catch (error) {
    next(error)
  }
}

export async function createSong(req: Request, res: Response, next: NextFunction) {
  try {
    const song = await service.createCatalogSong(req.body)
    res.status(201).json(song)
  } catch (error) {
    next(error)
  }
}

export async function updateSong(req: Request, res: Response, next: NextFunction) {
  try {
    const song = await service.updateCatalogSong(req.params.songId, req.body)
    res.json(song)
  } catch (error) {
    next(error)
  }
}

export async function deleteSong(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteCatalogSong(req.params.songId)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function reactivateSong(req: Request, res: Response, next: NextFunction) {
  try {
    const song = await service.reactivateCatalogSong(req.params.songId)
    res.json(song)
  } catch (error) {
    next(error)
  }
}

// ============================================
// LIKE SYSTEM CONTROLLERS
// ============================================

export async function toggleLike(req: Request, res: Response, next: NextFunction) {
  try {
    const { songId } = req.params
    const { guestId } = req.body

    if (!guestId) {
      return res.status(400).json({ error: 'guestId es requerido' })
    }

    const result = await service.toggleSongLike(songId, guestId)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getLikeStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { songId } = req.params
    const { guestId } = req.query

    if (!guestId || typeof guestId !== 'string') {
      return res.status(400).json({ error: 'guestId query param es requerido' })
    }

    const result = await service.getSongLikeStatus(songId, guestId)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getGuestLikedSongs(req: Request, res: Response, next: NextFunction) {
  try {
    const { guestId } = req.params
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50

    const result = await service.getGuestLikedSongs(guestId, limit)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

// ============================================
// DISPLAY SCREEN (Pantalla pública)
// ============================================

export async function getDisplay(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventSlug } = req.params
    const data = await service.getDisplayData(eventSlug)
    res.json(data)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Error Handler
// ============================================

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  console.error('[KARAOKEYA] Error:', err)

  if (err.name === 'KaraokeyaError') {
    return res.status(err.statusCode || 400).json({
      error: err.message
    })
  }

  if (err.name === 'YouTubeError') {
    return res.status(err.statusCode || 502).json({
      error: err.message
    })
  }

  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: err.errors
    })
  }

  res.status(500).json({
    error: 'Error interno del servidor'
  })
}
