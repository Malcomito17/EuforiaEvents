/**
 * KaraokeyaSuccess - Página de confirmación de turno
 */

import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { CheckCircle, ArrowLeft, Mic2, Clock, Home } from 'lucide-react'

interface SuccessState {
  turnNumber: number
  title: string
  singerName: string
}

export default function KaraokeyaSuccess() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  
  // Datos del turno desde navigation state
  const state = location.state as SuccessState | null

  if (!state) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <p className="text-white/60 mb-4">No hay datos del turno</p>
        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="btn-primary"
        >
          Volver al evento
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Ícono de éxito */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center">
          <CheckCircle className="w-12 h-12" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center border-4 border-gray-900">
          <Mic2 className="w-5 h-5" />
        </div>
      </div>

      {/* Mensaje principal */}
      <h1 className="text-3xl font-bold mb-2 text-center">
        ¡Estás anotado!
      </h1>
      <p className="text-white/70 text-center mb-8">
        Tu turno fue registrado correctamente
      </p>

      {/* Tarjeta con info del turno */}
      <div className="w-full max-w-sm card mb-8">
        <div className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-600 rounded-full mb-3">
            <span className="text-4xl font-bold">#{state.turnNumber}</span>
          </div>
          <p className="text-white/60 text-sm">Tu número de turno</p>
        </div>

        <div className="border-t border-white/10 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-white/60">Cantante</span>
            <span className="font-medium">{state.singerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/60">Canción</span>
            <span className="font-medium truncate ml-4">{state.title}</span>
          </div>
        </div>
      </div>

      {/* Info importante */}
      <div className="w-full max-w-sm p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl mb-8">
        <div className="flex items-start gap-3">
          <Clock className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-yellow-200 font-medium">
              Mantenete atento
            </p>
            <p className="text-sm text-yellow-200/80 mt-1">
              Cuando llegue tu turno, te van a llamar por tu nombre. 
              ¡Acercate al escenario!
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="w-full max-w-sm space-y-3">
        <button
          onClick={() => navigate(`/e/${slug}/karaokeya`)}
          className="w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Mic2 className="w-5 h-5" />
          Anotar otra canción
        </button>
        
        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-white/70"
        >
          <Home className="w-5 h-5" />
          Volver al evento
        </button>
      </div>
    </div>
  )
}
