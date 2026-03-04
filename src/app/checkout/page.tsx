"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, CreditCard, Truck, Check } from "lucide-react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/format";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<"info" | "payment" | "success">("info");
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    calle: "",
    colonia: "",
    ciudad: "",
    estado: "",
    cp: "",
    empresa: "",
    rfc: "",
    notas: "",
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          No hay productos en tu carrito
        </h1>
        <Link
          href="/productos"
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
        >
          Ir al catálogo
        </Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 5000 ? 0 : 350;
  const total = subtotal + shipping;

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setStep("payment");
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    clearCart();
    setStep("success");
  };

  if (step === "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          &iexcl;Pedido Realizado!
        </h1>
        <p className="text-gray-500 text-center mb-2 max-w-md">
          Tu pedido ha sido recibido exitosamente. Recibirás un correo con los detalles
          y seguimiento de tu envío.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Número de pedido: #SYSC-{Date.now().toString(36).toUpperCase()}
        </p>
        <Link
          href="/"
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
        >
          Volver al Inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <Link
          href="/carrito"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al carrito
        </Link>

        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 mb-8">
          Checkout
        </h1>

        {/* Progress steps */}
        <div className="flex items-center gap-4 mb-8">
          <div
            className={`flex items-center gap-2 ${step === "info" ? "text-blue-600" : "text-green-600"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "info" ? "bg-blue-600 text-white" : "bg-green-100 text-green-600"}`}
            >
              {step === "info" ? "1" : <Check size={16} />}
            </div>
            <span className="text-sm font-medium">Datos de envío</span>
          </div>
          <div className="h-px flex-1 bg-gray-200" />
          <div
            className={`flex items-center gap-2 ${step === "payment" ? "text-blue-600" : "text-gray-400"}`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step === "payment" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}
            >
              2
            </div>
            <span className="text-sm font-medium">Pago</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Form */}
          <div className="flex-1">
            {step === "info" && (
              <form
                onSubmit={handleSubmitInfo}
                className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 space-y-6"
              >
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Truck size={20} className="text-blue-600" />
                  Información de Envío
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Teléfono *
                    </label>
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.telefono}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Calle y número *
                  </label>
                  <input
                    type="text"
                    name="calle"
                    value={formData.calle}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Colonia *
                    </label>
                    <input
                      type="text"
                      name="colonia"
                      value={formData.colonia}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      name="cp"
                      value={formData.cp}
                      onChange={handleInputChange}
                      required
                      maxLength={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      name="ciudad"
                      value={formData.ciudad}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Estado *
                    </label>
                    <select
                      name="estado"
                      value={formData.estado}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm bg-white"
                    >
                      <option value="">Seleccionar...</option>
                      {[
                        "Aguascalientes", "Baja California", "Baja California Sur",
                        "Campeche", "Chiapas", "Chihuahua", "Ciudad de México",
                        "Coahuila", "Colima", "Durango", "Estado de México",
                        "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "Michoacán",
                        "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla",
                        "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa",
                        "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz",
                        "Yucatán", "Zacatecas",
                      ].map((estado) => (
                        <option key={estado} value={estado}>
                          {estado}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Empresa (opcional)
                    </label>
                    <input
                      type="text"
                      name="empresa"
                      value={formData.empresa}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      RFC (opcional para factura)
                    </label>
                    <input
                      type="text"
                      name="rfc"
                      value={formData.rfc}
                      onChange={handleInputChange}
                      maxLength={13}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Notas del pedido (opcional)
                  </label>
                  <textarea
                    name="notas"
                    value={formData.notas}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm resize-none"
                    placeholder="Instrucciones especiales de entrega..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
                >
                  Continuar al Pago
                </button>
              </form>
            )}

            {step === "payment" && (
              <form
                onSubmit={handleSubmitPayment}
                className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 space-y-6"
              >
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-600" />
                  Método de Pago
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-xl bg-blue-50 cursor-pointer">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="card"
                      defaultChecked
                      className="accent-blue-600"
                    />
                    <CreditCard size={20} className="text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Tarjeta de crédito o débito
                      </p>
                      <p className="text-xs text-gray-500">
                        Visa, Mastercard, AMEX
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="transfer"
                      className="accent-blue-600"
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M2 10h20" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Transferencia bancaria / SPEI
                      </p>
                      <p className="text-xs text-gray-500">
                        Se generará una referencia de pago
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-blue-300 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="deposit"
                      className="accent-blue-600"
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <path d="M3 21h18" />
                      <path d="M3 10h18" />
                      <path d="M5 6l7-3 7 3" />
                      <path d="M4 10v11" />
                      <path d="M20 10v11" />
                      <path d="M8 14v3" />
                      <path d="M12 14v3" />
                      <path d="M16 14v3" />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Depósito en OXXO
                      </p>
                      <p className="text-xs text-gray-500">
                        Paga en efectivo en cualquier OXXO
                      </p>
                    </div>
                  </label>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Esta es una demostración. En producción se
                    integrarán pasarelas de pago reales (OpenPay, Conekta, Stripe, etc.)
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep("info")}
                    className="px-6 py-4 rounded-xl border border-gray-200 text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    Atrás
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
                  >
                    Confirmar Pedido — {formatPrice(total)}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Order summary */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-40">
              <h3 className="font-bold text-gray-900 mb-4">
                Resumen ({items.length})
              </h3>

              <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                      <Image
                        src={item.product.images[0]}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-900 font-medium line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {formatPrice(item.product.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Envío</span>
                  <span>
                    {shipping === 0 ? (
                      <span className="text-green-600">Gratis</span>
                    ) : (
                      formatPrice(shipping)
                    )}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-blue-900">{formatPrice(total)}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 justify-center text-xs text-gray-400">
                <ShieldCheck size={14} />
                <span>Compra 100% segura</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
