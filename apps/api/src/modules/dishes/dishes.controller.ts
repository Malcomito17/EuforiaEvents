import { Request, Response } from 'express'
import { DishesService } from './dishes.service'
import { dishCreateSchema, dishUpdateSchema } from './dishes.types'
import { ZodError } from 'zod'

const service = new DishesService()

export class DishesController {
  /**
   * POST /api/dishes
   * Crea un nuevo plato
   */
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id

      const validatedData = dishCreateSchema.parse(req.body)

      const dish = await service.create(validatedData, userId)

      res.status(201).json({
        success: true,
        data: dish,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error creating dish:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear plato',
      })
    }
  }

  /**
   * GET /api/dishes
   * Lista todos los platos
   * Query params:
   * - includeInactive: boolean (default: false)
   * - search: string (búsqueda por nombre)
   */
  async listAll(req: Request, res: Response) {
    try {
      const includeInactive = req.query.includeInactive === 'true'
      const search = req.query.search as string | undefined

      const result = await service.listAll({
        includeInactive,
        search,
      })

      res.json({
        success: true,
        data: result.dishes,
        meta: {
          total: result.total,
          activeCount: result.activeCount,
          inactiveCount: result.inactiveCount,
        },
      })
    } catch (error: any) {
      console.error('Error listing dishes:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al listar platos',
      })
    }
  }

  /**
   * GET /api/dishes/search?q=xxx
   * Busca platos por nombre
   */
  async search(req: Request, res: Response) {
    try {
      const query = req.query.q as string

      if (!query || query.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Query debe tener al menos 2 caracteres',
        })
      }

      const dishes = await service.search(query)

      res.json({
        success: true,
        data: dishes,
        total: dishes.length,
      })
    } catch (error: any) {
      console.error('Error searching dishes:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al buscar platos',
      })
    }
  }

  /**
   * GET /api/dishes/:dishId
   * Obtiene un plato por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { dishId } = req.params

      const dish = await service.getById(dishId)

      res.json({
        success: true,
        data: dish,
      })
    } catch (error: any) {
      console.error('Error getting dish:', error)
      res.status(404).json({
        success: false,
        message: error.message || 'Plato no encontrado',
      })
    }
  }

  /**
   * PUT /api/dishes/:dishId
   * Actualiza un plato
   */
  async update(req: Request, res: Response) {
    try {
      const { dishId } = req.params

      const validatedData = dishUpdateSchema.parse(req.body)

      const dish = await service.update(dishId, validatedData)

      res.json({
        success: true,
        data: dish,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error updating dish:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar plato',
      })
    }
  }

  /**
   * DELETE /api/dishes/:dishId
   * Desactiva un plato (soft delete)
   */
  async delete(req: Request, res: Response) {
    try {
      const { dishId } = req.params

      await service.delete(dishId)

      res.json({
        success: true,
        message: 'Plato desactivado exitosamente',
      })
    } catch (error: any) {
      console.error('Error deleting dish:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al desactivar plato',
      })
    }
  }
}

export const dishesController = new DishesController()
