/**
 * ImageUpload Component - Upload de imágenes con preview
 */

import { useState, useRef } from 'react'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import clsx from 'clsx'

interface ImageUploadProps {
  currentImageUrl?: string | null
  onUpload: (file: File) => Promise<string> // Devuelve la URL de la imagen subida
  onDelete?: () => Promise<void>
  label: string
  description?: string
  aspectRatio?: '1:1' | '4:5' | '16:9' // Tamaños sugeridos
  maxSizeMB?: number
}

export function ImageUpload({
  currentImageUrl,
  onUpload,
  onDelete,
  label,
  description = 'Formato: JPEG, PNG o WebP. Tamaño máximo: 5MB',
  aspectRatio = '4:5', // Instagram post por defecto
  maxSizeMB = 5
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const aspectRatioClass = {
    '1:1': 'aspect-square',
    '4:5': 'aspect-[4/5]',
    '16:9': 'aspect-video'
  }[aspectRatio]

  const aspectRatioLabel = {
    '1:1': '1:1 (Instagram Post Cuadrado)',
    '4:5': '4:5 (Instagram Post Vertical - Recomendado)',
    '16:9': '16:9 (Horizontal)'
  }[aspectRatio]

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen')
      return
    }

    // Validar tamaño
    const fileSizeMB = file.size / 1024 / 1024
    if (fileSizeMB > maxSizeMB) {
      setError(`El archivo es muy grande. Máximo ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)

    try {
      const imageUrl = await onUpload(file)
      setPreviewUrl(imageUrl)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen')
    } finally {
      setIsUploading(false)
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return

    if (!confirm('¿Estás seguro de eliminar esta imagen?')) return

    setIsDeleting(true)
    setError(null)

    try {
      await onDelete()
      setPreviewUrl(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la imagen')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div className="space-y-3">
        {/* Preview o Upload Area */}
        <div className={clsx(
          'relative rounded-lg border-2 border-dashed overflow-hidden',
          previewUrl ? 'border-gray-300' : 'border-gray-300 hover:border-primary-400 transition-colors'
        )}>
          {previewUrl ? (
            /* Preview con imagen */
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                className={clsx('w-full object-cover', aspectRatioClass)}
              />

              {/* Overlay con botones */}
              <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-40 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isDeleting}
                  className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors"
                >
                  Cambiar
                </button>

                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isUploading || isDeleting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                  >
                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Eliminar'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Upload Area */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className={clsx(
                'w-full p-8 flex flex-col items-center justify-center text-center',
                aspectRatioClass,
                isUploading && 'opacity-50 cursor-not-allowed'
              )}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-12 w-12 text-primary-500 animate-spin mb-3" />
                  <p className="text-sm text-gray-600">Subiendo imagen...</p>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Click para subir una imagen
                  </p>
                  <p className="text-xs text-gray-500">{aspectRatioLabel}</p>
                </>
              )}
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Description */}
        <p className="text-xs text-gray-500">{description}</p>

        {/* Error message */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
            <X className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
