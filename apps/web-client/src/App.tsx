/**
 * App - Rutas principales de la aplicación cliente
 */

import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider'
import EventLanding from './pages/EventLanding'
import EventDetails from './pages/EventDetails'
import MusicaDJRequest from './pages/MusicaDJRequest'
import MyRequests from './pages/MyRequests'
import KaraokeyaRequest from './pages/KaraokeyaRequest'
import KaraokeQueue from './pages/KaraokeQueue'
import DisplayScreen from './pages/DisplayScreen'
import NotFound from './pages/NotFound'
import RequestSuccess from './pages/RequestSuccess'

function App() {
  return (
    <ThemeProvider>
      <Routes>
      {/* Evento por slug */}
      <Route path="/e/:slug" element={<EventLanding />} />
      <Route path="/e/:slug/detalles" element={<EventDetails />} />

      {/* MUSICADJ - Pedidos musicales */}
      <Route path="/e/:slug/musicadj" element={<MusicaDJRequest />} />
      <Route path="/e/:slug/musicadj/success" element={<RequestSuccess />} />
      <Route path="/e/:slug/musicadj/mis-pedidos" element={<MyRequests />} />

      {/* KARAOKEYA - Karaoke */}
      <Route path="/e/:slug/karaokeya" element={<KaraokeyaRequest />} />
      <Route path="/e/:slug/karaokeya/mi-cola" element={<KaraokeQueue />} />

      {/* Display Screen (público - para pantalla grande) */}
      <Route path="/display/:slug" element={<DisplayScreen />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    </ThemeProvider>
  )
}

export default App
