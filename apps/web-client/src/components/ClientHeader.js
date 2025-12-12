/**
 * ClientHeader - Header reutilizable para páginas del cliente
 * Muestra nombre del evento, notificación de turno, y navegación
 */
import { ArrowLeft, Phone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEventStore } from '../stores/eventStore';
import { useGuestStore } from '../stores/guestStore';
import { useKaraokeQueue } from '../hooks/useKaraokeQueue';
export function ClientHeader({ title, subtitle, showBackButton = true, backTo, showTurnNotification = true, }) {
    const navigate = useNavigate();
    const { event } = useEventStore();
    const { guest } = useGuestStore();
    // Hook para obtener el estado de la cola de karaoke
    const { hasTurn } = useKaraokeQueue(event?.id, guest?.id, showTurnNotification);
    const handleBack = () => {
        if (backTo) {
            navigate(backTo);
        }
        else if (event?.slug) {
            navigate(`/e/${event.slug}`);
        }
        else {
            navigate(-1);
        }
    };
    const handleEventClick = () => {
        if (event?.slug) {
            navigate(`/e/${event.slug}/detalles`);
        }
    };
    return (<header className="sticky top-0 bg-gray-900/80 backdrop-blur-lg border-b border-white/10 z-10">
      <div className="max-w-lg mx-auto px-4 py-3">
        {/* Primera fila: Navegación y título */}
        <div className="flex items-center gap-3 mb-1">
          {showBackButton && (<button onClick={handleBack} className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0" aria-label="Volver">
              <ArrowLeft className="w-5 h-5"/>
            </button>)}

          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate">{title}</h1>
            {subtitle && (<p className="text-xs text-white/60 truncate">{subtitle}</p>)}
          </div>

          {/* Notificación de turno */}
          {showTurnNotification && hasTurn && (<button onClick={() => navigate(`/e/${event?.slug}/karaokeya/queue`)} className="flex-shrink-0 relative" aria-label="¡Es tu turno!">
              <div className="p-2 bg-green-500/20 rounded-full border-2 border-green-500 animate-pulse">
                <Phone className="w-5 h-5 text-green-300"/>
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"/>
            </button>)}
        </div>

        {/* Segunda fila: Nombre del evento (clickable) */}
        {event && (<button onClick={handleEventClick} className="text-xs text-white/50 hover:text-white/70 transition-colors truncate w-full text-left">
            📍 {event.name}
          </button>)}
      </div>
    </header>);
}
//# sourceMappingURL=ClientHeader.js.map