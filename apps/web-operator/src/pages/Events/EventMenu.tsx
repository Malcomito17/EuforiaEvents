import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  eventsApi,
  dishesApi,
  menuApi,
  Event,
  Dish,
  EventDish,
  MenuAlertResponse
} from '@/lib/api'
import { ArrowLeft, Plus, AlertTriangle, Loader2, Utensils, Sparkles } from 'lucide-react'
import { DishCard } from '@/components/DishCard'
import { DishForm } from '@/components/DishForm'
import { MenuAlertsDashboard } from '@/components/MenuAlertsDashboard'

export function EventMenuPage() {
  const { id: eventId } = useParams()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Catálogo de platos
  const [allDishes, setAllDishes] = useState<Dish[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Menú del evento
  const [menuCategories, setMenuCategories] = useState<Array<{
    category: { id: string; nombre: string }
    dishes: EventDish[]
  }>>([])

  // Alertas
  const [alerts, setAlerts] = useState<MenuAlertResponse | null>(null)

  // Modales
  const [showDishForm, setShowDishForm] = useState(false)
  const [showAlertsDashboard, setShowAlertsDashboard] = useState(false)
  const [editingDish, setEditingDish] = useState<Dish | null>(null)

  useEffect(() => {
    loadData()
  }, [eventId])

  const loadData = async () => {
    if (!eventId) return

    setIsLoading(true)
    try {
      const [eventRes, dishesRes, menuRes, alertsRes] = await Promise.all([
        eventsApi.get(eventId),
        dishesApi.list(),
        menuApi.getMenu(eventId),
        menuApi.getAlerts(eventId)
      ])

      setEvent(eventRes.data)
      // El backend devuelve { success, data: dishes[] }
      const dishesData = (dishesRes.data as any).data || dishesRes.data.dishes || []
      setAllDishes(dishesData)
      // Menu puede venir como { data: { categories } } o { categories }
      const menuData = (menuRes.data as any).data || menuRes.data
      setMenuCategories(menuData.categories || [])
      // Alerts puede venir como { data: alerts } o directamente
      const alertsData = (alertsRes.data as any).data || alertsRes.data
      setAlerts(alertsData)
    } catch (err) {
      console.error('Error loading data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddDishToMenu = async (dishId: string) => {
    if (!eventId) return

    try {
      await menuApi.addDish(eventId, { dishId, isDefault: false })
      await loadData()
    } catch (err) {
      console.error('Error adding dish to menu:', err)
      alert('Error al agregar el plato al menú')
    }
  }

  const handleRemoveDishFromMenu = async (dishId: string) => {
    if (!eventId) return
    if (!confirm('¿Quitar este plato del menú?')) return

    try {
      await menuApi.removeDish(eventId, dishId)
      await loadData()
    } catch (err) {
      console.error('Error removing dish from menu:', err)
      alert('Error al quitar el plato del menú')
    }
  }

  const handleSetDefault = async (eventDishId: string) => {
    if (!eventId) return

    try {
      await menuApi.setDefault(eventId, eventDishId)
      await loadData()
    } catch (err) {
      console.error('Error setting default:', err)
      alert('Error al marcar como default')
    }
  }

  const handleAutoAssignDefaults = async () => {
    if (!eventId) return
    if (!confirm('¿Auto-asignar los platos default a todos los invitados sin plato?')) return

    try {
      const { data } = await menuApi.autoAssignDefaults(eventId)
      alert(`Se asignaron ${data.assigned} platos. ${data.skipped} invitados ya tenían plato asignado.`)
      await loadData()
    } catch (err: any) {
      console.error('Error auto-assigning:', err)
      alert(err.response?.data?.error || 'Error al auto-asignar platos')
    }
  }

  // Filtrar platos del catálogo
  const getFilteredCatalogDishes = () => {
    let filtered = allDishes

    // Filtrar por categoría
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(d => d.categoria === categoryFilter)
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(d =>
        d.nombre?.toLowerCase().includes(term) ||
        d.descripcion?.toLowerCase()?.includes(term)
      )
    }

    // Excluir platos que ya están en el menú
    const dishesInMenu = new Set(
      menuCategories.flatMap(cat => cat.dishes.map(ed => ed.dishId))
    )
    filtered = filtered.filter(d => !dishesInMenu.has(d.id))

    return filtered
  }

  const getCategoriesInCatalog = () => {
    const categories = new Set(allDishes.map(d => d.categoria))
    return Array.from(categories).sort()
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const catalogDishes = getFilteredCatalogDishes()
  const totalDishesInMenu = menuCategories.reduce((sum, cat) => sum + cat.dishes.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Menú del Evento</h1>
            {event?.eventData?.eventName && (
              <p className="text-sm text-gray-500">{event.eventData.eventName}</p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDishForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <Plus className="h-4 w-4" />
            Nuevo Plato
          </button>
          {totalDishesInMenu > 0 && (
            <button
              onClick={handleAutoAssignDefaults}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Sparkles className="h-4 w-4" />
              Auto-asignar Defaults
            </button>
          )}
        </div>
      </div>

      {/* Alertas */}
      {alerts && alerts.totalAlerts > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-semibold text-yellow-900">
                  {alerts.totalAlerts} Alerta{alerts.totalAlerts !== 1 ? 's' : ''} de Restricciones Dietarias
                </div>
                <div className="text-sm text-yellow-700">
                  {alerts.guestsWithIssues} invitado{alerts.guestsWithIssues !== 1 ? 's' : ''} con problemas detectados
                  {alerts.highSeverity > 0 && ` (${alerts.highSeverity} de alta prioridad)`}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowAlertsDashboard(true)}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition"
            >
              Ver Dashboard
            </button>
          </div>
        </div>
      )}

      {/* Layout de 2 columnas */}
      <div className="grid grid-cols-12 gap-6">
        {/* Sidebar: Catálogo de Platos */}
        <div className="col-span-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-4">
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="h-5 w-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Catálogo de Platos</h2>
            </div>

            {/* Filtros */}
            <div className="space-y-3 mb-4">
              <input
                type="search"
                placeholder="Buscar platos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              />

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
              >
                <option value="all">Todas las categorías</option>
                {getCategoriesInCatalog().map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Lista de platos */}
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {catalogDishes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 text-sm">
                  {searchTerm || categoryFilter !== 'all'
                    ? 'No hay platos que coincidan con los filtros'
                    : 'Todos los platos están en el menú'}
                </div>
              ) : (
                catalogDishes.map((dish) => (
                  <DishCard
                    key={dish.id}
                    dish={dish}
                    onAddToMenu={handleAddDishToMenu}
                    onEdit={(dish) => {
                      setEditingDish(dish)
                      setShowDishForm(true)
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main: Menú del Evento */}
        <div className="col-span-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Menú del Evento ({totalDishesInMenu} plato{totalDishesInMenu !== 1 ? 's' : ''})
              </h2>
            </div>

            {menuCategories.length === 0 ? (
              <div className="text-center py-12">
                <Utensils className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 mb-2">
                  No hay platos en el menú
                </p>
                <p className="text-sm text-gray-400">
                  Agrega platos desde el catálogo de la izquierda
                </p>
              </div>
            ) : (
              <div className="space-y-8">
                {menuCategories.map((category) => (
                  <div key={category.category.id}>
                    <h3 className="text-base font-semibold text-gray-900 mb-3">
                      {category.category.nombre} ({category.dishes.length})
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {category.dishes.map((eventDish) => (
                        <DishCard
                          key={eventDish.id}
                          dish={eventDish.dish}
                          isInMenu={true}
                          isDefault={eventDish.isDefault}
                          onRemoveFromMenu={handleRemoveDishFromMenu}
                          onSetDefault={handleSetDefault}
                          eventDishId={eventDish.id}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modales */}
      {showDishForm && (
        <DishForm
          dish={editingDish}
          onClose={() => {
            setShowDishForm(false)
            setEditingDish(null)
          }}
          onSuccess={loadData}
        />
      )}

      {showAlertsDashboard && alerts && (
        <MenuAlertsDashboard
          alerts={alerts.alerts}
          totalAlerts={alerts.totalAlerts}
          highSeverity={alerts.highSeverity}
          mediumSeverity={alerts.mediumSeverity}
          guestsWithIssues={alerts.guestsWithIssues}
          onClose={() => setShowAlertsDashboard(false)}
        />
      )}
    </div>
  )
}

export default EventMenuPage
