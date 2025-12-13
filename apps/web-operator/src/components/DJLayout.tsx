import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import { LogOut, Music, Mic2 } from 'lucide-react'

interface DJLayoutProps {
  children: React.ReactNode
}

export function DJLayout({ children }: DJLayoutProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar con gradient */}
      <header className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                <Music className="h-6 w-6" />
              </div>
              <div>
                <h1 className="font-bold text-lg">EUFORIA DJ</h1>
                <p className="text-xs text-white/80">{user?.username}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Navigation tabs */}
        <nav className="flex border-t border-white/10">
          <Link
            to="/dj/musicadj"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium hover:bg-white/10 transition-colors border-b-2 border-transparent hover:border-white"
          >
            <Music className="h-4 w-4" />
            <span>MUSICADJ</span>
          </Link>
          <Link
            to="/dj/karaokeya"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium hover:bg-white/10 transition-colors border-b-2 border-transparent hover:border-white"
          >
            <Mic2 className="h-4 w-4" />
            <span>KARAOKEYA</span>
          </Link>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
