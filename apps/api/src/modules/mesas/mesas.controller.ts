import { Request, Response } from 'express'
import { MesasService } from './mesas.service'
import { mesaCreateSchema, mesaUpdateSchema, autoAssignMesasSchema } from './mesas.types'
import { ZodError } from 'zod'

const service = new MesasService()

export class MesasController {
  /**
   * POST /api/events/:eventId/mesas
   * Crea una nueva mesa
   */
  async create(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const userId = (req as any).user?.id

      const validatedData = mesaCreateSchema.parse(req.body)

      const mesa = await service.create(eventId, validatedData, userId)

      res.status(201).json({
        success: true,
        data: mesa,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error creating mesa:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear mesa',
      })
    }
  }

  /**
   * GET /api/events/:eventId/mesas
   * Lista todas las mesas del evento
   * Query params:
   * - includeGuests: boolean (incluir lista de invitados asignados)
   */
  async listAll(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const includeGuests = req.query.includeGuests === 'true'

      const result = await service.listAll(eventId, includeGuests)

      res.json({
        success: true,
        data: result.mesas,
        meta: {
          total: result.total,
          ocupadas: result.ocupadas,
          disponibles: result.disponibles,
          capacidadTotal: result.capacidadTotal,
          invitadosAsignados: result.invitadosAsignados,
          invitadosSinMesa: result.invitadosSinMesa,
        },
      })
    } catch (error: any) {
      console.error('Error listing mesas:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al listar mesas',
      })
    }
  }

  /**
   * GET /api/events/:eventId/mesas/:mesaId
   * Obtiene una mesa por ID
   * Query params:
   * - includeGuests: boolean
   */
  async getById(req: Request, res: Response) {
    try {
      const { mesaId } = req.params
      const includeGuests = req.query.includeGuests === 'true'

      const mesa = await service.getById(mesaId, includeGuests)

      res.json({
        success: true,
        data: mesa,
      })
    } catch (error: any) {
      console.error('Error getting mesa:', error)
      res.status(404).json({
        success: false,
        message: error.message || 'Mesa no encontrada',
      })
    }
  }

  /**
   * PUT /api/events/:eventId/mesas/:mesaId
   * Actualiza una mesa
   */
  async update(req: Request, res: Response) {
    try {
      const { mesaId } = req.params

      const validatedData = mesaUpdateSchema.parse(req.body)

      const mesa = await service.update(mesaId, validatedData)

      res.json({
        success: true,
        data: mesa,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error updating mesa:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar mesa',
      })
    }
  }

  /**
   * DELETE /api/events/:eventId/mesas/:mesaId
   * Elimina una mesa
   */
  async delete(req: Request, res: Response) {
    try {
      const { mesaId } = req.params

      await service.delete(mesaId)

      res.json({
        success: true,
        message: 'Mesa eliminada exitosamente',
      })
    } catch (error: any) {
      console.error('Error deleting mesa:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar mesa',
      })
    }
  }

  /**
   * POST /api/events/:eventId/mesas/auto-assign
   * Auto-asignación de invitados a mesas
   */
  async autoAssign(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const validatedData = autoAssignMesasSchema.parse(req.body)

      const result = await service.autoAssign(eventId, validatedData)

      const statusCode = result.success ? 200 : 207 // 207 = Multi-Status

      res.status(statusCode).json({
        success: result.success,
        data: result,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error in auto-assign mesas:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error en asignación automática',
      })
    }
  }
}

export const mesasController = new MesasController()
