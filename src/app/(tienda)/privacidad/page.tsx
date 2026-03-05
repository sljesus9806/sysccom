import { ShieldCheck } from "lucide-react";

export default function PrivacidadPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <ShieldCheck size={48} className="text-blue-300 mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">Política de Privacidad</h1>
          <p className="text-blue-200">Última actualización: Marzo 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <Section title="1. Responsable del Tratamiento de Datos">
            <p>SYSCCOM Integradores (en adelante &quot;SYSCCOM&quot;), con domicilio en Chihuahua, Chihuahua, México, es responsable del tratamiento de los datos personales que recabamos de nuestros usuarios y clientes, en cumplimiento con la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP).</p>
          </Section>

          <Section title="2. Datos Personales que Recabamos">
            <p>Recabamos los siguientes datos personales:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Datos de identificación:</strong> Nombre completo, email, teléfono</li>
              <li><strong>Datos de contacto y envío:</strong> Dirección completa, código postal, ciudad, estado</li>
              <li><strong>Datos fiscales (opcionales):</strong> RFC, razón social, régimen fiscal</li>
              <li><strong>Datos de la empresa (opcionales):</strong> Nombre de la empresa</li>
              <li><strong>Datos de navegación:</strong> Dirección IP, tipo de navegador, páginas visitadas, productos consultados</li>
            </ul>
            <p>No recabamos datos financieros sensibles. Los pagos con tarjeta son procesados directamente por pasarelas de pago certificadas que cumplen con el estándar PCI-DSS.</p>
          </Section>

          <Section title="3. Finalidades del Tratamiento">
            <p>Sus datos personales serán utilizados para las siguientes finalidades:</p>
            <p><strong>Finalidades primarias (necesarias):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Procesar y dar seguimiento a pedidos y compras</li>
              <li>Gestionar envíos y entregas</li>
              <li>Emitir facturas electrónicas (CFDI)</li>
              <li>Atender solicitudes de soporte y garantías</li>
              <li>Crear y administrar su cuenta de usuario</li>
            </ul>
            <p className="mt-3"><strong>Finalidades secundarias (opcionales):</strong></p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enviar promociones, ofertas y novedades por correo electrónico</li>
              <li>Realizar encuestas de satisfacción</li>
              <li>Análisis estadísticos para mejorar nuestros servicios</li>
            </ul>
            <p>Si no desea que sus datos sean tratados para finalidades secundarias, puede comunicarlo a ventas@sysccom.mx.</p>
          </Section>

          <Section title="4. Transferencia de Datos">
            <p>Sus datos personales podrán ser transferidos a:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Empresas de paquetería (Estafeta, DHL) para la entrega de pedidos</li>
              <li>Procesadores de pagos para completar transacciones</li>
              <li>Autoridades competentes cuando sea requerido por ley</li>
            </ul>
            <p>No vendemos ni compartimos sus datos personales con terceros para fines de mercadotecnia.</p>
          </Section>

          <Section title="5. Medidas de Seguridad">
            <p>Implementamos medidas de seguridad administrativas, técnicas y físicas para proteger sus datos personales, incluyendo:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Encriptación SSL/TLS en todas las comunicaciones</li>
              <li>Almacenamiento seguro con acceso restringido</li>
              <li>Contraseñas encriptadas (hash)</li>
              <li>Monitoreo y auditorías periódicas de seguridad</li>
            </ul>
          </Section>

          <Section title="6. Derechos ARCO">
            <p>Usted tiene derecho a Acceder, Rectificar, Cancelar u Oponerse al tratamiento de sus datos personales (Derechos ARCO). Para ejercer estos derechos, envíe una solicitud a:</p>
            <div className="bg-blue-50 rounded-lg p-4 my-3">
              <p><strong>Email:</strong> ventas@sysccom.mx</p>
              <p><strong>Asunto:</strong> Solicitud de Derechos ARCO</p>
            </div>
            <p>Su solicitud será atendida en un plazo máximo de 20 días hábiles. Deberá incluir: nombre completo, email registrado, descripción clara de los derechos que desea ejercer, y una copia de identificación oficial.</p>
          </Section>

          <Section title="7. Uso de Cookies">
            <p>Nuestro sitio utiliza cookies y tecnologías similares para:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Mantener su sesión activa</li>
              <li>Recordar sus preferencias y carrito de compras</li>
              <li>Análisis de tráfico y mejora del sitio</li>
            </ul>
            <p>Puede configurar su navegador para rechazar cookies, aunque esto podría afectar la funcionalidad del sitio.</p>
          </Section>

          <Section title="8. Cambios al Aviso de Privacidad">
            <p>SYSCCOM se reserva el derecho de modificar este aviso de privacidad. Cualquier cambio será publicado en esta página con la fecha de última actualización. Le recomendamos revisar periódicamente este aviso.</p>
          </Section>

          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <p className="text-sm text-gray-600">
              Para cualquier duda o aclaración sobre nuestra política de privacidad, contáctanos en{" "}
              <a href="mailto:ventas@sysccom.mx" className="text-blue-600 hover:underline">ventas@sysccom.mx</a>{" "}
              o al teléfono <a href="tel:+526141234567" className="text-blue-600 hover:underline">(614) 123-4567</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 mb-3">{title}</h2>
      <div className="text-sm text-gray-600 leading-relaxed space-y-3">{children}</div>
    </div>
  );
}
