"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  ArrowLeft,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/format";

interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: {
    id: string;
    name: string;
    slug: string;
    image: string | null;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  createdAt: string;
  payment: {
    method: string;
    status: string;
    paidAt: string | null;
  } | null;
  items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pendiente", color: "bg-yellow-100 text-yellow-700", icon: <Clock size={14} /> },
  CONFIRMED: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: <CheckCircle2 size={14} /> },
  PROCESSING: { label: "En preparación", color: "bg-indigo-100 text-indigo-700", icon: <Package size={14} /> },
  SHIPPED: { label: "Enviado", color: "bg-purple-100 text-purple-700", icon: <Truck size={14} /> },
  DELIVERED: { label: "Entregado", color: "bg-green-100 text-green-700", icon: <CheckCircle2 size={14} /> },
  CANCELLED: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: <XCircle size={14} /> },
};

export default function PedidosPage() {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !user) {
      router.push("/cuenta");
      return;
    }

    if (mounted && token) {
      fetchOrders();
    }
  }, [mounted, user, token]);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/auth/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setOrders(data.orders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          href="/cuenta"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver a Mi Cuenta
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mis Pedidos</h1>
        <p className="text-gray-500 text-sm mb-8">
          Historial de todas tus compras
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
              </div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={32} className="text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aún no tienes pedidos
            </h3>
            <p className="text-gray-500 mb-6 text-sm">
              Explora nuestro catálogo y realiza tu primera compra
            </p>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <ShoppingBag size={16} />
              Explorar Productos
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const status = statusConfig[order.status] || statusConfig.PENDING;
              const isExpanded = expandedOrder === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-gray-100 overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setExpandedOrder(isExpanded ? null : order.id)
                    }
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Package size={20} className="text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-semibold text-gray-900 text-sm">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-MX",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${status.color}`}
                      >
                        {status.icon}
                        {status.label}
                      </span>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatPrice(order.total)}
                      </span>
                      {isExpanded ? (
                        <ChevronUp size={16} className="text-gray-400" />
                      ) : (
                        <ChevronDown size={16} className="text-gray-400" />
                      )}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-gray-100 p-5">
                      <div className="space-y-3">
                        {order.items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center shrink-0">
                              {item.product.image ? (
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  className="w-full h-full object-cover rounded-lg"
                                />
                              ) : (
                                <Package
                                  size={16}
                                  className="text-gray-400"
                                />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {item.product.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cantidad: {item.quantity} ×{" "}
                                {formatPrice(item.unitPrice)}
                              </p>
                            </div>
                            <p className="font-semibold text-gray-900 text-sm">
                              {formatPrice(item.unitPrice * item.quantity)}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex justify-between text-sm text-gray-500 mb-1">
                          <span>Subtotal</span>
                          <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mb-2">
                          <span>Envío</span>
                          <span>
                            {order.shippingCost === 0
                              ? "Gratis"
                              : formatPrice(order.shippingCost)}
                          </span>
                        </div>
                        <div className="flex justify-between font-bold text-gray-900">
                          <span>Total</span>
                          <span>{formatPrice(order.total)}</span>
                        </div>
                        {order.payment && (
                          <div className="mt-3 text-xs text-gray-500">
                            Método de pago:{" "}
                            {order.payment.method === "CARD"
                              ? "Tarjeta"
                              : order.payment.method === "SPEI"
                                ? "SPEI"
                                : "OXXO"}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
