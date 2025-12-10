import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import {
  LayoutDashboard,
  Calendar,
  Building2,
  Users,
  Music2,
  UserCog,
  LogOut,
  Menu,
  X,
  Key
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

const baseNavigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Eventos', href: '/events', icon: Calendar },
  { name: 'Venues', href: '/venues', icon: Building2 },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Karaoke', href: '/karaoke-songs', icon: Music2 },
]

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Solo mostrar el menú de usuarios si el usuario es ADMIN
  const navigation = user?.role === 'ADMIN'
    ? [...baseNavigation, { name: 'Usuarios', href: '/users', icon: UserCog }]
    : baseNavigation

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        "fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
              <text x="20" y="28" fontFamily="Arial, sans-serif" fontSize="24" fontWeight="bold" fill="white" textAnchor="middle">E</text>
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
            </svg>
            EUFORIA
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || 
              (item.href !== '/' && location.pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors",
                  isActive 
                    ? "bg-primary-600 text-white" 
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
          <div className="px-3 py-2 text-gray-400">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.username}
                </p>
                <p className="text-xs truncate">
                  {user?.role}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <Link
                to="/change-password"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs"
                title="Cambiar contraseña"
              >
                <Key className="h-4 w-4" />
                <span>Contraseña</span>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-800 transition-colors text-xs"
                title="Cerrar sesión"
              >
                <LogOut className="h-4 w-4" />
                <span>Salir</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
