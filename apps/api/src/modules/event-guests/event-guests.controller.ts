import { Request, Response } from 'express'
import { EventGuestsService } from './event-guests.service'
import {
  eventGuestCreateSchema,
  eventGuestUpdateSchema,
  checkInSchema,
  checkOutSchema,
  importCSVSchema,
} from './event-guests.types'
import { ZodError } from 'zod'

const service = new EventGuestsService()

export class EventGuestsController {
  /**
   * POST /api/events/:eventId/guests
   * Agrega un invitado a la guestlist
   */
  async addGuest(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const userId = (req as any).user?.id

      const validatedData = eventGuestCreateSchema.parse(req.body)

      const guest = await service.addGuest(eventId, validatedData, userId)

      res.status(201).json({
        success: true,
        data: guest,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error adding guest to event:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al agregar invitado',
      })
    }
  }

  /**
   * GET /api/events/:eventId/guests
   * Obtiene la guestlist completa
   */
  async getGuestlist(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const guests = await service.getGuestlist(eventId)

      res.json({
        success: true,
        data: guests,
        total: guests.length,
      })
    } catch (error: any) {
      console.error('Error getting guestlist:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener lista de invitados',
      })
    }
  }

  /**
   * PUT /api/events/:eventId/guests/:guestId
   * Actualiza un invitado
   */
  async updateGuest(req: Request, res: Response) {
    try {
      const { guestId } = req.params

      const validatedData = eventGuestUpdateSchema.parse(req.body)

      const guest = await service.updateGuest(guestId, validatedData)

      res.json({
        success: true,
        data: guest,
      })
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.errors,
        })
      }

      console.error('Error updating guest:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al actualizar invitado',
      })
    }
  }

  /**
   * DELETE /api/events/:eventId/guests/:guestId
   * Quita un invitado de la guestlist
   */
  async removeGuest(req: Request, res: Response) {
    try {
      const { guestId } = req.params

      await service.removeGuest(guestId)

      res.json({
        success: true,
        message: 'Invitado eliminado de la lista',
      })
    } catch (error: any) {
      console.error('Error removing guest:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al eliminar invitado',
      })
    }
  }

  /**
   * POST /api/events/:eventId/guests/:guestId/checkin
   * Marca el check-in de un invitado
   */
  async checkIn(req: Request, res: Response) {
    try {
      const { guestId } = req.params
      const userId = (req as any).user?.id

      const guest = await service.checkIn(guestId, userId)

      res.json({
        success: true,
        data: guest,
        message: 'Check-in registrado exitosamente',
      })
    } catch (error: any) {
      console.error('Error in check-in:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar check-in',
      })
    }
  }

  /**
   * POST /api/events/:eventId/guests/:guestId/checkout
   * Marca el check-out de un invitado
   */
  async checkOut(req: Request, res: Response) {
    try {
      const { guestId } = req.params
      const userId = (req as any).user?.id

      const guest = await service.checkOut(guestId, userId)

      res.json({
        success: true,
        data: guest,
        message: 'Check-out registrado exitosamente',
      })
    } catch (error: any) {
      console.error('Error in check-out:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al registrar check-out',
      })
    }
  }

  /**
   * POST /api/events/:eventId/guests/import
   * Importa guestlist desde CSV
   */
  async importCSV(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const userId = (req as any).user?.id

      const validatedData = importCSVSchema.parse(req.body)

      const result = await service.importCSV(eventId, validatedData.guests, userId)

      const statusCode = result.success ? 201 : 207 // 207 = Multi-Status (partial success)

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

      console.error('Error importing CSV:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al importar lista de invitados',
      })
    }
  }

  /**
   * GET /api/events/:eventId/guests/stats
   * Obtiene estadísticas de la guestlist
   */
  async getStats(req: Request, res: Response) {
    try {
      const { eventId } = req.params

      const stats = await service.getStats(eventId)

      res.json({
        success: true,
        data: stats,
      })
    } catch (error: any) {
      console.error('Error getting stats:', error)
      res.status(500).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas',
      })
    }
  }
}
