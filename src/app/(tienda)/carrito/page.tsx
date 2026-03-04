"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CarritoPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
          <ShoppingBag size={40} className="text-blue-300" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Tu carrito está vacío
        </h1>
        <p className="text-gray-500 mb-8 text-center">
          Explora nuestro catálogo y agrega los productos que necesites
        </p>
        <Link
          href="/productos"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 5000 ? 0 : 350;
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 lg:py-12">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl lg:text-3xl font-black text-gray-900">
            Carrito de Compras
          </h1>
          <button
            onClick={clearCart}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Cart items */}
          <div className="flex-1 space-y-4">
            {items.map((item) => (
              <div
                key={item.product.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 lg:p-6 flex gap-4"
              >
                <div className="relative w-24 h-24 lg:w-32 lg:h-32 bg-gray-50 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={item.product.images[0]}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                    sizes="128px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between gap-2">
                    <div>
                      <p className="text-xs font-medium text-blue-600 uppercase tracking-wider">
                        {item.product.brand}
                      </p>
                      <Link
                        href={`/producto/${item.product.id}`}
                        className="text-sm lg:text-base font-semibold text-gray-900 hover:text-blue-700 transition-colors line-clamp-2"
                      >
                        {item.product.name}
                      </Link>
                      <p className="text-xs text-gray-400 mt-1">
                        SKU: {item.product.sku}
                      </p>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-1.5 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500 transition-colors shrink-0 h-fit"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity - 1)
                        }
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold min-w-[40px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                        className="p-2 hover:bg-gray-50 transition-colors"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">
                        {formatPrice(item.product.price)} c/u
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/productos"
              className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              Seguir comprando
            </Link>
          </div>

          {/* Order summary */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-40">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">
                    Subtotal ({items.length}{" "}
                    {items.length === 1 ? "producto" : "productos"})
                  </span>
                  <span className="font-medium">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                {shipping > 0 && (
                  <p className="text-xs text-blue-600">
                    Envío gratis en compras mayores a $5,000 MXN
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-blue-900">
                    {formatPrice(total)}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">IVA incluido</p>
              </div>

              <Link
                href="/checkout"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
              >
                Proceder al Pago
                <ArrowRight size={18} />
              </Link>

              <div className="flex items-center gap-2 mt-4 justify-center text-xs text-gray-400">
                <ShieldCheck size={14} />
                <span>Compra segura y protegida</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
