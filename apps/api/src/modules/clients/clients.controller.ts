/**
 * EUFORIA EVENTS - Clients Controller
 * Handlers HTTP para gestión de clientes
 */

import { Response, NextFunction } from 'express'
import { clientService } from './clients.service'
import type { AuthenticatedRequest } from '../../shared/types'

export const clientController = {
  /**
   * POST /api/clients
   * Crea un nuevo cliente
   */
  async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.create(req.body)
      res.status(201).json(client)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/clients
   * Lista clientes con filtros
   */
  async findAll(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clientService.findAll(req.query)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/clients/:id
   * Obtiene un cliente por ID
   */
  async findById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.findById(req.params.id)
      res.json(client)
    } catch (error) {
      next(error)
    }
  },

  /**
   * PATCH /api/clients/:id
   * Actualiza un cliente
   */
  async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const client = await clientService.update(req.params.id, req.body)
      res.json(client)
    } catch (error) {
      next(error)
    }
  },

  /**
   * DELETE /api/clients/:id
   * Desactiva un cliente (soft delete)
   */
  async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clientService.delete(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/clients/:id/reactivate
   * Reactiva un cliente desactivado
   */
  async reactivate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await clientService.reactivate(req.params.id)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },
}
