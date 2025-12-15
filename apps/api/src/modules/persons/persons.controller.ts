import type { Request, Response } from 'express'
import { personsService } from './persons.service'
import { personCreateSchema, personUpdateSchema } from './persons.types'

export class PersonsController {
  /**
   * POST /api/persons
   * Crea una nueva persona
   */
  async create(req: Request, res: Response) {
    try {
      const validated = personCreateSchema.parse(req.body)
      const userId = (req as any).user?.id

      const person = await personsService.create(validated, userId)

      res.status(201).json({
        success: true,
        person,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors,
        })
      }

      if (error.message.includes('Ya existe una persona')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        })
      }

      console.error('Error en create person:', error)
      res.status(500).json({
        success: false,
        error: 'Error al crear persona',
      })
    }
  }

  /**
   * GET /api/persons/:personId
   * Obtiene una persona por ID
   */
  async getById(req: Request, res: Response) {
    try {
      const { personId } = req.params
      const person = await personsService.getById(personId)

      if (!person) {
        return res.status(404).json({
          success: false,
          error: 'Persona no encontrada',
        })
      }

      res.status(200).json({
        success: true,
        person,
      })
    } catch (error) {
      console.error('Error en getById person:', error)
      res.status(500).json({
        success: false,
        error: 'Error al obtener persona',
      })
    }
  }

  /**
   * GET /api/persons/search?q=xxx
   * Busca personas por nombre o apellido
   */
  async search(req: Request, res: Response) {
    try {
      const { q } = req.query

      if (!q || typeof q !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Query es requerido',
        })
      }

      const persons = await personsService.search(q)

      res.status(200).json({
        success: true,
        persons,
        count: persons.length,
      })
    } catch (error) {
      console.error('Error en search persons:', error)
      res.status(500).json({
        success: false,
        error: 'Error al buscar personas',
      })
    }
  }

  /**
   * GET /api/persons
   * Lista todas las personas
   */
  async listAll(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || 100
      const offset = parseInt(req.query.offset as string) || 0

      const result = await personsService.listAll(limit, offset)

      res.status(200).json({
        success: true,
        persons: result.persons,
        total: result.total,
        limit,
        offset,
      })
    } catch (error) {
      console.error('Error en listAll persons:', error)
      res.status(500).json({
        success: false,
        error: 'Error al listar personas',
      })
    }
  }

  /**
   * PUT /api/persons/:personId
   * Actualiza una persona
   */
  async update(req: Request, res: Response) {
    try {
      const { personId } = req.params
      const validated = personUpdateSchema.parse(req.body)
      const userId = (req as any).user?.id

      const person = await personsService.update(personId, validated, userId)

      res.status(200).json({
        success: true,
        person,
      })
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: 'Datos inválidos',
          details: error.errors,
        })
      }

      if (error.message === 'Persona no encontrada') {
        return res.status(404).json({
          success: false,
          error: error.message,
        })
      }

      if (error.message.includes('Ya existe otra persona')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        })
      }

      console.error('Error en update person:', error)
      res.status(500).json({
        success: false,
        error: 'Error al actualizar persona',
      })
    }
  }

  /**
   * DELETE /api/persons/:personId
   * Elimina una persona
   */
  async delete(req: Request, res: Response) {
    try {
      const { personId } = req.params
      const result = await personsService.delete(personId)

      res.status(200).json({
        success: true,
        ...result,
      })
    } catch (error: any) {
      console.error('Error en delete person:', error)

      if (error.message === 'Persona no encontrada') {
        return res.status(404).json({
          success: false,
          error: error.message,
        })
      }

      if (error.message.includes('está asociada a')) {
        return res.status(409).json({
          success: false,
          error: error.message,
        })
      }

      res.status(500).json({
        success: false,
        error: 'Error al eliminar persona',
      })
    }
  }

  /**
   * POST /api/persons/:personId/link-participant
   * Enlaza una persona con un participante
   */
  async linkParticipant(req: Request, res: Response) {
    try {
      const { personId } = req.params
      const { participantId } = req.body

      if (!participantId) {
        return res.status(400).json({
          success: false,
          error: 'participantId es requerido',
        })
      }

      const person = await personsService.linkParticipant(personId, participantId)

      res.status(200).json({
        success: true,
        person,
      })
    } catch (error: any) {
      console.error('Error en linkParticipant:', error)

      if (error.message.includes('no encontrad')) {
        return res.status(404).json({
          success: false,
          error: error.message,
        })
      }

      res.status(500).json({
        success: false,
        error: 'Error al enlazar participante',
      })
    }
  }

  /**
   * DELETE /api/persons/:personId/link-participant
   * Desenlaza una persona de un participante
   */
  async unlinkParticipant(req: Request, res: Response) {
    try {
      const { personId } = req.params
      const person = await personsService.unlinkParticipant(personId)

      res.status(200).json({
        success: true,
        person,
      })
    } catch (error) {
      console.error('Error en unlinkParticipant:', error)
      res.status(500).json({
        success: false,
        error: 'Error al desenlazar participante',
      })
    }
  }
}

export const personsController = new PersonsController()
