"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Shield, Truck, Headphones } from "lucide-react";

const slides = [
  {
    title: "Soluciones en\nVideovigilancia",
    subtitle: "Protege tu negocio con la mejor tecnología en cámaras y sistemas de seguridad",
    cta: "Ver Cámaras",
    href: "/productos?category=camaras",
    gradient: "from-blue-900 via-blue-800 to-blue-950",
  },
  {
    title: "Redes\nEmpresariales",
    subtitle: "Infraestructura de red de alto rendimiento para tu empresa",
    cta: "Ver Redes",
    href: "/productos?category=redes",
    gradient: "from-blue-950 via-blue-900 to-indigo-950",
  },
  {
    title: "Enlaces\nInalámbricos",
    subtitle: "Conectividad de largo alcance para zonas rurales y urbanas",
    cta: "Ver Antenas",
    href: "/productos?category=antenas",
    gradient: "from-indigo-950 via-blue-900 to-blue-950",
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section>
      {/* Hero */}
      <div
        className={`relative bg-gradient-to-br ${slide.gradient} min-h-[520px] lg:min-h-[600px] flex items-center overflow-hidden transition-all duration-1000`}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-4 py-20 lg:py-28 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-blue-200 text-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span>Proveedores autorizados • Precios actualizados</span>
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6 whitespace-pre-line">
              {slide.title}
            </h2>
            <p className="text-lg lg:text-xl text-blue-200 mb-8 max-w-lg">
              {slide.subtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href={slide.href}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all hover:scale-105 active:scale-100"
              >
                {slide.cta}
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-xl transition-all"
              >
                Ver Catálogo Completo
              </Link>
            </div>

            {/* Slide indicators */}
            <div className="flex gap-2 mt-10">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === currentSlide
                      ? "w-10 bg-orange-500"
                      : "w-4 bg-white/30 hover:bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features bar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            <div className="flex items-center gap-4 py-5 px-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Truck className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Envío a Todo México
                </p>
                <p className="text-xs text-gray-500">
                  Envíos rápidos y seguros a toda la república
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-5 px-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Shield className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Garantía de Fábrica
                </p>
                <p className="text-xs text-gray-500">
                  Todos nuestros productos con garantía oficial
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 py-5 px-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                <Headphones className="text-blue-600" size={22} />
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">
                  Soporte Técnico
                </p>
                <p className="text-xs text-gray-500">
                  Asesoría especializada en telecomunicaciones
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
