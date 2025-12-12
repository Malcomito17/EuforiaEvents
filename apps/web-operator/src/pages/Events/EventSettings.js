import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/lib/api';
import { ArrowLeft, Music, Mic, Loader2, Save } from 'lucide-react';
import clsx from 'clsx';
export function EventSettingsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [musicadjConfig, setMusicadjConfig] = useState({
        enabled: false,
        cooldownSeconds: 300,
        maxPerUser: 5,
        welcomeMessage: null,
    });
    const [karaokeyaConfig, setKaraokeyaConfig] = useState({
        enabled: false,
        cooldownSeconds: 300,
        maxPerPerson: 3,
        welcomeMessage: null,
        suggestionsEnabled: false,
    });
    useEffect(() => {
        loadConfigs();
    }, [id]);
    const loadConfigs = async () => {
        try {
            const [musicadj, karaokeya] = await Promise.allSettled([
                api.get(`/events/${id}/musicadj/config`),
                api.get(`/events/${id}/karaokeya/config`),
            ]);
            if (musicadj.status === 'fulfilled') {
                setMusicadjConfig(musicadj.value.data);
            }
            if (karaokeya.status === 'fulfilled') {
                setKaraokeyaConfig(karaokeya.value.data);
            }
        }
        catch (err) {
            console.error('Error loading configs:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSave = async () => {
        setSaving(true);
        setError(null);
        setSuccess(false);
        try {
            await Promise.all([
                api.patch(`/events/${id}/musicadj/config`, musicadjConfig),
                api.patch(`/events/${id}/karaokeya/config`, karaokeyaConfig),
            ]);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        }
        catch (err) {
            setError(err.response?.data?.error || 'Error al guardar configuración');
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (<div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600"/>
      </div>);
    }
    return (<div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(`/events/${id}`)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="h-5 w-5"/>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configuración de Módulos</h1>
            <p className="text-gray-500">Habilitar o deshabilitar funcionalidades del evento</p>
          </div>
        </div>

        <button onClick={handleSave} disabled={saving} className={clsx('inline-flex items-center gap-2 px-6 py-2 rounded-lg font-semibold transition-colors', 'bg-primary-600 hover:bg-primary-700 text-white', 'disabled:opacity-50 disabled:cursor-not-allowed')}>
          {saving ? (<>
              <Loader2 className="h-4 w-4 animate-spin"/>
              Guardando...
            </>) : (<>
              <Save className="h-4 w-4"/>
              Guardar Cambios
            </>)}
        </button>
      </div>

      {/* Success/Error messages */}
      {success && (<div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          Configuración guardada correctamente
        </div>)}

      {error && (<div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>)}

      <div className="space-y-6">
        {/* MUSICADJ Module */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-primary-100 rounded-xl">
              <Music className="h-6 w-6 text-primary-600"/>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">MUSICADJ</h2>
              <p className="text-gray-600 text-sm mt-1">
                Permite que los invitados soliciten canciones desde Spotify para el DJ
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={musicadjConfig.enabled} onChange={(e) => setMusicadjConfig({ ...musicadjConfig, enabled: e.target.checked })} className="sr-only peer"/>
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {musicadjConfig.enabled && (<div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (segundos)
                  </label>
                  <input type="number" min="0" max="3600" value={musicadjConfig.cooldownSeconds} onChange={(e) => setMusicadjConfig({
                ...musicadjConfig,
                cooldownSeconds: parseInt(e.target.value) || 0,
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo de espera entre solicitudes del mismo invitado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo por persona
                  </label>
                  <input type="number" min="1" max="20" value={musicadjConfig.maxPerUser} onChange={(e) => setMusicadjConfig({
                ...musicadjConfig,
                maxPerUser: parseInt(e.target.value) || 1,
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
                  <p className="text-xs text-gray-500 mt-1">
                    Número máximo de solicitudes activas por invitado
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de bienvenida (opcional)
                </label>
                <textarea value={musicadjConfig.welcomeMessage || ''} onChange={(e) => setMusicadjConfig({
                ...musicadjConfig,
                welcomeMessage: e.target.value || null,
            })} rows={3} placeholder="Ej: ¡Bienvenido! Pedí tu tema favorito para la fiesta..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"/>
              </div>
            </div>)}
        </div>

        {/* KARAOKEYA Module */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-purple-100 rounded-xl">
              <Mic className="h-6 w-6 text-purple-600"/>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">KARAOKEYA</h2>
              <p className="text-gray-600 text-sm mt-1">
                Sistema de cola de karaoke con búsqueda en YouTube y catálogo
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={karaokeyaConfig.enabled} onChange={(e) => setKaraokeyaConfig({ ...karaokeyaConfig, enabled: e.target.checked })} className="sr-only peer"/>
              <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
            </label>
          </div>

          {karaokeyaConfig.enabled && (<div className="space-y-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cooldown (segundos)
                  </label>
                  <input type="number" min="0" max="3600" value={karaokeyaConfig.cooldownSeconds} onChange={(e) => setKaraokeyaConfig({
                ...karaokeyaConfig,
                cooldownSeconds: parseInt(e.target.value) || 0,
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                  <p className="text-xs text-gray-500 mt-1">
                    Tiempo de espera entre solicitudes del mismo invitado
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Máximo por persona
                  </label>
                  <input type="number" min="1" max="10" value={karaokeyaConfig.maxPerPerson} onChange={(e) => setKaraokeyaConfig({
                ...karaokeyaConfig,
                maxPerPerson: parseInt(e.target.value) || 1,
            })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
                  <p className="text-xs text-gray-500 mt-1">
                    Número máximo de solicitudes en cola por invitado
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje de bienvenida (opcional)
                </label>
                <textarea value={karaokeyaConfig.welcomeMessage || ''} onChange={(e) => setKaraokeyaConfig({
                ...karaokeyaConfig,
                welcomeMessage: e.target.value || null,
            })} rows={3} placeholder="Ej: ¡Animate a cantar! Buscá tu tema favorito..." className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"/>
              </div>

              <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">Sugerencias Inteligentes</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    Muestra canciones recomendadas basadas en el historial y popularidad del evento
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer ml-4">
                  <input type="checkbox" checked={karaokeyaConfig.suggestionsEnabled} onChange={(e) => setKaraokeyaConfig({
                ...karaokeyaConfig,
                suggestionsEnabled: e.target.checked,
            })} className="sr-only peer"/>
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                </label>
              </div>
            </div>)}
        </div>
      </div>
    </div>);
}
//# sourceMappingURL=EventSettings.js.map