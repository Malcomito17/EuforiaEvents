import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { djApi } from '@/lib/api'
import { DJLayout } from '@/components/DJLayout'
import { Calendar, MapPin, Music, Mic2 } from 'lucide-react'

export default function DJEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEvents()
  }, [])

  const loadEvents = async () => {
    try {
      const res = await djApi.getEvents()
      setEvents(res.data)
    } catch (error) {
      console.error('Error loading events:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <DJLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </DJLayout>
    )
  }

  if (events.length === 0) {
    return (
      <DJLayout>
        <div className="flex flex-col items-center justify-center h-64 px-4">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay eventos activos</h2>
          <p className="text-gray-500 text-center">No hay eventos disponibles en este momento.</p>
        </div>
      </DJLayout>
    )
  }

  return (
    <DJLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Eventos Activos</h1>

        <div className="space-y-3">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-4">
                <h3 className="font-bold text-lg text-gray-900 mb-2">
                  {event.eventData?.eventName || event.slug}
                </h3>

                <div className="flex items-center text-sm text-gray-600 mb-3">
                  <MapPin className="h-4 w-4 mr-1" />
                  <span>{event.venue?.name || 'Sin venue'}</span>
                </div>

                {event.eventData?.startDate && (
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{new Date(event.eventData.startDate).toLocaleDateString()}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {event.musicadjConfig?.enabled && (
                    <Link
                      to={`/dj/events/${event.id}/musicadj`}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all"
                    >
                      <Music className="h-5 w-5" />
                      <span>MUSICADJ</span>
                    </Link>
                  )}

                  {event.karaokeyaConfig?.enabled && (
                    <Link
                      to={`/dj/events/${event.id}/karaokeya`}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-all"
                    >
                      <Mic2 className="h-5 w-5" />
                      <span>KARAOKEYA</span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DJLayout>
  )
}
