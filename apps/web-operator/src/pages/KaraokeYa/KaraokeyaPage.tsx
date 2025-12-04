import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Mic2, 
  Clock, 
  Users, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Search,
  Wifi,
  WifiOff,
  Settings,
  Play,
  Phone,
  User,
  AlertCircle,
  GripVertical,
  Download,
  X,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import { clsx } from 'clsx'
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { eventsApi, karaokeyaApi, KaraokeRequest, KaraokeRequestStatus, KaraokeyaConfig, Event, KaraokeyaStats } from '@/lib/api'
import { connectSocket, disconnectSocket, subscribeKaraokeya } from '@/lib/socket'

// Status configuration
const STATUS_CONFIG: Record<KaraokeRequestStatus, { label: string; color: string; bgColor: string; icon: typeof Clock }> = {
  QUEUED: { label: 'En cola', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Clock },
  CALLED: { label: 'Llamado', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: Phone },
  ON_STAGE: { label: 'En escenario', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: Mic2 },
  COMPLETED: { label: 'Completado', color: 'text-gray-600', bgColor: 'bg-gray-50 border-gray-200', icon: CheckCircle },
  NO_SHOW: { label: 'No presente', color: 'text-orange-600', bgColor: 'bg-orange-50 border-orange-200', icon: AlertCircle },
  CANCELLED: { label: 'Cancelado', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: XCircle },
}

// Filter tabs
type FilterTab = 'queue' | 'all' | 'completed'

const FILTER_TABS: { key: FilterTab; label: string; statuses: KaraokeRequestStatus[] | null }[] = [
  { key: 'queue', label: 'Cola activa', statuses: ['QUEUED', 'CALLED', 'ON_STAGE'] },
  { key: 'all', label: 'Todos', statuses: null },
  { key: 'completed', label: 'Finalizados', statuses: ['COMPLETED', 'NO_SHOW', 'CANCELLED'] },
]

// Sortable item component
interface SortableItemProps {
  request: KaraokeRequest
  onStatusChange: (id: string, status: KaraokeRequestStatus) => void
  onDelete: (id: string) => void
  isDraggable: boolean
}

