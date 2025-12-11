/**
 * EUFORIA EVENTS - Events Module Types
 * Tipos y constantes específicos del módulo de eventos
 */

// Estados posibles de un evento
export const EVENT_STATUS = {
  DRAFT: 'DRAFT',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  FINISHED: 'FINISHED',
} as const

export type EventStatus = (typeof EVENT_STATUS)[keyof typeof EVENT_STATUS]

// Tipos de evento
export const EVENT_TYPE = {
  WEDDING: 'WEDDING',
  BIRTHDAY: 'BIRTHDAY',
  QUINCEANERA: 'QUINCEANERA',
  CORPORATE: 'CORPORATE',
  GRADUATION: 'GRADUATION',
  ANNIVERSARY: 'ANNIVERSARY',
  FIESTA_PRIVADA: 'FIESTA_PRIVADA',
  SHOW: 'SHOW',
  EVENTO_ESPECIAL: 'EVENTO_ESPECIAL',
  OTHER: 'OTHER',
} as const

export type EventType = (typeof EVENT_TYPE)[keyof typeof EVENT_TYPE]

// Tipos de venue
export const VENUE_TYPE = {
  SALON: 'SALON',
  HOTEL: 'HOTEL',
  QUINTA: 'QUINTA',
  RESTAURANT: 'RESTAURANT',
  BAR: 'BAR',
  PUB: 'PUB',
  DISCO: 'DISCO',
  CONFITERIA: 'CONFITERIA',
  CLUB: 'CLUB',
  OUTDOOR: 'OUTDOOR',
  OTHER: 'OTHER',
} as const

export type VenueType = (typeof VENUE_TYPE)[keyof typeof VENUE_TYPE]

// Respuesta de evento con datos completos
export interface EventWithDetails {
  id: string
  slug: string
  status: EventStatus
  createdAt: Date
  updatedAt: Date
  createdBy: {
    id: string
    username: string
  }
  venue: {
    id: string
    name: string
    type: string
    city?: string | null
  } | null
  client: {
    id: string
    name: string
    company?: string | null
  } | null
  eventData: {
    eventName: string
    eventType: string
    startDate: Date
    endDate?: Date | null
    guestCount?: number | null
  } | null
  clonedFrom?: {
    id: string
    slug: string
  } | null
}

// Respuesta de listado (más ligera)
export interface EventListItem {
  id: string
  slug: string
  status: EventStatus
  createdAt: Date
  eventData: {
    eventName: string
    eventType: string
    startDate: Date
  } | null
  venue: {
    name: string
    city?: string | null
  } | null
  client: {
    name: string
  } | null
}
