import { FileText } from "lucide-react";

export default function TerminosPage() {
  return (
    <div>
      <section className="bg-gradient-to-r from-blue-800 to-blue-900 py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <FileText size={48} className="text-blue-300 mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-black text-white mb-3">Términos y Condiciones</h1>
          <p className="text-blue-200">Última actualización: Marzo 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 py-10 lg:py-16">
        <div className="prose prose-sm prose-gray max-w-none space-y-8">
          <Section title="1. Generalidades">
            <p>Los presentes Términos y Condiciones regulan el uso del sitio web de SYSCCOM Integradores (en adelante &quot;SYSCCOM&quot;), así como la compra de productos y servicios ofrecidos a través de la tienda en línea. Al acceder y utilizar este sitio, el usuario acepta los presentes términos en su totalidad.</p>
            <p>SYSCCOM se reserva el derecho de modificar estos términos en cualquier momento. Las modificaciones entrarán en vigor desde su publicación en el sitio.</p>
          </Section>

          <Section title="2. Productos y Precios">
            <p>Todos los productos ofrecidos son originales y cuentan con garantía oficial del fabricante. Los precios están expresados en pesos mexicanos (MXN) e incluyen IVA donde aplique.</p>
            <p>SYSCCOM se reserva el derecho de modificar precios sin previo aviso. El precio aplicable será el vigente al momento de confirmar la compra. La disponibilidad de productos está sujeta a existencias.</p>
          </Section>

          <Section title="3. Proceso de Compra">
            <p>Para realizar una compra, el usuario deberá seleccionar los productos deseados, proporcionar datos de envío válidos y seleccionar un método de pago. La confirmación del pedido constituye un contrato de compraventa vinculante.</p>
            <p>SYSCCOM se reserva el derecho de cancelar pedidos en caso de: información incorrecta o fraudulenta, problemas de inventario, errores en precios publicados, o incumplimiento de estos términos.</p>
          </Section>

          <Section title="4. Métodos de Pago">
            <p>Aceptamos los siguientes métodos de pago:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Tarjetas de crédito y débito (Visa, Mastercard, American Express)</li>
              <li>Transferencia bancaria SPEI</li>
              <li>Pago en efectivo en tiendas OXXO</li>
            </ul>
            <p>Para pagos por SPEI y OXXO, el pedido será procesado una vez confirmada la recepción del pago. Los pagos por OXXO tienen una vigencia de 3 días naturales.</p>
          </Section>

          <Section title="5. Envíos y Entregas">
            <p>Realizamos envíos a toda la República Mexicana a través de Estafeta y DHL Express. Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad del servicio de paquetería.</p>
            <p>El envío estándar es gratuito en compras superiores a $5,000 MXN. Los costos y tiempos de envío se calculan durante el proceso de checkout basándose en la ubicación de entrega y el peso del paquete.</p>
          </Section>

          <Section title="6. Devoluciones y Garantías">
            <p>Se aceptan devoluciones dentro de los 15 días naturales posteriores a la entrega del producto, siempre que se cumplan las siguientes condiciones:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>El producto debe estar en su empaque original, sin uso ni daño</li>
              <li>Debe incluir todos los accesorios y manuales</li>
              <li>Se debe presentar el comprobante de compra</li>
            </ul>
            <p>Las garantías se manejan directamente con el fabricante según sus políticas vigentes. SYSCCOM actuará como intermediario para facilitar el proceso de garantía.</p>
          </Section>

          <Section title="7. Facturación">
            <p>SYSCCOM emite facturas electrónicas (CFDI) conforme a la legislación fiscal mexicana vigente. Para solicitar factura, el usuario deberá proporcionar sus datos fiscales completos (RFC, razón social, régimen fiscal, domicilio fiscal y uso del CFDI).</p>
            <p>Las solicitudes de facturación deben realizarse dentro del mes calendario en que se efectuó la compra.</p>
          </Section>

          <Section title="8. Propiedad Intelectual">
            <p>Todo el contenido del sitio web (textos, imágenes, logotipos, diseño) es propiedad de SYSCCOM o de sus proveedores y está protegido por las leyes de propiedad intelectual aplicables. Queda prohibida su reproducción total o parcial sin autorización expresa.</p>
          </Section>

          <Section title="9. Limitación de Responsabilidad">
            <p>SYSCCOM no será responsable por daños indirectos, incidentales o consecuentes que resulten del uso del sitio web o de los productos adquiridos. Nuestra responsabilidad máxima se limita al monto pagado por el producto en cuestión.</p>
          </Section>

          <Section title="10. Jurisdicción">
            <p>Los presentes Términos y Condiciones se rigen por las leyes de los Estados Unidos Mexicanos. Para cualquier controversia, las partes se someten a la jurisdicción de los tribunales competentes de la ciudad de Chihuahua, Chihuahua.</p>
          </Section>

          <div className="bg-gray-50 rounded-xl p-6 mt-8">
            <p className="text-sm text-gray-600">
              Si tienes dudas sobre estos términos, contáctanos en{" "}
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
