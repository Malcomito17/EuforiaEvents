import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Music, 
  Clock, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Filter,
  Search,
  Wifi,
  WifiOff,
  Settings,
  ExternalLink
} from 'lucide-react'
import { clsx } from 'clsx'
import { eventsApi, musicadjApi, SongRequest, SongRequestStatus, MusicadjConfig, Event, MusicadjStats } from '@/lib/api'
import { connectSocket, disconnectSocket, subscribeMusicadj, SongRequestEvent } from '@/lib/socket'

// Status configuration
const STATUS_CONFIG: Record<SongRequestStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  PENDING: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock },
  HIGHLIGHTED: { label: 'Destacado', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Star },
  URGENT: { label: 'Urgente', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
  PLAYED: { label: 'Reproducido', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
  DISCARDED: { label: 'Descartado', color: 'text-gray-500', bgColor: 'bg-gray-50 border-gray-200', icon: XCircle },
}

// Filter tabs
type FilterTab = 'all' | 'active' | 'played' | 'discarded'

const FILTER_TABS: { key: FilterTab; label: string; statuses: SongRequestStatus[] | null }[] = [
  { key: 'all', label: 'Todos', statuses: null },
  { key: 'active', label: 'Activos', statuses: ['PENDING', 'HIGHLIGHTED', 'URGENT'] },
  { key: 'played', label: 'Reproducidos', statuses: ['PLAYED'] },
  { key: 'discarded', label: 'Descartados', statuses: ['DISCARDED'] },
]

export function MusicaDJPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  
  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [config, setConfig] = useState<MusicadjConfig | null>(null)
  const [requests, setRequests] = useState<SongRequest[]>([])
  const [stats, setStats] = useState<MusicadjStats | null>(null)
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
      
      // Load event, config, and requests in parallel
      const [eventRes, configRes, requestsRes] = await Promise.all([
        eventsApi.get(eventId),
        musicadjApi.getConfig(eventId),
        musicadjApi.listRequests(eventId, { limit: 100 }),
      ])
      
      setEvent(eventRes.data)
      setConfig(configRes.data)
      setRequests(requestsRes.data.requests)
      setStats(requestsRes.data.stats)
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
      
      // Subscribe to MUSICADJ events
      const unsubscribe = subscribeMusicadj({
        onNewRequest: (request) => {
          setRequests(prev => [request as SongRequest, ...prev])
          setStats(prev => prev ? {
            ...prev,
            total: prev.total + 1,
            pending: prev.pending + 1,
          } : null)
        },
        onRequestUpdated: (updated) => {
          setRequests(prev => prev.map(r => 
            r.id === updated.id ? { ...r, ...updated } as SongRequest : r
          ))
          // Reload stats
          loadData()
        },
        onRequestDeleted: ({ requestId }) => {
          setRequests(prev => prev.filter(r => r.id !== requestId))
          loadData()
        },
      })
      
      return () => {
        unsubscribe()
        disconnectSocket()
      }
    }
  }, [eventId, loadData])
  
  // Update request status
  const handleStatusChange = async (requestId: string, newStatus: SongRequestStatus) => {
    if (!eventId) return
    
    try {
      await musicadjApi.updateRequest(eventId, requestId, { status: newStatus })
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
        request.artist.toLowerCase().includes(query) ||
        request.requesterName.toLowerCase().includes(query) ||
        (request.requesterLastname?.toLowerCase().includes(query) ?? false)
      )
    }
    
    return true
  })
  
  // Get tab count
  const getTabCount = (tab: FilterTab): number => {
    if (!stats) return 0
    switch (tab) {
      case 'all': return stats.total
      case 'active': return stats.pending + stats.highlighted + stats.urgent
      case 'played': return stats.played
      case 'discarded': return stats.discarded
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
              <Music className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">MUSICADJ</h1>
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
            to={`/events/${eventId}/musicadj/config`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">Total</div>
          </div>
          <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
            <div className="text-sm text-yellow-600">Pendientes</div>
          </div>
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <div className="text-2xl font-bold text-blue-700">{stats.highlighted}</div>
            <div className="text-sm text-blue-600">Destacados</div>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.urgent}</div>
            <div className="text-sm text-red-600">Urgentes</div>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-700">{stats.played}</div>
            <div className="text-sm text-green-600">Reproducidos</div>
          </div>
        </div>
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
            placeholder="Buscar tema o solicitante..."
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
            <Music className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchQuery 
                ? 'No se encontraron pedidos con esos criterios'
                : activeTab === 'active'
                  ? 'No hay pedidos activos. ¡Esperando nuevos pedidos!'
                  : 'No hay pedidos en esta categoría'
              }
            </p>
          </div>
        ) : (
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

// Request Card Component
interface RequestCardProps {
  request: SongRequest
  onStatusChange: (id: string, status: SongRequestStatus) => void
  formatTime: (date: string) => string
  timeAgo: (date: string) => string
}

function RequestCard({ request, onStatusChange, formatTime, timeAgo }: RequestCardProps) {
  const statusConfig = STATUS_CONFIG[request.status]
  const StatusIcon = statusConfig.icon
  
  // Available status transitions
  const getAvailableTransitions = (): SongRequestStatus[] => {
    switch (request.status) {
      case 'PENDING':
        return ['HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED']
      case 'HIGHLIGHTED':
        return ['PENDING', 'URGENT', 'PLAYED', 'DISCARDED']
      case 'URGENT':
        return ['PENDING', 'HIGHLIGHTED', 'PLAYED', 'DISCARDED']
      case 'PLAYED':
        return ['PENDING'] // Can revert to pending
      case 'DISCARDED':
        return ['PENDING'] // Can revert to pending
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
          {/* Album art */}
          <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
            {request.albumArtUrl ? (
              <img 
                src={request.albumArtUrl} 
                alt={request.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Music className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>
          
          {/* Song info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
            <p className="text-gray-600 truncate">{request.artist}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>De: {request.requesterName} {request.requesterLastname || ''}</span>
              <span>•</span>
              <span title={formatTime(request.createdAt)}>{timeAgo(request.createdAt)}</span>
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
          
          {/* Spotify link */}
          {request.spotifyId && (
            <a
              href={`https://open.spotify.com/track/${request.spotifyId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              Spotify
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
