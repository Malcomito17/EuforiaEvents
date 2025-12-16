/**
 * EventCheckin - Página de check-in para invitados
 * Acceso mediante QR con token de autenticación
 */

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { CheckCircle2, Loader2, AlertCircle, User, MapPin, UtensilsCrossed } from 'lucide-react'

interface Guest {
  id: string
  person: {
    nombre: string
    apellido: string
    email?: string
  }
  mesa?: {
    numero: string
    sector?: string
  }
  estadoIngreso: 'PENDIENTE' | 'INGRESADO' | 'NO_ASISTIO'
  checkedInAt?: string
  guestDishes?: Array<{
    eventDish: {
      dish: {
        nombre: string
      }
      category?: {
        nombre: string
      }
    }
  }>
}

interface Event {
  id: string
  name: string
  slug: string
  eventData?: {
    eventName?: string
    eventImage?: string
    primaryColor?: string
  }
}

export default function EventCheckin() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [event, setEvent] = useState<Event | null>(null)
  const [guests, setGuests] = useState<Guest[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [checkingIn, setCheckingIn] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!slug || !token) {
      setError('Enlace inválido. Falta el slug o token de acceso.')
      setLoading(false)
      return
    }

    loadEventAndGuests()
  }, [slug, token])

  const loadEventAndGuests = async () => {
    try {
      // Cargar evento por slug con token
      const eventRes = await fetch(`/api/events/by-slug/${slug}?token=${token}`)
      if (!eventRes.ok) {
        const data = await eventRes.json()
        throw new Error(data.error || 'Evento no encontrado')
      }
      const eventData = await eventRes.json()
      setEvent(eventData.data || eventData)

      // Cargar lista de invitados
      const eventId = (eventData.data || eventData).id
      setEvent({ ...eventData.data || eventData, id: eventId })
      const guestsRes = await fetch(`/api/events/${eventId}/guests/public?token=${token}`)
      if (!guestsRes.ok) {
        const errData = await guestsRes.json().catch(() => ({}))
        throw new Error(errData.message || 'Error al cargar invitados')
      }
      const guestsData = await guestsRes.json()
      setGuests(guestsData.data || [])
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckin = async (guestId: string, guestName: string) => {
    if (!event) return
    setCheckingIn(guestId)
    setSuccessMessage(null)

    try {
      const res = await fetch(`/api/events/${event.id}/guests/${guestId}/checkin/public?token=${token}`, {
        method: 'POST',
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al hacer check-in')
      }

      // Actualizar lista local
      setGuests(prev => prev.map(g =>
        g.id === guestId
          ? { ...g, estadoIngreso: 'INGRESADO' as const, checkedInAt: new Date().toISOString() }
          : g
      ))
      setSuccessMessage(`¡Check-in exitoso para ${guestName}!`)

      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err: any) {
      alert(err.message || 'Error al hacer check-in')
    } finally {
      setCheckingIn(null)
    }
  }

  const filteredGuests = guests.filter(g => {
    if (!searchTerm) return true
    const fullName = `${g.person.nombre} ${g.person.apellido}`.toLowerCase()
    return fullName.includes(searchTerm.toLowerCase())
  })

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="text-center text-white">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-white/60">{error}</p>
        </div>
      </div>
    )
  }

  if (!event) return null

  const primaryColor = event.eventData?.primaryColor || '#8b5cf6'

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/95 backdrop-blur-sm border-b border-white/10 p-4">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-xl font-bold text-center">
            {event.eventData?.eventName || event.name}
          </h1>
          <p className="text-sm text-white/60 text-center">Check-in de invitados</p>
        </div>
      </header>

      {/* Success Message */}
      {successMessage && (
        <div className="fixed top-20 left-4 right-4 z-20 max-w-2xl mx-auto">
          <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            <span className="font-medium">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4">
        {/* Search */}
        <div className="mb-4">
          <input
            type="search"
            placeholder="Buscar invitado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white/5 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold">{guests.length}</div>
            <div className="text-xs text-white/60">Total</div>
          </div>
          <div className="bg-green-600/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-green-400">
              {guests.filter(g => g.estadoIngreso === 'INGRESADO').length}
            </div>
            <div className="text-xs text-white/60">Ingresados</div>
          </div>
          <div className="bg-yellow-600/20 rounded-lg p-3 text-center">
            <div className="text-2xl font-bold text-yellow-400">
              {guests.filter(g => g.estadoIngreso === 'PENDIENTE').length}
            </div>
            <div className="text-xs text-white/60">Pendientes</div>
          </div>
        </div>

        {/* Guest List */}
        <div className="space-y-3">
          {filteredGuests.length === 0 ? (
            <div className="text-center py-12 text-white/50">
              {searchTerm ? 'No se encontraron invitados' : 'No hay invitados'}
            </div>
          ) : (
            filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`bg-white/5 rounded-lg p-4 border ${
                  guest.estadoIngreso === 'INGRESADO'
                    ? 'border-green-500/30'
                    : 'border-white/10'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Name */}
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-white/50 flex-shrink-0" />
                      <span className="font-semibold truncate">
                        {guest.person.nombre} {guest.person.apellido}
                      </span>
                      {guest.estadoIngreso === 'INGRESADO' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                      )}
                    </div>

                    {/* Mesa */}
                    {guest.mesa && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>Mesa {guest.mesa.numero}</span>
                        {guest.mesa.sector && (
                          <span className="text-white/40">({guest.mesa.sector})</span>
                        )}
                      </div>
                    )}

                    {/* Dishes */}
                    {guest.guestDishes && guest.guestDishes.length > 0 && (
                      <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
                        <UtensilsCrossed className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">
                          {guest.guestDishes.map(gd => gd.eventDish.dish.nombre).join(', ')}
                        </span>
                      </div>
                    )}

                    {/* Check-in time */}
                    {guest.checkedInAt && (
                      <div className="mt-2 text-xs text-green-400">
                        Ingresó: {new Date(guest.checkedInAt).toLocaleTimeString('es-AR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>

                  {/* Check-in Button */}
                  {guest.estadoIngreso !== 'INGRESADO' && (
                    <button
                      onClick={() => handleCheckin(guest.id, `${guest.person.nombre} ${guest.person.apellido}`)}
                      disabled={checkingIn === guest.id}
                      className="px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 flex-shrink-0"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {checkingIn === guest.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle2 className="w-5 h-5" />
                          Check-in
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
