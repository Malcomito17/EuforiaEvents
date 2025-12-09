/**
 * EUFORIA EVENTS - Server Entry Point
 * Inicializa Express + Socket.io
 */

// Cargar variables de entorno ANTES de todo
import { config } from 'dotenv'
import { resolve } from 'path'

// Cargar .env desde el working directory (apps/api)
config({ path: resolve(process.cwd(), '.env') })

import { createServer } from 'http'
import app from './app'
import { initializeSocket } from './socket'

const PORT = process.env.PORT || 3000

// Crear servidor HTTP (necesario para Socket.io)
const httpServer = createServer(app)

// Inicializar Socket.io
const io = initializeSocket(httpServer)

// Exponer io en app para uso en controllers/services
app.set('io', io)

// Iniciar servidor
httpServer.listen(PORT, () => {
  console.log(`🚀 EUFORIA API corriendo en http://localhost:${PORT}`)
  console.log(`🔌 Socket.io habilitado`)
})

// Manejo de errores del servidor
httpServer.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} en uso. Ejecuta: lsof -ti:${PORT} | xargs kill -9`)
  } else {
    console.error('❌ Error del servidor:', error)
  }
  process.exit(1)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Señal SIGTERM recibida. Cerrando servidor...')
  httpServer.close(() => {
    console.log('✅ Servidor cerrado')
    process.exit(0)
  })
})
