import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import {
  type CreateUserInput,
  type UpdateUserInput,
  type ListUsersQuery,
  type Permission,
  createUserSchema,
  updateUserSchema,
  listUsersQuerySchema,
  updatePermissionsSchema,
  ROLE_PRESETS,
} from './users.types'

const prisma = new PrismaClient()

class UsersError extends Error {
  constructor(message: string, public statusCode: number = 400) {
    super(message)
    this.name = 'UsersError'
  }
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Lista usuarios con filtros y paginación
 */
export async function listUsers(filters: ListUsersQuery) {
  const { role, isActive, search, includeInactive, limit, offset } =
    listUsersQuerySchema.parse(filters)

  const where: any = {}

  if (!includeInactive) {
    where.isActive = true
  } else if (isActive !== undefined) {
    where.isActive = isActive
  }

  if (role) {
    where.role = role
  }

  if (search) {
    where.OR = [
      { username: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        permissions: {
          select: {
            id: true,
            module: true,
            canView: true,
            canEdit: true,
            canDelete: true,
            canExport: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ])

  return {
    users,
    pagination: {
      total,
      limit,
      offset,
      hasMore: offset + users.length < total,
    },
  }
}

/**
 * Obtiene un usuario por ID
 */
export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          id: true,
          module: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
        },
      },
    },
  })

  if (!user) {
    throw new UsersError('Usuario no encontrado', 404)
  }

  return user
}

/**
 * Crea un nuevo usuario
 */
export async function createUser(input: CreateUserInput) {
  const data = createUserSchema.parse(input)

  // Verificar username único
  const existingUsername = await prisma.user.findUnique({
    where: { username: data.username },
  })

  if (existingUsername) {
    throw new UsersError('El nombre de usuario ya existe', 409)
  }

  // Verificar email único si se proporciona
  if (data.email) {
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (existingEmail) {
      throw new UsersError('El email ya está registrado', 409)
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10)

  // Determinar permisos: usa preset del rol si no se proporcionaron permisos personalizados
  const permissions = data.permissions.length > 0
    ? data.permissions
    : ROLE_PRESETS[data.role]

  // Crear usuario con permisos
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      permissions: {
        create: permissions.map(p => ({
          module: p.module,
          canView: p.canView,
          canEdit: p.canEdit,
          canDelete: p.canDelete,
          canExport: p.canExport,
        })),
      },
    },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          id: true,
          module: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
        },
      },
    },
  })

  console.log(`[USERS] Usuario creado: ${user.id} (${user.username})`)

  return user
}

/**
 * Actualiza un usuario
 */
export async function updateUser(userId: string, input: UpdateUserInput) {
  const data = updateUserSchema.parse(input)

  // Verificar que existe
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!existing) {
    throw new UsersError('Usuario no encontrado', 404)
  }

  // Verificar username único si se cambia
  if (data.username && data.username !== existing.username) {
    const duplicate = await prisma.user.findUnique({
      where: { username: data.username },
    })

    if (duplicate) {
      throw new UsersError('El nombre de usuario ya existe', 409)
    }
  }

  // Verificar email único si se cambia
  if (data.email && data.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({
      where: { email: data.email },
    })

    if (duplicate) {
      throw new UsersError('El email ya está registrado', 409)
    }
  }

  // Preparar datos de actualización
  const updateData: any = {}

  if (data.username) updateData.username = data.username
  if (data.email !== undefined) updateData.email = data.email
  if (data.role) updateData.role = data.role
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10)
  }

  // Actualizar permisos si se proporcionan
  if (data.permissions) {
    // Eliminar permisos existentes
    await prisma.userPermission.deleteMany({
      where: { userId },
    })

    // Crear nuevos permisos
    updateData.permissions = {
      create: data.permissions.map(p => ({
        module: p.module,
        canView: p.canView,
        canEdit: p.canEdit,
        canDelete: p.canDelete,
        canExport: p.canExport,
      })),
    }
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          id: true,
          module: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
        },
      },
    },
  })

  console.log(`[USERS] Usuario actualizado: ${user.id}`)

  return user
}

/**
 * Actualiza solo los permisos de un usuario
 */
export async function updateUserPermissions(userId: string, permissions: Permission[]) {
  const { permissions: validatedPermissions } = updatePermissionsSchema.parse({ permissions })

  const existing = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!existing) {
    throw new UsersError('Usuario no encontrado', 404)
  }

  // Eliminar permisos existentes y crear nuevos en transacción
  await prisma.$transaction([
    prisma.userPermission.deleteMany({
      where: { userId },
    }),
    prisma.user.update({
      where: { id: userId },
      data: {
        permissions: {
          create: validatedPermissions.map(p => ({
            module: p.module,
            canView: p.canView,
            canEdit: p.canEdit,
            canDelete: p.canDelete,
            canExport: p.canExport,
          })),
        },
      },
    }),
  ])

  console.log(`[USERS] Permisos actualizados para usuario: ${userId}`)

  return getUserById(userId)
}

/**
 * Elimina un usuario (soft delete)
 */
export async function deleteUser(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!existing) {
    throw new UsersError('Usuario no encontrado', 404)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
    select: {
      id: true,
      username: true,
      isActive: true,
    },
  })

  console.log(`[USERS] Usuario desactivado: ${user.id}`)

  return { message: 'Usuario desactivado correctamente', user }
}

/**
 * Reactiva un usuario
 */
export async function reactivateUser(userId: string) {
  const existing = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!existing) {
    throw new UsersError('Usuario no encontrado', 404)
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: { isActive: true },
    select: {
      id: true,
      username: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      permissions: {
        select: {
          id: true,
          module: true,
          canView: true,
          canEdit: true,
          canDelete: true,
          canExport: true,
        },
      },
    },
  })

  console.log(`[USERS] Usuario reactivado: ${user.id}`)

  return user
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Obtiene los permisos preset para un rol
 */
export function getRolePreset(role: string): Permission[] {
  return ROLE_PRESETS[role as keyof typeof ROLE_PRESETS] || []
}

/**
 * Verifica si un usuario tiene un permiso específico
 */
export async function userHasPermission(
  userId: string,
  module: string,
  action: 'view' | 'edit' | 'delete' | 'export'
): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { permissions: true },
  })

  if (!user || !user.isActive) return false

  // ADMIN tiene todos los permisos
  if (user.role === 'ADMIN') return true

  const permission = user.permissions.find(p => p.module === module)
  if (!permission) return false

  switch (action) {
    case 'view': return permission.canView
    case 'edit': return permission.canEdit
    case 'delete': return permission.canDelete
    case 'export': return permission.canExport
    default: return false
  }
}

export { UsersError }
