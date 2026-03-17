'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Check, ShoppingCart, Home } from 'lucide-react'
import { Suspense } from 'react'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''
  const paymentId = searchParams.get('payment_id') || ''

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <Check size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Pago Exitoso</h1>
          <p className="text-slate-400 text-sm mb-1">Tu pago ha sido procesado correctamente por MercadoPago.</p>

          {orderNumber && (
            <p className="text-lg font-bold text-blue-600 mb-2">{orderNumber}</p>
          )}

          {paymentId && (
            <p className="text-xs text-slate-400 mb-4">ID de pago: {paymentId}</p>
          )}

          <div className="bg-green-50 rounded-xl p-6 text-left mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check size={20} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-green-900">Pago confirmado</p>
                <p className="text-sm text-green-700">Tu pedido sera procesado y te enviaremos los detalles de envio por correo.</p>
              </div>
            </div>
          </div>

          <p className="text-sm text-slate-400 mb-6">Recibiras un correo con la confirmacion y los detalles de seguimiento.</p>

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

export default function MercadoPagoSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" /></div>}>
      <SuccessContent />
    </Suspense>
  )
}
