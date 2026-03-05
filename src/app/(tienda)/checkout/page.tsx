"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ShieldCheck,
  CreditCard,
  Truck,
  Check,
  Tag,
  X,
  Loader2,
  Copy,
  Building2,
  Banknote,
  MapPin,
  Clock,
  User,
  LogIn,
} from "lucide-react";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/auth";
import { formatPrice } from "@/lib/format";

interface ShippingQuote {
  carrier: string;
  carrierName: string;
  service: string;
  deliveryDays: { min: number; max: number };
  price: number;
  trackingAvailable: boolean;
}

interface CouponData {
  code: string;
  type: string;
  discount: number;
  description: string;
  freeShipping: boolean;
}

interface SavedAddress {
  id: string;
  label: string;
  street: string;
  colony: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

type PaymentMethod = "CARD" | "SPEI" | "OXXO";
type CheckoutStep = "info" | "shipping" | "payment" | "success";

export default function CheckoutPage() {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<CheckoutStep>("info");
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    nombre: "", apellido: "", email: "", telefono: "",
    calle: "", colonia: "", ciudad: "", estado: "", cp: "",
    empresa: "", rfc: "", notas: "",
  });

  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingQuote | null>(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [orderResult, setOrderResult] = useState<{
    orderNumber: string;
    total: number;
    paymentMethod: PaymentMethod;
    paymentInfo: Record<string, string>;
  } | null>(null);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedAddresses(data.addresses);
        const defaultAddr = data.addresses.find((a: SavedAddress) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr.id);
          setFormData((prev) => ({
            ...prev,
            calle: defaultAddr.street,
            colonia: defaultAddr.colony,
            ciudad: defaultAddr.city,
            estado: defaultAddr.state,
            cp: defaultAddr.postalCode,
          }));
        }
      }
    } catch { /* ignore */ }
  }, [token]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setFormData((prev) => ({
        ...prev,
        nombre: user.firstName || prev.nombre,
        apellido: user.lastName || prev.apellido,
        email: user.email || prev.email,
        telefono: user.phone || prev.telefono,
        empresa: user.company || prev.empresa,
        rfc: user.rfc || prev.rfc,
      }));
    }
  }, [user]);

  useEffect(() => {
    if (mounted && token) fetchAddresses();
  }, [mounted, token, fetchAddresses]);

  if (!mounted) return null;

  // Auth guard: must be logged in to checkout
  if (!user || !token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <LogIn size={28} className="text-blue-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Inicia sesion para comprar</h1>
          <p className="text-slate-400 text-sm mb-6">
            Necesitas una cuenta para realizar compras, dar seguimiento a tus pedidos y guardar tus direcciones de envio.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/cuenta"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <User size={18} />
              Iniciar Sesion / Registrarse
            </Link>
            <Link
              href="/carrito"
              className="text-sm text-slate-400 hover:text-blue-600 transition-colors"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <h1 className="text-xl font-bold text-slate-800 mb-4">No hay productos en tu carrito</h1>
        <Link href="/productos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700">Ir al catalogo</Link>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const couponDiscount = appliedCoupon?.discount || 0;
  const shippingCost = appliedCoupon?.freeShipping ? 0 : (selectedShipping?.price ?? (subtotal > 5000 ? 0 : 350));
  const total = subtotal - couponDiscount + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectAddress = (addr: SavedAddress) => {
    setSelectedAddressId(addr.id);
    setFormData((prev) => ({
      ...prev,
      calle: addr.street,
      colonia: addr.colony,
      ciudad: addr.city,
      estado: addr.state,
      cp: addr.postalCode,
    }));
  };

  const fetchShippingQuotes = async (state: string) => {
    setLoadingShipping(true);
    try {
      const res = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state, postalCode: formData.cp, weight: items.reduce((s, i) => s + i.quantity * 0.5, 0), subtotal }),
      });
      const data = await res.json();
      if (res.ok) {
        setShippingQuotes(data.quotes);
        if (data.quotes.length > 0) setSelectedShipping(data.quotes[0]);
      }
    } catch { /* use default */ } finally { setLoadingShipping(false); }
  };

  const handleSubmitInfo = (e: React.FormEvent) => { e.preventDefault(); fetchShippingQuotes(formData.estado); setStep("shipping"); };
  const handleSubmitShipping = () => { setStep("payment"); };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponError(""); setCouponLoading(true);
    try {
      const res = await fetch("/api/coupons/validate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code: couponCode.trim(), subtotal }) });
      const data = await res.json();
      if (res.ok) { setAppliedCoupon(data); setCouponCode(""); } else { setCouponError(data.error); }
    } catch { setCouponError("Error al validar cupon"); } finally { setCouponLoading(false); }
  };

  const handleRemoveCoupon = () => { setAppliedCoupon(null); setCouponError(""); };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const orderBody = {
        paymentMethod, shippingAddress: { street: formData.calle, colony: formData.colonia, city: formData.ciudad, state: formData.estado, postalCode: formData.cp },
        shippingCost: selectedShipping?.price || shippingCost, couponCode: appliedCoupon?.code || null, notes: formData.notas || null,
      };
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(orderBody),
      });
      if (res.ok) {
        const data = await res.json();
        setOrderResult({
          orderNumber: data.order.orderNumber,
          total: data.order.total,
          paymentMethod,
          paymentInfo: data.order.paymentInfo,
        });
      }
      clearCart(); setStep("success");
    } catch { /* fallback */ } finally { setIsProcessing(false); }
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); };

  // ====== SUCCESS ======
  if (step === "success" && orderResult) {
    return (
      <div className="min-h-[60vh] bg-slate-50 py-12">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5"><Check size={32} className="text-green-600" /></div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Pedido Realizado</h1>
            <p className="text-slate-400 text-sm mb-1">Tu pedido ha sido recibido exitosamente.</p>
            <p className="text-lg font-bold text-blue-600 mb-6">{orderResult.orderNumber}</p>

            {orderResult.paymentMethod === "SPEI" && orderResult.paymentInfo.clabe && (
              <div className="bg-blue-50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-bold text-blue-900 mb-4 flex items-center gap-2"><Building2 size={18} />Datos para Transferencia SPEI</h3>
                <div className="space-y-3">
                  {[{ label: "CLABE", value: orderResult.paymentInfo.clabe }, { label: "Banco", value: orderResult.paymentInfo.banco }, { label: "Beneficiario", value: orderResult.paymentInfo.beneficiario }, { label: "Referencia", value: orderResult.paymentInfo.referencia }, { label: "Concepto", value: orderResult.paymentInfo.concepto }, { label: "Monto", value: formatPrice(orderResult.total) }].map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between bg-white rounded-lg px-4 py-3">
                      <div><p className="text-xs text-slate-400">{label}</p><p className="text-sm font-semibold text-slate-800">{value}</p></div>
                      <button onClick={() => copyToClipboard(value)} className="p-1.5 hover:bg-slate-100 rounded-lg" title="Copiar"><Copy size={14} className="text-slate-400" /></button>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-blue-700 mt-4">Tu pedido sera confirmado al verificar el pago (1-2 horas habiles).</p>
              </div>
            )}

            {orderResult.paymentMethod === "OXXO" && orderResult.paymentInfo.referencia && (
              <div className="bg-amber-50 rounded-xl p-6 text-left mb-6">
                <h3 className="font-bold text-amber-900 mb-4 flex items-center gap-2"><Banknote size={18} />Ficha de Pago OXXO</h3>
                <div className="bg-white rounded-lg p-6 text-center mb-4">
                  <p className="text-xs text-slate-400 mb-2">Numero de referencia</p>
                  <p className="text-2xl font-mono font-bold text-slate-800 tracking-wider">{orderResult.paymentInfo.referencia}</p>
                  <button onClick={() => copyToClipboard(orderResult.paymentInfo.referencia)} className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mx-auto"><Copy size={12} /> Copiar</button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg px-4 py-3"><p className="text-xs text-slate-400">Monto</p><p className="text-sm font-bold text-slate-800">{formatPrice(orderResult.total)}</p></div>
                  <div className="bg-white rounded-lg px-4 py-3"><p className="text-xs text-slate-400">Vigencia</p><p className="text-sm font-bold text-slate-800">{orderResult.paymentInfo.vigencia}</p></div>
                </div>
                <p className="text-xs text-amber-700 mt-4">Presenta este numero en cualquier tienda OXXO.</p>
              </div>
            )}

            {orderResult.paymentMethod === "CARD" && (
              <div className="bg-green-50 rounded-xl p-6 text-left mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center"><Check size={20} className="text-green-600" /></div>
                  <div><p className="font-semibold text-green-900">Pago procesado exitosamente</p><p className="text-sm text-green-700">Total cobrado: {formatPrice(orderResult.total)}</p></div>
                </div>
              </div>
            )}

            <p className="text-sm text-slate-400 mb-6">Recibiras un correo con los detalles y seguimiento de tu envio.</p>
            <div className="flex gap-3 justify-center">
              <Link href="/cuenta/pedidos" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm">Ver Mis Pedidos</Link>
              <Link href="/" className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm">Volver al Inicio</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ====== CHECKOUT STEPS ======
  const stepsArr = [{ key: "info", label: "Datos", num: 1 }, { key: "shipping", label: "Envio", num: 2 }, { key: "payment", label: "Pago", num: 3 }];
  const currentStepIndex = stepsArr.findIndex((s) => s.key === step);
  const estados = ["Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua","Ciudad de Mexico","Coahuila","Colima","Durango","Estado de Mexico","Guanajuato","Guerrero","Hidalgo","Jalisco","Michoacan","Morelos","Nayarit","Nuevo Leon","Oaxaca","Puebla","Queretaro","Quintana Roo","San Luis Potosi","Sinaloa","Sonora","Tabasco","Tamaulipas","Tlaxcala","Veracruz","Yucatan","Zacatecas"];

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
        <Link href="/carrito" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-blue-600 mb-6 transition-colors"><ArrowLeft size={16} />Volver al carrito</Link>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-800 mb-8">Checkout</h1>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {stepsArr.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div className={`flex items-center gap-2 ${i < currentStepIndex ? "text-green-600" : i === currentStepIndex ? "text-blue-600" : "text-slate-300"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < currentStepIndex ? "bg-green-50 text-green-600" : i === currentStepIndex ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                  {i < currentStepIndex ? <Check size={16} /> : s.num}
                </div>
                <span className="text-sm font-medium hidden sm:inline">{s.label}</span>
              </div>
              {i < stepsArr.length - 1 && <div className="h-px flex-1 bg-slate-200" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          <div className="flex-1">
            {/* STEP 1 */}
            {step === "info" && (
              <form onSubmit={handleSubmitInfo} className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><MapPin size={18} className="text-blue-600" />Informacion de Envio</h2>

                {/* Saved addresses */}
                {savedAddresses.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-2">Direcciones guardadas</p>
                    <div className="space-y-2">
                      {savedAddresses.map((addr) => (
                        <label
                          key={addr.id}
                          className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                            selectedAddressId === addr.id
                              ? "border-blue-500 bg-blue-50/50"
                              : "border-slate-200 hover:border-blue-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name="savedAddr"
                            checked={selectedAddressId === addr.id}
                            onChange={() => handleSelectAddress(addr)}
                            className="accent-blue-600"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-semibold text-slate-700">{addr.label}</span>
                            {addr.isDefault && <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full ml-2 font-medium">Predeterminada</span>}
                            <p className="text-xs text-slate-400">{addr.street}, {addr.colony}, {addr.city}, {addr.state} C.P. {addr.postalCode}</p>
                          </div>
                        </label>
                      ))}
                      <button
                        type="button"
                        onClick={() => { setSelectedAddressId(null); setFormData((prev) => ({ ...prev, calle: "", colonia: "", ciudad: "", estado: "", cp: "" })); }}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Usar otra direccion
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Nombre *</label><input type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Apellido *</label><input type="text" name="apellido" value={formData.apellido} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Email *</label><input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Telefono *</label><input type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                </div>
                <div><label className="text-sm font-medium text-slate-600 mb-1 block">Calle y numero *</label><input type="text" name="calle" value={formData.calle} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Colonia *</label><input type="text" name="colonia" value={formData.colonia} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Codigo Postal *</label><input type="text" name="cp" value={formData.cp} onChange={handleInputChange} required maxLength={5} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Ciudad *</label><input type="text" name="ciudad" value={formData.ciudad} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Estado *</label>
                    <select name="estado" value={formData.estado} onChange={handleInputChange} required className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm bg-white">
                      <option value="">Seleccionar...</option>
                      {estados.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">Empresa (opcional)</label><input type="text" name="empresa" value={formData.empresa} onChange={handleInputChange} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" /></div>
                  <div><label className="text-sm font-medium text-slate-600 mb-1 block">RFC (para factura)</label><input type="text" name="rfc" value={formData.rfc} onChange={handleInputChange} maxLength={13} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" /></div>
                </div>
                <div><label className="text-sm font-medium text-slate-600 mb-1 block">Notas (opcional)</label><textarea name="notas" value={formData.notas} onChange={handleInputChange} rows={3} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm resize-none" placeholder="Instrucciones especiales de entrega..." /></div>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">Continuar a Envio</button>
              </form>
            )}

            {/* STEP 2: Shipping */}
            {step === "shipping" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><Truck size={18} className="text-blue-600" />Selecciona tu Metodo de Envio</h2>
                <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-3">
                  <MapPin size={16} className="text-slate-400 shrink-0" />
                  <div><p className="text-sm font-medium text-slate-700">Enviar a:</p><p className="text-xs text-slate-400">{formData.calle}, {formData.colonia}, {formData.ciudad}, {formData.estado} {formData.cp}</p></div>
                </div>
                {loadingShipping ? (
                  <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-blue-600" /><span className="ml-2 text-sm text-slate-400">Cotizando envios...</span></div>
                ) : shippingQuotes.length > 0 ? (
                  <div className="space-y-3">
                    {shippingQuotes.map((quote) => (
                      <label key={`${quote.carrier}-${quote.service}`} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedShipping?.carrier === quote.carrier && selectedShipping?.service === quote.service ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}>
                        <input type="radio" name="shipping" checked={selectedShipping?.carrier === quote.carrier && selectedShipping?.service === quote.service} onChange={() => setSelectedShipping(quote)} className="accent-blue-600" />
                        <div className="flex-1">
                          <div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-800">{quote.carrierName}</span><span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{quote.service}</span></div>
                          <div className="flex items-center gap-2 mt-1"><Clock size={12} className="text-slate-300" /><span className="text-xs text-slate-400">{quote.deliveryDays.min === quote.deliveryDays.max ? `${quote.deliveryDays.min} dia${quote.deliveryDays.min > 1 ? "s" : ""} habil${quote.deliveryDays.min > 1 ? "es" : ""}` : `${quote.deliveryDays.min}-${quote.deliveryDays.max} dias habiles`}</span>{quote.trackingAvailable && <span className="text-xs text-green-600">Con rastreo</span>}</div>
                        </div>
                        <span className={`text-sm font-bold ${quote.price === 0 ? "text-green-600" : "text-slate-800"}`}>{quote.price === 0 ? "GRATIS" : formatPrice(quote.price)}</span>
                      </label>
                    ))}
                  </div>
                ) : <p className="text-sm text-slate-400 text-center py-4">Se usara tarifa estandar.</p>}
                <div className="flex gap-3">
                  <button onClick={() => setStep("info")} className="px-6 py-3.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">Atras</button>
                  <button onClick={handleSubmitShipping} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm">Continuar al Pago</button>
                </div>
              </div>
            )}

            {/* STEP 3: Payment */}
            {step === "payment" && (
              <form onSubmit={handleSubmitPayment} className="bg-white rounded-2xl border border-slate-200 p-6 lg:p-8 space-y-6">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2"><CreditCard size={18} className="text-blue-600" />Metodo de Pago</h2>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "CARD" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}>
                    <input type="radio" name="pm" value="CARD" checked={paymentMethod === "CARD"} onChange={() => setPaymentMethod("CARD")} className="accent-blue-600" />
                    <CreditCard size={18} className="text-blue-600" />
                    <div className="flex-1"><p className="text-sm font-semibold text-slate-800">Tarjeta de credito o debito</p><p className="text-xs text-slate-400">Visa, Mastercard, AMEX - Pago inmediato</p></div>
                    <div className="flex gap-1">{["Visa", "MC", "AMEX"].map((c) => <span key={c} className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">{c}</span>)}</div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "SPEI" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}>
                    <input type="radio" name="pm" value="SPEI" checked={paymentMethod === "SPEI"} onChange={() => setPaymentMethod("SPEI")} className="accent-blue-600" />
                    <Building2 size={18} className="text-blue-600" />
                    <div className="flex-1"><p className="text-sm font-semibold text-slate-800">Transferencia SPEI</p><p className="text-xs text-slate-400">Se generara una referencia de pago (1-2 hrs)</p></div>
                  </label>
                  <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === "OXXO" ? "border-blue-500 bg-blue-50/50" : "border-slate-200 hover:border-blue-300"}`}>
                    <input type="radio" name="pm" value="OXXO" checked={paymentMethod === "OXXO"} onChange={() => setPaymentMethod("OXXO")} className="accent-blue-600" />
                    <Banknote size={18} className="text-blue-600" />
                    <div className="flex-1"><p className="text-sm font-semibold text-slate-800">Pago en OXXO</p><p className="text-xs text-slate-400">Paga en efectivo (vigencia 3 dias)</p></div>
                  </label>
                </div>
                {paymentMethod === "CARD" && (
                  <div className="bg-blue-50 rounded-xl p-4 space-y-3">
                    <p className="text-sm font-medium text-blue-900">Datos de Tarjeta</p>
                    <input type="text" placeholder="Numero de tarjeta" maxLength={19} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                    <div className="grid grid-cols-2 gap-3">
                      <input type="text" placeholder="MM/AA" maxLength={5} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                      <input type="text" placeholder="CVV" maxLength={4} className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                    </div>
                    <input type="text" placeholder="Nombre en la tarjeta" className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 outline-none text-sm" />
                    <p className="text-xs text-blue-700">Tus datos son procesados de forma segura.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep("shipping")} className="px-6 py-3.5 rounded-xl border border-slate-200 text-sm font-medium hover:bg-slate-50 transition-colors">Atras</button>
                  <button type="submit" disabled={isProcessing} className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                    {isProcessing ? <><Loader2 size={16} className="animate-spin" />Procesando...</> : <><ShieldCheck size={16} />{paymentMethod === "CARD" ? `Pagar ${formatPrice(total)}` : `Confirmar Pedido — ${formatPrice(total)}`}</>}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-40">
              <h3 className="font-bold text-slate-800 text-sm mb-4">Resumen ({items.length})</h3>
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-3">
                    <div className="relative w-14 h-14 bg-slate-50 rounded-lg overflow-hidden shrink-0">
                      <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" sizes="56px" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full">{item.quantity}</span>
                    </div>
                    <div className="flex-1 min-w-0"><p className="text-xs text-slate-700 font-medium line-clamp-1">{item.product.name}</p><p className="text-xs text-slate-400">{formatPrice(item.product.price * item.quantity)}</p></div>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="border-t border-slate-100 pt-4 mb-4">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-green-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2"><Tag size={14} className="text-green-600" /><div><p className="text-xs font-semibold text-green-700">{appliedCoupon.code}</p><p className="text-[10px] text-green-600">{appliedCoupon.description}</p></div></div>
                    <button onClick={handleRemoveCoupon} className="p-1 hover:bg-green-100 rounded"><X size={14} className="text-green-600" /></button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }} placeholder="Codigo de cupon" className="flex-1 px-3 py-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 outline-none" />
                      <button onClick={handleApplyCoupon} disabled={couponLoading || !couponCode.trim()} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white text-xs font-semibold rounded-lg transition-colors">{couponLoading ? <Loader2 size={12} className="animate-spin" /> : "Aplicar"}</button>
                    </div>
                    {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-100 pt-4 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-slate-400">Subtotal</span><span className="text-slate-700">{formatPrice(subtotal)}</span></div>
                {couponDiscount > 0 && <div className="flex justify-between text-sm text-green-600"><span>Descuento</span><span>-{formatPrice(couponDiscount)}</span></div>}
                <div className="flex justify-between text-sm"><span className="text-slate-400">Envio</span><span className="text-slate-700">{shippingCost === 0 ? <span className="text-green-600">Gratis</span> : formatPrice(shippingCost)}</span></div>
                {selectedShipping && <p className="text-[10px] text-slate-300">{selectedShipping.carrierName} {selectedShipping.service} ({selectedShipping.deliveryDays.min}-{selectedShipping.deliveryDays.max} dias)</p>}
                <div className="flex justify-between text-base font-bold pt-2 border-t border-slate-100"><span className="text-slate-800">Total</span><span className="text-blue-700">{formatPrice(total)}</span></div>
              </div>
              <div className="flex items-center gap-2 mt-4 justify-center text-xs text-slate-400"><ShieldCheck size={14} /><span>Compra 100% segura</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
