import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Mic2,
  Clock,
  Phone,
  Users,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  Settings,
  ExternalLink,
  UserX,
  GripVertical
} from 'lucide-react'
import { clsx } from 'clsx'
import { eventsApi, karaokeyaApi, KaraokeRequest, KaraokeRequestStatus, Event, KaraokeyaStats } from '@/lib/api'
import { connectSocket, disconnectSocket, subscribeKaraokeya } from '@/lib/socket'
import { DisplayControlPanel } from '@/components/DisplayControlPanel'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Status configuration
const STATUS_CONFIG: Record<KaraokeRequestStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  QUEUED: { label: 'En Cola', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Clock },
  CALLED: { label: 'Llamado', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: Phone },
  ON_STAGE: { label: 'En Escenario', color: 'text-purple-600', bgColor: 'bg-purple-50 border-purple-200', icon: Users },
  COMPLETED: { label: 'Completado', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
  NO_SHOW: { label: 'No Vino', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', icon: UserX },
  CANCELLED: { label: 'Cancelado', color: 'text-gray-500', bgColor: 'bg-gray-50 border-gray-200', icon: XCircle },
}

// Filter tabs
type FilterTab = 'all' | 'active' | 'on_stage' | 'completed' | 'cancelled'

const FILTER_TABS: { key: FilterTab; label: string; statuses: KaraokeRequestStatus[] | null }[] = [
  { key: 'all', label: 'Todos', statuses: null },
  { key: 'active', label: 'En Cola', statuses: ['QUEUED', 'CALLED'] },
  { key: 'on_stage', label: 'En Escenario', statuses: ['ON_STAGE'] },
  { key: 'completed', label: 'Completados', statuses: ['COMPLETED'] },
  { key: 'cancelled', label: 'Cancelados/No Show', statuses: ['CANCELLED', 'NO_SHOW'] },
]

export function KaraokeyaPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()

  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [requests, setRequests] = useState<KaraokeRequest[]>([])
  const [stats, setStats] = useState<KaraokeyaStats | null>(null)
  const [config, setConfig] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('active')
  const [searchQuery, setSearchQuery] = useState('')

  // Load data
  const loadData = useCallback(async () => {
    if (!eventId) return

    try {
      setError(null)

      // Load event, requests, stats, and config in parallel
      const [eventRes, requestsRes, statsRes, configRes] = await Promise.all([
        eventsApi.get(eventId),
        karaokeyaApi.listRequests(eventId, { limit: 100 }),
        karaokeyaApi.getStats(eventId),
        karaokeyaApi.getConfig(eventId),
      ])

      setEvent(eventRes.data)
      setRequests(requestsRes.data.requests)
      setStats(statsRes.data)
      setConfig(configRes.data)
    } catch (err: any) {
      console.error('Error loading data:', err)
      setError(err.response?.data?.error || 'Error al cargar datos')
    } finally {
      setIsLoading(false)
    }
  }, [eventId])

  // Initial load and socket connection
  useEffect(() => {
    loadData()

    if (eventId) {
      // Connect to socket
      connectSocket({
        eventId,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onError: (err) => console.error('Socket error:', err),
      })

      // Subscribe to KARAOKEYA events
      const unsubscribe = subscribeKaraokeya({
        onNewRequest: (request) => {
          setRequests(prev => [request as KaraokeRequest, ...prev])
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            queued: prev.queued + 1,
          } : null)
        },
        onRequestUpdated: (updated) => {
          setRequests(prev => prev.map(r =>
            r.id === updated.id ? { ...r, ...updated } as KaraokeRequest : r
          ))
          // Reload stats
          loadData()
        },
        onRequestDeleted: ({ requestId }) => {
          setRequests(prev => prev.filter(r => r.id !== requestId))
          loadData()
        },
        onQueueReordered: ({ requests: reordered }) => {
          setRequests(reordered as KaraokeRequest[])
        },
      })

      return () => {
        unsubscribe()
        disconnectSocket()
      }
    }
  }, [eventId, loadData])

  // Drag & Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px de movimiento antes de activar drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Update request status
  const handleStatusChange = async (requestId: string, newStatus: KaraokeRequestStatus) => {
    if (!eventId) return

    try {
      await karaokeyaApi.updateRequest(eventId, requestId, { status: newStatus })
      // Optimistic update
      setRequests(prev => prev.map(r =>
        r.id === requestId ? { ...r, status: newStatus } : r
      ))
      loadData() // Reload to get accurate stats
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.response?.data?.error || 'Error al actualizar estado')
    }
  }

  // Handle drag end - reorder queue
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !eventId) {
      return
    }

    const oldIndex = filteredRequests.findIndex(r => r.id === active.id)
    const newIndex = filteredRequests.findIndex(r => r.id === over.id)

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    // Optimistic update
    const newOrder = arrayMove(filteredRequests, oldIndex, newIndex)
    setRequests(prev => {
      // Merge newOrder with items not in filteredRequests
      const filteredIds = new Set(filteredRequests.map(r => r.id))
      const otherItems = prev.filter(r => !filteredIds.has(r.id))
      return [...newOrder, ...otherItems]
    })

    try {
      // Send only the IDs of the reordered items to the backend
      await karaokeyaApi.reorderQueue(eventId, newOrder.map(r => r.id))
    } catch (err: any) {
      console.error('Error reordering queue:', err)
      setError(err.response?.data?.error || 'Error al reordenar cola')
      // Reload on error to get correct order from server
      loadData()
    }
  }

  // Handle config update
  const handleConfigUpdate = async (updatedConfig: any) => {
    if (!eventId) return

    try {
      await karaokeyaApi.updateConfig(eventId, updatedConfig)
      setConfig(prev => ({ ...prev, ...updatedConfig }))
    } catch (err: any) {
      console.error('Error updating config:', err)
      throw new Error(err.response?.data?.error || 'Error al actualizar configuración')
    }
  }

  // Filter requests
  const filteredRequests = requests.filter(request => {
    // Filter by tab
    const tab = FILTER_TABS.find(t => t.key === activeTab)
    if (tab?.statuses && !tab.statuses.includes(request.status)) {
      return false
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        request.title.toLowerCase().includes(query) ||
        (request.artist && request.artist.toLowerCase().includes(query)) ||
        request.guest.displayName.toLowerCase().includes(query) ||
        request.guest.email.toLowerCase().includes(query)
      )
    }

    return true
  })

  // Get tab count
  const getTabCount = (tab: FilterTab): number => {
    if (!stats) return 0
    switch (tab) {
      case 'all': return stats.total
      case 'active': return stats.queued + stats.called
      case 'on_stage': return stats.onStage
      case 'completed': return stats.completed
      case 'cancelled': return stats.cancelled + stats.noShow
    }
  }

  // Format time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })
  }

  // Time ago
  const timeAgo = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diff < 60) return 'hace segundos'
    if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`
    if (diff < 86400) return `hace ${Math.floor(diff / 3600)}h`
    return formatTime(dateStr)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error && !event) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:underline">
          Volver
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/events/${eventId}`)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Mic2 className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">KARAOKEYA</h1>
            </div>
            <p className="text-gray-500">{event?.eventData?.eventName || 'Evento'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm',
            isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          )}>
            {isConnected ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>

          {/* Refresh button */}
          <button
            onClick={loadData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="h-5 w-5" />
          </button>

          {/* Config link */}
          <Link
            to={`/events/${eventId}/karaokeya/config`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.queued}</div>
            <div className="text-sm text-blue-600">En Cola</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.called}</div>
            <div className="text-sm text-yellow-600">Llamados</div>
          </div>
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
            <div className="text-2xl font-bold text-purple-700">{stats.onStage}</div>
            <div className="text-sm text-purple-600">En Escenario</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.completed}</div>
            <div className="text-sm text-green-600">Completados</div>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <div className="text-2xl font-bold text-orange-700">{stats.noShow}</div>
            <div className="text-sm text-orange-600">No Vino</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-2xl font-bold text-gray-700">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </div>
        </div>
      )}

      {/* Display Control Panel */}
      {config && event && (
        <DisplayControlPanel
          eventId={eventId!}
          eventSlug={event.slug}
          config={{
            displayMode: config.displayMode,
            displayLayout: config.displayLayout,
            displayBreakMessage: config.displayBreakMessage,
            displayStartMessage: config.displayStartMessage,
            displayPromoImageUrl: config.displayPromoImageUrl,
          }}
          onConfigUpdate={handleConfigUpdate}
        />
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              )}
            >
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">({getTabCount(tab.key)})</span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar canción o solicitante..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Mic2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery
                ? 'No se encontraron solicitudes con esos criterios'
                : activeTab === 'active'
                  ? 'No hay solicitudes en cola. ¡Esperando nuevas solicitudes!'
                  : 'No hay solicitudes en esta categoría'
              }
            </p>
          </div>
        ) : activeTab === 'active' ? (
          // Drag & Drop enabled for "active" tab only
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={filteredRequests.map(r => r.id)}
              strategy={verticalListSortingStrategy}
            >
              {filteredRequests.map(request => (
                <SortableRequestCard
                  key={request.id}
                  request={request}
                  onStatusChange={handleStatusChange}
                  formatTime={formatTime}
                  timeAgo={timeAgo}
                />
              ))}
            </SortableContext>
          </DndContext>
        ) : (
          // No drag & drop for other tabs
          filteredRequests.map(request => (
            <RequestCard
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              formatTime={formatTime}
              timeAgo={timeAgo}
            />
          ))
        )}
      </div>
    </div>
  )
}

