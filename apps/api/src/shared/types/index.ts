import { Request, Application } from 'express'
import { Server as SocketServer } from 'socket.io'

// ============================================
// JWT & Auth Types
// ============================================

export interface JwtPayload {
  userId: string
  username: string
  role: string
}

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload
}

export type Role = 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'DJ'

export type Module = 'MUSICADJ' | 'KARAOKEYA'

// ============================================
// Socket.io Types
// ============================================

/**
 * Extiende Express Application para incluir Socket.io
 */
export interface AppWithIO extends Application {
  get(name: 'io'): SocketServer
}

/**
 * Request que incluye acceso a Socket.io via app.get('io')
 */
export interface RequestWithIO extends AuthenticatedRequest {
  app: AppWithIO
}

/**
 * Helper para obtener io desde un request
 */
export function getIOFromRequest(req: Request): SocketServer {
  return (req.app as AppWithIO).get('io')
}

// ============================================
// Song Request Status (MUSICADJ)
// ============================================

export type SongRequestStatus = 
  | 'PENDING'
  | 'HIGHLIGHTED'
  | 'URGENT'
  | 'PLAYED'
  | 'DISCARDED'

// ============================================
// Karaoke Request Status (KARAOKEYA)
// ============================================

export type KaraokeRequestStatus = 
  | 'QUEUED'
  | 'CALLED'
  | 'ON_STAGE'
  | 'COMPLETED'
  | 'NO_SHOW'
  | 'CANCELLED'
