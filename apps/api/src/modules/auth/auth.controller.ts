import { Request, Response, NextFunction } from 'express'
import { authService, AuthError } from './auth.service'
import type { AuthenticatedRequest } from '../../shared/types'

export const authController = {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body)
      res.json(result)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/auth/register
   * Requiere autenticación como ADMIN
   */
  async register(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const creatorRole = req.user?.role
      const user = await authService.register(req.body, creatorRole)
      res.status(201).json(user)
    } catch (error) {
      next(error)
    }
  },

  /**
   * GET /api/auth/me
   * Requiere autenticación
   */
  async me(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new AuthError('No autenticado', 401)
      }
      const user = await authService.getCurrentUser(req.user.userId)
      res.json(user)
    } catch (error) {
      next(error)
    }
  },

  /**
   * POST /api/auth/change-password
   * Requiere autenticación
   */
  async changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user?.userId) {
        throw new AuthError('No autenticado', 401)
      }
      const { currentPassword, newPassword } = req.body
      
      if (!currentPassword || !newPassword) {
        throw new AuthError('Se requiere contraseña actual y nueva', 400)
      }
      
      if (newPassword.length < 6) {
        throw new AuthError('La nueva contraseña debe tener al menos 6 caracteres', 400)
      }

      const result = await authService.changePassword(
        req.user.userId,
        currentPassword,
        newPassword
      )
      res.json(result)
    } catch (error) {
      next(error)
    }
  },
}
