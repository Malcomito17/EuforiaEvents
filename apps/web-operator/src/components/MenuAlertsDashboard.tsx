import { MenuAlert } from '@/lib/api'
import { X, AlertCircle, AlertTriangle, Info } from 'lucide-react'
import clsx from 'clsx'

interface MenuAlertsDashboardProps {
  alerts: MenuAlert[]
  totalAlerts: number
  highSeverity: number
  mediumSeverity: number
  guestsWithIssues: number
  onClose: () => void
}

export function MenuAlertsDashboard({
  alerts,
  totalAlerts,
  highSeverity,
  mediumSeverity,
  guestsWithIssues,
  onClose
}: MenuAlertsDashboardProps) {
  // Agrupar por severidad
  const highAlerts = alerts.filter(a => a.severity === 'HIGH')
  const mediumAlerts = alerts.filter(a => a.severity === 'MEDIUM')
  const lowAlerts = alerts.filter(a => a.severity === 'LOW')

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Alertas de Restricciones Dietarias</h2>
            <p className="text-sm text-gray-500 mt-1">
              {guestsWithIssues} invitado{guestsWithIssues !== 1 ? 's' : ''} con problemas detectados
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-50 border-b border-gray-200">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{totalAlerts}</div>
            <div className="text-sm text-gray-500">Total de alertas</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{highSeverity}</div>
            <div className="text-sm text-gray-500">Severidad alta</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{mediumSeverity}</div>
            <div className="text-sm text-gray-500">Severidad media</div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                ¡Todo en orden!
              </h3>
              <p className="text-gray-500">
                No hay alertas de restricciones dietarias en este momento
              </p>
            </div>
          ) : (
            <>
              {/* Alertas de alta prioridad */}
              {highAlerts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-red-700 mb-3 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Severidad Alta ({highAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {highAlerts.map((alert, idx) => (
                      <AlertCard key={idx} alert={alert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Alertas de prioridad media */}
              {mediumAlerts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Severidad Media ({mediumAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {mediumAlerts.map((alert, idx) => (
                      <AlertCard key={idx} alert={alert} />
                    ))}
                  </div>
                </div>
              )}

              {/* Alertas de baja prioridad */}
              {lowAlerts.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-700 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Severidad Baja ({lowAlerts.length})
                  </h3>
                  <div className="space-y-2">
                    {lowAlerts.map((alert, idx) => (
                      <AlertCard key={idx} alert={alert} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Close button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Card individual de alerta
function AlertCard({ alert }: { alert: MenuAlert }) {
  const config = {
    HIGH: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      icon: AlertCircle,
      iconColor: 'text-red-600'
    },
    MEDIUM: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: AlertTriangle,
      iconColor: 'text-yellow-600'
    },
    LOW: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: Info,
      iconColor: 'text-blue-600'
    }
  }

  const { bg, border, text, icon: Icon, iconColor } = config[alert.severity]

  return (
    <div className={clsx('p-4 rounded-lg border', bg, border)}>
      <div className="flex items-start gap-3">
        <Icon className={clsx('h-5 w-5 flex-shrink-0 mt-0.5', iconColor)} />
        <div className="flex-1">
          <div className={clsx('font-medium mb-1', text)}>
            {alert.guestName}
          </div>
          <p className={clsx('text-sm', text)}>
            {alert.message}
          </p>
          {alert.restriction && (
            <div className="mt-2">
              <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', bg, text)}>
                Requiere: {alert.restriction}
              </span>
            </div>
          )}
          {alert.suggestedDishes && alert.suggestedDishes.length > 0 && (
            <div className="mt-2">
              <p className="text-xs text-gray-500">
                Sugerencia: Agregar platos compatibles al menú o asignarle uno de los existentes
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
