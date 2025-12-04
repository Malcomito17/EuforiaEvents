/**
 * KARAOKEYA Controller
 * Handlers HTTP con integración Socket.io
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  emitKaraokeNewRequest,
  emitKaraokeStatusChanged,
  emitKaraokeQueueReordered,
  emitKaraokeConfigUpdated,
} from '../../socket'
import * as service from './karaokeya.service'
import {
  createKaraokeRequestSchema,
  updateKaraokeRequestStatusSchema,
  karaokeyaConfigSchema,
  listKaraokeRequestsQuerySchema,
  KaraokeyaError,
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
    res.json(config)
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

    // Emitir evento socket
    emitKaraokeConfigUpdated(req, eventId, config)

    res.json(config)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Request Endpoints (Turnos)
// ============================================

/**
 * POST /api/events/:eventId/karaokeya/requests
 */
export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = createKaraokeRequestSchema.parse(req.body)
    const request = await service.createRequest(eventId, input)

    // Emitir evento socket
    emitKaraokeNewRequest(req, eventId, request)

    res.status(201).json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/requests
 */
export async function listRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const query = listKaraokeRequestsQuerySchema.parse(req.query)
    const result = await service.listRequests(eventId, query)

    res.json({
      data: result.requests,
      meta: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
    })
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/requests/:requestId
 */
export async function getRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { requestId } = req.params
    const request = await service.getRequestById(requestId)

    if (!request) {
      return res.status(404).json({
        error: 'Turno no encontrado',
        code: 'REQUEST_NOT_FOUND',
      })
    }

    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/queue
 */
export async function getQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const queue = await service.getQueue(eventId)
    res.json(queue)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/karaokeya/stats
 */
export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const stats = await service.getQueueStats(eventId)
    res.json(stats)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Status Management
// ============================================

/**
 * PATCH /api/events/:eventId/karaokeya/requests/:requestId
 */
export async function updateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    const { status } = updateKaraokeRequestStatusSchema.parse(req.body)
    const request = await service.updateStatus(requestId, status)

    // Emitir evento socket
    emitKaraokeStatusChanged(req, eventId, request)

    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/events/:eventId/karaokeya/call-next
 */
export async function callNext(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const request = await service.callNext(eventId)

    if (!request) {
      return res.json({
        data: null,
        message: 'No hay turnos en cola',
      })
    }

    // Emitir evento socket
    emitKaraokeStatusChanged(req, eventId, request)

    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/karaokeya/requests/:requestId
 */
export async function deleteRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    
    // Primero obtener el request para el evento socket
    const request = await service.getRequestById(requestId)
    if (!request) {
      return res.status(404).json({
        error: 'Turno no encontrado',
        code: 'REQUEST_NOT_FOUND',
      })
    }

    await service.deleteRequest(requestId)

    // Emitir evento socket (como si fuera cancelado)
    emitKaraokeStatusChanged(req, eventId, { ...request, status: 'CANCELLED' })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

// ============================================
// Queue Reordering
// ============================================

/**
 * POST /api/events/:eventId/karaokeya/requests/reorder
 */
export async function reorderQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { orderedIds } = req.body

    if (!Array.isArray(orderedIds) || orderedIds.length === 0) {
      return res.status(400).json({
        error: 'orderedIds debe ser un array no vacío',
      })
    }

    await service.batchReorder(eventId, orderedIds)

    // Emitir evento socket
    emitKaraokeQueueReordered(req, eventId)

    res.json({ message: 'Cola reordenada' })
  } catch (error) {
    next(error)
  }
}

// ============================================
// Error Handler Middleware
// ============================================

export function karaokeyaErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof z.ZodError) {
    return res.status(400).json({
      error: 'Datos inválidos',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (error instanceof KaraokeyaError) {
    return res.status(error.statusCode).json({
      error: error.message,
      code: error.code,
    })
  }

  // Error no manejado
  console.error('[KARAOKEYA] Error no manejado:', error)
  next(error)
}
