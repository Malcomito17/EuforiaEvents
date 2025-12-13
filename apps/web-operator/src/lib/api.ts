import axios from 'axios'

const API_URL = '/api'

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor para manejar errores de auth
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Solo limpiar token, dejar que el authStore y ProtectedRoute manejen el redirect
      localStorage.removeItem('token')
      // Si necesitamos redirect manual, usar el basename correcto
      // window.location.href = '/operador/login'
    }
    return Promise.reject(error)
  }
)

// ============================================
// AUTH
// ============================================

export interface LoginInput {
  username: string
  password: string
}

export interface User {
  id: string
  username: string
  email: string | null
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'DJ'
}

export interface LoginResponse {
  token: string
  user: User
}

export const authApi = {
  login: (data: LoginInput) => 
    api.post<LoginResponse>('/auth/login', data),
  
  me: () => 
    api.get<User>('/auth/me'),
  
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.post('/auth/change-password', data),
}

// ============================================
// EVENTS
// ============================================

export interface EventData {
  id: string
  eventName: string
  eventType: string
  startDate: string
  endDate: string | null
  guestCount: number | null
  instagramUrl: string | null
  instagramUser: string | null
  hashtag: string | null
  spotifyPlaylist: string | null
  notes: string | null
  // Colores del tema
  primaryColor?: string
  secondaryColor?: string
  accentColor?: string
}

export interface Event {
  id: string
  slug: string
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'FINISHED'
  venueId: string | null
  clientId: string | null
  createdAt: string
  updatedAt: string
  eventData: EventData | null
  venue?: Venue | null
  client?: Client | null
}

export interface EventFilters {
  status?: string
  eventType?: string
  venueId?: string
  clientId?: string
  fromDate?: string
  toDate?: string
  search?: string
  limit?: number
  offset?: number
}

export interface CreateEventInput {
  venueId?: string
  clientId?: string
  eventData: {
    eventName: string
    eventType: string
    startDate: string
    endDate?: string
    guestCount?: number
    instagramUrl?: string
    instagramUser?: string
    hashtag?: string
    spotifyPlaylist?: string
    notes?: string
    primaryColor?: string
    secondaryColor?: string
    accentColor?: string
  }
}

export interface QRResponse {
  eventId: string
  slug: string
  eventName: string | null
  qr: {
    url: string
    dataUrl: string
    svg: string
  }
}

export const eventsApi = {
  list: (filters?: EventFilters) =>
    api.get<{ events: Event[]; total: number; hasMore: boolean }>('/events', { params: filters }),
  
  get: (id: string) =>
    api.get<Event>(`/events/${id}`),
  
  create: (data: CreateEventInput) =>
    api.post<Event>('/events', data),
  
  update: (id: string, data: Partial<CreateEventInput>) =>
    api.patch<Event>(`/events/${id}`, data),

  updateEventData: (id: string, data: Partial<EventData>) =>
    api.patch<EventData>(`/events/${id}/data`, data),
  
  updateStatus: (id: string, status: string) =>
    api.patch<Event>(`/events/${id}/status`, { status }),
  
  duplicate: (id: string, newStartDate?: string) =>
    api.post<Event>(`/events/${id}/duplicate`, { newStartDate }),
  
  delete: (id: string) =>
    api.delete(`/events/${id}`),
  
  getQR: (id: string) =>
    api.get<QRResponse>(`/events/${id}/qr`),
}

// ============================================
// VENUES
// ============================================

export interface Venue {
  id: string
  name: string
  type: string
  address: string | null
  city: string | null
  capacity: number | null
  contactName: string | null
  contactPhone: string | null
  instagramUrl: string | null
  notes: string | null
  isActive: boolean
  _count?: { events: number }
}

export interface CreateVenueInput {
  name: string
  type: string
  address?: string
  city?: string
  capacity?: number
  contactName?: string
  contactPhone?: string
  instagramUrl?: string
  notes?: string
}

