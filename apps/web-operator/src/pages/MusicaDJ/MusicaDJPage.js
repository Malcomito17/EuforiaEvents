import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Music, Clock, Star, AlertTriangle, CheckCircle, XCircle, RefreshCw, Search, Wifi, WifiOff, Settings, ExternalLink, GripVertical } from 'lucide-react';
import { clsx } from 'clsx';
import { eventsApi, musicadjApi } from '@/lib/api';
import { connectSocket, disconnectSocket, subscribeMusicadj } from '@/lib/socket';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable, } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
// Status configuration
const STATUS_CONFIG = {
    PENDING: { label: 'Pendiente', color: 'text-yellow-600', bgColor: 'bg-yellow-50 border-yellow-200', icon: Clock },
    HIGHLIGHTED: { label: 'Destacado', color: 'text-blue-600', bgColor: 'bg-blue-50 border-blue-200', icon: Star },
    URGENT: { label: 'Urgente', color: 'text-red-600', bgColor: 'bg-red-50 border-red-200', icon: AlertTriangle },
    PLAYED: { label: 'Reproducido', color: 'text-green-600', bgColor: 'bg-green-50 border-green-200', icon: CheckCircle },
    DISCARDED: { label: 'Descartado', color: 'text-gray-500', bgColor: 'bg-gray-50 border-gray-200', icon: XCircle },
};
const FILTER_TABS = [
    { key: 'all', label: 'Todos', statuses: null },
    { key: 'active', label: 'Activos', statuses: ['PENDING', 'HIGHLIGHTED', 'URGENT'] },
    { key: 'played', label: 'Reproducidos', statuses: ['PLAYED'] },
    { key: 'discarded', label: 'Descartados', statuses: ['DISCARDED'] },
];
export function MusicaDJPage() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    // State
    const [event, setEvent] = useState(null);
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    // Filters
    const [activeTab, setActiveTab] = useState('active');
    const [searchQuery, setSearchQuery] = useState('');
    // Load data
    const loadData = useCallback(async () => {
        if (!eventId)
            return;
        try {
            setError(null);
            // Load event and requests in parallel
            const [eventRes, requestsRes] = await Promise.all([
                eventsApi.get(eventId),
                musicadjApi.listRequests(eventId, { limit: 100 }),
            ]);
            setEvent(eventRes.data);
            setRequests(requestsRes.data.requests);
            setStats(requestsRes.data.stats);
        }
        catch (err) {
            console.error('Error loading data:', err);
            setError(err.response?.data?.error || 'Error al cargar datos');
        }
        finally {
            setIsLoading(false);
        }
    }, [eventId]);
    // Initial load and socket connection
    useEffect(() => {
        loadData();
        if (eventId) {
            // Connect to socket
            connectSocket({
                eventId,
                onConnect: () => setIsConnected(true),
                onDisconnect: () => setIsConnected(false),
                onError: (err) => console.error('Socket error:', err),
            });
            // Subscribe to MUSICADJ events
            const unsubscribe = subscribeMusicadj({
                onNewRequest: (request) => {
                    setRequests(prev => [request, ...prev]);
                    setStats(prev => prev ? {
                        ...prev,
                        total: prev.total + 1,
                        pending: prev.pending + 1,
                    } : null);
                },
                onRequestUpdated: (updated) => {
                    setRequests(prev => prev.map(r => r.id === updated.id ? { ...r, ...updated } : r));
                    // Reload stats
                    loadData();
                },
                onRequestDeleted: ({ requestId }) => {
                    setRequests(prev => prev.filter(r => r.id !== requestId));
                    loadData();
                },
            });
            return () => {
                unsubscribe();
                disconnectSocket();
            };
        }
    }, [eventId, loadData]);
    // Drag & Drop sensors
    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8, // 8px de movimiento antes de activar drag
        },
    }), useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
    }));
    // Update request status
    const handleStatusChange = async (requestId, newStatus) => {
        if (!eventId)
            return;
        try {
            await musicadjApi.updateRequest(eventId, requestId, { status: newStatus });
            // Optimistic update
            setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r));
            loadData(); // Reload to get accurate stats
        }
        catch (err) {
            console.error('Error updating status:', err);
            setError(err.response?.data?.error || 'Error al actualizar estado');
        }
    };
    // Handle drag end - reorder queue
    const handleDragEnd = async (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !eventId) {
            return;
        }
        const oldIndex = filteredRequests.findIndex(r => r.id === active.id);
        const newIndex = filteredRequests.findIndex(r => r.id === over.id);
        if (oldIndex === -1 || newIndex === -1) {
            return;
        }
        // Optimistic update
        const newOrder = arrayMove(filteredRequests, oldIndex, newIndex);
        setRequests(prev => {
            // Merge newOrder with items not in filteredRequests
            const filteredIds = new Set(filteredRequests.map(r => r.id));
            const otherItems = prev.filter(r => !filteredIds.has(r.id));
            return [...newOrder, ...otherItems];
        });
        try {
            // Send only the IDs of the reordered items to the backend
            await musicadjApi.reorderRequests(eventId, newOrder.map(r => r.id));
        }
        catch (err) {
            console.error('Error reordering queue:', err);
            setError(err.response?.data?.error || 'Error al reordenar cola');
            // Reload on error to get correct order from server
            loadData();
        }
    };
    // Filter requests
    const filteredRequests = requests.filter(request => {
        // Filter by tab
        const tab = FILTER_TABS.find(t => t.key === activeTab);
        if (tab?.statuses && !tab.statuses.includes(request.status)) {
            return false;
        }
        // Filter by search
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            return (request.title.toLowerCase().includes(query) ||
                request.artist.toLowerCase().includes(query) ||
                request.guest.displayName.toLowerCase().includes(query) ||
                request.guest.email.toLowerCase().includes(query));
        }
        return true;
    });
    // Get tab count
    const getTabCount = (tab) => {
        if (!stats)
            return 0;
        switch (tab) {
            case 'all': return stats.total;
            case 'active': return stats.pending + stats.highlighted + stats.urgent;
            case 'played': return stats.played;
            case 'discarded': return stats.discarded;
        }
    };
    // Format time
    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    };
    // Time ago
    const timeAgo = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
        if (diff < 60)
            return 'hace segundos';
        if (diff < 3600)
            return `hace ${Math.floor(diff / 60)} min`;
        if (diff < 86400)
            return `hace ${Math.floor(diff / 3600)}h`;
        return formatTime(dateStr);
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>);
    }
    if (error && !event) {
        return (<div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-primary-600 hover:underline">
          Volver
        </button>
      </div>);
    }
    return (<div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/events/${eventId}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Music className="h-6 w-6 text-primary-600"/>
              <h1 className="text-2xl font-bold text-gray-900">MUSICADJ</h1>
            </div>
            <p className="text-gray-500">{event?.eventData?.eventName || 'Evento'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Connection status */}
          <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm', isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700')}>
            {isConnected ? <Wifi className="h-4 w-4"/> : <WifiOff className="h-4 w-4"/>}
            {isConnected ? 'Conectado' : 'Desconectado'}
          </div>
          
          {/* Refresh button */}
          <button onClick={loadData} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Actualizar">
            <RefreshCw className="h-5 w-5"/>
          </button>
          
          {/* Config link */}
          <Link to={`/events/${eventId}/musicadj/config`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Configuración">
            <Settings className="h-5 w-5"/>
          </Link>
        </div>
      </div>

      {/* Stats cards */}
      {stats && (<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
        </div>)}

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {FILTER_TABS.map(tab => (<button key={tab.key} onClick={() => setActiveTab(tab.key)} className={clsx('px-4 py-2 rounded-md text-sm font-medium transition-colors', activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900')}>
              {tab.label}
              <span className="ml-1.5 text-xs text-gray-400">({getTabCount(tab.key)})</span>
            </button>))}
        </div>
        
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"/>
          <input type="text" placeholder="Buscar tema o solicitante..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"/>
        </div>
      </div>

      {/* Error message */}
      {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>)}

      {/* Requests list */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (<div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
            <Music className="h-12 w-12 text-gray-300 mx-auto mb-4"/>
            <p className="text-gray-500">
              {searchQuery
                ? 'No se encontraron pedidos con esos criterios'
                : activeTab === 'active'
                    ? 'No hay pedidos activos. ¡Esperando nuevos pedidos!'
                    : 'No hay pedidos en esta categoría'}
            </p>
          </div>) : activeTab === 'active' ? (
        // Drag & Drop enabled for "active" tab only
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={filteredRequests.map(r => r.id)} strategy={verticalListSortingStrategy}>
              {filteredRequests.map(request => (<SortableRequestCard key={request.id} request={request} onStatusChange={handleStatusChange} formatTime={formatTime} timeAgo={timeAgo}/>))}
            </SortableContext>
          </DndContext>) : (
        // No drag & drop for other tabs
        filteredRequests.map(request => (<RequestCard key={request.id} request={request} onStatusChange={handleStatusChange} formatTime={formatTime} timeAgo={timeAgo}/>)))}
      </div>
    </div>);
}
function SortableRequestCard({ request, onStatusChange, formatTime, timeAgo }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging, } = useSortable({ id: request.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };
    return (<div ref={setNodeRef} style={style}>
      <RequestCard request={request} onStatusChange={onStatusChange} formatTime={formatTime} timeAgo={timeAgo} dragHandleProps={{ ...attributes, ...listeners }} isDraggable/>
    </div>);
}
function RequestCard({ request, onStatusChange, formatTime, timeAgo, dragHandleProps, isDraggable = false }) {
    const statusConfig = STATUS_CONFIG[request.status];
    const StatusIcon = statusConfig.icon;
    // Available status transitions
    const getAvailableTransitions = () => {
        switch (request.status) {
            case 'PENDING':
                return ['HIGHLIGHTED', 'URGENT', 'PLAYED', 'DISCARDED'];
            case 'HIGHLIGHTED':
                return ['PENDING', 'URGENT', 'PLAYED', 'DISCARDED'];
            case 'URGENT':
                return ['PENDING', 'HIGHLIGHTED', 'PLAYED', 'DISCARDED'];
            case 'PLAYED':
                return ['PENDING']; // Can revert to pending
            case 'DISCARDED':
                return ['PENDING']; // Can revert to pending
            default:
                return [];
        }
    };
    return (<div className={clsx('bg-white rounded-xl border shadow-sm overflow-hidden transition-all hover:shadow-md', statusConfig.bgColor)}>
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Drag handle */}
          {isDraggable && (<div {...dragHandleProps} className="flex items-center justify-center w-8 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0">
              <GripVertical className="h-5 w-5"/>
            </div>)}

          {/* Album art */}
          <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
            {request.albumArtUrl ? (<img src={request.albumArtUrl} alt={request.title} className="w-full h-full object-cover"/>) : (<div className="w-full h-full flex items-center justify-center">
                <Music className="h-8 w-8 text-gray-400"/>
              </div>)}
          </div>
          
          {/* Song info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{request.title}</h3>
            <p className="text-gray-600 truncate">{request.artist}</p>
            <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
              <span>
                De:{' '}
                <Link to={`/participants/${request.guest.id}`} className="text-primary-600 hover:text-primary-700 hover:underline" onClick={(e) => e.stopPropagation()}>
                  {request.guest.displayName}
                </Link>
              </span>
              <span>•</span>
              <span title={formatTime(request.createdAt)}>{timeAgo(request.createdAt)}</span>
            </div>
          </div>
          
          {/* Status badge */}
          <div className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium', statusConfig.color, statusConfig.bgColor)}>
            <StatusIcon className="h-4 w-4"/>
            {statusConfig.label}
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
          {getAvailableTransitions().map(status => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            return (<button key={status} onClick={() => onStatusChange(request.id, status)} className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', 'border hover:shadow-sm', config.bgColor, config.color)}>
                <Icon className="h-4 w-4"/>
                {config.label}
              </button>);
        })}
          
          {/* Spotify link */}
          {request.spotifyId && (<a href={`https://open.spotify.com/track/${request.spotifyId}`} target="_blank" rel="noopener noreferrer" className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-green-600 hover:bg-green-50 transition-colors">
              <ExternalLink className="h-4 w-4"/>
              Spotify
            </a>)}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=MusicaDJPage.js.map