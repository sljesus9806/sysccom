"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Clock, TrendingUp, X, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { products, categories } from "@/lib/mock-data";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/types";

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  onClose?: () => void;
  isMobile?: boolean;
}

export default function SearchAutocomplete({
  className = "",
  placeholder = "Buscar cámaras, redes, cableado, servidores...",
  onClose,
  isMobile = false,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<Product[]>([]);
  const [matchedCategories, setMatchedCategories] = useState<typeof categories>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sysccom-recent-searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {
      // Ignore
    }
  }, []);

  // Search with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setMatchedCategories([]);
      return;
    }

    const timer = setTimeout(() => {
      const q = query.toLowerCase();

      // Search products
      const productResults = products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.brand.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q)
        )
        .slice(0, 5);

      // Search categories
      const catResults = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );

      setResults(productResults);
      setMatchedCategories(catResults);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5
    );
    setRecentSearches(updated);
    try {
      localStorage.setItem("sysccom-recent-searches", JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem("sysccom-recent-searches");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      saveRecentSearch(query.trim());
      window.location.href = `/productos?q=${encodeURIComponent(query.trim())}`;
      setIsOpen(false);
      onClose?.();
    }
  };

  const handleSelectRecent = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    window.location.href = `/productos?q=${encodeURIComponent(term)}`;
    setIsOpen(false);
    onClose?.();
  };

  const handleSelectProduct = (product: Product) => {
    saveRecentSearch(product.name);
    setIsOpen(false);
    onClose?.();
  };

  const showDropdown =
    isOpen && (query.trim() || recentSearches.length > 0);

  const popularSearches = [
    "Cámaras IP",
    "Switch PoE",
    "Cable UTP Cat6",
    "Access Point WiFi 6",
    "NVR 8 canales",
  ];

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          type="search"
          placeholder={placeholder}
          value={query}
          role="combobox"
          aria-expanded={showDropdown}
          aria-label="Buscar productos"
          aria-autocomplete="list"
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className={`w-full py-2.5 px-4 pr-12 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all text-sm bg-gray-50 focus:bg-white ${
            isMobile ? "pl-4" : "pl-4"
          }`}
          autoComplete="off"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Limpiar busqueda"
          >
            <X size={14} />
          </button>
        )}
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
          aria-label="Buscar"
        >
          <Search size={16} />
        </button>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[100] max-h-[70vh] overflow-y-auto">
          {/* Product results */}
          {query.trim() && results.length > 0 && (
            <div className="p-2">
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Productos
              </p>
              {results.map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.id}`}
                  onClick={() => handleSelectProduct(product)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.brand} · {product.sku}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-blue-600 shrink-0">
                    {formatPrice(product.price)}
                  </span>
                </Link>
              ))}
              <Link
                href={`/productos?q=${encodeURIComponent(query)}`}
                onClick={() => {
                  saveRecentSearch(query);
                  setIsOpen(false);
                  onClose?.();
                }}
                className="flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors mt-1"
              >
                Ver todos los resultados
                <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Category results */}
          {query.trim() && matchedCategories.length > 0 && (
            <div className="p-2 border-t border-gray-100">
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Categorías
              </p>
              {matchedCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/productos?category=${cat.slug}`}
                  onClick={() => {
                    saveRecentSearch(cat.name);
                    setIsOpen(false);
                    onClose?.();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Search size={14} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-900 font-medium">
                      {cat.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {cat.productCount} productos
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* No results */}
          {query.trim() &&
            results.length === 0 &&
            matchedCategories.length === 0 && (
              <div className="p-6 text-center">
                <p className="text-sm text-gray-500">
                  No se encontraron resultados para &quot;{query}&quot;
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Intenta con otros términos
                </p>
              </div>
            )}

          {/* Recent searches */}
          {!query.trim() && recentSearches.length > 0 && (
            <div className="p-2">
              <div className="flex items-center justify-between px-3 py-1.5">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Búsquedas recientes
                </p>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-red-500 hover:text-red-600"
                >
                  Borrar
                </button>
              </div>
              {recentSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelectRecent(term)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <Clock size={14} className="text-gray-400 shrink-0" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular searches */}
          {!query.trim() && (
            <div className="p-2 border-t border-gray-100">
              <p className="px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Búsquedas populares
              </p>
              {popularSearches.map((term) => (
                <button
                  key={term}
                  onClick={() => handleSelectRecent(term)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors w-full text-left"
                >
                  <TrendingUp size={14} className="text-orange-500 shrink-0" />
                  <span className="text-sm text-gray-700">{term}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
