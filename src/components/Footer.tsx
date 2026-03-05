import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  MessageCircle,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                <span className="text-white font-black text-lg">S</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight leading-none">
                  SYSCCOM
                </h3>
                <p className="text-[10px] text-blue-400 font-medium tracking-widest leading-none">
                  INTEGRADORES
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-gray-400">
              Empresa líder en telecomunicaciones y tecnología. Soluciones
              integrales en videovigilancia, redes, cableado estructurado y
              control de acceso.
            </p>
            <div className="flex gap-3">
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <MessageCircle size={16} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2.5">
              {[
                "Cámaras de Vigilancia",
                "Redes y Conectividad",
                "Cableado Estructurado",
                "Antenas y Enlaces",
                "Servidores",
                "Telefonía IP",
                "Control de Acceso",
                "Alarmas",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/productos"
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-white font-semibold mb-4">Empresa</h4>
            <ul className="space-y-2.5">
              {[
                { name: "Nosotros", href: "/nosotros" },
                { name: "Servicios", href: "/nosotros#servicios" },
                { name: "Contacto", href: "/nosotros#contacto" },
                { name: "Preguntas Frecuentes", href: "/faq" },
                { name: "Términos y Condiciones", href: "/terminos" },
                { name: "Política de Privacidad", href: "/privacidad" },
              ].map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm hover:text-blue-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              <a
                href="tel:+526141234567"
                className="flex items-center gap-3 text-sm hover:text-blue-400 transition-colors"
              >
                <Phone size={16} className="shrink-0 text-blue-500" />
                <span>(614) 123-4567</span>
              </a>
              <a
                href="mailto:ventas@sysccom.mx"
                className="flex items-center gap-3 text-sm hover:text-blue-400 transition-colors"
              >
                <Mail size={16} className="shrink-0 text-blue-500" />
                <span>ventas@sysccom.mx</span>
              </a>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={16} className="shrink-0 text-blue-500 mt-0.5" />
                <span>Chihuahua, Chihuahua, México</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-gray-800 rounded-xl">
              <p className="text-xs text-gray-400 mb-1">Horario de atención</p>
              <p className="text-sm text-white">Lun - Vie: 9:00 - 18:00</p>
              <p className="text-sm text-white">Sáb: 9:00 - 14:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} SYSCCOM Integradores. Todos los derechos reservados.</p>
          <p>
            Precios mostrados en MXN. IVA incluido donde aplique.
          </p>
        </div>
      </div>
    </footer>
  );
}
