import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  
  // Database
  DATABASE_URL: z.string().min(1),
  
  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Bcrypt
  BCRYPT_ROUNDS: z.string().transform(Number).default('10'),
  
  // URLs
  CLIENT_URL: z.string().url().optional(),
  OPERATOR_URL: z.string().url().optional(),
  
  // Spotify (opcional para MVP)
  SPOTIFY_CLIENT_ID: z.string().optional(),
  SPOTIFY_CLIENT_SECRET: z.string().optional(),
})

function loadEnv() {
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    console.error('❌ Error en variables de entorno:')
    result.error.issues.forEach((issue) => {
      console.error(`   - ${issue.path.join('.')}: ${issue.message}`)
    })
    process.exit(1)
  }
  
  return result.data
}

export const env = loadEnv()

export type Env = z.infer<typeof envSchema>
