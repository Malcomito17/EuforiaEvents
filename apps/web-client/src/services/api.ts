/**
 * API Service - Cliente HTTP para el backend
 */

import axios from 'axios'
import type { 
  Event, 
  MusicadjConfig, 
  SpotifySearchResult, 
  SongRequest,
  CreateSongRequestInput,
  KaraokeyaConfig,
  KaraokeRequest,
  CreateKaraokeRequestInput,
  KaraokeQueueStats,
} from '../types'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

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

export async function getKaraokeQueue(eventId: string): Promise<KaraokeRequest[]> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/queue`)
  return data
}

export async function getKaraokeStats(eventId: string): Promise<KaraokeQueueStats> {
  const { data } = await api.get(`/events/${eventId}/karaokeya/stats`)
  return data
}

export async function createKaraokeRequest(
  eventId: string,
  input: CreateKaraokeRequestInput
): Promise<KaraokeRequest> {
  const { data } = await api.post(`/events/${eventId}/karaokeya/requests`, input)
  return data
}

export async function getKaraokeRequestById(requestId: string): Promise<KaraokeRequest> {
  const { data } = await api.get(`/events/_/karaokeya/requests/${requestId}`)
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
