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

export interface KaraokeyaConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  showNextSinger: boolean
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
// Song Request Types (MUSICADJ)
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
// Karaoke Request Types (KARAOKEYA)
// ============================================

export type KaraokeRequestStatus = 
  | 'QUEUED' 
  | 'CALLED' 
  | 'ON_STAGE' 
  | 'COMPLETED' 
  | 'NO_SHOW' 
  | 'CANCELLED'

export interface KaraokeRequest {
  id: string
  eventId: string
  title: string
  artist: string | null
  singerName: string
  singerLastname: string | null
  singerEmail: string | null
  singerWhatsapp: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: string
  calledAt: string | null
}

export interface CreateKaraokeRequestInput {
  title: string
  artist?: string
  singerName: string
  singerLastname?: string
  singerEmail?: string
  singerWhatsapp?: string
}

export interface KaraokeQueueStats {
  total: number
  queued: number
  called: number
  onStage: number
  completed: number
  noShow: number
  cancelled: number
  nextTurnNumber: number
  estimatedWaitMinutes: number | null
}

// ============================================
// API Response Types
// ============================================

export interface ApiError {
  error: string
  code?: string
  details?: Array<{ field: string; message: string }>
}
