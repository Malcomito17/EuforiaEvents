import { Request } from 'express'

export interface JwtPayload {
  userId: string
  username: string
  role: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR'

export type Module = 'MUSICADJ' | 'KARAOKEYA'
