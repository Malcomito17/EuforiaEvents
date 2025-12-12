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
  Key,
  UserPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  ClipboardList,
  UtensilsCrossed,
  Settings,
  Table2,
  Utensils
} from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

interface LayoutProps {
  children: React.ReactNode
}

interface NavItem {
  name: string
  href?: string
  icon: any
  badge?: string
  children?: NavItem[]
  adminOnly?: boolean
  comingSoon?: boolean
}

interface NavigationStructure {
  items: NavItem[]
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['eventos', 'administracion']) // Grupos expandidos por defecto
  )

  const toggleGroup = (groupName: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupName)) {
      newExpanded.delete(groupName)
    } else {
      newExpanded.add(groupName)
    }
    setExpandedGroups(newExpanded)
  }

  // Estructura de navegación con grupos
  const navigationStructure: NavigationStructure = {
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
      },
      {
        name: 'Eventos',
        icon: Calendar,
        children: [
          {
            name: 'Listado',
            href: '/events',
            icon: Calendar,
          },
          {
            name: 'Timing',
            href: '/events/timing',
            icon: Clock,
            comingSoon: true,
          },
          {
            name: 'Guestlist',
            href: '/events/guestlist',
            icon: ClipboardList,
            comingSoon: true,
          },
          {
            name: 'Catering',
            href: '/events/catering',
            icon: UtensilsCrossed,
            comingSoon: true,
          },
        ],
      },
      {
        name: 'Administración',
        icon: Settings,
        children: [
          {
            name: 'Venues',
            href: '/venues',
            icon: Building2,
          },
          {
            name: 'Clientes',
            href: '/clients',
            icon: Users,
          },
          {
            name: 'Usuarios',
            href: '/users',
            icon: UserCog,
            adminOnly: true,
          },
          {
            name: 'Config',
            icon: Settings,
            children: [
              {
                name: 'Tablas',
                href: '/config/tables',
                icon: Table2,
                comingSoon: true,
              },
            ],
          },
        ],
      },
      {
        name: 'Karaoke',
        href: '/karaoke-songs',
        icon: Music2,
      },
      {
        name: 'Invitados',
        href: '/guests',
        icon: UserPlus,
      },
      {
        name: 'Menu',
        href: '/menu',
        icon: Utensils,
        comingSoon: true,
      },
    ],
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Función recursiva para renderizar items de navegación
  const renderNavItem = (item: NavItem, depth: number = 0): React.ReactNode => {
    // Filtrar items solo admin
    if (item.adminOnly && user?.role !== 'ADMIN') {
      return null
    }

    const groupKey = item.name.toLowerCase().replace(/\s+/g, '-')
    const isExpanded = expandedGroups.has(groupKey)
    const hasChildren = item.children && item.children.length > 0
    const isActive = item.href
      ? location.pathname === item.href ||
        (item.href !== '/' && location.pathname.startsWith(item.href))
      : false

    // Item con hijos (grupo colapsable)
    if (hasChildren) {
      return (
        <div key={item.name} className={clsx('mb-1', depth > 0 && 'ml-4')}>
          <button
            onClick={() => toggleGroup(groupKey)}
            className={clsx(
              'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left',
              depth === 0
                ? 'text-gray-300 hover:bg-gray-800 hover:text-white font-medium'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white text-sm'
            )}
          >
            <item.icon className={clsx(depth === 0 ? 'h-5 w-5' : 'h-4 w-4')} />
            <span className="flex-1">{item.name}</span>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {isExpanded && (
            <div className="mt-1 space-y-1">
              {item.children.map((child) => renderNavItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }

    // Item simple (link directo)
    if (item.comingSoon) {
      return (
        <div
          key={item.name}
          className={clsx(
            'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 cursor-not-allowed opacity-50',
            depth > 0 ? 'ml-4 text-sm' : '',
            'text-gray-500'
          )}
          title="Próximamente"
        >
          <item.icon className={clsx(depth === 0 ? 'h-5 w-5' : 'h-4 w-4')} />
          <span className="flex-1">{item.name}</span>
          <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">Pronto</span>
        </div>
      )
    }

    return (
      <Link
        key={item.name}
        to={item.href!}
        onClick={() => setSidebarOpen(false)}
        className={clsx(
          'flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition-colors',
          depth > 0 ? 'ml-4 text-sm' : '',
          isActive
            ? 'bg-primary-600 text-white'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        )}
      >
        <item.icon className={clsx(depth === 0 ? 'h-5 w-5' : 'h-4 w-4')} />
        <span className="flex-1">{item.name}</span>
        {item.badge && (
          <span className="text-xs bg-primary-500 text-white px-2 py-0.5 rounded">
            {item.badge}
          </span>
        )}
      </Link>
    )
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
      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transform transition-transform lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-white">
            <svg className="h-8 w-8" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#gradient)" />
              <text
                x="20"
                y="28"
                fontFamily="Arial, sans-serif"
                fontSize="24"
                fontWeight="bold"
                fill="white"
                textAnchor="middle"
              >
                E
              </text>
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

        <nav className="mt-6 px-3 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {navigationStructure.items.map((item) => renderNavItem(item))}
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
