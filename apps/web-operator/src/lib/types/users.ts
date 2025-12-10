export type Role = 'ADMIN' | 'OPERATOR' | 'VIEWER'
export type Module = 'MUSICADJ' | 'KARAOKEYA' | 'VENUES' | 'EVENTS' | 'CLIENTS' | 'USERS'

export interface Permission {
  module: Module
  canView: boolean
  canEdit: boolean
  canDelete: boolean
  canExport: boolean
}

export interface User {
  id: string
  username: string
  email: string | null
  role: Role
  isActive: boolean
  createdAt: string
  updatedAt: string
  permissions: Array<Permission & { id: string }>
}

export interface CreateUserInput {
  username: string
  password: string
  email?: string
  role: Role
  permissions?: Permission[]
}

export interface UpdateUserInput {
  username?: string
  password?: string
  email?: string | null
  role?: Role
  isActive?: boolean
  permissions?: Permission[]
}
