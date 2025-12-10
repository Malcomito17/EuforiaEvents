type Difficulty = 'FACIL' | 'MEDIO' | 'DIFICIL' | 'PAVAROTTI'

interface DifficultyBadgeProps {
  difficulty: Difficulty
  size?: 'sm' | 'md'
  className?: string
}

const LABELS: Record<Difficulty, string> = {
  FACIL: 'Fácil',
  MEDIO: 'Medio',
  DIFICIL: 'Difícil',
  PAVAROTTI: 'Pavarotti',
}

const COLORS: Record<Difficulty, string> = {
  FACIL: 'bg-green-100 text-green-700 border-green-200',
  MEDIO: 'bg-blue-100 text-blue-700 border-blue-200',
  DIFICIL: 'bg-orange-100 text-orange-700 border-orange-200',
  PAVAROTTI: 'bg-red-100 text-red-700 border-red-200',
}

export function DifficultyBadge({ difficulty, size = 'md', className = '' }: DifficultyBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${COLORS[difficulty]} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      } ${className}`}
    >
      {LABELS[difficulty]}
    </span>
  )
}
