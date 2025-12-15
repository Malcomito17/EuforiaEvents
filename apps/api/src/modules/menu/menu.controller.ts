import { Request, Response } from 'express'
import { MenuService } from './menu.service'
import {
  addDishToMenuSchema,
  createCategorySchema,
  assignDishToGuestSchema,
  autoAssignDishesSchema,
} from './menu.types'
import { ZodError } from 'zod'

const service = new MenuService()

export class MenuController {
  /**
   * POST /api/events/:eventId/menu/dishes
   * Agrega un plato al menú del evento
   */
  async addDish(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const userId = (req as any).user?.id

      const validatedData = addDishToMenuSchema.parse(req.body)

      const eventDish = await service.addDishToMenu(eventId, validatedData, userId)

      res.status(201).json({
        success: true,
        data: eventDish,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error adding dish to menu:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar plato al menú',
      })
    }
  }

  /**
   * GET /api/events/:eventId/menu
   * Obtiene el menú completo del evento
   */
  async getMenu(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const menu = await service.getMenu(eventId)

      res.json({
        success: true,
        data: menu,
      })
    } catch (error: any) {
      console.error('Error getting menu:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener menú',
      })
    }
  }

  /**
   * DELETE /api/events/:eventId/menu/dishes/:dishId
   * Quita un plato del menú
   */
  async removeDish(req: Request, res: Response) {
    try {
      const { eventId, dishId } = req.params

      await service.removeDishFromMenu(eventId, dishId)

      res.json({
        success: true,
        message: 'Plato eliminado del menú',
      })
    } catch (error: any) {
      console.error('Error removing dish from menu:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar plato del menú',
      })
    }
  }

  /**
   * POST /api/events/:eventId/menu/categories
   * Crea una categoría custom para el evento
   */
  async createCategory(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const validatedData = createCategorySchema.parse(req.body)

      const category = await service.createCategory(eventId, validatedData)

      res.status(201).json({
        success: true,
        data: category,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error creating category:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al crear categoría',
      })
    }
  }

  /**
   * POST /api/events/:eventId/menu/assign
   * Asigna un plato a un invitado
   */
  async assignDish(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id

      const validatedData = assignDishToGuestSchema.parse(req.body)

      const guestDish = await service.assignDishToGuest(validatedData, userId)

      res.status(201).json({
        success: true,
        data: guestDish,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error assigning dish:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al asignar plato',
      })
    }
  }

  /**
   * DELETE /api/events/:eventId/menu/assign/:guestDishId
   * Quita un plato de un invitado
   */
  async unassignDish(req: Request, res: Response) {
    try {
      const { guestDishId } = req.params

      await service.unassignDishFromGuest(guestDishId)

      res.json({
        success: true,
        message: 'Plato desasignado del invitado',
      })
    } catch (error: any) {
      console.error('Error unassigning dish:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al desasignar plato',
      })
    }
  }

  /**
   * POST /api/events/:eventId/menu/assign-auto
   * Asignación automática de platos default
   */
  async autoAssign(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const userId = (req as any).user?.id

      const validatedData = autoAssignDishesSchema.parse(req.body)

      const result = await service.autoAssignDishes(eventId, validatedData, userId)

      const statusCode = result.success ? 201 : 207 // 207 = Multi-Status

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

      console.error('Error in auto-assign:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error en asignación automática',
      })
    }
  }

  /**
   * GET /api/events/:eventId/menu/guest/:eventGuestId
   * Obtiene el menú asignado a un invitado
   */
  async getGuestMenu(req: Request, res: Response) {
    try {
      const { eventGuestId } = req.params

      const guestMenu = await service.getGuestMenu(eventGuestId)

      res.json({
        success: true,
        data: guestMenu,
      })
    } catch (error: any) {
      console.error('Error getting guest menu:', error)
      res.status(404).json({
        success: false,
        message: error.message || 'Error al obtener menú del invitado',
      })
    }
  }

  /**
   * GET /api/events/:eventId/menu/alerts
   * Dashboard de alertas de restricciones alimentarias
   */
  async getAlerts(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const alerts = await service.getAlerts(eventId)

      res.json({
        success: true,
        data: alerts,
      })
    } catch (error: any) {
      console.error('Error getting alerts:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener alertas',
      })
    }
  }
}

export const menuController = new MenuController()
