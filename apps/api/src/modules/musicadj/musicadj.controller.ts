/**
 * MUSICADJ Controller
 * Handlers HTTP con integración Socket.io y Spotify
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { getIOFromRequest } from '../../shared/types'
import { 
  emitNewRequest, 
  emitRequestUpdated, 
  emitRequestDeleted,
  emitQueueReordered,
  emitConfigUpdated
} from '../../socket'
import * as service from './musicadj.service'
import * as spotify from './spotify.service'
import { 
  createSongRequestSchema,
  updateSongRequestSchema,
  reorderQueueSchema,
  musicadjConfigSchema,
  listRequestsQuerySchema
} from './musicadj.types'

// ============================================
// Config Endpoints
// ============================================

/**
 * GET /api/events/:eventId/musicadj/config
 */
export async function getConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const config = await service.getOrCreateConfig(eventId)
    
    // Incluir info de si Spotify está disponible
    res.json({
      ...config,
      spotifyAvailable: spotify.isSpotifyConfigured(),
    })
  } catch (error) {
    next(error)
  }
}

/**
 * PATCH /api/events/:eventId/musicadj/config
 */
export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = musicadjConfigSchema.parse(req.body)
    
    const config = await service.updateConfig(eventId, input)
    
    const io = getIOFromRequest(req)
    emitConfigUpdated(io, eventId, config)
    
    res.json(config)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Spotify Search Endpoints
// ============================================

const searchQuerySchema = z.object({
  q: z.string().min(1).max(100),
  limit: z.coerce.number().int().min(1).max(20).default(10),
})

/**
 * GET /api/events/:eventId/musicadj/search
 * Busca tracks en Spotify (público)
 */
export async function searchSpotify(req: Request, res: Response, next: NextFunction) {
  try {
    const { q, limit } = searchQuerySchema.parse(req.query)
    
    // Verificar si Spotify está configurado
    if (!spotify.isSpotifyConfigured()) {
      return res.status(503).json({
        error: 'Búsqueda de Spotify no disponible',
        spotifyAvailable: false,
      })
    }
    
    const result = await spotify.searchTracks(q, limit)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/track/:trackId
 * Obtiene info de un track específico
 */
export async function getSpotifyTrack(req: Request, res: Response, next: NextFunction) {
  try {
    const { trackId } = req.params
    
    if (!spotify.isSpotifyConfigured()) {
      return res.status(503).json({
        error: 'Spotify no disponible',
        spotifyAvailable: false,
      })
    }
    
    const track = await spotify.getTrackById(trackId)
    
    if (!track) {
      return res.status(404).json({ error: 'Track no encontrado' })
    }
    
    res.json(track)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Song Request Endpoints
// ============================================

/**
 * POST /api/events/:eventId/musicadj/requests
 */
export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = createSongRequestSchema.parse(req.body)
    
    const request = await service.createRequest(eventId, input)
    
    const io = getIOFromRequest(req)
    emitNewRequest(io, eventId, request)
    
    res.status(201).json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/requests
 */
export async function listRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const query = listRequestsQuerySchema.parse(req.query)
    
    const result = await service.listRequests(eventId, query)
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/requests/:requestId
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
 * PATCH /api/events/:eventId/musicadj/requests/:requestId
 */
export async function updateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    const input = updateSongRequestSchema.parse(req.body)
    
    const request = await service.updateRequest(eventId, requestId, input)
    
    const io = getIOFromRequest(req)
    emitRequestUpdated(io, eventId, request)
    
    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/musicadj/requests/:requestId
 */
export async function deleteRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    
    await service.deleteRequest(eventId, requestId)
    
    const io = getIOFromRequest(req)
    emitRequestDeleted(io, eventId, requestId)
    
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/events/:eventId/musicadj/requests/reorder
 */
export async function reorderQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { requestIds } = reorderQueueSchema.parse(req.body)
    
    const result = await service.reorderQueue(eventId, requestIds)
    
    const io = getIOFromRequest(req)
    emitQueueReordered(io, eventId, requestIds)
    
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/stats
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
