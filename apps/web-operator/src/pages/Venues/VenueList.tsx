import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { venuesApi, Venue } from '@/lib/api'
import { Plus, Search, Building2, MapPin, Users, Edit, Trash2, RotateCcw } from 'lucide-react'
import clsx from 'clsx'

export function VenueListPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showInactive, setShowInactive] = useState(false)

  useEffect(() => {
    loadVenues()
  }, [showInactive])

  const loadVenues = async () => {
    setIsLoading(true)
    try {
      const { data } = await venuesApi.list({
        search: search || undefined,
        includeInactive: showInactive,
      })
      setVenues(data.venues)
    } catch (error) {
      console.error('Error loading venues:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadVenues()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Desactivar este venue?')) return
    try {
      await venuesApi.delete(id)
      loadVenues()
    } catch (error) {
      console.error('Error deleting:', error)
    }
  }

  const handleReactivate = async (id: string) => {
    try {
      await venuesApi.reactivate(id)
      loadVenues()
    } catch (error) {
      console.error('Error reactivating:', error)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Venues</h1>
        <Link
          to="/venues/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nuevo Venue
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar venues..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
          </div>
          <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Mostrar inactivos</span>
          </label>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Venues Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : venues.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay venues</h3>
          <p className="text-gray-500 mb-4">Creá tu primer venue para empezar</p>
          <Link
            to="/venues/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            Crear Venue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {venues.map((venue) => (
            <div
              key={venue.id}
              className={clsx(
                "bg-white rounded-xl shadow-sm border p-6",
                venue.isActive ? "border-gray-100" : "border-gray-200 opacity-60"
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{venue.name}</h3>
                  <span className="text-sm text-gray-500">{venue.type}</span>
                </div>
                {!venue.isActive && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                    Inactivo
                  </span>
                )}
              </div>

              {(venue.address || venue.city) && (
                <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span>
                    {[venue.address, venue.city].filter(Boolean).join(', ')}
                  </span>
                </div>
              )}

              {venue.capacity && (
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>Capacidad: {venue.capacity}</span>
                </div>
              )}

              {venue._count && (
                <div className="text-sm text-gray-500 mb-4">
                  {venue._count.events} evento{venue._count.events !== 1 ? 's' : ''}
                </div>
              )}

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <Link
                  to={`/venues/${venue.id}/edit`}
                  className="flex-1 px-3 py-2 text-center text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center justify-center gap-1"
                >
                  <Edit className="h-4 w-4" />
                  Editar
                </Link>
                {venue.isActive ? (
                  <button
                    onClick={() => handleDelete(venue.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Desactivar"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivate(venue.id)}
                    className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Reactivar"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
