/**
 * EUFORIA EVENTS - DJ Controller
 * Handlers HTTP para operaciones del rol DJ
 */

import { Response, NextFunction } from 'express'
import { djService, DJError } from './dj.service'
import type { AuthenticatedRequest } from '../../shared/types'

export const djController = {
  /**
   * GET /api/dj/events
   * Obtiene eventos asignados al DJ
   * Requiere: rol DJ
   */
  async getEvents(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new DJError('No autenticado', 401)
      }

      const events = await djService.getAssignedEvents(req.user.userId)
      res.json(events)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/dj/events/:eventId/musicadj
   * Obtiene pedidos musicales de un evento
   * Requiere: rol DJ
   */
  async getMusicaDJRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = await djService.getMusicaDJRequests(req.params.eventId)
      res.json(requests)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/dj/events/:eventId/musicadj/:requestId
   * Actualiza el estado de un pedido musical
   * Requiere: rol DJ
   */
  async updateMusicaDJRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, requestId } = req.params
      const { status } = req.body

      if (!status) {
        throw new DJError('Se requiere el campo status', 400)
      }

      const request = await djService.updateMusicaDJRequestStatus(eventId, requestId, status)
      res.json(request)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/dj/events/:eventId/musicadj/reorder
   * Reordena la cola de pedidos musicales
   * Requiere: rol DJ
   */
  async reorderMusicaDJQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params
      const { requestIds } = req.body

      if (!Array.isArray(requestIds)) {
        throw new DJError('requestIds debe ser un array', 400)
      }

      const result = await djService.reorderMusicaDJQueue(eventId, requestIds)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/dj/events/:eventId/karaokeya
   * Obtiene pedidos de karaoke de un evento
   * Requiere: rol DJ
   */
  async getKaraokeyaRequests(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const requests = await djService.getKaraokeyaRequests(req.params.eventId)
      res.json(requests)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/dj/events/:eventId/karaokeya/:requestId
   * Actualiza el estado de un pedido de karaoke
   * Requiere: rol DJ
   */
  async updateKaraokeyaRequestStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId, requestId } = req.params
      const { status } = req.body

      if (!status) {
        throw new DJError('Se requiere el campo status', 400)
      }

      const request = await djService.updateKaraokeyaRequestStatus(eventId, requestId, status)
      res.json(request)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/dj/events/:eventId/karaokeya/reorder
   * Reordena la cola de karaoke
   * Requiere: rol DJ
   */
  async reorderKaraokeyaQueue(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params
      const { requestIds } = req.body

      if (!Array.isArray(requestIds)) {
        throw new DJError('requestIds debe ser un array', 400)
      }

      const result = await djService.reorderKaraokeyaQueue(eventId, requestIds)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/dj/guests/:guestId/history
   * Obtiene el historial de pedidos de un invitado
   * Requiere: rol DJ
   */
  async getGuestHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const history = await djService.getGuestHistory(req.params.guestId)
      res.json(history)
    } catch (error) {
      next(error)
    }
  },
}
