import { useState, useEffect } from 'react'
import { eventsApi } from '@/lib/api'
import { X, Loader2, Copy, Share2, Printer, RefreshCw, CheckCircle } from 'lucide-react'

interface EventCheckinQRProps {
  eventId: string
  onClose: () => void
}

export function EventCheckinQR({ eventId, onClose }: EventCheckinQRProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [link, setLink] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchQRAndLink()
  }, [eventId])

  const fetchQRAndLink = async () => {
    setIsLoading(true)
    setError('')

    try {
      const [qrRes, linkRes] = await Promise.all([
        eventsApi.getCheckinQR(eventId),
        eventsApi.getCheckinLink(eventId)
      ])

      setQrDataUrl(qrRes.data.qr)
      setLink(linkRes.data.url)
    } catch (err: any) {
      console.error('Error fetching QR and link:', err)
      setError(err.response?.data?.error || 'Error al cargar el código QR')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegenerate = async () => {
    if (!confirm('¿Regenerar el token de acceso? El código QR y link anterior dejarán de funcionar.')) {
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await eventsApi.generateCheckinToken(eventId)
      await fetchQRAndLink()
      alert('Token regenerado exitosamente')
    } catch (err: any) {
      console.error('Error regenerating token:', err)
      setError(err.response?.data?.error || 'Error al regenerar el token')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = () => {
    if (link) {
      navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleShareWhatsApp = () => {
    if (link) {
      const message = `Acceso al check-in del evento: ${link}`
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const handlePrint = () => {
    if (!qrDataUrl) return

    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Check-in</title>
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
              }
              img {
                width: 300px;
                height: 300px;
              }
            }
          </style>
        </head>
        <body>
          <h1>Código QR - Check-in</h1>
          <img src="${qrDataUrl}" alt="QR Check-in" />
          <div class="link">${link}</div>
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">QR de Acceso Check-in</h2>
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
              Comparte este código QR o link con los recepcionistas para que puedan acceder
              directamente al check-in sin necesidad de login.
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
            ) : qrDataUrl ? (
              <div className="p-4 bg-gray-50 rounded-lg">
                <img src={qrDataUrl} alt="QR Check-in" className="w-64 h-64" />
              </div>
            ) : (
              <div className="flex items-center justify-center w-64 h-64 bg-gray-100 rounded-lg text-gray-400">
                Sin QR
              </div>
            )}
          </div>

          {/* Link */}
          {link && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link de acceso directo:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={link}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                />
                <button
                  onClick={handleCopyLink}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  title="Copiar link"
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
              onClick={handlePrint}
              disabled={!qrDataUrl || isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Printer className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Imprimir</span>
            </button>
            <button
              onClick={handleShareWhatsApp}
              disabled={!link || isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Share2 className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">WhatsApp</span>
            </button>
            <button
              onClick={handleRegenerate}
              disabled={isLoading}
              className="flex flex-col items-center gap-2 p-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="h-5 w-5 text-gray-600" />
              <span className="text-sm text-gray-700">Regenerar</span>
            </button>
          </div>

          {/* Security note */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs text-yellow-900">
            <p className="font-medium mb-1">🔒 Seguridad:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Este token permite acceso solo al check-in del evento</li>
              <li>Puedes regenerarlo en cualquier momento para invalidar el anterior</li>
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