export const venuesApi = {
  list: (filters?: { type?: string; city?: string; search?: string; includeInactive?: boolean }) =>
    api.get<{ venues: Venue[]; pagination: { total: number } }>('/venues', { params: filters }),
  
  get: (id: string) =>
    api.get<Venue>(`/venues/${id}`),
  
  create: (data: CreateVenueInput) =>
    api.post<Venue>('/venues', data),
  
  update: (id: string, data: Partial<CreateVenueInput>) =>
    api.patch<Venue>(`/venues/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/venues/${id}`),
  
  reactivate: (id: string) =>
    api.post(`/venues/${id}/reactivate`),
}

// ============================================
// CLIENTS
// ============================================

export interface Client {
  id: string
  name: string
  company: string | null
  phone: string | null
  email: string | null
  cuit: string | null
  notes: string | null
  isActive: boolean
  _count?: { events: number }
}

export interface CreateClientInput {
  name: string
  company?: string
  phone?: string
  email?: string
  cuit?: string
  notes?: string
}

export const clientsApi = {
  list: (filters?: { search?: string; includeInactive?: boolean }) =>
    api.get<{ clients: Client[]; pagination: { total: number } }>('/clients', { params: filters }),
  
  get: (id: string) =>
    api.get<Client>(`/clients/${id}`),
  
  create: (data: CreateClientInput) =>
    api.post<Client>('/clients', data),
  
  update: (id: string, data: Partial<CreateClientInput>) =>
    api.patch<Client>(`/clients/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/clients/${id}`),
  
  reactivate: (id: string) =>
    api.post(`/clients/${id}/reactivate`),
}

// ============================================
// MUSICADJ
// ============================================

export type SongRequestStatus = 'PENDING' | 'HIGHLIGHTED' | 'URGENT' | 'PLAYED' | 'DISCARDED'

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
  event?: {
    id: string
    slug: string
    eventData: EventData | null
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

export interface SongRequestFilters {
  status?: SongRequestStatus | SongRequestStatus[]
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateSongRequestInput {
  status?: SongRequestStatus
  priority?: number
}

export interface MusicadjStats {
  total: number
  pending: number
  highlighted: number
  urgent: number
  played: number
  discarded: number
}

export const musicadjApi = {
  // Config
  getConfig: (eventId: string) =>
    api.get<MusicadjConfig>(`/events/${eventId}/musicadj/config`),
  
  updateConfig: (eventId: string, data: Partial<MusicadjConfig>) =>
    api.patch<MusicadjConfig>(`/events/${eventId}/musicadj/config`, data),
  
  // Requests
  listRequests: (eventId: string, filters?: SongRequestFilters) =>
    api.get<{ requests: SongRequest[]; total: number; stats: MusicadjStats }>(
      `/events/${eventId}/musicadj/requests`,
      { params: filters }
    ),
  
  getRequest: (eventId: string, requestId: string) =>
    api.get<SongRequest>(`/events/${eventId}/musicadj/requests/${requestId}`),
  
  updateRequest: (eventId: string, requestId: string, data: UpdateSongRequestInput) =>
    api.patch<SongRequest>(`/events/${eventId}/musicadj/requests/${requestId}`, data),
  
  deleteRequest: (eventId: string, requestId: string) =>
    api.delete(`/events/${eventId}/musicadj/requests/${requestId}`),
  
  // Bulk operations
  updateManyRequests: (eventId: string, requestIds: string[], data: UpdateSongRequestInput) =>
    api.patch(`/events/${eventId}/musicadj/requests/bulk`, { requestIds, ...data }),
  
  // Reorder (drag & drop)
  reorderRequests: (eventId: string, orderedIds: string[]) =>
    api.post(`/events/${eventId}/musicadj/requests/reorder`, { orderedIds }),
}

// ============================================
// KARAOKEYA
// ============================================

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
    whatsapp: string | null
  }
  song: {
    id: string
    title: string
    artist: string | null
    youtubeId: string
    youtubeShareUrl: string
    thumbnailUrl: string | null
    duration: number | null
    timesRequested: number
  } | null
  event?: {
    id: string
    slug: string
    eventData: EventData | null
  }
}

