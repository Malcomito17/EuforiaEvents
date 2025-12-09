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
  GuestRequestsResponse
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
