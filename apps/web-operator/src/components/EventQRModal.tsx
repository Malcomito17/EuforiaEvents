import { useState, useEffect } from 'react'
import { eventsApi, QRResponse } from '@/lib/api'
import { X, Loader2, Copy, Download, ExternalLink, CheckCircle, Printer } from 'lucide-react'

interface EventQRModalProps {
  eventId: string
  onClose: () => void
}

export function EventQRModal({ eventId, onClose }: EventQRModalProps) {
  const [qrData, setQrData] = useState<QRResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    loadQR()
  }, [eventId])

  const loadQR = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { data } = await eventsApi.getQR(eventId)
      setQrData(data)
    } catch (err: any) {
      console.error('Error loading QR:', err)
      setError(err.response?.data?.error || 'Error al cargar el código QR')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyUrl = async () => {
    if (!qrData) return
    await navigator.clipboard.writeText(qrData.qr.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    if (!qrData) return
    const link = document.createElement('a')
    link.href = qrData.qr.dataUrl
    link.download = `qr-${qrData.slug}.png`
    link.click()
  }

  const handleOpenUrl = () => {
    if (qrData) {
      window.open(qrData.qr.url, '_blank')
    }
  }

  const handlePrint = () => {
    if (!qrData) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Evento - ${qrData.eventName}</title>
          <style>
            body {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              font-family: Arial, sans-serif;
            }
            h1 {
              margin-bottom: 10px;
            }
            .slug {
              color: #666;
              margin-bottom: 20px;
            }
            img {
              width: 400px;
              height: 400px;
            }
            .link {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
              word-break: break-all;
              max-width: 80%;
              text-align: center;
            }
            @media print {
              body {
                display: block;
                text-align: center;
                padding-top: 50px;
              }
              img {
                width: 300px;
                height: 300px;
              }
            }
          </style>
        </head>
        <body>
          <h1>${qrData.eventName}</h1>
          <p class="slug">${qrData.slug}</p>
          <img src="${qrData.qr.dataUrl}" alt="QR Evento" />
          <div class="link">${qrData.qr.url}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-md w-full my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Código QR del Evento</h2>
            {qrData && (
              <p className="text-sm text-gray-500 mt-1">{qrData.eventName}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
            <p>
              Los invitados pueden escanear este QR o ingresar directamente a la URL
              para acceder a la app del evento.
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* QR Code */}
          <div className="flex justify-center">
            {isLoading ? (
              <div className="flex items-center justify-center w-64 h-64 bg-gray-50 rounded-lg">
                <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
              </div>
            ) : qrData ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <img src={qrData.qr.dataUrl} alt="QR Evento" className="w-64 h-64" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg text-gray-400">
                Sin QR
              </div>
            )}
          </div>

          {/* Slug */}
          {qrData && (
            <div className="text-center">
              <span className="inline-block px-3 py-1 bg-gray-100 rounded-full text-sm font-mono text-gray-700">
                {qrData.slug}
              </span>
            </div>
          )}

          {/* URL */}
          {qrData && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL del evento:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={qrData.qr.url}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyUrl}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Copiar URL"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-600" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleDownload}
              disabled={!qrData || isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Descargar</span>
            </button>
            <button
              onClick={handlePrint}
              disabled={!qrData || isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Imprimir</span>
            </button>
            <button
              onClick={handleOpenUrl}
              disabled={!qrData || isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ExternalLink className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Abrir</span>
            </button>
          </div>

          {/* Tips */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-900">
            <p className="font-medium mb-1">Tips para usar el QR:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Imprimilo en tamaño grande para que sea fácil de escanear</li>
              <li>Ubicalo en un lugar visible del evento</li>
              <li>Podés incluirlo en las invitaciones digitales</li>
            </ul>
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
