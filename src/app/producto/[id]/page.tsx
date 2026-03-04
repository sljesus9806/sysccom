"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  ArrowLeft,
  Package,
  Check,
} from "lucide-react";
import { getProductById, products } from "@/lib/mock-data";
import { formatPrice, formatDiscount } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/ProductCard";

export default function ProductoPage() {
  const params = useParams();
  const product = getProductById(params.id as string);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h1>
        <Link
          href="/productos"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/productos"
              className="hover:text-blue-600 transition-colors"
            >
              Productos
            </Link>
            <span>/</span>
            <Link
              href={`/productos?category=${product.category}`}
              className="hover:text-blue-600 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        {/* Product detail */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image section */}
            <div className="relative aspect-square bg-gray-50 lg:border-r border-gray-100">
              <Image
                src={product.images[0]}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.discount && (
                  <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                    {formatDiscount(product.discount)}
                  </span>
                )}
                {product.isNew && (
                  <span className="bg-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                    Nuevo
                  </span>
                )}
              </div>
            </div>

            {/* Info section */}
            <div className="p-6 lg:p-10">
              <div className="mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-400 ml-3">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviewCount} opiniones)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-blue-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.discount && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Ahorras{" "}
                    {formatPrice(
                      (product.originalPrice || product.price) - product.price
                    )}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">IVA incluido</p>
              </div>

              {/* Description */}
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {product.description}
              </p>

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      En stock ({product.stock} disponibles)
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-red-500">
                    Agotado
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-2">
                  Proveedor: {product.supplier.toUpperCase()}
                </span>
              </div>

              {/* Quantity and add to cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-semibold text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : product.stock > 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} />
                      Agregado al Carrito
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Truck size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Envío a todo México
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Shield size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Garantía oficial
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Package size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Producto original
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs table */}
          <div className="border-t border-gray-100 p-6 lg:p-10">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Especificaciones Técnicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
              {Object.entries(product.specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between py-3 border-b border-gray-100"
                >
                  <span className="text-sm text-gray-500 font-medium">
                    {key}
                  </span>
                  <span className="text-sm text-gray-900 font-semibold text-right">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
