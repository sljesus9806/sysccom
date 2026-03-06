'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  Users,
  Tag,
  Image as ImageIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
  ShoppingCart,
  FolderTree,
  BarChart3,
  UserCog,
  Store,
} from 'lucide-react'

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/productos', label: 'Inventario', icon: Package },
  { href: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
  { href: '/admin/clientes', label: 'Clientes', icon: Users },
  { href: '/admin/catalogo', label: 'Catalogo', icon: FolderTree },
  { href: '/admin/promociones', label: 'Promociones', icon: Tag },
  { href: '/admin/banners', label: 'Banners', icon: ImageIcon },
  { href: '/admin/syscom', label: 'SYSCOM API', icon: Store },
  { href: '/admin/estadisticas', label: 'Estadisticas', icon: BarChart3 },
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
    if (pathname === '/admin/login') return

    const stored = localStorage.getItem('sysccom-admin')
    if (stored) {
      try {
        setAdminUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('sysccom-admin')
        router.push('/admin/login')
      }
    } else {
      router.push('/admin/login')
    }
  }, [pathname, router])

  const handleLogout = () => {
    localStorage.removeItem('sysccom-admin')
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (!adminUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-slate-200 border-t-primary-600" />
      </div>
    )
  }

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  return (
        <div className="min-h-screen flex bg-slate-50">
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar */}
          <aside
            className={`fixed lg:static inset-y-0 left-0 z-50 w-60 bg-slate-900 text-white transform transition-transform duration-200 ease-in-out ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center justify-between h-14 px-4 border-b border-slate-800">
                <Link href="/admin" className="flex items-center gap-2">
                  <Image src="/logo.svg" alt="SYSCCOM" width={28} height={28} />
                  <div>
                    <span className="text-sm font-bold">SYSCCOM</span>
                    <span className="text-[10px] text-slate-500 block -mt-0.5">Panel Admin</span>
                  </div>
                </Link>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const active = isActive(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary-600 text-white'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className="w-[18px] h-[18px]" />
                      {item.label}
                      {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                    </Link>
                  )
                })}
              </nav>

              {/* User info */}
              <div className="border-t border-slate-800 p-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-xs font-bold">
                    {adminUser.firstName[0]}{adminUser.lastName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {adminUser.firstName} {adminUser.lastName}
                    </p>
                    <p className="text-[10px] text-slate-500 capitalize">
                      {adminUser.role === 'OWNER' ? 'Dueno' : adminUser.role === 'MANAGER' ? 'Gerente' : 'Admin'}
                    </p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-slate-500 hover:text-red-400 transition-colors"
                    title="Cerrar sesion"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Top bar */}
            <header className="bg-white border-b border-slate-200 h-14 flex items-center px-4 lg:px-6 sticky top-0 z-30">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden text-slate-500 hover:text-slate-800 mr-4"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="flex-1">
                <h1 className="text-base font-semibold text-slate-700">
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
