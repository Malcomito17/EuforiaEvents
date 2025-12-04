/**
 * EUFORIA EVENTS - Error Handler Middleware
 * Manejo centralizado de errores
 */

import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { AuthError } from '../../modules/auth/auth.service'
import { EventError } from '../../modules/events/events.service'
import { VenueError } from '../../modules/venues/venues.service'
import { ClientError } from '../../modules/clients/clients.service'
import { MusicadjError } from '../../modules/musicadj/musicadj.service'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(`[ERROR] ${err.name}: ${err.message}`)

  // Errores de autenticación
  if (err instanceof AuthError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Errores de eventos
  if (err instanceof EventError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Errores de venues
  if (err instanceof VenueError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Errores de clients
  if (err instanceof ClientError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Errores de MUSICADJ
  if (err instanceof MusicadjError) {
    return res.status(err.statusCode).json({
      error: err.message,
    })
  }

  // Errores de validación Zod
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Error de validación',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    })
  }

  // Errores de Prisma
  if (err.name === 'PrismaClientKnownRequestError') {
    return res.status(400).json({
      error: 'Error de base de datos',
      message: err.message,
    })
  }

  // Error genérico
  const statusCode = 'statusCode' in err ? (err.statusCode as number) : 500

  res.status(statusCode).json({
    error:
      process.env.NODE_ENV === 'production'
        ? 'Error interno del servidor'
        : err.message,
  })
}
