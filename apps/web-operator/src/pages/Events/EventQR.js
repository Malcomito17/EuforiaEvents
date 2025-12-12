import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { eventsApi } from '@/lib/api';
import { ArrowLeft, Download, Copy, ExternalLink, Check } from 'lucide-react';
export function EventQRPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [qrData, setQrData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        loadQR();
    }, [id]);
    const loadQR = async () => {
        try {
            const { data } = await eventsApi.getQR(id);
            setQrData(data);
        }
        catch (err) {
            console.error('Error loading QR:', err);
        }
        finally {
            setIsLoading(false);
        }
    };
    const handleCopyUrl = async () => {
        if (!qrData)
            return;
        await navigator.clipboard.writeText(qrData.qr.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const handleDownload = () => {
        if (!qrData)
            return;
        const link = document.createElement('a');
        link.href = qrData.qr.dataUrl;
        link.download = `qr-${qrData.slug}.png`;
        link.click();
    };
    if (isLoading) {
        return (<div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>);
    }
    if (!qrData) {
        return (<div className="text-center py-12">
        <p className="text-gray-500">No se pudo cargar el código QR</p>
      </div>);
    }
    return (<div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5"/>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Código QR</h1>
          <p className="text-gray-500">{qrData.eventName}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {/* QR Image */}
        <div className="flex justify-center mb-8">
          <div className="p-4 bg-white rounded-2xl shadow-lg">
            <img src={qrData.qr.dataUrl} alt="Código QR del evento" className="w-64 h-64"/>
          </div>
        </div>

        {/* URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL del evento
          </label>
          <div className="flex gap-2">
            <input type="text" value={qrData.qr.url} readOnly className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-700"/>
            <button onClick={handleCopyUrl} className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
              {copied ? (<>
                  <Check className="h-4 w-4 text-green-600"/>
                  Copiado
                </>) : (<>
                  <Copy className="h-4 w-4"/>
                  Copiar
                </>)}
            </button>
            <a href={qrData.qr.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors flex items-center gap-2">
              <ExternalLink className="h-4 w-4"/>
              Abrir
            </a>
          </div>
        </div>

        {/* Slug info */}
        <div className="mb-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            <strong>Slug:</strong> {qrData.slug}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Los invitados pueden escanear el QR o ingresar directamente a la URL
          </p>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4">
          <button onClick={handleDownload} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center gap-2 transition-colors">
            <Download className="h-5 w-5"/>
            Descargar QR
          </button>
        </div>
      </div>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
        <h3 className="font-medium text-blue-900 mb-2">Tips para usar el QR</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Imprimilo en tamaño grande para que sea fácil de escanear</li>
          <li>• Ubicalo en un lugar visible del evento</li>
          <li>• Podés incluirlo en las invitaciones digitales</li>
          <li>• El QR funciona incluso sin internet si el servidor es local</li>
        </ul>
      </div>
    </div>);
}
//# sourceMappingURL=EventQR.js.map