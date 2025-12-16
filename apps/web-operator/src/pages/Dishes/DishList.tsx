import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { dishesApi, Dish } from '@/lib/api'
import { Plus, Search, Loader2, UtensilsCrossed, Edit, Trash2 } from 'lucide-react'
import clsx from 'clsx'

// Categorías de platos
const CATEGORIES = [
  { value: '', label: 'Todas las categorías' },
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'PRINCIPAL', label: 'Principal' },
  { value: 'POSTRE', label: 'Postre' },
  { value: 'BEBIDA', label: 'Bebida' },
  { value: 'GUARNICION', label: 'Guarnición' },
  { value: 'DEGUSTACION', label: 'Degustación' },
  { value: 'OTRO', label: 'Otro' },
]

// Opciones de restricciones alimenticias
const DIETARY_OPTIONS: Record<string, string> = {
  'VEGANO': 'Vegano',
  'VEGETARIANO': 'Vegetariano',
  'SIN_GLUTEN': 'Sin gluten',
  'SIN_LACTOSA': 'Sin lactosa',
  'KOSHER': 'Kosher',
  'HALAL': 'Halal',
  'PESCETARIANO': 'Pescetariano',
  'BAJO_SODIO': 'Bajo en sodio',
  'DIABETICO': 'Diabético',
  'SIN_FRUTOS_SECOS': 'Sin frutos secos',
  'SIN_AZUCAR': 'Sin azúcar',
}

export function DishListPage() {
  const navigate = useNavigate()
  const [dishes, setDishes] = useState<Dish[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')

  useEffect(() => {
    loadDishes()
  }, [searchTerm, categoryFilter])

  const loadDishes = async () => {
    setIsLoading(true)
    try {
      const { data } = await dishesApi.list({
        search: searchTerm || undefined,
        categoria: categoryFilter || undefined,
      })
      // El backend devuelve { success, data: { dishes, total, ... } }
      const dishesData = (data as any).data?.dishes || (data as any).dishes || []
      setDishes(dishesData)
    } catch (err) {
      console.error('Error loading dishes:', err)
      setDishes([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (dish: Dish) => {
    if (!confirm(`¿Eliminar el plato "${dish.nombre}"?`)) return

    try {
      await dishesApi.delete(dish.id)
      await loadDishes()
    } catch (err: any) {
      console.error('Error deleting dish:', err)
      alert(err.response?.data?.message || 'Error al eliminar el plato')
    }
  }

  const parseDietaryInfo = (dish: Dish): string[] => {
    try {
      if (typeof dish.dietaryInfo === 'string') {
        return JSON.parse(dish.dietaryInfo)
      }
      if (Array.isArray(dish.dietaryInfo)) {
        return dish.dietaryInfo
      }
    } catch { /* ignore */ }
    return []
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Platos</h1>
          <p className="text-sm text-gray-500">
            Catálogo de platos disponibles para asignar a menús
          </p>
        </div>
        <button
          onClick={() => navigate('/dishes/new')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-4 w-4" />
          Nuevo Plato
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="search"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Filtro por categoría */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Lista de platos */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      ) : dishes.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
          <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm || categoryFilter
              ? 'No se encontraron platos con los filtros aplicados'
              : 'No hay platos creados. Crea el primer plato.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dishes.map((dish) => {
            const dietaryInfo = parseDietaryInfo(dish)

            return (
              <div
                key={dish.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{dish.nombre}</h3>
                    <span
                      className={clsx(
                        'inline-block px-2 py-0.5 text-xs rounded-full mt-1',
                        {
                          'bg-orange-100 text-orange-700': dish.categoria === 'ENTRADA',
                          'bg-blue-100 text-blue-700': dish.categoria === 'PRINCIPAL',
                          'bg-pink-100 text-pink-700': dish.categoria === 'POSTRE',
                          'bg-cyan-100 text-cyan-700': dish.categoria === 'BEBIDA',
                          'bg-green-100 text-green-700': dish.categoria === 'GUARNICION',
                          'bg-purple-100 text-purple-700': dish.categoria === 'DEGUSTACION',
                          'bg-gray-100 text-gray-700': dish.categoria === 'OTRO',
                        }
                      )}
                    >
                      {CATEGORIES.find((c) => c.value === dish.categoria)?.label || dish.categoria}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => navigate(`/dishes/${dish.id}/edit`)}
                      className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition"
                      title="Editar"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(dish)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {dish.descripcion && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {dish.descripcion}
                  </p>
                )}

                {dietaryInfo.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {dietaryInfo.map((info) => (
                      <span
                        key={info}
                        className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded"
                      >
                        {DIETARY_OPTIONS[info] || info}
                      </span>
                    ))}
                  </div>
                )}

                {dish._count?.eventDishes !== undefined && dish._count.eventDishes > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Usado en {dish._count.eventDishes} evento(s)
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default DishListPage
