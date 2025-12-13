import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { djApi, SongRequest, SongRequestStatus } from '@/lib/api'
import { DJLayout } from '@/components/DJLayout'
import { DJRequestCard } from '@/components/DJ/DJRequestCard'
import { GuestHistoryModal } from '@/components/DJ/GuestHistoryModal'
import { Music, Filter } from 'lucide-react'

export default function DJMusicaDJ() {
  const { eventId } = useParams<{ eventId: string }>()
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<SongRequestStatus | 'ALL'>('ALL')

  useEffect(() => {
    if (eventId) {
      loadRequests()
    }
  }, [eventId])

  const loadRequests = async () => {
    if (!eventId) return

    setLoading(true)
    setError(null)
    try {
      const res = await djApi.getMusicaDJRequests(eventId)
      setRequests(res.data.requests || [])
    } catch (err: any) {
      console.error('Error loading requests:', err)
      setError(err.response?.data?.message || 'Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: SongRequestStatus) => {
    if (!eventId) return

    try {
      await djApi.updateMusicaDJRequestStatus(eventId, requestId, newStatus)
      // Update local state
      setRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status: newStatus } : req
        )
      )
    } catch (err: any) {
      console.error('Error updating status:', err)
      alert(err.response?.data?.message || 'Error al actualizar el estado')
    }
  }

  const handleViewHistory = (guestId: string) => {
    setSelectedGuestId(guestId)
  }

  // Filter requests by status
  const filteredRequests = requests.filter((req) => {
    if (statusFilter === 'ALL') return true
    return req.status === statusFilter
  })

  // Sort requests: URGENT > HIGHLIGHTED > PENDING > others
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const priority = { URGENT: 0, HIGHLIGHTED: 1, PENDING: 2, PLAYED: 3, DISCARDED: 4 }
    return (priority[a.status] ?? 99) - (priority[b.status] ?? 99)
  })

  // Stats
  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === 'PENDING').length,
    highlighted: requests.filter((r) => r.status === 'HIGHLIGHTED').length,
    urgent: requests.filter((r) => r.status === 'URGENT').length,
    played: requests.filter((r) => r.status === 'PLAYED').length,
  }

  if (loading) {
    return (
      <DJLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600" />
        </div>
      </DJLayout>
    )
  }

  if (error) {
    return (
      <DJLayout>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <Music className="h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
          <p className="text-gray-500 text-center">{error}</p>
          <button
            onClick={loadRequests}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Reintentar
          </button>
        </div>
      </DJLayout>
    )
  }

  return (
    <DJLayout>
      <div className="p-4">
        {/* Stats */}
        <div className="grid grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'ALL' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs mt-1">Total</div>
          </button>
          <button
            onClick={() => setStatusFilter('URGENT')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'URGENT' ? 'bg-red-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.urgent}</div>
            <div className="text-xs mt-1">Urgente</div>
          </button>
          <button
            onClick={() => setStatusFilter('HIGHLIGHTED')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'HIGHLIGHTED' ? 'bg-yellow-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.highlighted}</div>
            <div className="text-xs mt-1">Destacado</div>
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'PENDING' ? 'bg-gray-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.pending}</div>
            <div className="text-xs mt-1">Pendiente</div>
          </button>
          <button
            onClick={() => setStatusFilter('PLAYED')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'PLAYED' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.played}</div>
            <div className="text-xs mt-1">Tocadas</div>
          </button>
        </div>

        {/* Filter indicator */}
        {statusFilter !== 'ALL' && (
          <div className="mb-4 flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-purple-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Mostrando: {statusFilter} ({filteredRequests.length})
              </span>
            </div>
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-sm text-purple-600 hover:text-purple-800 font-medium"
            >
              Ver todo
            </button>
          </div>
        )}

        {/* Requests List */}
        {sortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Music className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {statusFilter === 'ALL' ? 'No hay solicitudes' : `No hay solicitudes ${statusFilter.toLowerCase()}`}
            </h2>
            <p className="text-gray-500 text-center">
              {statusFilter === 'ALL'
                ? 'Las solicitudes de música aparecerán aquí'
                : 'Prueba con otro filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((request) => (
              <DJRequestCard
                key={request.id}
                request={request}
                onStatusChange={handleStatusChange}
                onViewHistory={handleViewHistory}
              />
            ))}
          </div>
        )}
      </div>

      {/* Guest History Modal */}
      <GuestHistoryModal
        guestId={selectedGuestId}
        isOpen={!!selectedGuestId}
        onClose={() => setSelectedGuestId(null)}
      />
    </DJLayout>
  )
}
