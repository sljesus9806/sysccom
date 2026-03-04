'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Image,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Shield,
  ShoppingCart,
  Settings,
  FolderTree,
  BarChart3,
  UserCog,
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Inventario', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/catalogo', label: 'Catálogo', icon: FolderTree },
  { href: '/admin/promociones', label: 'Promociones', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: Image },
  { href: '/admin/estadisticas', label: 'Estadísticas', icon: BarChart3 },
  { href: '/admin/usuarios', label: 'Administradores', icon: UserCog },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminUser, setAdminUser] = useState<{ firstName: string; lastName: string; role: string } | null>(null)

  useEffect(() => {
    // Skip auth check on login page
    if (pathname === '/admin/login') return

    const stored = localStorage.getItem('sysccom-admin')
    if (stored) {
      setAdminUser(JSON.parse(stored))
    } else {
      router.push('/admin/login')
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('sysccom-admin')
    router.push('/admin/login')
  }

  // Don't wrap login page with admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
        <div className="min-h-screen flex bg-gray-100">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-200 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
                <Link href="/admin" className="flex items-center gap-2">
                  <Shield className="w-8 h-8 text-primary-400" />
                  <div>
                    <span className="text-lg font-bold">SYSCCOM</span>
                    <span className="text-xs text-gray-400 block -mt-1">Panel de Control</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-600 text-white'
                          : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  )
                })}
              </nav>

              {/* User info */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold">
                    {adminUser.firstName[0]}{adminUser.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {adminUser.firstName} {adminUser.lastName}
                    </p>
                    <p className="text-xs text-gray-400 capitalize">
                      {adminUser.role === 'OWNER' ? 'Dueño' : adminUser.role === 'MANAGER' ? 'Gerente' : 'Admin'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-400 transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6 sticky top-0 z-30">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="flex-1">
                <h1 className="text-lg font-semibold text-gray-800">
                  {menuItems.find((item) => isActive(item.href))?.label || 'Panel de Control'}
                </h1>
              </div>
              <Link
                href="/"
                target="_blank"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Ver tienda →
              </Link>
            </header>

            {/* Page content */}
            <main className="flex-1 p-4 lg:p-6 overflow-auto">
              {children}
            </main>
          </div>
        </div>
  )
}
