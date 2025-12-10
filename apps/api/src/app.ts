/**
 * EUFORIA EVENTS - Express Application
 */

import express from 'express'
import cors from 'cors'
import { authRoutes } from './modules/auth'
import { eventRoutes } from './modules/events'
import { venueRoutes } from './modules/venues'
import { clientRoutes } from './modules/clients'
import { musicadjRoutes } from './modules/musicadj'
import { karaokeyaRoutes, karaokeyaGlobalRoutes } from './modules/karaokeya'
import { guestRoutes } from './modules/guests'
import { usersRoutes } from './modules/users'
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
    version: '0.5.0',
    modules: ['auth', 'users', 'events', 'venues', 'clients', 'musicadj', 'karaokeya'],
  })
})

// Rutas de módulos
app.use('/api/auth', authRoutes)
app.use('/api/guests', guestRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/clients', clientRoutes)

// MUSICADJ - rutas anidadas bajo eventos
app.use('/api/events/:eventId/musicadj', musicadjRoutes)

// KARAOKEYA - rutas anidadas bajo eventos
app.use('/api/events/:eventId/karaokeya', karaokeyaRoutes)

// KARAOKEYA - rutas globales (catálogo)
app.use('/api/karaokeya', karaokeyaGlobalRoutes)

// Manejo de errores (debe ir al final)
app.use(errorHandler)

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