function SortableItem({ request, onStatusChange, onDelete, isDraggable }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id, disabled: !isDraggable })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const statusConfig = STATUS_CONFIG[request.status]
  const StatusIcon = statusConfig.icon

  // Status actions per current status
  const getStatusActions = (status: KaraokeRequestStatus): KaraokeRequestStatus[] => {
    switch (status) {
      case 'QUEUED': return ['CALLED', 'CANCELLED']
      case 'CALLED': return ['ON_STAGE', 'NO_SHOW', 'QUEUED']
      case 'ON_STAGE': return ['COMPLETED', 'CANCELLED']
      case 'NO_SHOW': return ['QUEUED']
      case 'CANCELLED': return ['QUEUED']
      default: return []
    }
  }

  const actions = getStatusActions(request.status)

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={clsx(
        'p-4 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors',
        request.status === 'CALLED' && 'bg-yellow-50',
        isDragging && 'shadow-lg rounded-lg z-50'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Drag handle */}
        {isDraggable && (
          <button
            {...attributes}
            {...listeners}
            className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing touch-none"
          >
            <GripVertical className="w-5 h-5" />
          </button>
        )}

        {/* Turn number */}
        <div className={clsx(
          'w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0',
          statusConfig.bgColor
        )}>
          #{request.turnNumber}
        </div>
        
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={clsx(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
              statusConfig.bgColor,
              statusConfig.color
            )}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig.label}
            </span>
            {request.queuePosition && request.status === 'QUEUED' && (
              <span className="text-xs text-gray-400">
                Pos. {request.queuePosition}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-gray-900">
              {request.singerName}
              {request.singerLastname && ` ${request.singerLastname}`}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {request.title}
            {request.artist && <span className="text-gray-400"> - {request.artist}</span>}
          </p>
          
          <p className="text-xs text-gray-400 mt-1">
            {new Date(request.createdAt).toLocaleTimeString()}
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions.map(action => {
            const ActionIcon = STATUS_CONFIG[action].icon
            return (
              <button
                key={action}
                onClick={() => onStatusChange(request.id, action)}
                className={clsx(
                  'p-2 rounded-lg transition-colors text-sm',
                  STATUS_CONFIG[action].bgColor,
                  STATUS_CONFIG[action].color,
                  'hover:opacity-80'
                )}
                title={STATUS_CONFIG[action].label}
              >
                <ActionIcon className="w-4 h-4" />
              </button>
            )
          })}
          
          {/* Delete */}
          <button
            onClick={() => onDelete(request.id)}
            className="p-2 rounded-lg transition-colors text-red-500 hover:bg-red-50"
            title="Eliminar"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function KaraokeyaPage() {
  const { eventId } = useParams<{ eventId: string }>()
  const navigate = useNavigate()
  
  // State
  const [event, setEvent] = useState<Event | null>(null)
  const [config, setConfig] = useState<KaraokeyaConfig | null>(null)
  const [requests, setRequests] = useState<KaraokeRequest[]>([])
  const [stats, setStats] = useState<KaraokeyaStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  // Filters
  const [activeTab, setActiveTab] = useState<FilterTab>('queue')
  const [searchQuery, setSearchQuery] = useState('')
  
  // Action states
  const [callingNext, setCallingNext] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [showConfigModal, setShowConfigModal] = useState(false)
  const [configForm, setConfigForm] = useState<Partial<KaraokeyaConfig>>({})
  const [isSavingConfig, setIsSavingConfig] = useState(false)

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  // Load data
  const loadData = useCallback(async () => {
    if (!eventId) return
    
    try {
      setError(null)
      
      const [eventRes, configRes, requestsRes, statsRes] = await Promise.all([
        eventsApi.get(eventId),
        karaokeyaApi.getConfig(eventId),
        karaokeyaApi.listRequests(eventId, { limit: 100 }),
        karaokeyaApi.getStats(eventId),
      ])
      
      setEvent(eventRes.data)
      setConfig(configRes.data)
      setRequests(requestsRes.data.data)
      setStats(statsRes.data)
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
      connectSocket({
        eventId,
        onConnect: () => setIsConnected(true),
        onDisconnect: () => setIsConnected(false),
        onError: (err) => console.error('Socket error:', err),
      })
      
      const unsubscribe = subscribeKaraokeya({
        onNewRequest: (request) => {
          setRequests(prev => [...prev, request as KaraokeRequest])
          loadData()
        },
        onStatusChanged: (updated) => {
          setRequests(prev => prev.map(r => 
            r.id === updated.id ? { ...r, ...updated } as KaraokeRequest : r
          ))
          loadData()
        },
        onQueueReordered: () => {
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
  const handleStatusChange = async (requestId: string, newStatus: KaraokeRequestStatus) => {
    if (!eventId) return
    
    try {
      await karaokeyaApi.updateRequest(eventId, requestId, { status: newStatus })
      setRequests(prev => prev.map(r => 
        r.id === requestId ? { ...r, status: newStatus } : r
      ))
      loadData()
    } catch (err: any) {
      console.error('Error updating status:', err)
      setError(err.response?.data?.error || 'Error al actualizar estado')
    }
  }
  
  // Call next singer
  const handleCallNext = async () => {
    if (!eventId || callingNext) return
    
    setCallingNext(true)
    try {
      const response = await karaokeyaApi.callNext(eventId)
      if (response.data) {
        setRequests(prev => prev.map(r => 
          r.id === response.data.id ? { ...r, status: 'CALLED' as KaraokeRequestStatus } : r
        ))
        loadData()
      }
    } catch (err: any) {
      console.error('Error calling next:', err)
      setError(err.response?.data?.error || 'Error al llamar siguiente')
    } finally {
      setCallingNext(false)
    }
  }
  
  // Delete request
  const handleDelete = async (requestId: string) => {
    if (!eventId || !confirm('¿Eliminar este turno?')) return
    
    try {
      await karaokeyaApi.deleteRequest(eventId, requestId)
      setRequests(prev => prev.filter(r => r.id !== requestId))
      loadData()
    } catch (err: any) {
      console.error('Error deleting request:', err)
      setError(err.response?.data?.error || 'Error al eliminar turno')
    }
  }

  // Handle drag end - reorder queue
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id || !eventId) return

    // Get only QUEUED items for reordering
    const queuedItems = requests.filter(r => r.status === 'QUEUED')
    const oldIndex = queuedItems.findIndex(r => r.id === active.id)
    const newIndex = queuedItems.findIndex(r => r.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Optimistic update
    const reordered = arrayMove(queuedItems, oldIndex, newIndex)
    const newOrderedIds = reordered.map(r => r.id)

    // Update local state with new positions
    setRequests(prev => {
      const nonQueued = prev.filter(r => r.status !== 'QUEUED')
      const updatedQueued = reordered.map((r, idx) => ({
        ...r,
        queuePosition: idx + 1
      }))
      return [...nonQueued, ...updatedQueued]
    })

    // Send to server
    try {
      await karaokeyaApi.reorderQueue(eventId, newOrderedIds)
    } catch (err: any) {
      console.error('Error reordering queue:', err)
      setError(err.response?.data?.error || 'Error al reordenar cola')
      loadData() // Revert on error
    }
  }
  
  

  // Export CSV
  const handleExport = async () => {
    if (!eventId || isExporting) return
    
    setIsExporting(true)
    try {
      await karaokeyaApi.exportCsv(eventId)
    } catch (err: any) {
      console.error('Error exporting:', err)
      setError(err.response?.data?.error || 'Error al exportar')
    } finally {
      setIsExporting(false)
    }
  }

  // Open config modal
  const openConfigModal = () => {
    if (config) {
      setConfigForm({
        enabled: config.enabled,
        cooldownSeconds: config.cooldownSeconds,
        maxPerPerson: config.maxPerPerson,
        showQueueToClient: config.showQueueToClient,
        showNextSinger: config.showNextSinger,
      })
    }
    setShowConfigModal(true)
  }

  // Save config
  const handleSaveConfig = async () => {
    if (!eventId || isSavingConfig) return

    setIsSavingConfig(true)
    try {
      const response = await karaokeyaApi.updateConfig(eventId, configForm)
      setConfig(response.data)
      setShowConfigModal(false)
    } catch (err: any) {
      console.error('Error saving config:', err)
      setError(err.response?.data?.error || 'Error al guardar configuración')
    } finally {
      setIsSavingConfig(false)
    }
  }

  // Filter requests
  const filteredRequests = requests.filter(request => {
    const tab = FILTER_TABS.find(t => t.key === activeTab)
    if (tab?.statuses && !tab.statuses.includes(request.status)) {
      return false
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesName = request.singerName.toLowerCase().includes(query)
      const matchesTitle = request.title.toLowerCase().includes(query)
      const matchesArtist = request.artist?.toLowerCase().includes(query)
      const matchesTurn = request.turnNumber.toString().includes(query)
      if (!matchesName && !matchesTitle && !matchesArtist && !matchesTurn) {
        return false
      }
    }
    
    return true
  })
  
  // Sort by queue position for queue tab, by turn number for others
  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (activeTab === 'queue') {
      const statusOrder = { ON_STAGE: 0, CALLED: 1, QUEUED: 2 }
      const aOrder = statusOrder[a.status as keyof typeof statusOrder] ?? 99
      const bOrder = statusOrder[b.status as keyof typeof statusOrder] ?? 99
      if (aOrder !== bOrder) return aOrder - bOrder
      return a.queuePosition - b.queuePosition
    }
    return b.turnNumber - a.turnNumber
  })

  // Get only QUEUED items for drag & drop
  const queuedForDnd = sortedRequests.filter(r => r.status === 'QUEUED')
  const nonQueuedItems = sortedRequests.filter(r => r.status !== 'QUEUED')
  
  // Get next in queue
  const nextInQueue = requests
    .filter(r => r.status === 'QUEUED')
    .sort((a, b) => a.queuePosition - b.queuePosition)[0]
  
  // Get current on stage or called
  const currentOnStage = requests.find(r => r.status === 'ON_STAGE')
  const currentCalled = requests.find(r => r.status === 'CALLED')
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }
  
  if (error && !event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-medium text-gray-900 mb-2">Error</h2>
        <p className="text-gray-500 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-blue-600 hover:underline">
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
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Mic2 className="w-6 h-6 text-purple-600" />
              Karaoke
            </h1>
            <p className="text-sm text-gray-500">
              {event?.eventData?.eventName || 'Evento'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className={clsx(
            'flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
            isConnected ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
          )}>
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
          
          <button
            onClick={loadData}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Actualizar"
          >
            <RefreshCw className="w-5 h-5 text-gray-500" />
          </button>
          
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            title="Exportar CSV"
          >
            {isExporting ? (
              <RefreshCw className="w-5 h-5 text-gray-500 animate-spin" />
            ) : (
              <Download className="w-5 h-5 text-gray-500" />
            )}
          </button>
          
          <button
            onClick={openConfigModal}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Configuración"
          >
            <Settings className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">En cola</span>
            </div>
            <p className="text-2xl font-bold">{stats.queued}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <Phone className="w-4 h-4" />
              <span className="text-sm font-medium">Llamados</span>
            </div>
            <p className="text-2xl font-bold">{stats.called}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Mic2 className="w-4 h-4" />
              <span className="text-sm font-medium">En escenario</span>
            </div>
            <p className="text-2xl font-bold">{stats.onStage}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-600 mb-1">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">Completados</span>
            </div>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-1">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">No presente</span>
            </div>
            <p className="text-2xl font-bold">{stats.noShow}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <Users className="w-4 h-4" />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
        </div>
      )}
      
      {/* Current status and call next */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1">
            {currentOnStage ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Mic2 className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">En escenario ahora</p>
                  <p className="font-semibold text-lg">
                    #{currentOnStage.turnNumber} - {currentOnStage.singerName}
                  </p>
                  <p className="text-sm text-gray-600">{currentOnStage.title}</p>
                </div>
              </div>
            ) : currentCalled ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center animate-pulse">
                  <Phone className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Llamando...</p>
                  <p className="font-semibold text-lg">
                    #{currentCalled.turnNumber} - {currentCalled.singerName}
                  </p>
                  <p className="text-sm text-gray-600">{currentCalled.title}</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                  <Mic2 className="w-6 h-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Escenario libre</p>
                  <p className="text-gray-400">Nadie cantando</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentCalled && (
              <button
                onClick={() => handleStatusChange(currentCalled.id, 'ON_STAGE')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Mic2 className="w-4 h-4" />
                Al escenario
              </button>
            )}
            {currentOnStage && (
              <button
                onClick={() => handleStatusChange(currentOnStage.id, 'COMPLETED')}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Completado
              </button>
            )}
            {!currentOnStage && !currentCalled && nextInQueue && (
              <button
                onClick={handleCallNext}
                disabled={callingNext}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {callingNext ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                Llamar siguiente (#{nextInQueue.turnNumber})
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {FILTER_TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={clsx(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                activeTab === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre, canción..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Drag & drop hint */}
      {activeTab === 'queue' && queuedForDnd.length > 1 && (
        <p className="text-sm text-gray-500 flex items-center gap-2">
          <GripVertical className="w-4 h-4" />
          Arrastrá los turnos en cola para reordenar
        </p>
      )}
      
      {/* Error alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={() => setError(null)} className="ml-auto text-red-500 hover:text-red-700">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}
      
      {/* Requests list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {sortedRequests.length === 0 ? (
          <div className="text-center py-12">
            <Mic2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay turnos en esta categoría</p>
          </div>
        ) : activeTab === 'queue' ? (
          <>
            {/* Non-draggable items (ON_STAGE, CALLED) */}
            {nonQueuedItems.map((request) => (
              <SortableItem
                key={request.id}
                request={request}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                isDraggable={false}
              />
            ))}
            
            {/* Draggable QUEUED items */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={queuedForDnd.map(r => r.id)}
                strategy={verticalListSortingStrategy}
              >
                {queuedForDnd.map((request) => (
                  <SortableItem
                    key={request.id}
                    request={request}
                    onStatusChange={handleStatusChange}
                    onDelete={handleDelete}
                    isDraggable={true}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </>
        ) : (
          // Non-queue tabs - no drag & drop
          sortedRequests.map((request) => (
            <SortableItem
              key={request.id}
              request={request}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              isDraggable={false}
            />
          ))
        )}
      </div>

      {/* Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-600" />
                Configuración Karaoke
              </h2>
              <button
                onClick={() => setShowConfigModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-4 space-y-6">
              {/* Enabled toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Módulo habilitado</p>
                  <p className="text-sm text-gray-500">Los invitados pueden anotarse</p>
                </div>
                <button
                  onClick={() => setConfigForm(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={clsx(
                    'p-1 rounded-lg transition-colors',
                    configForm.enabled ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {configForm.enabled ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Cooldown */}
              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Cooldown (segundos)
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Tiempo mínimo entre anotaciones del mismo email
                </p>
                <input
                  type="number"
                  min="0"
                  step="60"
                  value={configForm.cooldownSeconds || 0}
                  onChange={(e) => setConfigForm(prev => ({ 
                    ...prev, 
                    cooldownSeconds: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-400 mt-1">
                  {Math.floor((configForm.cooldownSeconds || 0) / 60)} minutos
                </p>
              </div>

              {/* Max per person */}
              <div>
                <label className="block font-medium text-gray-900 mb-1">
                  Máximo por persona
                </label>
                <p className="text-sm text-gray-500 mb-2">
                  Turnos activos simultáneos (0 = sin límite)
                </p>
                <input
                  type="number"
                  min="0"
                  max="10"
                  value={configForm.maxPerPerson || 0}
                  onChange={(e) => setConfigForm(prev => ({ 
                    ...prev, 
                    maxPerPerson: parseInt(e.target.value) || 0 
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Show queue to client */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mostrar cola al cliente</p>
                  <p className="text-sm text-gray-500">El invitado ve su posición en cola</p>
                </div>
                <button
                  onClick={() => setConfigForm(prev => ({ ...prev, showQueueToClient: !prev.showQueueToClient }))}
                  className={clsx(
                    'p-1 rounded-lg transition-colors',
                    configForm.showQueueToClient ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {configForm.showQueueToClient ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>

              {/* Show next singer */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Mostrar siguiente cantante</p>
                  <p className="text-sm text-gray-500">Visible en el display público</p>
                </div>
                <button
                  onClick={() => setConfigForm(prev => ({ ...prev, showNextSinger: !prev.showNextSinger }))}
                  className={clsx(
                    'p-1 rounded-lg transition-colors',
                    configForm.showNextSinger ? 'text-green-600' : 'text-gray-400'
                  )}
                >
                  {configForm.showNextSinger ? (
                    <ToggleRight className="w-10 h-10" />
                  ) : (
                    <ToggleLeft className="w-10 h-10" />
                  )}
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowConfigModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingConfig ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
