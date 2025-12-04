/**
 * Client Types - Tipos para el frontend cliente
 */

// ============================================
// Event Types
// ============================================

export interface Event {
  id: string
  slug: string
  name: string
  startDate: string
  endDate: string | null
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED'
}

export interface MusicadjConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  allowWithoutSpotify: boolean
  welcomeMessage: string | null
  showQueueToClient: boolean
  spotifyAvailable: boolean
}

// ============================================
// Spotify Types
// ============================================

export interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  album: string
  albumArtUrl: string | null
  durationMs: number
  previewUrl: string | null
  spotifyUrl: string
}

export interface SpotifySearchResult {
  tracks: SpotifyTrack[]
  total: number
  query: string
}

// ============================================
// Song Request Types
// ============================================

export type SongRequestStatus = 
  | 'PENDING' 
  | 'HIGHLIGHTED' 
  | 'URGENT' 
  | 'PLAYED' 
  | 'DISCARDED'

export interface SongRequest {
  id: string
  eventId: string
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  requesterName: string
  requesterLastname: string | null
  requesterEmail: string | null
  requesterWhatsapp: string | null
  status: SongRequestStatus
  priority: number
  createdAt: string
}

export interface CreateSongRequestInput {
  spotifyId?: string
  title: string
  artist: string
  albumArtUrl?: string
  requesterName: string
  requesterLastname?: string
  requesterEmail?: string
  requesterWhatsapp?: string
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string
  details?: Array<{ field: string; message: string }>
}
