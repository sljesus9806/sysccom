"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Eye } from "lucide-react";
import type { Product } from "@/types";
import { formatPrice, formatDiscount } from "@/lib/format";
import { useCartStore } from "@/store/cart";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        <Link href={`/producto/${product.id}`}>
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.discount && (
            <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              {formatDiscount(product.discount)}
            </span>
          )}
          {product.isNew && (
            <span className="bg-green-500 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
              Nuevo
            </span>
          )}
        </div>

        {/* Quick actions */}
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/producto/${product.id}`}
            className="w-9 h-9 bg-white/90 backdrop-blur-sm hover:bg-blue-600 hover:text-white rounded-lg flex items-center justify-center text-gray-600 shadow-md transition-all"
            aria-label={`Ver detalles de ${product.name}`}
          >
            <Eye size={16} />
          </Link>
        </div>

        {/* Supplier badge */}
        <div className="absolute bottom-3 right-3">
          <span className="bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-gray-500 px-2 py-1 rounded-md uppercase">
            {product.supplier}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-[11px] font-medium text-blue-600 uppercase tracking-wider mb-1">
            {product.brand}
          </p>
          <Link href={`/producto/${product.id}`}>
            <h3 className="text-sm font-semibold text-gray-900 leading-snug hover:text-blue-700 transition-colors line-clamp-2 mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mb-3" aria-label={`Calificacion: ${product.rating} de 5 estrellas`} role="img">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={
                    i < Math.floor(product.rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          </div>
        </div>

        {/* Price and action */}
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-50">
          <div>
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                {formatPrice(product.originalPrice)}
              </p>
            )}
            <p className="text-lg font-bold text-blue-900">
              {formatPrice(product.price)}
            </p>
          </div>
          <button
            onClick={() => addItem(product)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2.5 rounded-xl transition-colors active:scale-95"
            aria-label={`Agregar ${product.name} al carrito`}
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Agregar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
