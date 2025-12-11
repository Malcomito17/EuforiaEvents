import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { venuesApi, CreateVenueInput } from '@/lib/api'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import clsx from 'clsx'

interface VenueFormData {
  name: string
  type: string
  address: string
  city: string
  capacity: string
  contactName: string
  contactPhone: string
  instagramUrl: string
  notes: string
}

const VENUE_TYPES = [
  { value: 'SALON', label: 'Salón de Fiestas' },
  { value: 'HOTEL', label: 'Hotel' },
  { value: 'QUINTA', label: 'Quinta' },
  { value: 'RESTAURANT', label: 'Restaurant' },
  { value: 'BAR', label: 'Bar' },
  { value: 'PUB', label: 'Pub' },
  { value: 'DISCO', label: 'Discoteca' },
  { value: 'CONFITERIA', label: 'Confitería' },
  { value: 'CLUB', label: 'Club' },
  { value: 'OUTDOOR', label: 'Al Aire Libre' },
  { value: 'OTHER', label: 'Otro' },
]

export function VenueFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id

  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<VenueFormData>({
    defaultValues: {
      type: 'SALON',
    }
  })

  useEffect(() => {
    if (isEditing) {
      loadVenue()
    }
  }, [id])

  const loadVenue = async () => {
    setIsLoading(true)
    try {
      const { data } = await venuesApi.get(id!)
      reset({
        name: data.name,
        type: data.type,
        address: data.address || '',
        city: data.city || '',
        capacity: data.capacity?.toString() || '',
        contactName: data.contactName || '',
        contactPhone: data.contactPhone || '',
        instagramUrl: data.instagramUrl || '',
        notes: data.notes || '',
      })
    } catch (err) {
      setError('Error al cargar el venue')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (formData: VenueFormData) => {
    setIsSaving(true)
    setError('')

    try {
      const payload: CreateVenueInput = {
        name: formData.name,
        type: formData.type,
        address: formData.address || undefined,
        city: formData.city || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        contactName: formData.contactName || undefined,
        contactPhone: formData.contactPhone || undefined,
        instagramUrl: formData.instagramUrl || undefined,
        notes: formData.notes || undefined,
      }

      if (isEditing) {
        await venuesApi.update(id!, payload)
      } else {
        await venuesApi.create(payload)
      }

      navigate('/venues')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } }
      setError(error.response?.data?.error || 'Error al guardar el venue')
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
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Venue' : 'Nuevo Venue'}
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
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos del Venue</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre *
              </label>
              <input
                {...register('name', { required: 'El nombre es requerido' })}
                className={clsx(
                  "w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none",
                  errors.name ? "border-red-300" : "border-gray-300"
                )}
                placeholder="Ej: Salón La Fiesta"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo *
              </label>
              <select
                {...register('type', { required: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
              >
                {VENUE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacidad
              </label>
              <input
                type="number"
                {...register('capacity', { min: 1 })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: 200"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dirección
              </label>
              <input
                {...register('address')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: Av. Corrientes 1234"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ciudad
              </label>
              <input
                {...register('city')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: Buenos Aires"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instagram
              </label>
              <input
                {...register('instagramUrl')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
          </div>
        </div>

        {/* Contacto */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre de Contacto
              </label>
              <input
                {...register('contactName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono de Contacto
              </label>
              <input
                {...register('contactPhone')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                placeholder="Ej: +54 11 1234-5678"
              />
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
            placeholder="Notas adicionales sobre el venue..."
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