// Sortable Request Card (with drag & drop)
interface SortableRequestCardProps {
  request: KaraokeRequest
  onStatusChange: (id: string, status: KaraokeRequestStatus) => void
  formatTime: (date: string) => string
  timeAgo: (date: string) => string
}

function SortableRequestCard({ request, onStatusChange, formatTime, timeAgo }: SortableRequestCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <RequestCard
        request={request}
        onStatusChange={onStatusChange}
        formatTime={formatTime}
        timeAgo={timeAgo}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDraggable
      />
    </div>
  )
}

// Request Card Component
interface RequestCardProps {
  request: KaraokeRequest
  onStatusChange: (id: string, status: KaraokeRequestStatus) => void
  formatTime: (date: string) => string
  timeAgo: (date: string) => string
  dragHandleProps?: any
  isDraggable?: boolean
}

function RequestCard({ request, onStatusChange, formatTime, timeAgo, dragHandleProps, isDraggable = false }: RequestCardProps) {
  const statusConfig = STATUS_CONFIG[request.status]
  const StatusIcon = statusConfig.icon

  // Available status transitions
  const getAvailableTransitions = (): KaraokeRequestStatus[] => {
    switch (request.status) {
      case 'QUEUED':
        return ['CALLED', 'CANCELLED']
      case 'CALLED':
        return ['ON_STAGE', 'NO_SHOW', 'QUEUED']
      case 'ON_STAGE':
        return ['COMPLETED', 'CALLED']
      case 'COMPLETED':
        return ['QUEUED'] // Can revert to queue
      case 'NO_SHOW':
        return ['QUEUED', 'CALLED'] // Can retry
      case 'CANCELLED':
        return ['QUEUED'] // Can reactivate
      default:
        return []
    }
  }

  return (
    <div className={clsx(
      'bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md',
      statusConfig.bgColor
    )}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          {isDraggable && (
            <div
              {...dragHandleProps}
              className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            >
              <GripVertical className="h-5 w-5" />
            </div>
          )}

          {/* Thumbnail */}
          <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
            {request.song?.thumbnailUrl ? (
              <img
                src={request.song.thumbnailUrl}
                alt={request.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Mic2 className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Song info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-bold">
                #{request.turnNumber}
              </span>
              <span className="text-xs text-gray-500">
                Posición: {request.queuePosition}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
            {request.artist && (
              <p className="text-gray-600 truncate">{request.artist}</p>
            )}
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>De: {request.guest.displayName}</span>
              <span>•</span>
              <span title={formatTime(request.createdAt)}>{timeAgo(request.createdAt)}</span>
              {request.calledAt && (
                <>
                  <span>•</span>
                  <span title={formatTime(request.calledAt)}>Llamado {timeAgo(request.calledAt)}</span>
                </>
              )}
            </div>
          </div>

          {/* Status badge */}
          <div className={clsx(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium',
            statusConfig.color,
            statusConfig.bgColor
          )}>
            <StatusIcon className="h-4 w-4" />
            {statusConfig.label}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {getAvailableTransitions().map(status => {
            const config = STATUS_CONFIG[status]
            const Icon = config.icon
            return (
              <button
                key={status}
                onClick={() => onStatusChange(request.id, status)}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  'border hover:shadow-sm',
                  config.bgColor,
                  config.color
                )}
              >
                <Icon className="h-4 w-4" />
                {config.label}
              </button>
            )
          })}

          {/* YouTube link */}
          {request.song?.youtubeShareUrl && (
            <a
              href={request.song.youtubeShareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              YouTube
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
