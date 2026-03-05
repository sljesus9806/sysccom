"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  Mail,
  ChevronDown,
  User,
  LogOut,
  Package,
  Search,
  MapPin,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { categories } from "@/lib/mock-data";
import SearchAutocomplete from "@/components/SearchAutocomplete";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const getTotalItems = useCartStore((s) => s.getTotalItems);
  const { user, token, logout } = useAuthStore();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore
    }
    logout();
    setIsUserMenuOpen(false);
  };

  const cartCount = mounted ? getTotalItems() : 0;
  const isLoggedIn = mounted && user && token;

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      {/* Top bar */}
      <div className="bg-slate-800 text-slate-300 text-xs py-2 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <a
              href="tel:+526141234567"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Phone size={12} />
              <span>(614) 123-4567</span>
            </a>
            <a
              href="mailto:ventas@sysccom.mx"
              className="flex items-center gap-1.5 hover:text-white transition-colors"
            >
              <Mail size={12} />
              <span>ventas@sysccom.mx</span>
            </a>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <MapPin size={12} />
              Envios a toda la Republica Mexicana
            </span>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav
        className={`bg-white/95 backdrop-blur-md transition-all duration-300 ${
          isScrolled ? "shadow-md" : "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <Image
                src="/logo.svg"
                alt="SYSCCOM"
                width={42}
                height={42}
                className="lg:w-11 lg:h-11"
                priority
              />
              <div className="hidden sm:block">
                <h1 className="text-lg lg:text-xl font-extrabold text-slate-800 tracking-tight leading-none">
                  SYSCCOM
                </h1>
                <p className="text-[9px] lg:text-[10px] text-blue-600 font-semibold tracking-[0.2em] leading-none mt-0.5">
                  INTEGRADORES
                </p>
              </div>
            </Link>

            {/* Search bar - desktop with autocomplete */}
            <SearchAutocomplete className="hidden md:block flex-1 max-w-xl mx-8" />

            {/* Actions */}
            <div className="flex items-center gap-1.5 lg:gap-2">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="md:hidden p-2.5 hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Search size={20} className="text-slate-600" />
              </button>

              <Link
                href="/carrito"
                className="relative p-2.5 hover:bg-slate-50 rounded-lg transition-colors group"
              >
                <ShoppingCart
                  size={20}
                  className="text-slate-600 group-hover:text-blue-600 transition-colors"
                />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-blue-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              {isLoggedIn ? (
                <div
                  className="relative"
                  onMouseEnter={() => setIsUserMenuOpen(true)}
                  onMouseLeave={() => setIsUserMenuOpen(false)}
                >
                  <button className="hidden lg:flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
                    <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-blue-700">
                        {user.firstName.charAt(0)}
                        {user.lastName.charAt(0)}
                      </span>
                    </div>
                    <span className="max-w-[100px] truncate text-slate-700">
                      {user.firstName}
                    </span>
                    <ChevronDown size={14} className="text-slate-400" />
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute top-full right-0 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 mt-1">
                      <div className="px-4 py-2.5 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/cuenta"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <User size={15} />
                        Mi Cuenta
                      </Link>
                      <Link
                        href="/cuenta/pedidos"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <Package size={15} />
                        Mis Pedidos
                      </Link>
                      <Link
                        href="/cuenta/direcciones"
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                      >
                        <MapPin size={15} />
                        Mis Direcciones
                      </Link>
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors w-full"
                        >
                          <LogOut size={15} />
                          Cerrar Sesion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/cuenta"
                  className="hidden lg:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg transition-colors"
                >
                  <User size={18} />
                  <span>Mi Cuenta</span>
                </Link>
              )}

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2.5 hover:bg-slate-50 rounded-lg transition-colors"
              >
                {isMenuOpen ? (
                  <X size={20} className="text-slate-600" />
                ) : (
                  <Menu size={20} className="text-slate-600" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category navigation - desktop */}
        <div className="hidden lg:block border-t border-slate-100 bg-slate-800">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-0.5 h-10">
              <div
                className="relative"
                onMouseEnter={() => setIsCategoryOpen(true)}
                onMouseLeave={() => setIsCategoryOpen(false)}
              >
                <button className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Menu size={15} />
                  <span>Categorias</span>
                  <ChevronDown size={13} />
                </button>
                {isCategoryOpen && (
                  <div className="absolute top-full left-0 w-60 bg-white rounded-b-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/productos?category=${cat.slug}`}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition-colors text-sm text-slate-600 hover:text-blue-600"
                      >
                        <span className="font-medium">{cat.name}</span>
                        <span className="ml-auto text-xs text-slate-300">
                          {cat.productCount}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <Link
                href="/productos"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Todos los Productos
              </Link>
              <Link
                href="/productos?filter=ofertas"
                className="px-3 py-2 text-sm font-medium text-amber-400 hover:text-amber-300 hover:bg-white/10 rounded-lg transition-colors"
              >
                Ofertas
              </Link>
              <Link
                href="/productos?filter=nuevos"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Nuevos
              </Link>
              <Link
                href="/nosotros"
                className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
              >
                Nosotros
              </Link>
              <div className="ml-auto">
                <Link
                  href="/nosotros#contacto"
                  className="px-3 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  Contacto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile search with autocomplete */}
      {isSearchOpen && (
        <div className="md:hidden bg-white border-b shadow-lg p-4">
          <SearchAutocomplete
            isMobile
            placeholder="Buscar productos..."
            onClose={() => setIsSearchOpen(false)}
          />
        </div>
      )}

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-b shadow-lg">
          <div className="px-4 py-3 space-y-1">
            {/* User section for mobile */}
            {isLoggedIn ? (
              <div className="border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-3 px-3 py-2">
                  <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                </div>
                <Link
                  href="/cuenta"
                  className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mi Cuenta
                </Link>
                <Link
                  href="/cuenta/pedidos"
                  className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mis Pedidos
                </Link>
                <Link
                  href="/cuenta/direcciones"
                  className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Mis Direcciones
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2.5 rounded-lg hover:bg-red-50 text-sm text-red-500"
                >
                  Cerrar Sesion
                </button>
              </div>
            ) : (
              <Link
                href="/cuenta"
                className="block px-3 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-blue-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Iniciar Sesion / Registrarse
              </Link>
            )}

            <Link
              href="/productos"
              className="block px-3 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
              onClick={() => setIsMenuOpen(false)}
            >
              Todos los Productos
            </Link>
            <div className="border-t border-slate-100 pt-2 mt-2">
              <p className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Categorias
              </p>
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?category=${cat.slug}`}
                  className="block px-3 py-2.5 rounded-lg hover:bg-slate-50 text-sm text-slate-600"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
            <div className="border-t border-slate-100 pt-2 mt-2">
              <Link
                href="/productos?filter=ofertas"
                className="block px-3 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-amber-600"
                onClick={() => setIsMenuOpen(false)}
              >
                Ofertas
              </Link>
              <Link
                href="/nosotros"
                className="block px-3 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/nosotros#contacto"
                className="block px-3 py-3 rounded-lg hover:bg-slate-50 text-sm font-medium text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                Contacto
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
