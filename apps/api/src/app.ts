import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json())

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/api', (req, res) => {
  res.json({ message: 'EUFORIA EVENTS API v0.1.0' })
})

export default app
