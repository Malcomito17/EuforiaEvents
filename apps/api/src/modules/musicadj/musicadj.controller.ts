/**
 * MUSICADJ Controller
 * Handlers HTTP con integración Socket.io
 */

import { Request, Response, NextFunction } from 'express'
import { getIOFromRequest, AuthenticatedRequest } from '../../shared/types'
import { 
  emitNewRequest, 
  emitRequestUpdated, 
  emitRequestDeleted,
  emitQueueReordered,
  emitConfigUpdated
} from '../../socket'
import * as service from './musicadj.service'
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
 * Obtiene configuración del módulo
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
 * PATCH /api/events/:eventId/musicadj/config
 * Actualiza configuración del módulo
 */
export async function updateConfig(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = musicadjConfigSchema.parse(req.body)
    
    const config = await service.updateConfig(eventId, input)
    
    // Emitir cambio via Socket.io
    const io = getIOFromRequest(req)
    emitConfigUpdated(io, eventId, config)
    
    res.json(config)
  } catch (error) {
    next(error)
  }
}

// ============================================
// Song Request Endpoints
// ============================================

/**
 * POST /api/events/:eventId/musicadj/requests
 * Crea nueva solicitud (endpoint público para clientes QR)
 */
export async function createRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const input = createSongRequestSchema.parse(req.body)
    
    const request = await service.createRequest(eventId, input)
    
    // Emitir a operadores via Socket.io
    const io = getIOFromRequest(req)
    emitNewRequest(io, eventId, request)
    
    res.status(201).json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/requests
 * Lista solicitudes (operador)
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
 * PATCH /api/events/:eventId/musicadj/requests/:requestId
 * Actualiza solicitud (estado, prioridad)
 */
export async function updateRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    const input = updateSongRequestSchema.parse(req.body)
    
    const request = await service.updateRequest(eventId, requestId, input)
    
    // Emitir actualización via Socket.io
    const io = getIOFromRequest(req)
    emitRequestUpdated(io, eventId, request)
    
    res.json(request)
  } catch (error) {
    next(error)
  }
}

/**
 * DELETE /api/events/:eventId/musicadj/requests/:requestId
 * Elimina solicitud
 */
export async function deleteRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId, requestId } = req.params
    
    await service.deleteRequest(eventId, requestId)
    
    // Emitir eliminación via Socket.io
    const io = getIOFromRequest(req)
    emitRequestDeleted(io, eventId, requestId)
    
    res.status(204).send()
  } catch (error) {
    next(error)
  }
}

/**
 * POST /api/events/:eventId/musicadj/requests/reorder
 * Reordena la cola de solicitudes
 */
export async function reorderQueue(req: Request, res: Response, next: NextFunction) {
  try {
    const { eventId } = req.params
    const { requestIds } = reorderQueueSchema.parse(req.body)
    
    const result = await service.reorderQueue(eventId, requestIds)
    
    // Emitir nuevo orden via Socket.io
    const io = getIOFromRequest(req)
    emitQueueReordered(io, eventId, requestIds)
    
    res.json(result)
  } catch (error) {
    next(error)
  }
}

/**
 * GET /api/events/:eventId/musicadj/stats
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
