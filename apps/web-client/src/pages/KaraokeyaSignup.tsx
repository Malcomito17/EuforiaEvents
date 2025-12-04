/**
 * KaraokeyaSignup - Formulario para anotarse en el karaoke
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, Mic2, Loader2, AlertCircle, 
  Check, User, Music, Clock, Users
} from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import * as api from '../services/api'
import type { CreateKaraokeRequestInput, KaraokeQueueStats } from '../types'

export default function KaraokeyaSignup() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event, karaokeyaConfig, loadEvent } = useEventStore()

  // Estados del formulario
  const [title, setTitle] = useState('')
  const [artist, setArtist] = useState('')
  const [singerName, setSingerName] = useState('')
  const [singerLastname, setSingerLastname] = useState('')
  
  // Estados de envío
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Estadísticas de la cola
  const [stats, setStats] = useState<KaraokeQueueStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  // Cargar evento si no está
  useEffect(() => {
    if (slug && !event) {
      loadEvent(slug)
    }
  }, [slug, event, loadEvent])

  // Cargar estadísticas de la cola
  useEffect(() => {
    if (event?.id) {
      loadStats()
      // Actualizar cada 30 segundos
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [event?.id])

  const loadStats = async () => {
    if (!event) return
    try {
      const data = await api.getKaraokeStats(event.id)
      setStats(data)
    } catch (err) {
      console.error('Error cargando stats:', err)
    } finally {
      setLoadingStats(false)
    }
  }

  // Enviar inscripción
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!event || !singerName.trim() || !title.trim()) return

    const input: CreateKaraokeRequestInput = {
      title: title.trim(),
      artist: artist.trim() || undefined,
      singerName: singerName.trim(),
      singerLastname: singerLastname.trim() || undefined,
    }

    setSubmitting(true)
    setError(null)

    try {
      const request = await api.createKaraokeRequest(event.id, input)
      // Navegar a página de éxito con el turno
      navigate(`/e/${slug}/karaokeya/success`, { 
        state: { 
          turnNumber: request.turnNumber,
          title: request.title,
          singerName: request.singerName,
        } 
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al anotarse')
    } finally {
      setSubmitting(false)
    }
  }

  // Validar formulario
  const isValid = singerName.trim() && title.trim()

  if (!event || !karaokeyaConfig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-safe">
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
            <h1 className="font-semibold">Anotate para cantar</h1>
            <p className="text-xs text-white/60">{event.name}</p>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Estadísticas de la cola */}
        {stats && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="card text-center py-3">
              <Users className="w-5 h-5 mx-auto mb-1 text-primary-400" />
              <p className="text-2xl font-bold">{stats.queued}</p>
              <p className="text-xs text-white/60">En cola</p>
            </div>
            <div className="card text-center py-3">
              <Mic2 className="w-5 h-5 mx-auto mb-1 text-green-400" />
              <p className="text-2xl font-bold">{stats.onStage || stats.called}</p>
              <p className="text-xs text-white/60">Cantando</p>
            </div>
            <div className="card text-center py-3">
              <Clock className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-2xl font-bold">
                {stats.estimatedWaitMinutes ? `~${stats.estimatedWaitMinutes}` : '-'}
              </p>
              <p className="text-xs text-white/60">Min. espera</p>
            </div>
          </div>
        )}

        {/* Error global */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-200">{error}</p>
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit}>
          {/* Canción */}
          <div className="card mb-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-600/30 rounded-lg flex items-center justify-center">
                <Music className="w-5 h-5 text-purple-400" />
              </div>
              <h2 className="font-semibold">¿Qué vas a cantar?</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">
                  Nombre del tema *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Bohemian Rhapsody"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">
                  Artista (opcional)
                </label>
                <input
                  type="text"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="Ej: Queen"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Datos del cantante */}
          <div className="card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary-600/30 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-primary-400" />
              </div>
              <h2 className="font-semibold">Tus datos</h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">
                  Nombre *
                </label>
                <input
                  type="text"
                  value={singerName}
                  onChange={(e) => setSingerName(e.target.value)}
                  placeholder="Tu nombre"
                  className="input-field"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-white/70">
                  Apellido (opcional)
                </label>
                <input
                  type="text"
                  value={singerLastname}
                  onChange={(e) => setSingerLastname(e.target.value)}
                  placeholder="Tu apellido"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          {/* Info de límite por persona */}
          {karaokeyaConfig.maxPerPerson > 0 && (
            <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-sm text-yellow-200 text-center">
                Máximo {karaokeyaConfig.maxPerPerson} turno(s) activo(s) por persona
              </p>
            </div>
          )}

          {/* Botón enviar */}
          <button
            type="submit"
            disabled={!isValid || submitting}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Anotando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Anotarme para cantar
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  )
}
