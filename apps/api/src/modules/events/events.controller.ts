/**
 * EUFORIA EVENTS - Events Controller
 * Handlers HTTP para gestión de eventos
 */

import { Request, Response, NextFunction } from 'express'
import { eventService, EventError } from './events.service'
import type { AuthenticatedRequest } from '../../shared/types'

export const eventController = {
  /**
   * POST /api/events
   * Crea un nuevo evento
   * Requiere: ADMIN o MANAGER
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new EventError('No autenticado', 401)
      }

      const event = await eventService.create(req.body, req.user.userId)
      res.status(201).json(event)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/events
   * Lista eventos con filtros
   * Requiere: Autenticado
   */
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.findAll(req.query)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/events/:id
   * Obtiene un evento por ID
   * Requiere: Autenticado
   */
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id)
      res.json(event)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/events/slug/:slug
   * Obtiene un evento por slug (para acceso público via QR)
   * No requiere auth - Es la entrada del cliente
   */
  async findBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findBySlug(req.params.slug)

      // Solo devolver datos públicos si no está activo
      if (event.status !== 'ACTIVE') {
        return res.status(403).json({
          error: 'Este evento no está activo actualmente',
          status: event.status,
        })
      }

      // Respuesta pública (sin datos sensibles)
      res.json({
        id: event.id,
        slug: event.slug,
        status: event.status,
        eventData: event.eventData
          ? {
              eventName: event.eventData.eventName,
              eventType: event.eventData.eventType,
              hashtag: event.eventData.hashtag,
            }
          : null,
        venue: event.venue
          ? {
              name: event.venue.name,
            }
          : null,
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/events/:id
   * Actualiza datos del evento (venue, client, status)
   * Requiere: ADMIN o MANAGER
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.update(req.params.id, req.body)
      res.json(event)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/events/:id/data
   * Actualiza eventData específicamente
   * Requiere: ADMIN o MANAGER
   */
  async updateEventData(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const eventData = await eventService.updateEventData(req.params.id, req.body)
      res.json(eventData)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/events/:id/status
   * Cambia el estado del evento
   * Requiere: ADMIN o MANAGER
   */
  async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { status } = req.body

      if (!status) {
        throw new EventError('Se requiere el campo status', 400)
      }

      const event = await eventService.updateStatus(req.params.id, status)
      res.json(event)
    } catch (error) {
      next(error)
    }
  },

  /**
   * DELETE /api/events/:id
   * Elimina un evento (soft delete)
   * Requiere: ADMIN
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await eventService.delete(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/events/:id/duplicate
   * Duplica un evento existente
   * Requiere: ADMIN o MANAGER
   */
  async duplicate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new EventError('No autenticado', 401)
      }

      const { newStartDate } = req.body
      const parsedDate = newStartDate ? new Date(newStartDate) : undefined

      const event = await eventService.duplicate(
        req.params.id,
        req.user.userId,
        parsedDate
      )

      res.status(201).json(event)
    } catch (error) {
      next(error)
    }
  },
}
