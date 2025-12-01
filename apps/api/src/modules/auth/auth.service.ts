import jwt from 'jsonwebtoken'
import { z } from 'zod'
import prisma from '../../config/database'
import { env } from '../../config/env'
import { hashPassword, verifyPassword } from '../../shared/utils/password'
import type { JwtPayload } from '../../shared/types'

// Schemas de validación
export const loginSchema = z.object({
  username: z.string().min(3, 'Username debe tener al menos 3 caracteres'),
  password: z.string().min(6, 'Password debe tener al menos 6 caracteres'),
})

export const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
  password: z.string().min(6).max(100),
  role: z.enum(['ADMIN', 'MANAGER', 'OPERATOR']).default('OPERATOR'),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>

class AuthService {
  /**
   * Genera un JWT para el usuario
   */
  generateToken(payload: JwtPayload): string {
    return jwt.sign(payload, env.JWT_SECRET, {
      expiresIn: env.JWT_EXPIRES_IN,
    })
  }

  /**
   * Verifica y decodifica un JWT
   */
  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, env.JWT_SECRET) as JwtPayload
  }

  /**
   * Login de usuario
   */
  async login(input: LoginInput) {
    const { username, password } = loginSchema.parse(input)

    const user = await prisma.user.findUnique({
      where: { username },
      include: { permissions: true },
    })

    if (!user) {
      throw new AuthError('Credenciales inválidas', 401)
    }

    if (!user.isActive) {
      throw new AuthError('Usuario desactivado', 403)
    }

    const isValid = await verifyPassword(password, user.password)
    if (!isValid) {
      throw new AuthError('Credenciales inválidas', 401)
    }

    const token = this.generateToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    })

    return {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
      },
    }
  }

  /**
   * Registro de nuevo usuario (solo admin puede crear)
   */
  async register(input: RegisterInput, creatorRole?: string) {
    // Solo ADMIN puede crear usuarios
    if (creatorRole && creatorRole !== 'ADMIN') {
      throw new AuthError('Solo administradores pueden crear usuarios', 403)
    }

    const { username, email, password, role } = registerSchema.parse(input)

    // Verificar username único
    const existingUser = await prisma.user.findUnique({
      where: { username },
    })
    if (existingUser) {
      throw new AuthError('El username ya existe', 409)
    }

    // Verificar email único si se proporciona
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      })
      if (existingEmail) {
        throw new AuthError('El email ya está registrado', 409)
      }
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    return user
  }

  /**
   * Obtiene el usuario actual por ID
   */
  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { permissions: true },
    })

    if (!user) {
      throw new AuthError('Usuario no encontrado', 404)
    }

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      permissions: user.permissions,
      createdAt: user.createdAt,
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      throw new AuthError('Usuario no encontrado', 404)
    }

    const isValid = await verifyPassword(currentPassword, user.password)
    if (!isValid) {
      throw new AuthError('Contraseña actual incorrecta', 401)
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    })

    return { message: 'Contraseña actualizada correctamente' }
  }
}

// Custom error para auth
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export const authService = new AuthService()
