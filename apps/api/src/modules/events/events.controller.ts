/**
 * EUFORIA EVENTS - Events Controller
 * Handlers HTTP para gestión de eventos
 */

import { Request, Response, NextFunction } from 'express'
import { eventService, EventError } from './events.service'
import { generateEventQR, generateEventUrl, generateQRBuffer } from '../../shared/utils/qr-generator'
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
              primaryColor: event.eventData.primaryColor,
              secondaryColor: event.eventData.secondaryColor,
              accentColor: event.eventData.accentColor,
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

  // ============================================
  // QR CODE ENDPOINTS
  // ============================================

  /**
   * GET /api/events/:id/qr
   * Obtiene el código QR del evento en múltiples formatos
   * Requiere: Autenticado
   * 
   * Query params opcionales:
   * - width: ancho del QR (default 300)
   * - darkColor: color oscuro (default #000000)
   * - lightColor: color claro (default #ffffff)
   */
  async getQRCode(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id)

      // Parsear opciones de query params
      const width = req.query.width ? parseInt(req.query.width as string, 10) : 300
      const darkColor = (req.query.darkColor as string) || '#000000'
      const lightColor = (req.query.lightColor as string) || '#ffffff'

      // Validar width
      if (width < 100 || width > 1000) {
        throw new EventError('El ancho debe estar entre 100 y 1000 pixels', 400)
      }

      const qrResult = await generateEventQR(event.slug, {
        width,
        darkColor,
        lightColor,
      })

      console.log(`[EVENTS] QR generado para evento: ${event.id} (${event.slug})`)

      res.json({
        eventId: event.id,
        slug: event.slug,
        eventName: event.eventData?.eventName || null,
        qr: {
          url: qrResult.url,
          dataUrl: qrResult.dataUrl,
          svg: qrResult.svg,
        },
      })
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/events/:id/qr/download
   * Descarga el código QR como imagen PNG
   * Requiere: Autenticado
   * 
   * Query params opcionales:
   * - width: ancho del QR (default 400 para descarga)
   * - darkColor: color oscuro (default #000000)
   * - lightColor: color claro (default #ffffff)
   */
  async downloadQR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id)

      // Parsear opciones (default más grande para descarga/impresión)
      const width = req.query.width ? parseInt(req.query.width as string, 10) : 400
      const darkColor = (req.query.darkColor as string) || '#000000'
      const lightColor = (req.query.lightColor as string) || '#ffffff'

      // Validar width
      if (width < 100 || width > 2000) {
        throw new EventError('El ancho debe estar entre 100 y 2000 pixels', 400)
      }

      const eventUrl = generateEventUrl(event.slug)
      const buffer = await generateQRBuffer(eventUrl, {
        width,
        darkColor,
        lightColor,
      })

      // Nombre del archivo basado en el evento
      const eventName = event.eventData?.eventName || event.slug
      const sanitizedName = eventName.replace(/[^a-zA-Z0-9-_]/g, '_')
      const filename = `qr-${sanitizedName}.png`

      console.log(`[EVENTS] QR descargado para evento: ${event.id} (${event.slug})`)

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      res.setHeader('Content-Length', buffer.length)
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/events/:id/qr/preview
   * Sirve el código QR como imagen PNG inline (para preview en browser)
   * Requiere: Autenticado
   */
  async previewQR(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const event = await eventService.findById(req.params.id)

      const width = req.query.width ? parseInt(req.query.width as string, 10) : 300
      const darkColor = (req.query.darkColor as string) || '#000000'
      const lightColor = (req.query.lightColor as string) || '#ffffff'

      if (width < 100 || width > 1000) {
        throw new EventError('El ancho debe estar entre 100 y 1000 pixels', 400)
      }

      const eventUrl = generateEventUrl(event.slug)
      const buffer = await generateQRBuffer(eventUrl, {
        width,
        darkColor,
        lightColor,
      })

      res.setHeader('Content-Type', 'image/png')
      res.setHeader('Cache-Control', 'public, max-age=3600') // Cache 1 hora
      res.send(buffer)
    } catch (error) {
      next(error)
    }
  },
}
