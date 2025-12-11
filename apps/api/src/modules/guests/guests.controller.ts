import type { Request, Response } from 'express'
import { guestsService } from './guests.service'
import { guestIdentifySchema } from './guests.types'

export class GuestsController {
  /**
   * POST /api/guests/identify
   * Identifica o crea un guest
   */
  async identify(req: Request, res: Response) {
    try {
      const validated = guestIdentifySchema.parse(req.body)
      const guest = await guestsService.identify(validated)

      res.status(200).json({
        success: true,
        guest,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors,
        })
      }

      console.error('Error en identify:', error)
      res.status(500).json({
        success: false,
        error: 'Error al identificar guest',
      })
    }
  }

  /**
   * GET /api/guests/:guestId
   * Obtiene un guest por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { guestId } = req.params
      const guest = await guestsService.getById(guestId)

      if (!guest) {
        return res.status(404).json({
          success: false,
          error: 'Guest no encontrado',
        })
      }

      res.status(200).json({
        success: true,
        guest,
      })
    } catch (error) {
      console.error('Error en getById:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener guest',
      })
    }
  }

  /**
   * GET /api/guests/:guestId/requests
   * Obtiene todos los pedidos de un guest (song + karaoke)
   * Query params: ?eventId=xxx (opcional)
   */
  async getRequests(req: Request, res: Response) {
    try {
      const { guestId } = req.params
      const { eventId } = req.query

      const requests = await guestsService.getRequests(
        guestId,
        eventId as string | undefined
      )

      res.status(200).json({
        success: true,
        requests,
      })
    } catch (error) {
      console.error('Error en getRequests:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener pedidos',
      })
    }
  }

  /**
   * GET /api/events/:eventId/guests
   * Lista todos los guests de un evento con contadores de requests
   */
  async listByEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const guests = await guestsService.listByEvent(eventId)

      res.status(200).json({
        success: true,
        guests,
      })
    } catch (error) {
      console.error('Error en listByEvent:', error)
      res.status(500).json({
        success: false,
        error: 'Error al listar guests',
      })
    }
  }

  /**
   * DELETE /api/guests/:guestId
   * Elimina un guest y todos sus requests
   */
  async delete(req: Request, res: Response) {
    try {
      const { guestId } = req.params
      const result = await guestsService.delete(guestId)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      console.error('Error en delete:', error)

      if (error.message === 'Guest no encontrado') {
        return res.status(404).json({
          success: false,
          error: error.message,
        })
      }

      res.status(500).json({
        success: false,
        error: 'Error al eliminar guest',
      })
    }
  }
}

export const guestsController = new GuestsController()
