'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { X, RefreshCw, Home } from 'lucide-react'
import { Suspense } from 'react'

function FailureContent() {
  const searchParams = useSearchParams()
  const orderNumber = searchParams.get('order') || ''

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <X size={32} className="text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Pago No Completado</h1>
          <p className="text-slate-400 text-sm mb-1">El pago no pudo ser procesado por MercadoPago.</p>

          {orderNumber && (
            <p className="text-sm text-slate-500 mb-4">Pedido: {orderNumber}</p>
          )}

          <div className="bg-red-50 rounded-xl p-6 text-left mb-6">
            <p className="text-sm text-red-800">
              Esto puede ocurrir por fondos insuficientes, tarjeta rechazada o cancelacion del pago.
              Tu pedido esta guardado y puedes intentar pagar de nuevo.
            </p>
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/cuenta/pedidos"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
            >
              <RefreshCw size={16} />
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

export default function MercadoPagoFailurePage() {
  return (
    <Suspense fallback={<div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" /></div>}>
      <FailureContent />
    </Suspense>
  )
}
