/**
 * EUFORIA EVENTS - Express Application
 */

import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth'
import { eventRoutes } from './modules/events'
import { venueRoutes } from './modules/venues'
import { clientRoutes } from './modules/clients'
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
    version: '0.3.0',
    modules: ['auth', 'events', 'venues', 'clients', 'musicadj', 'karaokeya'],
  })
})

// Rutas de módulos
app.use('/api/auth', authRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/clients', clientRoutes)

// TODO: Agregar más rutas de módulos
// app.use('/api/musicadj', musicadjRoutes)
// app.use('/api/karaokeya', karaokeyaRoutes)

// Manejo de errores (debe ir al final)
app.use(errorHandler)

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
