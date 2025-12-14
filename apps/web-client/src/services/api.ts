/**
 * API Service - Cliente HTTP para el backend (v1.3)
 */

import axios from 'axios'
import type {
  Event,
  MusicadjConfig,
  SpotifySearchResult,
  SongRequest,
  CreateSongRequestInput,
  Guest,
  GuestIdentifyInput,
  GuestIdentifyResponse,
  GuestRequestsResponse,
  KaraokeyaConfig,
  HybridSearchResult,
  CreateKaraokeRequestInput,
  KaraokeRequest,
  CatalogSong
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// ============================================
// Guest API (v1.3)
// ============================================

export async function identifyGuest(input: GuestIdentifyInput): Promise<Guest> {
  const { data } = await api.post<GuestIdentifyResponse>('/guests/identify', input)
  return data.guest
}

export async function lookupGuestByEmail(email: string): Promise<Guest | null> {
  try {
    const { data } = await api.get<{ success: boolean; guest: Guest | null }>('/guests/lookup', {
      params: { email },
    })
    return data.guest
  } catch (error) {
    console.error('Error looking up guest:', error)
    return null
  }
}

export async function getGuestRequests(guestId: string, eventId?: string): Promise<GuestRequestsResponse> {
  const { data } = await api.get<GuestRequestsResponse>(`/guests/${guestId}/requests`, {
    params: eventId ? { eventId } : undefined,
  })
  return data
}

// ============================================
// Event API
// ============================================

export async function getEventBySlug(slug: string): Promise<Event> {
  const { data } = await api.get(`/events/slug/${slug}`)
  return data
}

// ============================================
// MUSICADJ API
// ============================================

export async function getMusicadjConfig(eventId: string): Promise<MusicadjConfig> {
  const { data } = await api.get(`/events/${eventId}/musicadj/config`)
  return data
}

export async function searchSpotify(
  eventId: string, 
  query: string, 
  limit: number = 10
): Promise<SpotifySearchResult> {
  const { data } = await api.get(`/events/${eventId}/musicadj/search`, {
    params: { q: query, limit },
  })
  return data
}

export async function createSongRequest(
  eventId: string,
  input: CreateSongRequestInput
): Promise<SongRequest> {
  const { data } = await api.post(`/events/${eventId}/musicadj/requests`, input)
  return data
}

// ============================================
// KARAOKEYA API
// ============================================

export async function getKaraokeyaConfig(eventId: string): Promise<KaraokeyaConfig> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/config`)
  return data
}

export async function searchKaraoke(
  eventId: string,
  query: string
): Promise<HybridSearchResult> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/search`, {
    params: { q: query },
  })
  return data
}

export async function createKaraokeRequest(
  eventId: string,
  input: CreateKaraokeRequestInput
): Promise<KaraokeRequest> {
  const { data } = await api.post(`/events/${eventId}/karaokeya/requests`, input)
  return data
}

export async function deleteKaraokeRequest(
  eventId: string,
  requestId: string,
  guestId: string
): Promise<void> {
  await api.delete(`/events/${eventId}/karaokeya/requests/${requestId}`, {
    data: { guestId }
  })
}

export async function getGuestKaraokeQueue(
  eventId: string,
  guestId: string
): Promise<{ requests: KaraokeRequest[]; total: number }> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/guests/${guestId}/requests`)
  return data
}

export async function getPublicKaraokeQueue(
  eventId: string
): Promise<{ requests: KaraokeRequest[]; total: number }> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/queue`)
  return data
}

export async function getPopularSongs(
  eventId: string,
  limit: number = 10
): Promise<{ songs: CatalogSong[]; total: number }> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/popular`, {
    params: { limit },
  })
  return data
}

export async function getSmartSuggestions(
  eventId: string,
  guestId?: string,
  limit: number = 5
): Promise<{ suggestions: (CatalogSong & { reason?: string })[]; total: number }> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/suggestions`, {
    params: { guestId, limit },
  })
  return data
}

// ============================================
// Karaoke Likes API
// ============================================

export async function toggleSongLike(
  songId: string,
  guestId: string
): Promise<{ liked: boolean; likesCount: number }> {
  const { data } = await api.post(`/karaokeya/songs/${songId}/like`, { guestId })
  return data
}

export async function getSongLikeStatus(
  songId: string,
  guestId: string
): Promise<{ liked: boolean }> {
  const { data } = await api.get(`/karaokeya/songs/${songId}/like-status`, {
    params: { guestId },
  })
  return data
}

export async function batchGetLikeStatuses(
  songIds: string[],
  guestId: string
): Promise<Record<string, boolean>> {
  // Helper para obtener múltiples estados en paralelo
  const promises = songIds.map(songId => getSongLikeStatus(songId, guestId))
  const results = await Promise.all(promises)

  const statusMap: Record<string, boolean> = {}
  songIds.forEach((songId, index) => {
    statusMap[songId] = results[index].liked
  })

  return statusMap
}

// ============================================
// Error Handler
// ============================================

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || 'Error de conexión'
    return Promise.reject(new Error(message))
  }
)

export { api }
