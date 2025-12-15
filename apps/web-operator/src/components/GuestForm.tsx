import { useState, useEffect } from 'react'
import { eventGuestsApi, mesasApi, EventGuest, EventGuestCreateInput, EventGuestUpdateInput, Accesibilidad, Mesa } from '@/lib/api'
import { PersonSelector } from './PersonSelector'
import { X, Loader2 } from 'lucide-react'

interface GuestFormProps {
  eventId: string
  guest?: EventGuest | null
  onClose: () => void
  onSuccess: () => void
}

export function GuestForm({ eventId, guest, onClose, onSuccess }: GuestFormProps) {
  const isEditing = !!guest

  const [formData, setFormData] = useState<EventGuestCreateInput>({
    personId: guest?.personId || '',
    mesaId: guest?.mesaId || null,
    observaciones: guest?.observaciones || '',
    accesibilidad: guest?.accesibilidad || 'NINGUNA'
  })

  const [mesas, setMesas] = useState<Mesa[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Cargar mesas del evento
  useEffect(() => {
    loadMesas()
  }, [eventId])

  const loadMesas = async () => {
    try {
      const { data } = await mesasApi.list(eventId)
      // El backend devuelve { success, data: mesas[], meta: stats }
      const mesasData = (data as any).data || data.mesas || []
      setMesas(mesasData)
    } catch (err) {
      console.error('Error loading mesas:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.personId) {
      setError('Debe seleccionar una persona')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await eventGuestsApi.update(eventId, guest.id, formData as EventGuestUpdateInput)
      } else {
        await eventGuestsApi.create(eventId, formData as EventGuestCreateInput)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error saving guest:', err)
      setError(err.response?.data?.error || 'Error al guardar el invitado')
    } finally {
      setIsSubmitting(false)
    }
  }

  const accesibilidadOptions: { value: Accesibilidad; label: string }[] = [
    { value: 'NINGUNA', label: 'Ninguna' },
    { value: 'MOVILIDAD_REDUCIDA', label: 'Movilidad reducida' },
    { value: 'VISUAL', label: 'Visual' },
    { value: 'AUDITIVA', label: 'Auditiva' },
    { value: 'OTRA', label: 'Otra' }
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Invitado' : 'Agregar Invitado'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Selector de persona */}
          {!isEditing && (
            <PersonSelector
              value={formData.personId}
              onChange={(personId) => setFormData({ ...formData, personId })}
              label="Persona *"
              placeholder="Buscar persona por nombre, apellido o email..."
            />
          )}

          {/* Si está editando, mostrar info de la persona */}
          {isEditing && guest && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-500 mb-1">Persona</div>
              <div className="font-medium text-gray-900">
                {guest.person.nombre} {guest.person.apellido}
              </div>
              {guest.person.email && (
                <div className="text-sm text-gray-600">{guest.person.email}</div>
              )}
            </div>
          )}

          {/* Selector de mesa */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mesa
            </label>
            <select
              value={formData.mesaId || ''}
              onChange={(e) => setFormData({ ...formData, mesaId: e.target.value || null })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Sin asignar</option>
              {mesas.map((mesa) => (
                <option key={mesa.id} value={mesa.id}>
                  Mesa {mesa.numero} ({mesa._count.invitados}/{mesa.capacidad} personas)
                  {mesa.sector && ` - ${mesa.sector}`}
                </option>
              ))}
            </select>
            {mesas.length === 0 && (
              <p className="mt-1 text-sm text-gray-500">
                No hay mesas creadas para este evento
              </p>
            )}
          </div>

          {/* Accesibilidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Necesidades de accesibilidad
            </label>
            <select
              value={formData.accesibilidad}
              onChange={(e) => setFormData({ ...formData, accesibilidad: e.target.value as Accesibilidad })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {accesibilidadOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={4}
              placeholder="Notas, preferencias, requisitos especiales..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Agregar invitado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
