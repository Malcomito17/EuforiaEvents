import type { Request, Response } from 'express'
import { participantsService } from './participants.service'
import { participantIdentifySchema } from './participants.types'

export class ParticipantsController {
  /**
   * POST /api/participants/identify
   * Identifica o crea un participant
   */
  async identify(req: Request, res: Response) {
    try {
      const validated = participantIdentifySchema.parse(req.body)
      const participant = await participantsService.identify(validated)

      res.status(200).json({
        success: true,
        participant,
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
        error: 'Error al identificar participant',
      })
    }
  }

  /**
   * GET /api/participants/:participantId
   * Obtiene un participant por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { participantId } = req.params
      const participant = await participantsService.getById(participantId)

      if (!participant) {
        return res.status(404).json({
          success: false,
          error: 'Participant no encontrado',
        })
      }

      res.status(200).json({
        success: true,
        participant,
      })
    } catch (error) {
      console.error('Error en getById:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener participant',
      })
    }
  }

  /**
   * GET /api/participants/lookup?email=xxx
   * Busca un participant por email (para autocompletar formularios)
   */
  async lookupByEmail(req: Request, res: Response) {
    try {
      const { email } = req.query

      if (!email || typeof email !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Email es requerido',
        })
      }

      const participant = await participantsService.lookupByEmail(email)

      // Retornar success:true incluso si no se encuentra (no es un error)
      res.status(200).json({
        success: true,
        participant: participant || null,
      })
    } catch (error) {
      console.error('Error en lookupByEmail:', error)
      res.status(500).json({
        success: false,
        error: 'Error al buscar participant',
      })
    }
  }

  /**
   * GET /api/participants/:participantId/requests
   * Obtiene todos los pedidos de un participant (song + karaoke)
   * Query params: ?eventId=xxx (opcional)
   */
  async getRequests(req: Request, res: Response) {
    try {
      const { participantId } = req.params
      const { eventId } = req.query

      const requests = await participantsService.getRequests(
        participantId,
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
   * GET /api/participants
   * Lista TODOS los participants (sin filtrar por evento)
   */
  async listAll(req: Request, res: Response) {
    try {
      const participants = await participantsService.listAll()

      res.status(200).json({
        success: true,
        participants,
      })
    } catch (error) {
      console.error('Error en listAll:', error)
      res.status(500).json({
        success: false,
        error: 'Error al listar participants',
      })
    }
  }

  /**
   * GET /api/events/:eventId/participants
   * Lista todos los participants de un evento con contadores de requests
   */
  async listByEvent(req: Request, res: Response) {
    try {
      const { eventId } = req.params
      const participants = await participantsService.listByEvent(eventId)

      res.status(200).json({
        success: true,
        participants,
      })
    } catch (error) {
      console.error('Error en listByEvent:', error)
      res.status(500).json({
        success: false,
        error: 'Error al listar participants',
      })
    }
  }

  /**
   * DELETE /api/participants/:participantId
   * Elimina un participant y todos sus requests
   */
  async delete(req: Request, res: Response) {
    try {
      const { participantId } = req.params
      const result = await participantsService.delete(participantId)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      console.error('Error en delete:', error)

      if (error.message === 'Participant no encontrado') {
        return res.status(404).json({
          success: false,
          error: error.message,
        })
      }

      res.status(500).json({
        success: false,
        error: 'Error al eliminar participant',
      })
    }
  }
}

export const participantsController = new ParticipantsController()
