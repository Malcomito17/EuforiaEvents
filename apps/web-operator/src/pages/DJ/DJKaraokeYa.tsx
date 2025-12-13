import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { djApi, KaraokeRequest, KaraokeRequestStatus } from '@/lib/api'
import { DJLayout } from '@/components/DJLayout'
import { DJKaraokeCard } from '@/components/DJ/DJKaraokeCard'
import { GuestHistoryModal } from '@/components/DJ/GuestHistoryModal'
import { Mic2, Filter } from 'lucide-react'

export default function DJKaraokeYa() {
  const { eventId } = useParams<{ eventId: string }>()
  const [requests, setRequests] = useState<KaraokeRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedGuestId, setSelectedGuestId] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<KaraokeRequestStatus | 'ALL'>('ALL')

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
      const res = await djApi.getKaraokeyaRequests(eventId)
      setRequests(res.data.requests || [])
    } catch (err: any) {
      console.error('Error loading requests:', err)
      setError(err.response?.data?.message || 'Error al cargar las solicitudes')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (requestId: string, newStatus: KaraokeRequestStatus) => {
    if (!eventId) return

    try {
      await djApi.updateKaraokeyaRequestStatus(eventId, requestId, newStatus)
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

  // Sort requests: CALLED > ON_STAGE > QUEUED > others (by queue position)
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    const priority = { CALLED: 0, ON_STAGE: 1, QUEUED: 2, COMPLETED: 3, NO_SHOW: 4, CANCELLED: 5 }
    const aPriority = priority[a.status] ?? 99
    const bPriority = priority[b.status] ?? 99

    if (aPriority !== bPriority) {
      return aPriority - bPriority
    }

    // If same priority, sort by queue position
    return a.queuePosition - b.queuePosition
  })

  // Stats
  const stats = {
    total: requests.length,
    queued: requests.filter((r) => r.status === 'QUEUED').length,
    called: requests.filter((r) => r.status === 'CALLED').length,
    onStage: requests.filter((r) => r.status === 'ON_STAGE').length,
    completed: requests.filter((r) => r.status === 'COMPLETED').length,
  }

  if (loading) {
    return (
      <DJLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        </div>
      </DJLayout>
    )
  }

  if (error) {
    return (
      <DJLayout>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <Mic2 className="h-16 w-16 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Error</h2>
          <p className="text-gray-500 text-center">{error}</p>
          <button
            onClick={loadRequests}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
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
              statusFilter === 'ALL' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs mt-1">Total</div>
          </button>
          <button
            onClick={() => setStatusFilter('CALLED')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'CALLED' ? 'bg-yellow-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.called}</div>
            <div className="text-xs mt-1">Llamado</div>
          </button>
          <button
            onClick={() => setStatusFilter('ON_STAGE')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'ON_STAGE' ? 'bg-purple-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.onStage}</div>
            <div className="text-xs mt-1">Escenario</div>
          </button>
          <button
            onClick={() => setStatusFilter('QUEUED')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'QUEUED' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.queued}</div>
            <div className="text-xs mt-1">En Cola</div>
          </button>
          <button
            onClick={() => setStatusFilter('COMPLETED')}
            className={`p-3 rounded-lg text-center ${
              statusFilter === 'COMPLETED' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200'
            }`}
          >
            <div className="text-2xl font-bold">{stats.completed}</div>
            <div className="text-xs mt-1">Completo</div>
          </button>
        </div>

        {/* Filter indicator */}
        {statusFilter !== 'ALL' && (
          <div className="mb-4 flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-indigo-700">
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Mostrando: {statusFilter} ({filteredRequests.length})
              </span>
            </div>
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Ver todo
            </button>
          </div>
        )}

        {/* Requests List */}
        {sortedRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <Mic2 className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              {statusFilter === 'ALL' ? 'No hay solicitudes' : `No hay solicitudes ${statusFilter.toLowerCase()}`}
            </h2>
            <p className="text-gray-500 text-center">
              {statusFilter === 'ALL'
                ? 'Las solicitudes de karaoke aparecerán aquí'
                : 'Prueba con otro filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRequests.map((request) => (
              <DJKaraokeCard
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
