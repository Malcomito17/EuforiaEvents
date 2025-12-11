/**
 * Display Control Panel - Controles para gestionar la pantalla Display
 */

import { useState, useEffect } from 'react'
import { Monitor, ExternalLink, Save, Loader2 } from 'lucide-react'
import { clsx } from 'clsx'

interface DisplayConfig {
  displayMode: 'QUEUE' | 'BREAK' | 'START' | 'PROMO'
  displayLayout: 'VERTICAL' | 'HORIZONTAL'
  displayBreakMessage: string
  displayStartMessage: string
  displayPromoImageUrl: string | null
}

interface DisplayControlPanelProps {
  eventId: string
  eventSlug: string
  config: DisplayConfig
  onConfigUpdate: (config: Partial<DisplayConfig>) => Promise<void>
}

export function DisplayControlPanel({ eventSlug, config, onConfigUpdate }: DisplayControlPanelProps) {
  const [localConfig, setLocalConfig] = useState<DisplayConfig>(config)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    setLocalConfig(config)
  }, [config])

  const handleSave = async () => {
    setIsSaving(true)
    setSaveMessage(null)

    try {
      await onConfigUpdate(localConfig)
      setSaveMessage({ type: 'success', text: 'Configuración guardada correctamente' })
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error: any) {
      setSaveMessage({ type: 'error', text: error.message || 'Error al guardar configuración' })
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenDisplay = () => {
    const displayUrl = `${window.location.origin}/display/${eventSlug}`
    window.open(displayUrl, '_blank', 'width=1920,height=1080,fullscreen=yes')
  }

  const hasChanges = JSON.stringify(localConfig) !== JSON.stringify(config)

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Monitor className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Pantalla Display</h3>
            <p className="text-sm text-gray-500">Configura la pantalla pública de karaoke</p>
          </div>
        </div>
        <button
          onClick={handleOpenDisplay}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          <ExternalLink className="w-4 h-4" />
          Abrir Display
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Display Mode */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Modo de Pantalla
          </label>
          <div className="grid grid-cols-4 gap-3">
            {(['QUEUE', 'BREAK', 'START', 'PROMO'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLocalConfig({ ...localConfig, displayMode: mode })}
                className={clsx(
                  'px-4 py-3 text-sm font-medium rounded-lg border-2 transition',
                  localConfig.displayMode === mode
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                {mode === 'QUEUE' && '📋 Cola'}
                {mode === 'BREAK' && '☕ Pausa'}
                {mode === 'START' && '🎬 Inicio'}
                {mode === 'PROMO' && '📸 Promo'}
              </button>
            ))}
          </div>
        </div>

        {/* Layout (solo visible en modo QUEUE) */}
        {localConfig.displayMode === 'QUEUE' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Orientación
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setLocalConfig({ ...localConfig, displayLayout: 'VERTICAL' })}
                className={clsx(
                  'px-4 py-3 text-sm font-medium rounded-lg border-2 transition',
                  localConfig.displayLayout === 'VERTICAL'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                📱 Vertical
              </button>
              <button
                onClick={() => setLocalConfig({ ...localConfig, displayLayout: 'HORIZONTAL' })}
                className={clsx(
                  'px-4 py-3 text-sm font-medium rounded-lg border-2 transition',
                  localConfig.displayLayout === 'HORIZONTAL'
                    ? 'border-purple-600 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                )}
              >
                🖥️ Horizontal
              </button>
            </div>
          </div>
        )}

        {/* Break Message */}
        {localConfig.displayMode === 'BREAK' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de Pausa
            </label>
            <input
              type="text"
              value={localConfig.displayBreakMessage}
              onChange={(e) => setLocalConfig({ ...localConfig, displayBreakMessage: e.target.value })}
              placeholder="¡Ya regresamos! 🎤"
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 200 caracteres</p>
          </div>
        )}

        {/* Start Message */}
        {localConfig.displayMode === 'START' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensaje de Inicio
            </label>
            <input
              type="text"
              value={localConfig.displayStartMessage}
              onChange={(e) => setLocalConfig({ ...localConfig, displayStartMessage: e.target.value })}
              placeholder="¡Ya comenzamos! 🎉"
              maxLength={200}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">Máximo 200 caracteres</p>
          </div>
        )}

        {/* Promo Image URL */}
        {localConfig.displayMode === 'PROMO' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL de Imagen Promocional
            </label>
            <input
              type="url"
              value={localConfig.displayPromoImageUrl || ''}
              onChange={(e) => setLocalConfig({ ...localConfig, displayPromoImageUrl: e.target.value || null })}
              placeholder="https://ejemplo.com/promo.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">URL de la imagen a mostrar en pantalla completa</p>
          </div>
        )}

        {/* Save Message */}
        {saveMessage && (
          <div
            className={clsx(
              'px-4 py-3 rounded-lg',
              saveMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            )}
          >
            {saveMessage.text}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={clsx(
              'flex items-center gap-2 px-6 py-2 rounded-lg transition font-medium',
              hasChanges && !isSaving
                ? 'bg-purple-600 text-white hover:bg-purple-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
