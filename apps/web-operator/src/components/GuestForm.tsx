import { useState, useEffect } from 'react'
import { eventGuestsApi, mesasApi, menuApi, EventGuest, EventGuestCreateInput, EventGuestUpdateInput, Accesibilidad, Mesa, GuestDish, EventDish } from '@/lib/api'
import { PersonSelector } from './PersonSelector'
import { X, Loader2, UtensilsCrossed, Plus, Trash2, AlertCircle } from 'lucide-react'

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

  // Estado para menú asignado
  const [guestDishes, setGuestDishes] = useState<GuestDish[]>([])
  const [menuDishes, setMenuDishes] = useState<EventDish[]>([])
  const [loadingDishes, setLoadingDishes] = useState(false)
  const [selectedDishToAdd, setSelectedDishToAdd] = useState('')
  const [addingDish, setAddingDish] = useState(false)
  const [removingDishId, setRemovingDishId] = useState<string | null>(null)

  // Cargar mesas del evento
  useEffect(() => {
    loadMesas()
    if (isEditing && guest) {
      loadGuestDishes()
      loadMenuDishes()
    }
  }, [eventId, guest?.id])

  const loadMesas = async () => {
    try {
      const { data } = await mesasApi.list(eventId)
      // El backend devuelve { success, data: mesas[], meta: stats }
      const mesasData = (data as any).data || data.mesas || []
      setMesas(mesasData)
    } catch (err) {
      console.error('Error loading mesas:', err)
      // No bloquear si falla - mesas es opcional
      setMesas([])
    }
  }

  const loadGuestDishes = async () => {
    if (!guest) return
    setLoadingDishes(true)
    try {
      const { data } = await menuApi.getGuestDishes(eventId, guest.id)
      // Manejar diferentes formatos de respuesta
      const dishesData = (data as any).data?.dishes || (data as any).dishes || []
      setGuestDishes(dishesData)
    } catch (err) {
      console.error('Error loading guest dishes:', err)
      setGuestDishes([])
    } finally {
      setLoadingDishes(false)
    }
  }

  const loadMenuDishes = async () => {
    try {
      const { data } = await menuApi.getMenu(eventId)
      const menuData = (data as any).data || data
      // Extraer todos los platos del menú de todas las categorías
      const allDishes: EventDish[] = []
      if (menuData.categories) {
        menuData.categories.forEach((cat: any) => {
          if (cat.dishes) {
            cat.dishes.forEach((d: any) => allDishes.push(d))
          }
        })
      }
      setMenuDishes(allDishes)
    } catch (err) {
      console.error('Error loading menu dishes:', err)
      setMenuDishes([])
    }
  }

  const handleAddDish = async () => {
    if (!selectedDishToAdd || !guest) return
    setAddingDish(true)
    try {
      await menuApi.assignDish(eventId, {
        eventGuestId: guest.id,
        eventDishId: selectedDishToAdd
      })
      setSelectedDishToAdd('')
      await loadGuestDishes()
    } catch (err: any) {
      console.error('Error assigning dish:', err)
      setError(err.response?.data?.message || 'Error al asignar plato')
    } finally {
      setAddingDish(false)
    }
  }

  const handleRemoveDish = async (guestDishId: string) => {
    setRemovingDishId(guestDishId)
    try {
      await menuApi.unassignDish(eventId, guestDishId)
      await loadGuestDishes()
    } catch (err: any) {
      console.error('Error removing dish:', err)
      setError(err.response?.data?.message || 'Error al quitar plato')
    } finally {
      setRemovingDishId(null)
    }
  }

  // Obtener platos disponibles para agregar (que no están ya asignados)
  const availableDishes = menuDishes.filter(
    md => !guestDishes.some(gd => gd.eventDishId === md.id)
  )

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

          {/* Menú Asignado - Solo visible al editar */}
          {isEditing && (
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center gap-2 mb-4">
                <UtensilsCrossed className="h-5 w-5 text-primary-600" />
                <h3 className="text-lg font-medium text-gray-900">Menú Asignado</h3>
              </div>

              {loadingDishes ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                  <span className="ml-2 text-sm text-gray-500">Cargando platos...</span>
                </div>
              ) : (
                <>
                  {/* Lista de platos asignados */}
                  {guestDishes.length === 0 ? (
                    <div className="flex items-center gap-2 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      <span className="text-sm text-amber-700">
                        No hay platos asignados a este invitado
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-2 mb-4">
                      {guestDishes.map((gd) => (
                        <div
                          key={gd.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                        >
                          <div>
                            <div className="font-medium text-gray-900">
                              {gd.eventDish?.dish?.nombre || 'Plato desconocido'}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                              {gd.eventDish?.category?.nombre && (
                                <span className="text-xs text-gray-500">
                                  {gd.eventDish.category.nombre}
                                </span>
                              )}
                              {gd.eventDish?.dish?.dietaryInfo && gd.eventDish.dish.dietaryInfo.length > 0 && (
                                <div className="flex gap-1">
                                  {gd.eventDish.dish.dietaryInfo.map((info: string) => (
                                    <span
                                      key={info}
                                      className="px-1.5 py-0.5 text-xs bg-green-100 text-green-700 rounded"
                                    >
                                      {info}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveDish(gd.id)}
                            disabled={removingDishId === gd.id}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                            title="Quitar plato"
                          >
                            {removingDishId === gd.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Agregar plato */}
                  {availableDishes.length > 0 ? (
                    <div className="flex gap-2">
                      <select
                        value={selectedDishToAdd}
                        onChange={(e) => setSelectedDishToAdd(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="">Seleccionar plato para agregar...</option>
                        {availableDishes.map((md) => (
                          <option key={md.id} value={md.id}>
                            {md.dish?.nombre || 'Sin nombre'} ({(md as any).category?.nombre || 'Sin categoría'})
                            {md.dish?.dietaryInfo && md.dish.dietaryInfo.length > 0 && ` - ${md.dish.dietaryInfo.join(', ')}`}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={handleAddDish}
                        disabled={!selectedDishToAdd || addingDish}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {addingDish ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                        Agregar
                      </button>
                    </div>
                  ) : menuDishes.length === 0 ? (
                    <p className="text-sm text-gray-500">
                      No hay platos en el menú del evento. Agrega platos desde la sección Menú.
                    </p>
                  ) : (
                    <p className="text-sm text-gray-500">
                      Todos los platos del menú ya están asignados a este invitado.
                    </p>
                  )}
                </>
              )}
            </div>
          )}

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
