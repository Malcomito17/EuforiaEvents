/**
 * KaraokeyaMyTurn - Página para ver el estado de mi turno
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { 
  ArrowLeft, Mic2, Loader2, AlertCircle, RefreshCw,
  Clock, Users, CheckCircle, XCircle, Bell, Home
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import * as api from '../services/api'
import type { KaraokeRequest, KaraokeQueueStats } from '../types'

// Configuración de colores por estado
const STATUS_CONFIG = {
  QUEUED: {
    label: 'En cola',
    color: 'bg-blue-500',
    textColor: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: Clock,
    description: 'Esperando tu turno',
  },
  CALLED: {
    label: '¡Te están llamando!',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: Bell,
    description: '¡Acercate al escenario!',
  },
  ON_STAGE: {
    label: 'En escenario',
    color: 'bg-green-500',
    textColor: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: Mic2,
    description: '¡A cantar!',
  },
  COMPLETED: {
    label: 'Completado',
    color: 'bg-gray-500',
    textColor: 'text-gray-400',
    bgColor: 'bg-gray-500/20',
    icon: CheckCircle,
    description: '¡Gracias por cantar!',
  },
  NO_SHOW: {
    label: 'No presente',
    color: 'bg-orange-500',
    textColor: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    icon: XCircle,
    description: 'No te presentaste cuando te llamaron',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'bg-red-500',
    textColor: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: XCircle,
    description: 'Este turno fue cancelado',
  },
}

export default function KaraokeyaMyTurn() {
  const { slug } = useParams<{ slug: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { event, loadEvent } = useEventStore()

  // ID del turno desde query param
  const turnId = searchParams.get('id')

  // Estados
  const [request, setRequest] = useState<KaraokeRequest | null>(null)
  const [stats, setStats] = useState<KaraokeQueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // Cargar evento si no está
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Cargar datos del turno
  const loadTurnData = useCallback(async (showRefreshing = false) => {
    if (!turnId || !event) return

    if (showRefreshing) setRefreshing(true)

    try {
      const [turnData, statsData] = await Promise.all([
        api.getKaraokeRequestById(event.id, turnId),
        api.getKaraokeStats(event.id),
      ])
      setRequest(turnData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar turno')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [turnId, event])

  // Cargar datos iniciales y configurar auto-refresh
  useEffect(() => {
    if (turnId && event) {
      loadTurnData()
      
      // Auto-refresh cada 10 segundos
      const interval = setInterval(() => loadTurnData(), 10000)
      return () => clearInterval(interval)
    }
  }, [turnId, event, loadTurnData])

  // Calcular posición en cola
  const getQueuePosition = () => {
    if (!request || request.status !== 'QUEUED') return null
    return request.queuePosition
  }

  // Calcular tiempo estimado
  const getEstimatedWait = () => {
    const position = getQueuePosition()
    if (!position) return null
    // ~3 minutos por canción
    return position * 3
  }

  // Sin ID de turno
  if (!turnId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Turno no especificado</h1>
        <p className="text-white/60 mb-6">No se proporcionó un ID de turno válido</p>
        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="btn-primary"
        >
          Volver al evento
        </button>
      </div>
    )
  }

  // Loading inicial
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  // Error
  if (error || !request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-xl font-bold mb-2">Turno no encontrado</h1>
        <p className="text-white/60 mb-6">{error || 'El turno no existe o fue eliminado'}</p>
        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="btn-primary"
        >
          Volver al evento
        </button>
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[request.status]
  const StatusIcon = statusConfig.icon
  const queuePosition = getQueuePosition()
  const estimatedWait = getEstimatedWait()
  const isActive = ['QUEUED', 'CALLED', 'ON_STAGE'].includes(request.status)
  const isUrgent = request.status === 'CALLED'

  return (
    <div className={`min-h-screen pb-safe ${isUrgent ? 'animate-pulse-slow' : ''}`}>
      {/* Header */}
      <header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 z-10">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-semibold">Mi turno</h1>
            <p className="text-xs text-white/60">{event?.name}</p>
          </div>
          <button
            onClick={() => loadTurnData(true)}
            disabled={refreshing}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Estado principal */}
        <div className={`card mb-6 ${isUrgent ? 'ring-2 ring-yellow-500 ring-offset-2 ring-offset-gray-900' : ''}`}>
          {/* Badge de estado */}
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${statusConfig.bgColor} mb-4`}>
            <StatusIcon className={`w-4 h-4 ${statusConfig.textColor}`} />
            <span className={`text-sm font-medium ${statusConfig.textColor}`}>
              {statusConfig.label}
            </span>
          </div>

          {/* Número de turno */}
          <div className="text-center mb-4">
            <div className={`inline-flex items-center justify-center w-24 h-24 ${statusConfig.color} rounded-full mb-3`}>
              <span className="text-4xl font-bold">#{request.turnNumber}</span>
            </div>
            <p className="text-white/60">{statusConfig.description}</p>
          </div>

          {/* Info del turno */}
          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-white/60">Cantante</span>
              <span className="font-medium">
                {request.singerName}
                {request.singerLastname ? ` ${request.singerLastname}` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/60">Canción</span>
              <span className="font-medium truncate ml-4">{request.title}</span>
            </div>
            {request.artist && (
              <div className="flex justify-between">
                <span className="text-white/60">Artista</span>
                <span className="font-medium truncate ml-4">{request.artist}</span>
              </div>
            )}
          </div>
        </div>

        {/* Alerta si está siendo llamado */}
        {isUrgent && (
          <div className="mb-6 p-4 bg-yellow-500/20 border-2 border-yellow-500 rounded-xl animate-bounce-slow">
            <div className="flex items-center gap-3">
              <Bell className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-lg font-bold text-yellow-200">
                  ¡Es tu turno!
                </p>
                <p className="text-sm text-yellow-200/80">
                  Acercate al escenario ahora
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas de cola (solo si está activo) */}
        {isActive && stats && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {queuePosition && (
              <div className="card text-center py-3">
                <Users className="w-5 h-5 mx-auto mb-1 text-primary-400" />
                <p className="text-2xl font-bold">{queuePosition}</p>
                <p className="text-xs text-white/60">Posición en cola</p>
              </div>
            )}
            {estimatedWait && (
              <div className="card text-center py-3">
                <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
                <p className="text-2xl font-bold">~{estimatedWait}</p>
                <p className="text-xs text-white/60">Min. aprox.</p>
              </div>
            )}
            {!queuePosition && (
              <div className="card text-center py-3 col-span-2">
                <Mic2 className="w-5 h-5 mx-auto mb-1 text-green-400" />
                <p className="text-lg font-bold">
                  {request.status === 'CALLED' ? '¡Te toca!' : '¡Estás cantando!'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Info de actualización */}
        <div className="text-center text-white/40 text-xs mb-6">
          <p>Esta página se actualiza automáticamente</p>
          <p>Última actualización: {new Date().toLocaleTimeString()}</p>
        </div>

        {/* Botones */}
        <div className="space-y-3">
          {/* Anotar otra canción (solo si terminó) */}
          {!isActive && (
            <button
              onClick={() => navigate(`/e/${slug}/karaokeya`)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Mic2 className="w-5 h-5" />
              Anotarme de nuevo
            </button>
          )}

          <button
            onClick={() => navigate(`/e/${slug}`)}
            className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-white/70"
          >
            <Home className="w-5 h-5" />
            Volver al evento
          </button>
        </div>
      </main>

      {/* Estilos para animaciones */}
      <style>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.9; }
        }
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
