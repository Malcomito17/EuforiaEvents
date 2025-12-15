import { useState } from 'react'
import { dishesApi, Dish, DishCreateInput, TipoDieta } from '@/lib/api'
import { X, Loader2 } from 'lucide-react'

interface DishFormProps {
  dish?: Dish | null
  onClose: () => void
  onSuccess: () => void
}

const CATEGORIAS_DISPONIBLES = [
  'Entrada',
  'Plato Principal',
  'Guarnición',
  'Postre',
  'Bebida',
  'Aperitivo',
  'Ensalada',
  'Sopa',
  'Otro'
]

const DIETARY_OPTIONS: { value: TipoDieta; label: string }[] = [
  { value: 'VEGANO', label: 'Vegano' },
  { value: 'VEGETARIANO', label: 'Vegetariano' },
  { value: 'SIN_GLUTEN', label: 'Sin Gluten' },
  { value: 'SIN_LACTOSA', label: 'Sin Lactosa' },
  { value: 'KOSHER', label: 'Kosher' },
  { value: 'HALAL', label: 'Halal' },
  { value: 'PESCETARIANO', label: 'Pescetariano' },
  { value: 'BAJO_SODIO', label: 'Bajo en Sodio' },
  { value: 'DIABETICO', label: 'Diabético' }
]

export function DishForm({ dish, onClose, onSuccess }: DishFormProps) {
  const isEditing = !!dish

  const [formData, setFormData] = useState<DishCreateInput>({
    nombre: dish?.nombre || '',
    descripcion: dish?.descripcion || '',
    categoria: dish?.categoria || 'Plato Principal',
    dietaryInfo: dish?.dietaryInfo ? JSON.parse(dish.dietaryInfo) : [],
    allergens: dish?.allergens ? JSON.parse(dish.allergens) : []
  })

  const [allergenInput, setAllergenInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    if (!formData.categoria) {
      setError('La categoría es obligatoria')
      return
    }

    setIsSubmitting(true)
    try {
      if (isEditing) {
        await dishesApi.update(dish.id, formData)
      } else {
        await dishesApi.create(formData)
      }
      onSuccess()
      onClose()
    } catch (err: any) {
      console.error('Error saving dish:', err)
      setError(err.response?.data?.error || 'Error al guardar el plato')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleDietaryInfo = (diet: TipoDieta) => {
    const current = formData.dietaryInfo || []
    if (current.includes(diet)) {
      setFormData({
        ...formData,
        dietaryInfo: current.filter(d => d !== diet)
      })
    } else {
      setFormData({
        ...formData,
        dietaryInfo: [...current, diet]
      })
    }
  }

  const addAllergen = () => {
    if (!allergenInput.trim()) return

    const current = formData.allergens || []
    if (!current.includes(allergenInput.trim())) {
      setFormData({
        ...formData,
        allergens: [...current, allergenInput.trim()]
      })
    }
    setAllergenInput('')
  }

  const removeAllergen = (allergen: string) => {
    setFormData({
      ...formData,
      allergens: (formData.allergens || []).filter(a => a !== allergen)
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Editar Plato' : 'Crear Nuevo Plato'}
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

          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del plato *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Ensalada César"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              required
            >
              {CATEGORIAS_DISPONIBLES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.descripcion || ''}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Descripción breve del plato..."
            />
          </div>

          {/* Información Dietaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Restricciones dietarias compatibles
            </label>
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggleDietaryInfo(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    (formData.dietaryInfo || []).includes(value)
                      ? 'bg-primary-100 text-primary-700 border-2 border-primary-500'
                      : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Alérgenos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alérgenos
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={allergenInput}
                onChange={(e) => setAllergenInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addAllergen()
                  }
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Ej: Gluten, Lácteos, Frutos secos..."
              />
              <button
                type="button"
                onClick={addAllergen}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
              >
                Agregar
              </button>
            </div>

            {(formData.allergens || []).length > 0 && (
              <div className="flex flex-wrap gap-2">
                {(formData.allergens || []).map((allergen) => (
                  <span
                    key={allergen}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded text-sm"
                  >
                    {allergen}
                    <button
                      type="button"
                      onClick={() => removeAllergen(allergen)}
                      className="hover:bg-red-100 rounded p-0.5"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              {isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear plato'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
