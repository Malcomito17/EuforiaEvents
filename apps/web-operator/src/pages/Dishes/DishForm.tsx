import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { dishesApi, Dish, DishCreateInput, TipoDieta } from '@/lib/api'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

// Categorías de platos
const CATEGORIES = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'POSTRE', label: 'Postre' },
  { value: 'BEBIDA', label: 'Bebida' },
  { value: 'GUARNICION', label: 'Guarnición' },
  { value: 'DEGUSTACION', label: 'Degustación' },
  { value: 'OTRO', label: 'Otro' },
]

// Opciones de información dietaria que cumple el plato
const DIETARY_OPTIONS: { value: TipoDieta; label: string; description: string }[] = [
  { value: 'VEGANO', label: 'Vegano', description: 'Sin productos de origen animal' },
  { value: 'VEGETARIANO', label: 'Vegetariano', description: 'Sin carne ni pescado' },
  { value: 'SIN_GLUTEN', label: 'Sin gluten', description: 'Apto para celíacos' },
  { value: 'SIN_LACTOSA', label: 'Sin lactosa', description: 'Sin productos lácteos' },
  { value: 'KOSHER', label: 'Kosher', description: 'Cumple normas judías' },
  { value: 'HALAL', label: 'Halal', description: 'Cumple normas islámicas' },
  { value: 'PESCETARIANO', label: 'Pescetariano', description: 'Vegetariano + pescado' },
  { value: 'BAJO_SODIO', label: 'Bajo en sodio', description: 'Reducido en sal' },
  { value: 'DIABETICO', label: 'Diabético', description: 'Bajo en azúcar' },
]

export function DishFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = !!id

  const [formData, setFormData] = useState<DishCreateInput>({
    nombre: '',
    descripcion: '',
    categoria: 'PRINCIPAL',
    dietaryInfo: [],
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEditing && id) {
      loadDish(id)
    }
  }, [id])

  const loadDish = async (dishId: string) => {
    setIsLoading(true)
    try {
      const { data } = await dishesApi.get(dishId)
      // El backend devuelve { success, data: dish }
      const dish = (data as any).data || data as Dish

      // Parsear dietaryInfo si es string
      let dietaryInfo: TipoDieta[] = []
      if (dish.dietaryInfo) {
        try {
          dietaryInfo = typeof dish.dietaryInfo === 'string'
            ? JSON.parse(dish.dietaryInfo)
            : dish.dietaryInfo
        } catch { /* ignore */ }
      }

      setFormData({
        nombre: dish.nombre,
        descripcion: dish.descripcion || '',
        categoria: dish.categoria || 'PRINCIPAL',
        dietaryInfo,
      })
    } catch (err) {
      console.error('Error loading dish:', err)
      setError('Error al cargar el plato')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio')
      return
    }

    setIsSaving(true)
    try {
      if (isEditing && id) {
        await dishesApi.update(id, formData)
      } else {
        await dishesApi.create(formData)
      }
      navigate('/dishes')
    } catch (err: any) {
      console.error('Error saving dish:', err)
      setError(err.response?.data?.message || 'Error al guardar el plato')
    } finally {
      setIsSaving(false)
    }
  }

  const toggleDietaryInfo = (value: TipoDieta) => {
    const current = formData.dietaryInfo || []
    if (current.includes(value)) {
      setFormData({
        ...formData,
        dietaryInfo: current.filter((v) => v !== value),
      })
    } else {
      setFormData({
        ...formData,
        dietaryInfo: [...current, value],
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/dishes')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEditing ? 'Editar Plato' : 'Nuevo Plato'}
        </h1>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Ej: Risotto de hongos"
              required
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
              placeholder="Descripción del plato, ingredientes principales..."
            />
          </div>

          {/* Información dietaria */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Información dietaria
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Selecciona las características que cumple este plato
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {DIETARY_OPTIONS.map((option) => {
                const isSelected = formData.dietaryInfo?.includes(option.value)
                return (
                  <label
                    key={option.value}
                    className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition ${
                      isSelected
                        ? 'bg-green-50 border-green-300'
                        : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleDietaryInfo(option.value)}
                      className="h-4 w-4 mt-0.5 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <div>
                      <div className={`text-sm font-medium ${isSelected ? 'text-green-700' : 'text-gray-900'}`}>
                        {option.label}
                      </div>
                      <div className={`text-xs ${isSelected ? 'text-green-600' : 'text-gray-500'}`}>
                        {option.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/dishes')}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {isSaving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default DishFormPage