export interface KaraokeyaConfig {
  eventId: string
  enabled: boolean
  cooldownSeconds: number
  maxPerPerson: number
  showQueueToClient: boolean
  youtubeAvailable: boolean
}

export interface KaraokeRequestFilters {
  status?: KaraokeRequestStatus | KaraokeRequestStatus[]
  search?: string
  limit?: number
  offset?: number
}

export interface UpdateKaraokeRequestInput {
  status?: KaraokeRequestStatus
}

export interface KaraokeyaStats {
  total: number
  queued: number
  called: number
  onStage: number
  completed: number
  noShow: number
  cancelled: number
}

export const karaokeyaApi = {
  // Config
  getConfig: (eventId: string) =>
    api.get<KaraokeyaConfig>(`/events/${eventId}/karaokeya/config`),

  updateConfig: (eventId: string, data: Partial<KaraokeyaConfig>) =>
    api.patch<KaraokeyaConfig>(`/events/${eventId}/karaokeya/config`, data),

  // Stats
  getStats: (eventId: string) =>
    api.get<KaraokeyaStats>(`/events/${eventId}/karaokeya/stats`),

  // Requests
  listRequests: (eventId: string, filters?: KaraokeRequestFilters) =>
    api.get<{ requests: KaraokeRequest[]; total: number }>(
      `/events/${eventId}/karaokeya/requests`,
      { params: filters }
    ),

  getRequest: (eventId: string, requestId: string) =>
    api.get<KaraokeRequest>(`/events/${eventId}/karaokeya/requests/${requestId}`),

  updateRequest: (eventId: string, requestId: string, data: UpdateKaraokeRequestInput) =>
    api.patch<KaraokeRequest>(`/events/${eventId}/karaokeya/requests/${requestId}`, data),

  deleteRequest: (eventId: string, requestId: string) =>
    api.delete(`/events/${eventId}/karaokeya/requests/${requestId}`),

  // Reorder (drag & drop)
  reorderQueue: (eventId: string, requestIds: string[]) =>
    api.post(`/events/${eventId}/karaokeya/requests/reorder`, { requestIds }),
}

// ============================================
// KARAOKE SONGS (CRUD)
// ============================================

export type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'PAVAROTTI'

export interface KaraokeSong {
  id: string
  title: string
  artist: string
  youtubeId: string
  youtubeShareUrl: string
  thumbnailUrl: string | null
  duration: number | null
  source: string
  language: string
  difficulty: Difficulty
  ranking: number  // 1-5
  opinion: string | null
  likesCount: number
  moods: string  // JSON
  tags: string   // JSON
  timesRequested: number
  timesCompleted: number
  isActive: boolean
  createdAt: string
  updatedAt: string
  _count?: {
    requests: number
    likes: number
  }
}

export interface CreateKaraokeSongInput {
  title: string
  artist: string
  youtubeId: string
  youtubeShareUrl?: string
  thumbnailUrl?: string | null
  duration?: number | null
  language?: 'ES' | 'EN' | 'PT'
  difficulty?: Difficulty
  ranking?: number
  opinion?: string | null
  source?: string
  moods?: string
  tags?: string
}

export interface ListSongsFilters {
  search?: string
  difficulty?: Difficulty
  minRanking?: number
  language?: 'ES' | 'EN' | 'PT'
  sortBy?: 'title' | 'ranking' | 'likesCount' | 'timesRequested' | 'createdAt'
  sortOrder?: 'asc' | 'desc'
  includeInactive?: boolean
  limit?: number
  offset?: number
}

