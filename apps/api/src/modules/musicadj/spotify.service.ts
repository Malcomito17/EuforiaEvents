/**
 * Spotify Service
 * Integración con Spotify Web API para búsqueda de tracks
 * Usa Client Credentials Flow (no requiere login de usuario)
 */

import { env } from '../../config/env'

// ============================================
// Types
// ============================================

interface SpotifyToken {
  accessToken: string
  expiresAt: number
}

interface SpotifyTrack {
  id: string
  name: string
  artists: string[]
  album: string
  albumArtUrl: string | null
  durationMs: number
  previewUrl: string | null
  spotifyUrl: string
}

interface SpotifySearchResult {
  tracks: SpotifyTrack[]
  total: number
  query: string
}

// ============================================
// Token Cache
// ============================================

let cachedToken: SpotifyToken | null = null

/**
 * Verifica si las credenciales de Spotify están configuradas
 */
export function isSpotifyConfigured(): boolean {
  return !!(env.SPOTIFY_CLIENT_ID && env.SPOTIFY_CLIENT_SECRET)
}

/**
 * Obtiene un token de acceso (con cache)
 */
async function getAccessToken(): Promise<string> {
  // Verificar cache
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.accessToken
  }

  if (!isSpotifyConfigured()) {
    throw new SpotifyError('Spotify no está configurado', 503)
  }

  console.log('[SPOTIFY] Obteniendo nuevo token...')

  const credentials = Buffer.from(
    `${env.SPOTIFY_CLIENT_ID}:${env.SPOTIFY_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('[SPOTIFY] Error de autenticación:', error)
    throw new SpotifyError('Error al autenticar con Spotify', 502)
  }

  const data = await response.json()
  
  // Guardar en cache (expira 5 minutos antes para seguridad)
  cachedToken = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in - 300) * 1000,
  }

  console.log('[SPOTIFY] Token obtenido, expira en', data.expires_in, 'segundos')
  return cachedToken.accessToken
}

// ============================================
// Search
// ============================================

/**
 * Busca tracks en Spotify
 */
export async function searchTracks(
  query: string, 
  limit: number = 10
): Promise<SpotifySearchResult> {
  if (!query.trim()) {
    return { tracks: [], total: 0, query }
  }

  const token = await getAccessToken()

  const params = new URLSearchParams({
    q: query,
    type: 'track',
    limit: String(Math.min(limit, 50)),
    market: 'AR', // Argentina
  })

  const response = await fetch(
    `https://api.spotify.com/v1/search?${params}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 401) {
      // Token expirado, limpiar cache e intentar de nuevo
      cachedToken = null
      return searchTracks(query, limit)
    }
    const error = await response.text()
    console.error('[SPOTIFY] Error de búsqueda:', error)
    throw new SpotifyError('Error al buscar en Spotify', 502)
  }

  const data = await response.json()

  const tracks: SpotifyTrack[] = data.tracks.items.map((item: any) => ({
    id: item.id,
    name: item.name,
    artists: item.artists.map((a: any) => a.name),
    album: item.album.name,
    albumArtUrl: item.album.images?.[0]?.url || null,
    durationMs: item.duration_ms,
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls.spotify,
  }))

  console.log(`[SPOTIFY] Búsqueda "${query}": ${tracks.length} resultados`)

  return {
    tracks,
    total: data.tracks.total,
    query,
  }
}

/**
 * Obtiene un track por ID
 */
export async function getTrackById(trackId: string): Promise<SpotifyTrack | null> {
  const token = await getAccessToken()

  const response = await fetch(
    `https://api.spotify.com/v1/tracks/${trackId}?market=AR`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  )

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    if (response.status === 401) {
      cachedToken = null
      return getTrackById(trackId)
    }
    throw new SpotifyError('Error al obtener track de Spotify', 502)
  }

  const item = await response.json()

  return {
    id: item.id,
    name: item.name,
    artists: item.artists.map((a: any) => a.name),
    album: item.album.name,
    albumArtUrl: item.album.images?.[0]?.url || null,
    durationMs: item.duration_ms,
    previewUrl: item.preview_url,
    spotifyUrl: item.external_urls.spotify,
  }
}

// ============================================
// Error Class
// ============================================

export class SpotifyError extends Error {
  constructor(
    message: string,
    public statusCode: number = 502
  ) {
    super(message)
    this.name = 'SpotifyError'
  }
}

// ============================================
// Exports
// ============================================

export type { SpotifyTrack, SpotifySearchResult }
