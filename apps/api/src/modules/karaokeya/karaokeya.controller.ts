import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { KaraokeyaService } from './karaokeya.service'
import {
  createKaraokeRequestSchema,
  updateKaraokeRequestStatusSchema,
  reorderQueueSchema,
  batchReorderSchema,
  karaokeyaConfigSchema,
  listKaraokeRequestsQuerySchema,
  KaraokeyaError,
} from './karaokeya.types'

// ============================================
// KARAOKEYA CONTROLLER
// ============================================

export class KaraokeyaController {
  constructor(private service: KaraokeyaService) {}

  // ============================================
  // CONFIGURACIÓN
  // ============================================

  getConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const config = await this.service.getConfig(eventId)

      if (!config) {
        return res.status(404).json({
          success: false,
          error: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND',
        })
      }

      res.json({ success: true, data: config })
    } catch (error) {
      next(error)
    }
  }

  updateConfig = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const input = karaokeyaConfigSchema.parse(req.body)
      const config = await this.service.createOrUpdateConfig(eventId, input)

      res.json({ success: true, data: config })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // REQUESTS (TURNOS)
  // ============================================

  createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const input = createKaraokeRequestSchema.parse(req.body)
      const request = await this.service.createRequest(eventId, input)

      res.status(201).json({ success: true, data: request })
    } catch (error) {
      next(error)
    }
  }

  getRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params
      const request = await this.service.getRequestById(requestId)

      if (!request) {
        return res.status(404).json({
          success: false,
          error: 'Turno no encontrado',
          code: 'REQUEST_NOT_FOUND',
        })
      }

      res.json({ success: true, data: request })
    } catch (error) {
      next(error)
    }
  }

  listRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const query = listKaraokeRequestsQuerySchema.parse(req.query)
      const result = await this.service.listRequests(eventId, query)

      res.json({
        success: true,
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

  getQueue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const queue = await this.service.getQueue(eventId)

      res.json({ success: true, data: queue })
    } catch (error) {
      next(error)
    }
  }

  getQueueStats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const stats = await this.service.getQueueStats(eventId)

      res.json({ success: true, data: stats })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // GESTIÓN DE ESTADOS
  // ============================================

  updateStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params
      const { status } = updateKaraokeRequestStatusSchema.parse(req.body)
      const request = await this.service.updateStatus(requestId, status)

      res.json({ success: true, data: request })
    } catch (error) {
      next(error)
    }
  }

  callNext = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const request = await this.service.callNext(eventId)

      if (!request) {
        return res.json({
          success: true,
          data: null,
          message: 'No hay turnos en cola',
        })
      }

      res.json({ success: true, data: request })
    } catch (error) {
      next(error)
    }
  }

  cancelRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId } = req.params
      const request = await this.service.cancelRequest(requestId)

      res.json({ success: true, data: request })
    } catch (error) {
      next(error)
    }
  }

  // ============================================
  // REORDENAMIENTO
  // ============================================

  reorderRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { requestId, newPosition } = reorderQueueSchema.parse({
        requestId: req.params.requestId,
        newPosition: parseInt(req.body.newPosition, 10),
      })

      await this.service.reorderQueue(requestId, newPosition)

      res.json({ success: true, message: 'Orden actualizado' })
    } catch (error) {
      next(error)
    }
  }

  batchReorder = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.params
      const { orderedIds } = batchReorderSchema.parse(req.body)

      await this.service.batchReorder(eventId, orderedIds)

      res.json({ success: true, message: 'Cola reordenada' })
    } catch (error) {
      next(error)
    }
  }
}

// ============================================
// MIDDLEWARE DE ERRORES ESPECÍFICO
// ============================================

export function karaokeyaErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (error instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: 'Datos inválidos',
      details: error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  if (error instanceof KaraokeyaError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
    })
  }

  // Error no manejado
  console.error('[KARAOKEYA] Error no manejado:', error)
  next(error)
}
