import { useState } from 'react'
import { Heart } from 'lucide-react'
import clsx from 'clsx'
import * as api from '../services/api'

interface LikeButtonProps {
  songId: string
  guestId: string
  initialLiked?: boolean
  initialLikesCount?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZES = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

export function LikeButton({
  songId,
  guestId,
  initialLiked = false,
  initialLikesCount = 0,
  size = 'md',
  className,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation() // Evitar activar click del card

    // Optimistic update
    const previousLiked = liked
    const previousCount = likesCount

    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
    setIsLoading(true)

    try {
      const result = await api.toggleSongLike(songId, guestId)
      setLiked(result.liked)
      setLikesCount(result.likesCount)
    } catch (error) {
      console.error('Error toggling like:', error)
      // Revertir en caso de error
      setLiked(previousLiked)
      setLikesCount(previousCount)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isLoading}
      className={clsx(
        'inline-flex items-center gap-1 transition-all',
        'hover:scale-110 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
    >
      <Heart
        className={clsx(
          SIZES[size],
          'transition-colors',
          liked
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        )}
      />
      {likesCount > 0 && (
        <span className={clsx(
          'font-medium',
          size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base',
          liked ? 'text-red-500' : 'text-gray-600'
        )}>
          {likesCount}
        </span>
      )}
    </button>
  )
}
