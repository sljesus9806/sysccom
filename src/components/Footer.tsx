import Link from "next/link";
import Image from "next/image";
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
    <footer className="bg-slate-900 text-slate-400">
      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <Image
                src="/logo.svg"
                alt="SYSCCOM"
                width={38}
                height={38}
              />
              <div>
                <h3 className="text-lg font-extrabold text-white tracking-tight leading-none">
                  SYSCCOM
                </h3>
                <p className="text-[9px] text-blue-400 font-semibold tracking-[0.2em] leading-none mt-0.5">
                  INTEGRADORES
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-500">
              Empresa lider en telecomunicaciones y tecnologia. Soluciones
              integrales en videovigilancia, redes, cableado estructurado y
              control de acceso.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                className="w-9 h-9 bg-slate-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Facebook size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-800 hover:bg-pink-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <Instagram size={15} />
              </a>
              <a
                href="#"
                className="w-9 h-9 bg-slate-800 hover:bg-green-600 rounded-lg flex items-center justify-center transition-colors"
              >
                <MessageCircle size={15} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-4">Categorias</h4>
            <ul className="space-y-2">
              {[
                "Camaras de Vigilancia",
                "Redes y Conectividad",
                "Cableado Estructurado",
                "Antenas y Enlaces",
                "Servidores",
                "Telefonia IP",
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
            <h4 className="text-white font-semibold text-sm mb-4">Empresa</h4>
            <ul className="space-y-2">
              {[
                { name: "Nosotros", href: "/nosotros" },
                { name: "Servicios", href: "/nosotros#servicios" },
                { name: "Contacto", href: "/nosotros#contacto" },
                { name: "Preguntas Frecuentes", href: "/faq" },
                { name: "Terminos y Condiciones", href: "/terminos" },
                { name: "Politica de Privacidad", href: "/privacidad" },
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
            <h4 className="text-white font-semibold text-sm mb-4">Contacto</h4>
            <div className="space-y-3">
              <a
                href="tel:+526141234567"
                className="flex items-center gap-3 text-sm hover:text-blue-400 transition-colors"
              >
                <Phone size={15} className="shrink-0 text-blue-500" />
                <span>(614) 123-4567</span>
              </a>
              <a
                href="mailto:ventas@sysccom.mx"
                className="flex items-center gap-3 text-sm hover:text-blue-400 transition-colors"
              >
                <Mail size={15} className="shrink-0 text-blue-500" />
                <span>ventas@sysccom.mx</span>
              </a>
              <div className="flex items-start gap-3 text-sm">
                <MapPin size={15} className="shrink-0 text-blue-500 mt-0.5" />
                <span>Chihuahua, Chihuahua, Mexico</span>
              </div>
            </div>
            <div className="mt-5 p-3.5 bg-slate-800/60 rounded-xl border border-slate-700/50">
              <p className="text-xs text-slate-500 mb-1">Horario de atencion</p>
              <p className="text-sm text-slate-300">Lun - Vie: 9:00 - 18:00</p>
              <p className="text-sm text-slate-300">Sab: 9:00 - 14:00</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} SYSCCOM Integradores. Todos los derechos reservados.</p>
          <p>
            Precios mostrados en MXN. IVA incluido donde aplique.
          </p>
        </div>
      </div>
    </footer>
  );
}