export const karaokeSongsApi = {
  list: (filters?: ListSongsFilters) =>
    api.get<{ songs: KaraokeSong[]; pagination: { total: number; limit: number; offset: number; hasMore: boolean } }>('/karaokeya/songs', { params: filters }),

  get: (id: string) =>
    api.get<KaraokeSong>(`/karaokeya/songs/${id}`),

  create: (data: CreateKaraokeSongInput) =>
    api.post<KaraokeSong>('/karaokeya/songs', data),

  update: (id: string, data: Partial<CreateKaraokeSongInput>) =>
    api.patch<KaraokeSong>(`/karaokeya/songs/${id}`, data),

  delete: (id: string) =>
    api.delete(`/karaokeya/songs/${id}`),

  reactivate: (id: string) =>
    api.post<KaraokeSong>(`/karaokeya/songs/${id}/reactivate`),

  toggleLike: (songId: string, guestId: string) =>
    api.post<{ liked: boolean; likesCount: number }>(`/karaokeya/songs/${songId}/like`, { guestId }),

  getLikeStatus: (songId: string, guestId: string) =>
    api.get<{ liked: boolean }>(`/karaokeya/songs/${songId}/like-status`, { params: { guestId } }),

  getGuestLikedSongs: (guestId: string, limit?: number) =>
    api.get<{ songs: KaraokeSong[]; total: number }>(`/karaokeya/guests/${guestId}/liked-songs`, { params: { limit } }),
}

// ============================================
// GUESTS
// ============================================

export interface Guest {
  id: string
  email: string
  displayName: string
  whatsapp: string | null
  createdAt: string
  songRequestsCount?: number
  karaokeRequestsCount?: number
}

export interface GuestRequests {
  songs: SongRequest[]
  karaoke: KaraokeRequest[]
}

export const guestsApi = {
  listAll: () =>
    api.get<{ success: boolean; guests: Guest[] }>('/guests'),

  listByEvent: (eventId: string) =>
    api.get<{ success: boolean; guests: Guest[] }>(`/events/${eventId}/guests`),

  get: (guestId: string) =>
    api.get<{ success: boolean; guest: Guest }>(`/guests/${guestId}`),

  getRequests: (guestId: string, eventId?: string) =>
    api.get<{ success: boolean; requests: GuestRequests }>(`/guests/${guestId}/requests`, {
      params: eventId ? { eventId } : undefined
    }),

  delete: (guestId: string) =>
    api.delete<{ success: boolean; message: string; guest: Guest }>(`/guests/${guestId}`),
}

// ============================================
// USERS
// ============================================

export type { Role, Module, Permission, CreateUserInput, UpdateUserInput } from './types/users'

export const usersApi = {
  list: (filters?: { role?: string; isActive?: boolean; search?: string; includeInactive?: boolean }) =>
    api.get<{ users: any[]; pagination: any }>('/users', { params: filters }),
  
  get: (id: string) =>
    api.get('/users/' + id),
  
  create: (data: any) =>
    api.post('/users', data),
  
  update: (id: string, data: any) =>
    api.patch('/users/' + id, data),
  
  updatePermissions: (id: string, permissions: any[]) =>
    api.patch('/users/' + id + '/permissions', { permissions }),
  
  delete: (id: string) =>
    api.delete('/users/' + id),
  
  reactivate: (id: string) =>
    api.post('/users/' + id + '/reactivate'),
  
  getRolePreset: (role: string) =>
    api.get('/users/roles/' + role + '/preset'),
}

// ============================================
// DJ
// ============================================

export const djApi = {
  getEvents: () =>
    api.get('/dj/events'),

  getMusicaDJRequests: (eventId: string) =>
    api.get(`/dj/events/${eventId}/musicadj`),

  updateMusicaDJRequestStatus: (eventId: string, requestId: string, status: string) =>
    api.patch(`/dj/events/${eventId}/musicadj/${requestId}`, { status }),

  reorderMusicaDJQueue: (eventId: string, requestIds: string[]) =>
    api.post(`/dj/events/${eventId}/musicadj/reorder`, { requestIds }),

  getKaraokeyaRequests: (eventId: string) =>
    api.get(`/dj/events/${eventId}/karaokeya`),

  updateKaraokeyaRequestStatus: (eventId: string, requestId: string, status: string) =>
    api.patch(`/dj/events/${eventId}/karaokeya/${requestId}`, { status }),

  reorderKaraokeyaQueue: (eventId: string, requestIds: string[]) =>
    api.post(`/dj/events/${eventId}/karaokeya/reorder`, { requestIds }),

  getGuestHistory: (guestId: string) =>
    api.get(`/dj/guests/${guestId}/history`),
}
