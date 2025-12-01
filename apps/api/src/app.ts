import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth'
import { errorHandler } from './shared/middleware/error.middleware'

const app = express()

// Middlewares globales
app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API info
app.get('/api', (req, res) => {
  res.json({ 
    name: 'EUFORIA EVENTS API',
    version: '0.1.0',
    modules: ['auth', 'events', 'musicadj', 'karaokeya']
  })
})

// Rutas
app.use('/api/auth', authRoutes)

// TODO: Agregar más rutas de módulos
// app.use('/api/events', eventRoutes)
// app.use('/api/musicadj', musicadjRoutes)
// app.use('/api/karaokeya', karaokeyaRoutes)

// Manejo de errores (debe ir al final)
app.use(errorHandler)

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
