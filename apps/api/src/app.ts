/**
 * EUFORIA EVENTS - Express Application
 */

import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { authRoutes } from './modules/auth'
import { eventRoutes } from './modules/events'
import { venueRoutes } from './modules/venues'
import { clientRoutes } from './modules/clients'
import { musicadjRoutes } from './modules/musicadj'
import { karaokeyaRoutes, karaokeyaGlobalRoutes } from './modules/karaokeya'
import { participantRoutes, eventParticipantRoutes } from './modules/participants'
import { personRoutes } from './modules/persons'
import { eventGuestRoutes } from './modules/event-guests'
import { dishRoutes } from './modules/dishes'
import { usersRoutes } from './modules/users'
import { djRoutes } from './modules/dj'
import { uploadRoutes } from './modules/upload'
import { errorHandler } from './shared/middleware/error.middleware'

const app = express()

// Resolver __dirname en módulos ES
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Middlewares globales
app.use(cors())
app.use(express.json())

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')))

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API info
app.get('/api', (req, res) => {
  res.json({
    name: 'EUFORIA EVENTS API',
    version: '0.6.0',
    modules: ['auth', 'users', 'events', 'venues', 'clients', 'musicadj', 'karaokeya', 'dj'],
  })
})

// Rutas de módulos
app.use('/api/auth', authRoutes)
app.use('/api/participants', participantRoutes)
app.use('/api/persons', personRoutes)
app.use('/api/dishes', dishRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/dj', djRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/clients', clientRoutes)

// Upload routes (imágenes)
app.use('/api', uploadRoutes)

// MUSICADJ - rutas anidadas bajo eventos
app.use('/api/events/:eventId/musicadj', musicadjRoutes)

// KARAOKEYA - rutas anidadas bajo eventos
app.use('/api/events/:eventId/karaokeya', karaokeyaRoutes)

// PARTICIPANTS - rutas anidadas bajo eventos
app.use('/api/events/:eventId/participants', eventParticipantRoutes)

// EVENT GUESTS - rutas anidadas bajo eventos
app.use('/api/events/:eventId/guests', eventGuestRoutes)

// KARAOKEYA - rutas globales (catálogo)
app.use('/api/karaokeya', karaokeyaGlobalRoutes)

// Manejo de errores (debe ir al final)
app.use(errorHandler)

// 404 para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' })
})

export default app
