import { useState } from 'react'
import { mesasApi, Mesa, MesaCreateInput, FormaMesa } from '@/lib/api'
import { X, Loader2 } from 'lucide-react'

interface MesaFormProps {
  eventId: string
  mesa?: Mesa | null
  onClose: () => void
  onSuccess: () => void
}

const FORMAS_DISPONIBLES: { value: FormaMesa; label: string }[] = [
  { value: 'CUADRADA', label: 'Cuadrada' },
  { value: 'RECTANGULAR', label: 'Rectangular' },
  { value: 'REDONDA', label: 'Redonda' },
  { value: 'OVALADA', label: 'Ovalada' },
  { value: 'BARRA', label: 'Barra' }
]

export function MesaForm({ eventId, mesa, onClose, onSuccess }: MesaFormProps) {
  const isEditing = !!mesa

  const [formData, setFormData] = useState<MesaCreateInput>({
    numero: mesa?.numero || '',
    capacidad: mesa?.capacidad || 4,
    forma: mesa?.forma || 'REDONDA',
    sector: mesa?.sector || '',
    observaciones: mesa?.observaciones || ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.numero.trim()) {
      setError('El número de mesa es obligatorio')
      return
    }

    if (formData.capacidad < 1 || formData.capacidad > 50) {
      setError('La capacidad debe ser entre 1 y 50 personas')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await mesasApi.update(eventId, mesa.id, formData)
      } else {
        await mesasApi.create(eventId, formData)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error saving mesa:', err)
      setError(err.response?.data?.error || 'Error al guardar la mesa')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Mesa' : 'Crear Nueva Mesa'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Número */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Mesa *
            </label>
            <input
              type="text"
              value={formData.numero}
              onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: 1, A1, VIP-1"
              required
            />
          </div>

          {/* Capacidad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad (personas) *
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            />
          </div>

          {/* Forma */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Forma *
            </label>
            <select
              value={formData.forma}
              onChange={(e) => setFormData({ ...formData, forma: e.target.value as FormaMesa })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {FORMAS_DISPONIBLES.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Sector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sector / Zona
            </label>
            <input
              type="text"
              value={formData.sector || ''}
              onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Jardín, Salón principal, VIP"
            />
          </div>

          {/* Observaciones */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              value={formData.observaciones || ''}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Notas adicionales..."
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
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear mesa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
