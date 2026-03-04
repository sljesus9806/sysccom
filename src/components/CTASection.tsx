import Link from "next/link";
import { Phone, ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-3xl p-8 lg:p-16 relative overflow-hidden">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />

          <div className="relative text-center max-w-2xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              &iquest;Necesitas un proyecto a la medida?
            </h2>
            <p className="text-lg text-blue-200 mb-8">
              Nuestro equipo de ingenieros te asesora en el dise&ntilde;o e
              implementaci&oacute;n de soluciones de telecomunicaciones y seguridad
              para tu empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/nosotros#contacto"
                className="inline-flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105"
              >
                Solicitar Cotización
                <ArrowRight size={18} />
              </Link>
              <a
                href="tel:+526141234567"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                <Phone size={18} />
                Llamar Ahora
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
