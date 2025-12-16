import { Dish, TipoDieta } from '@/lib/api'
import { Plus, Check, Star } from 'lucide-react'
import clsx from 'clsx'

interface DishCardProps {
  dish: Dish
  isInMenu?: boolean
  isDefault?: boolean
  onAddToMenu?: (dishId: string) => void
  onRemoveFromMenu?: (dishId: string) => void
  onSetDefault?: (eventDishId: string) => void
  onEdit?: (dish: Dish) => void
  eventDishId?: string
}

// Helper para parsear JSON de forma segura
function safeJsonParse<T>(value: any, fallback: T): T {
  if (!value) return fallback
  if (Array.isArray(value)) return value as T
  if (typeof value === 'object') return value as T
  if (typeof value === 'string') {
    try {
      return JSON.parse(value) as T
    } catch {
      // Si no es JSON válido, puede ser un valor simple como "VEGETARIANO"
      return [value] as T
    }
  }
  return fallback
}

export function DishCard({
  dish,
  isInMenu = false,
  isDefault = false,
  onAddToMenu,
  onRemoveFromMenu,
  onSetDefault,
  onEdit,
  eventDishId
}: DishCardProps) {
  const dietaryInfo: TipoDieta[] = safeJsonParse<TipoDieta[]>(dish.dietaryInfo, [])
  const allergens: string[] = safeJsonParse<string[]>(dish.allergens, [])

  return (
    <div className={clsx(
      'p-4 border rounded-lg transition-all',
      isDefault && 'border-yellow-400 bg-yellow-50',
      !isDefault && 'border-gray-200 hover:border-gray-300'
    )}>
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900">{dish.nombre}</h3>
            {isDefault && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <p className="text-sm text-gray-500 uppercase tracking-wide mt-0.5">
            {dish.categoria}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-1">
          {isInMenu ? (
            <>
              {eventDishId && !isDefault && onSetDefault && (
                <button
                  onClick={() => onSetDefault(eventDishId)}
                  className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition"
                  title="Marcar como default"
                >
                  <Star className="h-4 w-4" />
                </button>
              )}
              {onRemoveFromMenu && (
                <button
                  onClick={() => onRemoveFromMenu(dish.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  title="Quitar del menú"
                >
                  <Check className="h-4 w-4" />
                </button>
              )}
            </>
          ) : (
            onAddToMenu && (
              <button
                onClick={() => onAddToMenu(dish.id)}
                className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                title="Agregar al menú"
              >
                <Plus className="h-4 w-4" />
              </button>
            )
          )}
        </div>
      </div>

      {/* Description */}
      {dish.descripcion && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {dish.descripcion}
        </p>
      )}

      {/* Dietary Info */}
      {dietaryInfo.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {dietaryInfo.map((diet) => (
            <DietaryBadge key={diet} type={diet} />
          ))}
        </div>
      )}

      {/* Allergens */}
      {allergens.length > 0 && (
        <div className="mt-2">
          <p className="text-xs text-gray-500">
            ⚠️ Alérgenos: {allergens.join(', ')}
          </p>
        </div>
      )}

      {/* Edit button if provided */}
      {onEdit && (
        <button
          onClick={() => onEdit(dish)}
          className="mt-3 text-xs text-gray-500 hover:text-primary-600 transition"
        >
          Editar plato
        </button>
      )}
    </div>
  )
}

// Badge para restricciones dietarias
function DietaryBadge({ type }: { type: TipoDieta }) {
  const config: Record<TipoDieta, { bg: string; text: string; label: string }> = {
    VEGANO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vegano' },
    VEGETARIANO: { bg: 'bg-green-100', text: 'text-green-700', label: 'Vegetariano' },
    SIN_GLUTEN: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Sin Gluten' },
    SIN_LACTOSA: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Sin Lactosa' },
    KOSHER: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Kosher' },
    HALAL: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Halal' },
    PESCETARIANO: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'Pescetariano' },
    BAJO_SODIO: { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Bajo Sodio' },
    DIABETICO: { bg: 'bg-red-100', text: 'text-red-700', label: 'Diabético' }
  }

  const { bg, text, label } = config[type]

  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', bg, text)}>
      {label}
    </span>
  )
}
