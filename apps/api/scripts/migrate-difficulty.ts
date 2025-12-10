import { PrismaClient, Difficulty } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateDifficulty() {
  console.log('[MIGRATION] Starting difficulty migration from Int to Enum...')

  // Map old Int values to new Enum values
  const difficultyMap: Record<string, Difficulty> = {
    '1': 'FACIL',
    '2': 'FACIL',
    '3': 'MEDIO',
    '4': 'DIFICIL',
    '5': 'PAVAROTTI',
  }

  // Get all songs
  const songs = await prisma.karaokeSong.findMany()
  console.log(`[MIGRATION] Found ${songs.length} songs to migrate`)

  let updated = 0
  for (const song of songs) {
    const oldValue = String(song.difficulty)
    const newValue = difficultyMap[oldValue] || 'MEDIO'

    if (oldValue !== newValue) {
      await prisma.karaokeSong.update({
        where: { id: song.id },
        data: { difficulty: newValue }
      })
      console.log(`[MIGRATION] Updated ${song.title}: ${oldValue} → ${newValue}`)
      updated++
    }
  }

  console.log(`[MIGRATION] Complete! Updated ${updated} songs`)
  await prisma.$disconnect()
}

migrateDifficulty().catch(console.error)
