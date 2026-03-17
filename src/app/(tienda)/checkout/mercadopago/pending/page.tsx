'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, ShoppingCart, Home } from 'lucide-react'
import { Suspense } from 'react'

function PendingContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Clock size={32} className="text-amber-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Pago Pendiente</h1>
          <p className="text-slate-400 text-sm mb-1">Tu pago esta siendo procesado por MercadoPago.</p>

          {orderNumber && (
            <p className="text-lg font-bold text-blue-600 mb-4">{orderNumber}</p>
          )}

          <div className="bg-amber-50 rounded-xl p-6 text-left mb-6">
            <p className="text-sm text-amber-800">
              El pago esta pendiente de confirmacion. Si elegiste pagar en efectivo o transferencia,
              completa el pago siguiendo las instrucciones que recibiste. Te notificaremos por correo
              cuando se confirme tu pago.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/cuenta/pedidos"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <ShoppingCart size={16} />
              Ver Mis Pedidos
            </Link>
            <Link
              href="/"
              className="bg-slate-100 text-slate-600 px-6 py-3 rounded-xl font-semibold hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
            >
              <Home size={16} />
              Ir al Inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function MercadoPagoPendingPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" /></div>}>
      <PendingContent />
    </Suspense>
  )
}
