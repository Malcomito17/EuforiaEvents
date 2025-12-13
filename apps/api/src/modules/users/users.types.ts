import { z } from 'zod'

// ============================================
// ENUMS
// ============================================

export const ROLES = ['ADMIN', 'OPERATOR', 'DJ', 'VIEWER'] as const
export const MODULES = ['MUSICADJ', 'KARAOKEYA', 'VENUES', 'EVENTS', 'CLIENTS', 'USERS'] as const

export type Role = typeof ROLES[number]
export type Module = typeof MODULES[number]

// ============================================
// SCHEMAS
// ============================================

export const permissionSchema = z.object({
  module: z.enum(MODULES),
  canView: z.boolean().default(true),
  canEdit: z.boolean().default(false),
  canDelete: z.boolean().default(false),
  canExport: z.boolean().default(false),
})

export const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email().optional(),
  password: z.string().min(6),
  role: z.enum(ROLES),
  permissions: z.array(permissionSchema).optional().default([]),
})

export const updateUserSchema = z.object({
  username: z.string().min(3).max(50).optional(),
  email: z.string().email().optional().nullable(),
  password: z.string().min(6).optional(),
  role: z.enum(ROLES).optional(),
  isActive: z.boolean().optional(),
  permissions: z.array(permissionSchema).optional(),
})

export const updatePermissionsSchema = z.object({
  permissions: z.array(permissionSchema),
})

export const listUsersQuerySchema = z.object({
  role: z.enum(ROLES).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().optional(),
  includeInactive: z.coerce.boolean().default(false),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
})

// ============================================
// TYPES
// ============================================

export type Permission = z.infer<typeof permissionSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UpdatePermissionsInput = z.infer<typeof updatePermissionsSchema>
export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>

// ============================================
// PRESET PERMISSIONS POR ROL
// ============================================

export const ROLE_PRESETS: Record<Role, Permission[]> = {
  ADMIN: MODULES.map(module => ({
    module,
    canView: true,
    canEdit: true,
    canDelete: true,
    canExport: true,
  })),

  OPERATOR: [
    { module: 'MUSICADJ', canView: true, canEdit: true, canDelete: true, canExport: true },
    { module: 'KARAOKEYA', canView: true, canEdit: true, canDelete: true, canExport: true },
    { module: 'VENUES', canView: true, canEdit: false, canDelete: false, canExport: false },
    { module: 'EVENTS', canView: true, canEdit: false, canDelete: false, canExport: false },
    { module: 'CLIENTS', canView: true, canEdit: false, canDelete: false, canExport: false },
    { module: 'USERS', canView: false, canEdit: false, canDelete: false, canExport: false },
  ],

  DJ: [
    { module: 'MUSICADJ', canView: true, canEdit: false, canDelete: false, canExport: false },
    { module: 'KARAOKEYA', canView: true, canEdit: false, canDelete: false, canExport: false },
    { module: 'VENUES', canView: false, canEdit: false, canDelete: false, canExport: false },
    { module: 'EVENTS', canView: false, canEdit: false, canDelete: false, canExport: false },
    { module: 'CLIENTS', canView: false, canEdit: false, canDelete: false, canExport: false },
    { module: 'USERS', canView: false, canEdit: false, canDelete: false, canExport: false },
  ],

  VIEWER: MODULES.map(module => ({
    module,
    canView: true,
    canEdit: false,
    canDelete: false,
    canExport: false,
  })),
}
