"use client";

import { useState } from "react";
import { ChevronDown, HelpCircle, Package, CreditCard, Truck, Shield, RotateCcw, Phone } from "lucide-react";
import Link from "next/link";

const faqCategories = [
  {
    icon: Package,
    title: "Pedidos",
    faqs: [
      { q: "¿Cómo realizo un pedido?", a: "Navega nuestro catálogo, agrega productos al carrito y procede al checkout. Puedes comprar como invitado o crear una cuenta para rastrear tus pedidos." },
      { q: "¿Puedo modificar mi pedido después de realizarlo?", a: "Si tu pedido aún no ha sido procesado, contáctanos lo antes posible al (614) 123-4567 o ventas@sysccom.mx y haremos lo posible por modificarlo." },
      { q: "¿Cómo puedo rastrear mi pedido?", a: "Desde tu cuenta en 'Mis Pedidos' podrás ver el estado actual. Una vez enviado, recibirás un número de guía para rastrear con la paquetería correspondiente." },
      { q: "¿Emiten factura electrónica (CFDI)?", a: "Sí, emitimos factura electrónica CFDI. Asegúrate de proporcionar tu RFC durante el checkout o solicítala enviando un correo a ventas@sysccom.mx con tu RFC y datos fiscales." },
    ],
  },
  {
    icon: CreditCard,
    title: "Pagos",
    faqs: [
      { q: "¿Qué métodos de pago aceptan?", a: "Aceptamos tarjetas de crédito y débito (Visa, Mastercard, AMEX), transferencias bancarias SPEI y pagos en efectivo en tiendas OXXO." },
      { q: "¿Los precios incluyen IVA?", a: "Sí, todos los precios mostrados en nuestra tienda incluyen IVA (16%)." },
      { q: "¿Es seguro pagar en su sitio?", a: "Sí, utilizamos encriptación SSL y no almacenamos datos de tarjetas. Los pagos son procesados a través de pasarelas de pago certificadas PCI-DSS." },
      { q: "¿Puedo pagar a meses sin intereses?", a: "Sí, aceptamos pagos a 3, 6 y 12 meses sin intereses con tarjetas de crédito participantes en compras mayores a $3,000 MXN." },
    ],
  },
  {
    icon: Truck,
    title: "Envíos",
    faqs: [
      { q: "¿Cuánto cuesta el envío?", a: "El costo de envío varía según tu ubicación y el peso del paquete. En compras mayores a $5,000 MXN el envío estándar es GRATIS. Trabajamos con Estafeta y DHL Express." },
      { q: "¿En cuánto tiempo recibo mi pedido?", a: "El tiempo de entrega depende de tu ubicación: Zona local (Chihuahua): 1-2 días hábiles. Norte del país: 2-3 días. Centro: 3-5 días. Sur/Sureste: 4-7 días. Con DHL Express los tiempos se reducen significativamente." },
      { q: "¿Hacen envíos a toda la República?", a: "Sí, realizamos envíos a toda la República Mexicana a través de Estafeta (terrestre y express) y DHL Express." },
      { q: "¿Puedo recoger mi pedido en tienda?", a: "Sí, puedes seleccionar la opción de recoger en sucursal durante el checkout. Te notificaremos cuando tu pedido esté listo para recoger en nuestras oficinas en Chihuahua." },
    ],
  },
  {
    icon: Shield,
    title: "Garantías",
    faqs: [
      { q: "¿Los productos tienen garantía?", a: "Sí, todos nuestros productos cuentan con garantía oficial del fabricante. La duración varía según la marca y el tipo de producto (generalmente de 1 a 3 años)." },
      { q: "¿Cómo hago válida una garantía?", a: "Contáctanos con tu número de pedido y descripción del problema. Te guiaremos en el proceso de garantía que puede incluir reparación, reemplazo o crédito según las políticas del fabricante." },
      { q: "¿Son productos originales?", a: "Sí, somos distribuidores autorizados. Todos nuestros productos son 100% originales con garantía oficial del fabricante." },
    ],
  },
  {
    icon: RotateCcw,
    title: "Devoluciones",
    faqs: [
      { q: "¿Cuál es su política de devoluciones?", a: "Aceptamos devoluciones dentro de los 15 días naturales posteriores a la entrega, siempre que el producto esté en su empaque original, sin uso y con todos sus accesorios." },
      { q: "¿Cómo solicito una devolución?", a: "Envía un correo a ventas@sysccom.mx con tu número de pedido y motivo de devolución. Te enviaremos una guía prepagada para el envío de retorno." },
      { q: "¿En cuánto tiempo recibo mi reembolso?", a: "Una vez recibido y verificado el producto, el reembolso se procesa en 5-10 días hábiles al mismo método de pago original." },
    ],
  },
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <HelpCircle size={48} className="text-blue-300 mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">Preguntas Frecuentes</h1>
          <p className="text-blue-200 max-w-2xl mx-auto">Encuentra respuestas a las preguntas más comunes sobre pedidos, pagos, envíos y más.</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16">
        <div className="space-y-10">
          {faqCategories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <category.icon size={20} className="text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{category.title}</h2>
              </div>
              <div className="space-y-2">
                {category.faqs.map((faq, i) => {
                  const id = `${category.title}-${i}`;
                  const isOpen = openItems.has(id);
                  return (
                    <div key={id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                      <button onClick={() => toggle(id)} className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors">
                        <span className="text-sm font-medium text-gray-900 pr-4">{faq.q}</span>
                        <ChevronDown size={16} className={`text-gray-400 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600 leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 bg-blue-50 rounded-2xl p-8 text-center">
          <Phone size={32} className="text-blue-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-sm text-gray-600 mb-4">Nuestro equipo está listo para ayudarte</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/nosotros#contacto" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors">Contáctanos</Link>
            <a href="tel:+526141234567" className="bg-white text-blue-600 border border-blue-200 px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-50 transition-colors">(614) 123-4567</a>
          </div>
        </div>
      </div>
    </div>
  );
}
