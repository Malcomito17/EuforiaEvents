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
// Guest Types (v1.3)
// ============================================

export interface Guest {
  id: string
  email: string
  displayName: string
  whatsapp: string | null
  createdAt: string
}

export interface GuestIdentifyInput {
  email: string
  displayName: string
  whatsapp?: string
}

export interface GuestIdentifyResponse {
  success: boolean
  guest: Guest
}

// ============================================
// Song Request Types (v1.3)
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
  guestId: string
  spotifyId: string | null
  title: string
  artist: string
  albumArtUrl: string | null
  status: SongRequestStatus
  priority: number
  createdAt: string
  updatedAt: string
  guest: {
    id: string
    displayName: string
    email: string
  }
}

export interface CreateSongRequestInput {
  guestId: string
  spotifyId?: string
  title: string
  artist: string
  albumArtUrl?: string
}

export interface GuestRequestsResponse {
  success: boolean
  requests: {
    songs: Array<SongRequest & { event: any }>
    karaoke: any[]
  }
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string
  details?: Array<{ field: string; message: string }>
}
