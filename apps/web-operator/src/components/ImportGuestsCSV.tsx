import { useState } from 'react'
import { eventGuestsApi, CSVGuestInput } from '@/lib/api'
import { X, Upload, FileText, AlertCircle, CheckCircle, Download } from 'lucide-react'

interface ImportGuestsCSVProps {
  eventId: string
  onClose: () => void
  onSuccess: () => void
}

export function ImportGuestsCSV({ eventId, onClose, onSuccess }: ImportGuestsCSVProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    imported: number
    errors: Array<{ row: number; error: string }>
  } | null>(null)
  const [error, setError] = useState('')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('El archivo debe ser un CSV')
        setFile(null)
        return
      }
      setFile(selectedFile)
      setError('')
      setResult(null)
    }
  }

  const parseCSV = (text: string): CSVGuestInput[] => {
    const lines = text.trim().split('\n')
    if (lines.length < 2) {
      throw new Error('El archivo CSV está vacío o no tiene datos')
    }

    // Primera línea debe ser el header
    const header = lines[0].split(',').map(h => h.trim().toLowerCase())

    // Validar que tenga al menos "nombre"
    if (!header.includes('nombre')) {
      throw new Error('El CSV debe tener al menos una columna "nombre"')
    }

    const guests: CSVGuestInput[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim())
      const row: any = {}

      header.forEach((key, index) => {
        const value = values[index]
        if (value) {
          // Procesar restricciones dietarias si vienen separadas por punto y coma
          if (key === 'dietaryrestrictions' || key === 'restricciones') {
            row.dietaryRestrictions = value.split(';').map(r => r.trim()).filter(Boolean)
          } else if (key === 'mesanumero' || key === 'mesa') {
            row.mesaNumero = value
          } else {
            row[key] = value
          }
        }
      })

      // Solo agregar si tiene nombre
      if (row.nombre) {
        guests.push(row)
      }
    }

    return guests
  }

  const handleImport = async () => {
    if (!file) {
      setError('Seleccione un archivo CSV')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Leer el archivo
      const text = await file.text()

      // Parsear CSV
      const guests = parseCSV(text)

      if (guests.length === 0) {
        throw new Error('No se encontraron invitados válidos en el archivo')
      }

      // Importar
      const { data } = await eventGuestsApi.importCSV(eventId, guests)
      setResult(data)

      // Si todo salió bien, llamar onSuccess después de un momento
      if (data.errors.length === 0) {
        setTimeout(() => {
          onSuccess()
          onClose()
        }, 2000)
      }
    } catch (err: any) {
      console.error('Error importing CSV:', err)
      setError(err.message || 'Error al importar el archivo')
    } finally {
      setIsUploading(false)
    }
  }

  const downloadTemplate = () => {
    const template = `nombre,apellido,email,phone,company,mesaNumero,dietaryRestrictions,observaciones,accesibilidad
Juan,Pérez,juan@example.com,1234567890,Empresa SA,5,VEGANO;SIN_GLUTEN,VIP,NINGUNA
María,González,maria@example.com,0987654321,Empresa SRL,3,VEGETARIANO,Necesita silla especial,MOVILIDAD_REDUCIDA`

    const blob = new Blob([template], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'template_invitados.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Importar Invitados desde CSV</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-2">Formato del archivo CSV:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La primera fila debe contener los nombres de las columnas</li>
                  <li>La columna <code className="bg-blue-100 px-1 rounded">nombre</code> es obligatoria</li>
                  <li>
                    Columnas opcionales: <code className="bg-blue-100 px-1 rounded">apellido</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">email</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">phone</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">company</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">mesaNumero</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">dietaryRestrictions</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">observaciones</code>,{' '}
                    <code className="bg-blue-100 px-1 rounded">accesibilidad</code>
                  </li>
                  <li>
                    Las restricciones dietarias se separan con punto y coma (;)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Descargar template */}
          <div>
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <Download className="h-4 w-4" />
              Descargar plantilla de ejemplo
            </button>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Archivo CSV
            </label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
              />
            </div>
            {file && (
              <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                <FileText className="h-4 w-4" />
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className={`p-4 rounded-lg border ${result.errors.length === 0 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
              <div className="flex items-start gap-3">
                <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${result.errors.length === 0 ? 'text-green-600' : 'text-yellow-600'}`} />
                <div className="text-sm">
                  <p className={`font-medium mb-2 ${result.errors.length === 0 ? 'text-green-900' : 'text-yellow-900'}`}>
                    Importación completada
                  </p>
                  <p className={result.errors.length === 0 ? 'text-green-700' : 'text-yellow-700'}>
                    Se importaron {result.imported} invitados correctamente
                  </p>
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="font-medium text-yellow-900 mb-2">Errores encontrados:</p>
                      <ul className="space-y-1 text-yellow-700">
                        {result.errors.map((err, idx) => (
                          <li key={idx}>
                            Fila {err.row}: {err.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              disabled={isUploading}
            >
              {result ? 'Cerrar' : 'Cancelar'}
            </button>
            {!result && (
              <button
                onClick={handleImport}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={!file || isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? 'Importando...' : 'Importar'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
