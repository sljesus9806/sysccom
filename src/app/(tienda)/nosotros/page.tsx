"use client";

import { useState } from "react";
import {
  Camera,
  Network,
  Phone,
  Shield,
  Radio,
  Server,
  Users,
  Award,
  Target,
  CheckCircle,
  Send,
  MapPin,
  Mail,
  Clock,
} from "lucide-react";

const services = [
  {
    icon: Camera,
    title: "Videovigilancia (CCTV)",
    description:
      "Diseño e instalación de sistemas de circuito cerrado de televisión con cámaras IP y analógicas.",
  },
  {
    icon: Network,
    title: "Redes de Voz y Datos",
    description:
      "Implementación de redes LAN, WAN, cableado estructurado y soluciones de conectividad empresarial.",
  },
  {
    icon: Phone,
    title: "Conmutadores Telefónicos",
    description:
      "Soluciones de telefonía IP, conmutadores y comunicaciones unificadas para empresas.",
  },
  {
    icon: Shield,
    title: "Control de Acceso",
    description:
      "Sistemas biométricos, cerraduras electrónicas y control de acceso para edificios y oficinas.",
  },
  {
    icon: Radio,
    title: "Enlaces Inalámbricos",
    description:
      "Diseño de enlaces punto a punto y punto a multipunto para conectividad de largo alcance.",
  },
  {
    icon: Server,
    title: "Servidores y Almacenamiento",
    description:
      "Soluciones de servidores, NAS, respaldos y almacenamiento empresarial.",
  },
];

const stats = [
  { value: "10+", label: "Años de experiencia" },
  { value: "500+", label: "Proyectos completados" },
  { value: "200+", label: "Clientes satisfechos" },
  { value: "24/7", label: "Soporte técnico" },
];

export default function NosotrosPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    email: "",
    telefono: "",
    empresa: "",
    mensaje: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setFormData({ nombre: "", email: "", telefono: "", empresa: "", mensaje: "" });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 py-16 lg:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl lg:text-5xl font-black text-white mb-6">
              SYSCCOM Integradores
            </h1>
            <p className="text-lg lg:text-xl text-blue-200 leading-relaxed">
              Somos una empresa dedicada a proveer soluciones integrales en
              telecomunicaciones y tecnología. Desde videovigilancia hasta redes
              empresariales, ofrecemos productos y servicios de la más alta calidad.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center py-8 lg:py-10">
                <p className="text-3xl lg:text-4xl font-black text-blue-700 mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                Nuestra Historia
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  SYSCCOM nació como una empresa familiar enfocada en
                  telecomunicaciones y tecnología. Con la visión de nuestro
                  fundador, hemos crecido para convertirnos en un integrador de
                  soluciones confiable para empresas en toda la República
                  Mexicana.
                </p>
                <p>
                  Trabajamos con los principales proveedores y fabricantes del
                  sector, como Syscom y Abasteo, para ofrecer a nuestros
                  clientes los mejores productos a precios competitivos, con
                  garantía oficial y soporte técnico especializado.
                </p>
                <p>
                  Nuestra tienda en línea te permite acceder a un amplio
                  catálogo de productos de telecomunicaciones con precios
                  actualizados en tiempo real directamente de nuestros
                  proveedores autorizados.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Target size={32} className="text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Misión</h3>
                <p className="text-sm text-gray-600">
                  Proveer soluciones tecnológicas de calidad que impulsen el
                  crecimiento de nuestros clientes.
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center">
                <Award size={32} className="text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Visión</h3>
                <p className="text-sm text-gray-600">
                  Ser el integrador de telecomunicaciones líder en el norte de
                  México.
                </p>
              </div>
              <div className="bg-blue-50 rounded-2xl p-6 text-center col-span-2">
                <Users size={32} className="text-blue-600 mx-auto mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Valores</h3>
                <p className="text-sm text-gray-600">
                  Honestidad, compromiso, calidad y servicio al cliente como
                  pilares fundamentales de nuestro trabajo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Nuestros Servicios
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Ofrecemos soluciones integrales en telecomunicaciones, desde el
              diseño hasta la implementación y mantenimiento
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-blue-50 group-hover:bg-blue-100 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <service.icon size={24} className="text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {service.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why choose us */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              &iquest;Por qué elegirnos?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {[
              "Distribuidores autorizados de las mejores marcas",
              "Precios competitivos actualizados en tiempo real",
              "Asesoría técnica especializada sin costo",
              "Envíos a toda la República Mexicana",
              "Garantía oficial del fabricante en todos los productos",
              "Soporte post-venta y servicio de instalación",
              "Facturación electrónica CFDI",
              "Más de 10 años de experiencia en el sector",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 p-4 bg-green-50 rounded-xl"
              >
                <CheckCircle
                  size={20}
                  className="text-green-500 shrink-0"
                />
                <span className="text-sm font-medium text-gray-700">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contacto" className="py-16 lg:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-3">
              Contáctanos
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Estamos listos para ayudarte con tu proyecto. Escríbenos y te
              responderemos a la brevedad.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Contact info */}
            <div className="space-y-4">
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Phone size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Teléfono
                    </p>
                    <a
                      href="tel:+526141234567"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      (614) 123-4567
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Mail size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email</p>
                    <a
                      href="mailto:ventas@sysccom.mx"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      ventas@sysccom.mx
                    </a>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <MapPin size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Ubicación
                    </p>
                    <p className="text-sm text-gray-600">
                      Chihuahua, Chih., México
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Clock size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      Horario
                    </p>
                    <p className="text-sm text-gray-600">
                      Lun-Vie 9:00-18:00
                    </p>
                    <p className="text-sm text-gray-600">Sáb 9:00-14:00</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    &iexcl;Mensaje Enviado!
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Gracias por contactarnos. Te responderemos a la brevedad.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-blue-600 font-medium hover:underline"
                  >
                    Enviar otro mensaje
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-gray-100 p-6 lg:p-8 space-y-4"
                >
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
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        name="telefono"
                        value={formData.telefono}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-1 block">
                        Empresa
                      </label>
                      <input
                        type="text"
                        name="empresa"
                        value={formData.empresa}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      Mensaje *
                    </label>
                    <textarea
                      name="mensaje"
                      value={formData.mensaje}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm resize-none"
                      placeholder="Cuéntanos sobre tu proyecto o lo que necesitas..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-xl transition-colors shadow-lg shadow-blue-600/30"
                  >
                    <Send size={16} />
                    Enviar Mensaje
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
