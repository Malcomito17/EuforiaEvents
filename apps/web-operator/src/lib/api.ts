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
  facebook: string | null
  twitter: string | null
  website: string | null
  eventImage: string | null
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

  uploadEventImage: async (id: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('uploadType', 'events')

    const { data } = await api.post<{ imageUrl: string }>(`/events/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data.imageUrl
  },

  deleteEventImage: (id: string) =>
    api.delete(`/events/${id}/delete-image`),

  // Check-in QR Access
  generateCheckinToken: (id: string) =>
    api.post<{ success: boolean; message: string; token: string }>(`/events/${id}/checkin/generate-token`),

  getCheckinLink: (id: string) =>
    api.get<{ success: boolean; url: string; token: string }>(`/events/${id}/checkin/link`),

  getCheckinQR: (id: string) =>
    api.get<{ success: boolean; qr: string }>(`/events/${id}/checkin/qr`),
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
  playlistId: string | null
  fromClientPlaylist: boolean
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

  // Playlist Import
  importPlaylist: (eventId: string, data: { spotifyPlaylistId: string; createRequests?: boolean; guestId?: string }) =>
    api.post<{
      playlist: { id: string; name: string; trackCount: number };
      tracksCount: number;
      requestsCreated: number;
    }>(`/events/${eventId}/musicadj/import-playlist`, data),

  listPlaylists: (eventId: string) =>
    api.get<{
      playlists: Array<{
        id: string;
        spotifyPlaylistId: string;
        name: string;
        description: string | null;
        trackCount: number;
        importedAt: string;
        _count: { songRequests: number };
      }>;
      total: number;
    }>(`/events/${eventId}/musicadj/playlists`),

  getPlaylistTracks: (eventId: string, playlistId: string) =>
    api.get<{
      playlist: {
        id: string;
        name: string;
        description: string | null;
        trackCount: number;
      };
      tracks: SongRequest[];
      tracksCount: number;
    }>(`/events/${eventId}/musicadj/playlists/${playlistId}/tracks`),

  deletePlaylist: (eventId: string, playlistId: string) =>
    api.delete(`/events/${eventId}/musicadj/playlists/${playlistId}`),
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

  // Upload promo image
  uploadPromoImage: async (eventId: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    formData.append('uploadType', 'karaokeya')

    const { data } = await api.post<{ imageUrl: string }>(
      `/events/${eventId}/karaokeya/upload-promo`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return data.imageUrl
  },

  deletePromoImage: (eventId: string) =>
    api.delete(`/events/${eventId}/karaokeya/delete-promo`),
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

// ============================================
// PERSONS (Catálogo global de personas)
// ============================================

export interface Person {
  id: string
  nombre: string
  apellido: string | null
  email: string | null
  phone: string | null
  company: string | null
  dietaryRestrictions: string // JSON array
  identityHash: string
  participantId: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface PersonCreateInput {
  nombre: string
  apellido?: string
  email?: string
  phone?: string
  company?: string
  dietaryRestrictions?: string[]
}

export interface PersonUpdateInput {
  nombre?: string
  apellido?: string
  email?: string
  phone?: string
  company?: string
  dietaryRestrictions?: string[]
}

export const personsApi = {
  list: () =>
    api.get<{ persons: Person[]; total: number }>('/persons'),

  search: (query: string) =>
    api.get<{ persons: Person[] }>(`/persons/search?q=${query}`),

  get: (id: string) =>
    api.get<Person>(`/persons/${id}`),

  create: (data: PersonCreateInput) =>
    api.post<Person>('/persons', data),

  update: (id: string, data: PersonUpdateInput) =>
    api.patch<Person>(`/persons/${id}`, data),

  delete: (id: string) =>
    api.delete(`/persons/${id}`),
}

// ============================================
// EVENT GUESTS (Lista de invitados del evento)
// ============================================

export type EstadoIngreso = 'PENDIENTE' | 'INGRESADO' | 'NO_ASISTIO'
export type Accesibilidad = 'NINGUNA' | 'MOVILIDAD_REDUCIDA' | 'VISUAL' | 'AUDITIVA' | 'OTRA'

export interface EventGuest {
  id: string
  eventId: string
  personId: string
  mesaId: string | null
  estadoIngreso: EstadoIngreso
  accesibilidad: Accesibilidad
  observaciones: string | null
  checkedInAt: string | null
  checkedInBy: string | null
  isImportante: boolean
  isDestacado: boolean
  createdAt: string
  person: Person
  mesa?: {
    id: string
    numero: string
    capacidad: number
  }
  assignedDishes?: Array<{
    id: string
    dish: {
      id: string
      nombre: string
      categoria: string
    }
  }>
}

export interface EventGuestCreateInput {
  personId: string
  mesaId?: string | null
  observaciones?: string
  accesibilidad?: Accesibilidad
  isImportante?: boolean
  isDestacado?: boolean
}

export interface EventGuestUpdateInput {
  mesaId?: string | null
  observaciones?: string
  accesibilidad?: Accesibilidad
  isImportante?: boolean
  isDestacado?: boolean
}

export interface EventGuestStats {
  total: number
  ingresados: number
  pendientes: number
  noAsistieron: number
  porcentajeAsistencia: number
}

export interface CSVGuestInput {
  nombre: string
  apellido?: string
  email?: string
  phone?: string
  company?: string
  mesaNumero?: string
  dietaryRestrictions?: string[]
  observaciones?: string
  accesibilidad?: Accesibilidad
}

export const eventGuestsApi = {
  list: (eventId: string) =>
    api.get<{ guests: EventGuest[] }>(`/events/${eventId}/guests`),

  get: (eventId: string, guestId: string) =>
    api.get<EventGuest>(`/events/${eventId}/guests/${guestId}`),

  create: (eventId: string, data: EventGuestCreateInput) =>
    api.post<EventGuest>(`/events/${eventId}/guests`, data),

  update: (eventId: string, guestId: string, data: EventGuestUpdateInput) =>
    api.patch<EventGuest>(`/events/${eventId}/guests/${guestId}`, data),

  delete: (eventId: string, guestId: string) =>
    api.delete(`/events/${eventId}/guests/${guestId}`),

  checkIn: (eventId: string, guestId: string) =>
    api.post<EventGuest>(`/events/${eventId}/guests/${guestId}/checkin`),

  checkOut: (eventId: string, guestId: string) =>
    api.post<EventGuest>(`/events/${eventId}/guests/${guestId}/checkout`),

  importCSV: (eventId: string, guests: CSVGuestInput[]) =>
    api.post<{
      success: boolean
      message: string
      imported: number
      errors: Array<{ row: number; error: string }>
    }>(`/events/${eventId}/guests/import`, { guests }),

  getStats: (eventId: string) =>
    api.get<EventGuestStats>(`/events/${eventId}/guests/stats`),
}

// ============================================
// DISHES (Catálogo de platos)
// ============================================

export type TipoDieta =
  | 'VEGANO'
  | 'VEGETARIANO'
  | 'SIN_GLUTEN'
  | 'SIN_LACTOSA'
  | 'KOSHER'
  | 'HALAL'
  | 'PESCETARIANO'
  | 'BAJO_SODIO'
  | 'DIABETICO'

export interface Dish {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string
  dietaryInfo: string // JSON array
  allergens: string // JSON array
  isActive: boolean
  createdAt: string
  _count?: {
    eventDishes: number
  }
}

export interface DishCreateInput {
  nombre: string
  descripcion?: string
  categoria: string
  dietaryInfo?: TipoDieta[]
  allergens?: string[]
}

export interface DishUpdateInput {
  nombre?: string
  descripcion?: string
  categoria?: string
  dietaryInfo?: TipoDieta[]
  allergens?: string[]
}

export const dishesApi = {
  list: (filters?: { categoria?: string; dietary?: string; search?: string }) =>
    api.get<{ dishes: Dish[]; total: number }>('/dishes', { params: filters }),

  get: (id: string) =>
    api.get<Dish>(`/dishes/${id}`),

  create: (data: DishCreateInput) =>
    api.post<Dish>('/dishes', data),

  update: (id: string, data: DishUpdateInput) =>
    api.patch<Dish>(`/dishes/${id}`, data),

  delete: (id: string) =>
    api.delete(`/dishes/${id}`),
}

// ============================================
// EVENT MENU (Menú del evento)
// ============================================

export type AlertType = 'MISSING_COMPATIBLE_DISH' | 'NO_DISH_ASSIGNED' | 'INCOMPATIBLE_DISH'
export type AlertSeverity = 'HIGH' | 'MEDIUM' | 'LOW'

export interface EventDish {
  id: string
  eventId: string
  dishId: string
  categoria: string
  isDefault: boolean
  dish: Dish
}

export interface MenuAlert {
  type: AlertType
  severity: AlertSeverity
  eventGuestId: string
  guestName: string
  restriction?: string
  message: string
  suggestedDishes?: string[]
}

export interface MenuAlertResponse {
  alerts: MenuAlert[]
  totalAlerts: number
  highSeverity: number
  mediumSeverity: number
  guestsWithIssues: number
}

export interface GuestDish {
  id: string
  eventGuestId: string
  eventDishId: string
  eventDish: {
    id: string
    dish: Dish
  }
}

export const menuApi = {
  // Gestión del menú del evento
  getMenu: (eventId: string) =>
    api.get<{
      categories: Array<{
        category: { id: string; nombre: string }
        dishes: EventDish[]
      }>
      totalDishes: number
    }>(`/events/${eventId}/menu`),

  addDish: (eventId: string, data: { dishId: string; isDefault?: boolean }) =>
    api.post<EventDish>(`/events/${eventId}/menu/dishes`, data),

  removeDish: (eventId: string, dishId: string) =>
    api.delete(`/events/${eventId}/menu/dishes/${dishId}`),

  setDefault: (eventId: string, eventDishId: string) =>
    api.patch<EventDish>(`/events/${eventId}/menu/dishes/${eventDishId}/default`),

  // Alertas de restricciones dietarias
  getAlerts: (eventId: string) =>
    api.get<MenuAlertResponse>(`/events/${eventId}/menu/alerts`),

  // Asignación de platos a invitados
  assignDish: (eventId: string, data: { eventGuestId: string; eventDishId: string }) =>
    api.post<GuestDish>(`/events/${eventId}/menu/assign`, data),

  unassignDish: (eventId: string, guestDishId: string) =>
    api.delete(`/events/${eventId}/menu/assign/${guestDishId}`),

  autoAssignDefaults: (eventId: string) =>
    api.post<{ assigned: number; skipped: number }>(`/events/${eventId}/menu/assign-auto`),

  // Obtener platos asignados a un invitado
  getGuestDishes: (eventId: string, eventGuestId: string) =>
    api.get<{ dishes: GuestDish[] }>(`/events/${eventId}/menu/guest/${eventGuestId}`),
}

// ============================================
// MESAS (Distribución de mesas)
// ============================================

export type FormaMesa = 'CUADRADA' | 'RECTANGULAR' | 'REDONDA' | 'OVALADA' | 'BARRA'
export type AsignacionStrategy = 'FILL_FIRST' | 'DISTRIBUTE'

export interface Mesa {
  id: string
  eventId: string
  numero: string
  capacidad: number
  forma: FormaMesa
  sector: string | null
  posX: number | null
  posY: number | null
  rotation: number | null
  observaciones: string | null
  createdAt: string
  _count: {
    invitados: number
  }
}

export interface MesaCreateInput {
  numero: string
  capacidad: number
  forma: FormaMesa
  sector?: string
  posX?: number
  posY?: number
  rotation?: number
  observaciones?: string
}

export interface MesaUpdateInput {
  numero?: string
  capacidad?: number
  forma?: FormaMesa
  sector?: string
  posX?: number
  posY?: number
  rotation?: number
  observaciones?: string
}

export interface MesaStats {
  total: number
  ocupadas: number
  libres: number
  capacidadTotal: number
  capacidadDisponible: number
  invitadosAsignados: number
  invitadosSinMesa: number
}

export interface AutoAssignResult {
  assigned: number
  failed: number
  errors: Array<{
    guestId: string
    guestName: string
    reason: string
  }>
}

export const mesasApi = {
  list: (eventId: string) =>
    api.get<{ mesas: Mesa[]; stats: MesaStats }>(`/events/${eventId}/mesas`),

  get: (eventId: string, mesaId: string) =>
    api.get<Mesa>(`/events/${eventId}/mesas/${mesaId}`),

  create: (eventId: string, data: MesaCreateInput) =>
    api.post<Mesa>(`/events/${eventId}/mesas`, data),

  update: (eventId: string, mesaId: string, data: MesaUpdateInput) =>
    api.patch<Mesa>(`/events/${eventId}/mesas/${mesaId}`, data),

  updatePosition: (eventId: string, mesaId: string, data: { posX: number; posY: number; rotation?: number }) =>
    api.patch<Mesa>(`/events/${eventId}/mesas/${mesaId}/position`, data),

  delete: (eventId: string, mesaId: string) =>
    api.delete(`/events/${eventId}/mesas/${mesaId}`),

  autoAssign: (eventId: string, data: { strategy: AsignacionStrategy; preferSector?: boolean }) =>
    api.post<AutoAssignResult>(`/events/${eventId}/mesas/auto-assign`, data),

  getStats: (eventId: string) =>
    api.get<MesaStats>(`/events/${eventId}/mesas/stats`),
}
