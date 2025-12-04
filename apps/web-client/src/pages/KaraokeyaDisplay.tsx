/**
 * KaraokeyaDisplay - Pantalla pública para proyectar en el salón
 * 
 * Muestra:
 * - Cantante actual en escenario
 * - Próximo cantante
 * - Cola de espera
 * 
 * Uso: /e/:slug/karaokeya/display
 * Optimizado para proyección (pantalla completa, letras grandes)
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Mic2, Clock, Users, Music2, Loader2 } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import * as api from '../services/api'
import type { KaraokeRequest, KaraokeyaConfig, KaraokeQueueStats } from '../types'

// Configuración
const REFRESH_INTERVAL = 5000 // 5 segundos
const MAX_QUEUE_DISPLAY = 8  // Máximo de turnos a mostrar en cola

export default function KaraokeyaDisplay() {
  const { slug } = useParams<{ slug: string }>()
  const { event, loadEvent } = useEventStore()

  // Estados
  const [config, setConfig] = useState<KaraokeyaConfig | null>(null)
  const [queue, setQueue] = useState<KaraokeRequest[]>([])
  const [stats, setStats] = useState<KaraokeQueueStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Cargar evento
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Cargar datos del karaoke
  const loadData = useCallback(async () => {
    if (!event) return

    try {
      const [configData, queueData, statsData] = await Promise.all([
        api.getKaraokeyaConfig(event.id),
        api.getKaraokeQueue(event.id),
        api.getKaraokeStats(event.id),
      ])
      setConfig(configData)
      setQueue(queueData)
      setStats(statsData)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error de conexión')
    } finally {
      setLoading(false)
    }
  }, [event])

  // Auto-refresh
  useEffect(() => {
    if (event) {
      loadData()
      const interval = setInterval(loadData, REFRESH_INTERVAL)
      return () => clearInterval(interval)
    }
  }, [event, loadData])

  // Actualizar reloj
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(interval)
  }, [])

  // Obtener cantante actual (ON_STAGE)
  const currentSinger = queue.find(r => r.status === 'ON_STAGE')
  
  // Obtener próximo (CALLED o primero QUEUED)
  const calledSinger = queue.find(r => r.status === 'CALLED')
  const nextInQueue = queue.filter(r => r.status === 'QUEUED').sort((a, b) => a.queuePosition - b.queuePosition)[0]
  const nextSinger = calledSinger || nextInQueue
  
  // Cola de espera (QUEUED, sin el primero si es nextSinger)
  const waitingQueue = queue
    .filter(r => r.status === 'QUEUED')
    .sort((a, b) => a.queuePosition - b.queuePosition)
    .slice(nextSinger && !calledSinger ? 1 : 0, MAX_QUEUE_DISPLAY + 1)

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-purple-400" />
      </div>
    )
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-gray-900 to-gray-900 flex flex-col items-center justify-center p-8">
        <Music2 className="w-24 h-24 text-red-400 mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">Error de conexión</h1>
        <p className="text-xl text-white/60">{error}</p>
        <p className="text-lg text-white/40 mt-4">Reintentando automáticamente...</p>
      </div>
    )
  }

  // Módulo deshabilitado
  if (!config?.enabled) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900 flex flex-col items-center justify-center p-8">
        <Mic2 className="w-32 h-32 text-gray-600 mb-6" />
        <h1 className="text-5xl font-bold text-white/40">Karaoke pausado</h1>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-gray-900 to-gray-900 text-white overflow-hidden">
      {/* Header con evento y hora */}
      <header className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start z-10">
        <div>
          <h1 className="text-2xl font-bold text-white/90">{event?.name}</h1>
          <p className="text-lg text-purple-300">🎤 Karaoke</p>
        </div>
        <div className="text-right">
          <p className="text-4xl font-mono font-bold">
            {currentTime.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
          </p>
          {stats && (
            <p className="text-lg text-white/60">
              {stats.waiting} en cola
            </p>
          )}
        </div>
      </header>

      {/* Contenido principal */}
      <main className="min-h-screen pt-28 pb-8 px-8 grid grid-cols-3 gap-8">
        
        {/* Columna izquierda: Cantante actual */}
        <div className="col-span-2 flex flex-col">
          {/* Ahora cantando */}
          <div className="flex-1 flex flex-col items-center justify-center">
            {currentSinger ? (
              <>
                <div className="text-purple-400 text-2xl font-medium mb-4 uppercase tracking-widest">
                  ★ Ahora cantando ★
                </div>
                <div className="w-40 h-40 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-2xl shadow-purple-500/50 animate-pulse">
                  <span className="text-7xl font-bold">#{currentSinger.turnNumber}</span>
                </div>
                <h2 className="text-6xl font-bold text-center mb-4 drop-shadow-lg">
                  {currentSinger.singerName}
                  {currentSinger.singerLastname ? ` ${currentSinger.singerLastname.charAt(0)}.` : ''}
                </h2>
                <div className="text-3xl text-white/80 text-center">
                  <span className="text-purple-300">♪</span> {currentSinger.title}
                  {currentSinger.artist && (
                    <span className="text-white/50"> - {currentSinger.artist}</span>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center">
                <Mic2 className="w-32 h-32 text-purple-400/30 mx-auto mb-6" />
                <p className="text-4xl text-white/40">Escenario libre</p>
                <p className="text-2xl text-white/30 mt-2">¡Anotate para cantar!</p>
              </div>
            )}
          </div>

          {/* Próximo (si showNextSinger está activo) */}
          {config?.showNextSinger && nextSinger && (
            <div className="bg-white/5 backdrop-blur rounded-2xl p-6 mt-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold ${
                  calledSinger ? 'bg-yellow-500 animate-pulse' : 'bg-purple-600'
                }`}>
                  #{nextSinger.turnNumber}
                </div>
                <div className="flex-1">
                  <p className={`text-sm uppercase tracking-wider ${
                    calledSinger ? 'text-yellow-400' : 'text-purple-400'
                  }`}>
                    {calledSinger ? '¡Preparate!' : 'Siguiente'}
                  </p>
                  <p className="text-2xl font-semibold">
                    {nextSinger.singerName}
                    {nextSinger.singerLastname ? ` ${nextSinger.singerLastname.charAt(0)}.` : ''}
                  </p>
                  <p className="text-lg text-white/60">
                    {nextSinger.title}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Columna derecha: Cola de espera */}
        <div className="flex flex-col">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-6 flex-1 overflow-hidden">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-semibold text-purple-300">Cola de espera</h3>
            </div>

            {waitingQueue.length > 0 ? (
              <div className="space-y-3">
                {waitingQueue.map((request, index) => (
                  <div
                    key={request.id}
                    className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                      index === 0 ? 'bg-purple-500/20' : 'bg-white/5'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      index === 0 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}>
                      #{request.turnNumber}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {request.singerName}
                        {request.singerLastname ? ` ${request.singerLastname.charAt(0)}.` : ''}
                      </p>
                      <p className="text-sm text-white/50 truncate">
                        {request.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-white/30">
                <Clock className="w-12 h-12 mb-3" />
                <p className="text-lg">Sin más turnos</p>
              </div>
            )}

            {/* Más turnos */}
            {stats && stats.waiting > waitingQueue.length + (currentSinger ? 1 : 0) + (nextSinger && !calledSinger ? 1 : 0) && (
              <div className="mt-4 text-center text-white/40">
                +{stats.waiting - waitingQueue.length - (currentSinger ? 1 : 0) - (nextSinger && !calledSinger ? 1 : 0)} más en cola
              </div>
            )}
          </div>

          {/* QR para anotarse */}
          <div className="mt-4 bg-white/5 backdrop-blur rounded-2xl p-4 text-center">
            <p className="text-sm text-white/60 mb-1">¿Querés cantar?</p>
            <p className="text-lg font-medium text-purple-300">
              Escaneá el QR del evento
            </p>
          </div>
        </div>
      </main>

      {/* Estilos adicionales */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.02); opacity: 0.9; }
        }
        .animate-pulse {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
