/**
 * App - Rutas principales de la aplicación cliente
 */

import { Routes, Route } from 'react-router-dom'
import EventLanding from './pages/EventLanding'
import MusicaDJRequest from './pages/MusicaDJRequest'
import NotFound from './pages/NotFound'
import RequestSuccess from './pages/RequestSuccess'

function App() {
  return (
    <Routes>
      {/* Evento por slug */}
      <Route path="/e/:slug" element={<EventLanding />} />
      
      {/* MUSICADJ - Pedidos musicales */}
      <Route path="/e/:slug/musicadj" element={<MusicaDJRequest />} />
      <Route path="/e/:slug/musicadj/success" element={<RequestSuccess />} />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
