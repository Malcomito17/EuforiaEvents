import { Response, NextFunction } from 'express'
import { authService, AuthError } from './auth.service'
import type { AuthenticatedRequest, Role, Module } from '../../shared/types'
import prisma from '../../config/database'

/**
 * Middleware que verifica el JWT y agrega user al request
 * Uso: router.get('/ruta', authenticate, handler)
 */
export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader) {
      throw new AuthError('Token no proporcionado', 401)
    }

    const [type, token] = authHeader.split(' ')

    if (type !== 'Bearer' || !token) {
      throw new AuthError('Formato de token inválido', 401)
    }

    const payload = authService.verifyToken(token)
    req.user = payload
    next()
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message })
    }
    // Error de JWT (token expirado, inválido, etc.)
    return res.status(401).json({ error: 'Token inválido o expirado' })
  }
}

/**
 * Middleware que verifica el rol del usuario
 * Uso: router.post('/ruta', authenticate, requireRole('ADMIN'), handler)
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autenticado' })
    }

    if (!allowedRoles.includes(req.user.role as Role)) {
      return res.status(403).json({ 
        error: `Acceso denegado. Roles permitidos: ${allowedRoles.join(', ')}` 
      })
    }

    next()
  }
}

/**
 * Middleware que verifica permisos sobre un módulo específico
 * Uso: router.get('/musicadj/:eventId', authenticate, requireModuleAccess('MUSICADJ'), handler)
 */
export function requireModuleAccess(module: Module, permission: 'view' | 'operate' | 'export' = 'view') {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'No autenticado' })
      }

      // ADMIN tiene acceso total
      if (req.user.role === 'ADMIN') {
        return next()
      }

      // Buscar permisos del usuario
      const userPermission = await prisma.userPermission.findUnique({
        where: {
          userId_module: {
            userId: req.user.userId,
            module: module,
          },
        },
      })

      if (!userPermission) {
        return res.status(403).json({ 
          error: `No tienes acceso al módulo ${module}` 
        })
      }

      // Verificar el tipo de permiso requerido
      const hasPermission = 
        (permission === 'view' && userPermission.canView) ||
        (permission === 'operate' && userPermission.canOperate) ||
        (permission === 'export' && userPermission.canExport)

      if (!hasPermission) {
        return res.status(403).json({ 
          error: `No tienes permiso para ${permission} en ${module}` 
        })
      }

      next()
    } catch (error) {
      next(error)
    }
  }
}

/**
 * Middleware opcional - verifica JWT si existe, pero no falla si no hay token
 * Útil para rutas que funcionan con o sin auth
 */
export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return next()
  }

  try {
    const [type, token] = authHeader.split(' ')
    if (type === 'Bearer' && token) {
      const payload = authService.verifyToken(token)
      req.user = payload
    }
  } catch {
    // Token inválido, pero continuamos sin user
  }

  next()
}
