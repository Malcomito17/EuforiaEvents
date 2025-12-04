/**
 * EUFORIA EVENTS - Venues Controller
 * Handlers HTTP para gestión de venues
 */

import { Response, NextFunction } from 'express'
import { venueService } from './venues.service'
import type { AuthenticatedRequest } from '../../shared/types'

export const venueController = {
  /**
   * POST /api/venues
   * Crea un nuevo venue
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.create(req.body)
      res.status(201).json(venue)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/venues
   * Lista venues con filtros
   */
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await venueService.findAll(req.query)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/venues/:id
   * Obtiene un venue por ID
   */
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.findById(req.params.id)
      res.json(venue)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/venues/:id
   * Actualiza un venue
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const venue = await venueService.update(req.params.id, req.body)
      res.json(venue)
    } catch (error) {
      next(error)
    }
  },

  /**
   * DELETE /api/venues/:id
   * Desactiva un venue (soft delete)
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await venueService.delete(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/venues/:id/reactivate
   * Reactiva un venue desactivado
   */
  async reactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await venueService.reactivate(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },
}
