import app from './app'

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
  console.log(`🚀 EUFORIA API corriendo en http://localhost:${PORT}`)
})
