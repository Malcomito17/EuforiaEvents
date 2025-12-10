import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Save, Loader2, Star, ExternalLink } from 'lucide-react'
import { karaokeSongsApi, type CreateKaraokeSongInput, type KaraokeSong, type Difficulty } from '../../lib/api'
import clsx from 'clsx'

type FormData = {
  youtubeId: string
  youtubeShareUrl?: string
  thumbnailUrl?: string
  title: string
  artist: string
  language: 'ES' | 'EN' | 'PT'
  duration?: number
  difficulty: Difficulty
  ranking: number
  opinion?: string
}

export default function SongForm() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEdit = !!id

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [rankingHover, setRankingHover] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      language: 'ES',
      difficulty: 'MEDIO',
      ranking: 3,
    },
  })

  const ranking = watch('ranking')
  const youtubeId = watch('youtubeId')

  useEffect(() => {
    if (isEdit) {
      loadSong()
    }
  }, [id])

  async function loadSong() {
    if (!id) return

    setLoading(true)
    try {
      const { data } = await karaokeSongsApi.get(id)

      setValue('youtubeId', data.youtubeId)
      setValue('youtubeShareUrl', data.youtubeShareUrl)
      setValue('thumbnailUrl', data.thumbnailUrl || '')
      setValue('title', data.title)
      setValue('artist', data.artist)
      setValue('language', data.language as 'ES' | 'EN' | 'PT')
      setValue('duration', data.duration || undefined)
      setValue('difficulty', data.difficulty)
      setValue('ranking', data.ranking)
      setValue('opinion', data.opinion || '')
    } catch (error) {
      console.error('Error al cargar canción:', error)
      alert('Error al cargar canción')
      navigate('/karaoke-songs')
    } finally {
      setLoading(false)
    }
  }

  async function onSubmit(data: FormData) {
    setSaving(true)
    try {
      // Auto-generate youtubeShareUrl if not provided
      const payload: CreateKaraokeSongInput = {
        ...data,
        youtubeShareUrl: data.youtubeShareUrl || `https://youtu.be/${data.youtubeId}`,
        duration: data.duration || null,
        opinion: data.opinion || null,
        thumbnailUrl: data.thumbnailUrl || null,
      }

      if (isEdit && id) {
        await karaokeSongsApi.update(id, payload)
      } else {
        await karaokeSongsApi.create(payload)
      }

      navigate('/karaoke-songs')
    } catch (error: any) {
      console.error('Error al guardar canción:', error)
      alert(error.response?.data?.error || 'Error al guardar canción')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/karaoke-songs')}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Editar Canción' : 'Nueva Canción'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {isEdit ? 'Modifica los datos de la canción' : 'Agrega una nueva canción al catálogo'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* YouTube Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Información de YouTube</h2>
            {youtubeId && (
              <a
                href={`https://youtu.be/${youtubeId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-purple-600 hover:text-purple-700 inline-flex items-center gap-1"
              >
                Ver en YouTube
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* YouTube ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                YouTube ID <span className="text-red-500">*</span>
              </label>
              <input
                {...register('youtubeId', { required: 'YouTube ID es requerido' })}
                type="text"
                disabled={isEdit}
                placeholder="dQw4w9WgXcQ"
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.youtubeId ? 'border-red-300' : 'border-gray-300',
                  isEdit && 'bg-gray-100 cursor-not-allowed'
                )}
              />
              {errors.youtubeId && (
                <p className="text-sm text-red-600 mt-1">{errors.youtubeId.message}</p>
              )}
              {isEdit && (
                <p className="text-xs text-gray-500 mt-1">
                  El YouTube ID no puede modificarse después de crear la canción
                </p>
              )}
            </div>

            {/* YouTube Share URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de YouTube (opcional)
              </label>
              <input
                {...register('youtubeShareUrl')}
                type="url"
                placeholder="https://youtu.be/dQw4w9WgXcQ"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Se generará automáticamente si no se proporciona
              </p>
            </div>

            {/* Thumbnail URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL de Miniatura (opcional)
              </label>
              <input
                {...register('thumbnailUrl')}
                type="url"
                placeholder="https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Song Info Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Información de la Canción</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Título <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title', { required: 'Título es requerido' })}
                type="text"
                placeholder="Never Gonna Give You Up"
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.title ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.title && (
                <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Artist */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Artista <span className="text-red-500">*</span>
              </label>
              <input
                {...register('artist', { required: 'Artista es requerido' })}
                type="text"
                placeholder="Rick Astley"
                className={clsx(
                  'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent',
                  errors.artist ? 'border-red-300' : 'border-gray-300'
                )}
              />
              {errors.artist && (
                <p className="text-sm text-red-600 mt-1">{errors.artist.message}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Idioma
              </label>
              <select
                {...register('language')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="ES">Español</option>
                <option value="EN">Inglés</option>
                <option value="PT">Portugués</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duración (segundos)
              </label>
              <input
                {...register('duration', { valueAsNumber: true })}
                type="number"
                placeholder="213"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Editorial Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Evaluación Editorial</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dificultad Vocal
              </label>
              <select
                {...register('difficulty')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="FACIL">Fácil</option>
                <option value="MEDIO">Medio</option>
                <option value="DIFICIL">Difícil</option>
                <option value="PAVAROTTI">Pavarotti</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Nivel de habilidad vocal requerido
              </p>
            </div>

            {/* Ranking */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Calificación de Calidad
              </label>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setValue('ranking', star)}
                      onMouseEnter={() => setRankingHover(star)}
                      onMouseLeave={() => setRankingHover(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        className={clsx(
                          'w-8 h-8 transition-colors',
                          (rankingHover || ranking) >= star
                            ? 'fill-amber-500 text-amber-500'
                            : 'fill-gray-200 text-gray-200'
                        )}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-700">
                  {ranking}/5
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Calificación general de la canción para karaoke
              </p>
            </div>
          </div>

          {/* Opinion */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opinión Editorial (opcional)
            </label>
            <textarea
              {...register('opinion', {
                maxLength: {
                  value: 500,
                  message: 'La opinión no puede exceder 500 caracteres',
                },
              })}
              rows={3}
              placeholder='ej: "Perfecta para romper el hielo y hacer reír a todos" o "Ideal si sufrís un desamor"'
              className={clsx(
                'w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none',
                errors.opinion ? 'border-red-300' : 'border-gray-300'
              )}
            />
            {errors.opinion && (
              <p className="text-sm text-red-600 mt-1">{errors.opinion.message}</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Comentario que se mostrará a los invitados en las sugerencias
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <button
            type="button"
            onClick={() => navigate('/karaoke-songs')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            disabled={saving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {isEdit ? 'Guardar Cambios' : 'Crear Canción'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
