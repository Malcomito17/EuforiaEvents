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
  eventData?: {
    eventName?: string
    eventType?: string
    hashtag?: string | null
    eventImage?: string | null
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
  venue?: {
    name: string
  }
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

// ============================================
// KARAOKEYA Types (v1.4)
// ============================================

export interface KaraokeyaConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  youtubeAvailable: boolean
}

export interface YouTubeVideo {
  youtubeId: string
  title: string
  artist: string
  youtubeShareUrl: string
  thumbnailUrl: string | null
  duration: number | null
}

export interface CatalogSong extends YouTubeVideo {
  id: string
  catalogId: string
  timesRequested: number
  isPopular: true
  ranking?: number // 1-5 quality rating
  difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL' | 'PAVAROTTI'
  opinion?: string | null
  likesCount?: number
  reason?: string // AI suggestion reason
}

export interface HybridSearchResult {
  fromCatalog: CatalogSong[]
  fromYouTube: YouTubeVideo[]
  query: string
}

export type KaraokeRequestStatus = 'QUEUED' | 'CALLED' | 'ON_STAGE' | 'COMPLETED' | 'NO_SHOW' | 'CANCELLED'

export interface KaraokeRequest {
  id: string
  eventId: string
  guestId: string
  songId: string | null
  title: string
  artist: string | null
  turnNumber: number
  queuePosition: number
  status: KaraokeRequestStatus
  createdAt: string
  calledAt: string | null
  guest: {
    id: string
    displayName: string
    email: string
  }
  song: {
    id: string
    title: string
    artist: string | null
    youtubeId: string
    youtubeShareUrl: string
    thumbnailUrl: string | null
    duration: number | null
    ranking?: number
    difficulty?: 'FACIL' | 'MEDIO' | 'DIFICIL' | 'PAVAROTTI'
    opinion?: string | null
    likesCount?: number
  } | null
}

export interface CreateKaraokeRequestInput {
  guestId: string
  songId?: string
  youtubeId?: string
  title: string
  artist?: string
}
