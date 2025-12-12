import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { eventsApi, venuesApi, clientsApi, Venue, Client, CreateEventInput } from '@/lib/api'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface EventFormData {
  eventName: string
  eventType: string
  startDate: string
  endDate: string
  guestCount: string
  venueId: string
  clientId: string
  instagramUrl: string
  instagramUser: string
  hashtag: string
  spotifyPlaylist: string
  notes: string
  // Colores del tema
  primaryColor: string
  secondaryColor: string
  accentColor: string
}

const EVENT_TYPES = [
  { value: 'BIRTHDAY', label: 'Cumpleaños' },
  { value: 'WEDDING', label: 'Casamiento' },
  { value: 'FIFTEEN', label: '15 Años' },
  { value: 'CORPORATE', label: 'Corporativo' },
  { value: 'PARTY', label: 'Fiesta' },
  { value: 'BAR', label: 'Bar' },
  { value: 'PRIVATE_PARTY', label: 'Fiesta Privada' },
  { value: 'COMMERCIAL', label: 'Evento Comercial' },
  { value: 'SHOW', label: 'Show' },
  { value: 'DJ_SET', label: 'DJ' },
  { value: 'OTHER', label: 'Otro' },
]

export function EventFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [venues, setVenues] = useState<Venue[]>([])
  const [clients, setClients] = useState<Client[]>([])

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      eventType: 'BIRTHDAY',
      primaryColor: '#7C3AED',
      secondaryColor: '#EC4899',
      accentColor: '#F59E0B',
    }
  })

  // Watch color values for synchronization
  const primaryColor = watch('primaryColor')
  const secondaryColor = watch('secondaryColor')
  const accentColor = watch('accentColor')

  useEffect(() => {
    loadDependencies()
    if (isEditing) {
      loadEvent()
    }
  }, [id])

  const loadDependencies = async () => {
    try {
      const [venuesRes, clientsRes] = await Promise.all([
        venuesApi.list(),
        clientsApi.list(),
      ])
      setVenues(venuesRes.data.venues)
      setClients(clientsRes.data.clients)
    } catch (err) {
      console.error('Error loading dependencies:', err)
    }
  }

  const loadEvent = async () => {
    setIsLoading(true)
    try {
      const { data } = await eventsApi.get(id!)
      reset({
        eventName: data.eventData?.eventName || '',
        eventType: data.eventData?.eventType || 'BIRTHDAY',
        startDate: data.eventData?.startDate 
          ? new Date(data.eventData.startDate).toISOString().slice(0, 16) 
          : '',
        endDate: data.eventData?.endDate 
          ? new Date(data.eventData.endDate).toISOString().slice(0, 16) 
          : '',
        guestCount: data.eventData?.guestCount?.toString() || '',
        venueId: data.venueId || '',
        clientId: data.clientId || '',
        instagramUrl: data.eventData?.instagramUrl || '',
        instagramUser: data.eventData?.instagramUser || '',
        hashtag: data.eventData?.hashtag || '',
        spotifyPlaylist: data.eventData?.spotifyPlaylist || '',
        notes: data.eventData?.notes || '',
        primaryColor: data.eventData?.primaryColor || '#7C3AED',
        secondaryColor: data.eventData?.secondaryColor || '#EC4899',
        accentColor: data.eventData?.accentColor || '#F59E0B',
      })
    } catch (err) {
      setError('Error al cargar el evento')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (formData: EventFormData) => {
    setIsSaving(true)
    setError('')

    try {
      const eventData = {
        eventName: formData.eventName,
        eventType: formData.eventType,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        guestCount: formData.guestCount ? parseInt(formData.guestCount) : undefined,
        instagramUrl: formData.instagramUrl || undefined,
        instagramUser: formData.instagramUser || undefined,
        hashtag: formData.hashtag || undefined,
        spotifyPlaylist: formData.spotifyPlaylist || undefined,
        notes: formData.notes || undefined,
        primaryColor: formData.primaryColor || '#7C3AED',
        secondaryColor: formData.secondaryColor || '#EC4899',
        accentColor: formData.accentColor || '#F59E0B',
      }

      if (isEditing) {
        // Al editar, actualizar eventData por separado
        await eventsApi.updateEventData(id!, eventData)
      } else {
        // Al crear, enviar todo junto
        const payload: CreateEventInput = {
          venueId: formData.venueId || undefined,
          clientId: formData.clientId || undefined,
          eventData,
        }
        await eventsApi.create(payload)
      }

      navigate('/events')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Error al guardar el evento')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Evento' : 'Nuevo Evento'}
        </h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Datos principales */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Evento</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Evento *
              </label>
              <input
                {...register('eventName', { required: 'El nombre es requerido' })}
                className={clsx(
                  "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none",
                  errors.eventName ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Ej: Fiesta de 15 de Martina"
              />
              {errors.eventName && (
                <p className="mt-1 text-sm text-red-600">{errors.eventName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Evento *
              </label>
              <select
                {...register('eventType', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {EVENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad de Invitados
              </label>
              <input
                type="number"
                {...register('guestCount', { min: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: 150"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Inicio *
              </label>
              <input
                type="datetime-local"
                {...register('startDate', { required: 'La fecha de inicio es requerida' })}
                className={clsx(
                  "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none",
                  errors.startDate ? "border-red-300" : "border-gray-300"
                )}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fecha y Hora de Fin
              </label>
              <input
                type="datetime-local"
                {...register('endDate')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Venue y Cliente */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Venue y Cliente</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Venue
              </label>
              <select
                {...register('venueId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sin venue asignado</option>
                {venues.map((venue) => (
                  <option key={venue.id} value={venue.id}>
                    {venue.name} {venue.city && `(${venue.city})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cliente
              </label>
              <select
                {...register('clientId')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                <option value="">Sin cliente asignado</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name} {client.company && `(${client.company})`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Redes y música */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redes Sociales y Música</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario Instagram
              </label>
              <input
                {...register('instagramUser')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="@usuario"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hashtag
              </label>
              <input
                {...register('hashtag')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="#MisQuince"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Instagram
              </label>
              <input
                {...register('instagramUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Playlist Spotify
              </label>
              <input
                {...register('spotifyPlaylist')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="https://open.spotify.com/playlist/..."
              />
            </div>
          </div>
        </div>

        {/* Colores del Tema */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Colores del Tema</h2>
          <p className="text-sm text-gray-600 mb-4">
            Personaliza los colores que verán los invitados en la interfaz del evento
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Primario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setValue('primaryColor', e.target.value)}
                  className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  {...register('primaryColor')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm uppercase"
                  placeholder="#7C3AED"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Usado en botones y elementos principales</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color Secundario
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setValue('secondaryColor', e.target.value)}
                  className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  {...register('secondaryColor')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm uppercase"
                  placeholder="#EC4899"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Para acentos y destacados</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color de Acento
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={accentColor}
                  onChange={(e) => setValue('accentColor', e.target.value)}
                  className="h-12 w-20 rounded-lg border border-gray-300 cursor-pointer"
                />
                <input
                  type="text"
                  {...register('accentColor')}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none font-mono text-sm uppercase"
                  placeholder="#F59E0B"
                  maxLength={7}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Para elementos decorativos</p>
            </div>
          </div>
        </div>

        {/* Notas */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notas</h2>

          <textarea
            {...register('notes')}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none resize-none"
            placeholder="Notas adicionales sobre el evento..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Save className="h-5 w-5" />
            )}
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
