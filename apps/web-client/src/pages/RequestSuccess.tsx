/**
 * RequestSuccess - Confirmación de pedido enviado
 */

import { useParams, useNavigate } from 'react-router-dom'
import { CheckCircle2, Music2, ArrowLeft, Plus, ListMusic } from 'lucide-react'
import { useEventStore } from '../stores/eventStore'
import { ClientHeader } from '../components/ClientHeader'

export default function RequestSuccess() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { event } = useEventStore()

  return (
    <div className="min-h-screen pb-safe">
      <ClientHeader title="¡Listo!" showBackButton={false} />

      <div className="flex flex-col items-center justify-center p-4 text-center" style={{ minHeight: 'calc(100vh - 80px)' }}>
      {/* Ícono de éxito */}
      <div className="relative mb-6">
        <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-green-400" />
        </div>
        <div className="absolute -right-2 -bottom-2 w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
          <Music2 className="w-5 h-5" />
        </div>
      </div>

      {/* Mensaje */}
      <h1 className="text-2xl font-bold mb-2">¡Pedido enviado!</h1>
      <p className="text-white/60 max-w-xs mb-8">
        Tu solicitud fue recibida. El DJ la verá en su pantalla.
      </p>

      {/* Acciones */}
      <div className="w-full max-w-xs space-y-3">
        <button
          onClick={() => navigate(`/e/${slug}/musicadj/mis-pedidos`)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <ListMusic className="w-5 h-5" />
          Ver mis pedidos
        </button>

        <button
          onClick={() => navigate(`/e/${slug}/musicadj`)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Pedir otro tema
        </button>

        <button
          onClick={() => navigate(`/e/${slug}`)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Volver al inicio
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-white/40">
        {event?.name}
      </p>
      </div>
    </div>
  )
}
