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
      localStorage.removeItem('token')
      window.location.href = '/login'
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
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR'
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
  
  updateData: (id: string, data: Partial<EventData>) =>
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
    api.get<{ venues: Venue[]; total: number }>('/venues', { params: filters }),
  
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
    api.get<{ clients: Client[]; total: number }>('/clients', { params: filters }),
  
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
  updatedAt: string
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
