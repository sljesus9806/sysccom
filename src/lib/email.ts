/**
 * Email utilities for SYSCCOM
 *
 * Currently logs emails to console. To enable actual sending:
 * 1. Install nodemailer: npm install nodemailer
 * 2. Configure SMTP settings in .env
 * 3. Uncomment the nodemailer transport below
 *
 * Or integrate with a service like SendGrid, Resend, or AWS SES.
 */

interface EmailOptions {
  to: string
  subject: string
  html: string
}

async function sendEmail(options: EmailOptions): Promise<void> {
  // In production, replace with actual email transport:
  // import nodemailer from 'nodemailer'
  // const transport = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: Number(process.env.SMTP_PORT),
  //   auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  // })
  // await transport.sendMail({ from: 'SYSCCOM <noreply@sysccom.mx>', ...options })

  console.log(`[EMAIL] To: ${options.to} | Subject: ${options.subject}`)
  console.log(`[EMAIL] Body preview: ${options.html.slice(0, 200)}...`)
}

export async function sendWelcomeEmail(email: string, firstName: string): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Bienvenido a SYSCCOM Integradores',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">SYSCCOM Integradores</h1>
            <p style="color: #3b66ee; font-size: 11px; letter-spacing: 2px; margin: 4px 0 0;">TELECOMUNICACIONES Y TECNOLOGIA</p>
          </div>

          <h2 style="color: #1e293b; font-size: 20px;">Hola ${firstName},</h2>

          <p style="color: #475569; line-height: 1.6;">
            Tu cuenta en SYSCCOM ha sido creada exitosamente. Ya puedes:
          </p>

          <ul style="color: #475569; line-height: 1.8;">
            <li>Explorar nuestro catalogo de productos</li>
            <li>Agregar direcciones de envio</li>
            <li>Realizar compras y dar seguimiento a tus pedidos</li>
            <li>Acceder a ofertas exclusivas</li>
          </ul>

          <div style="text-align: center; margin: 28px 0;">
            <a href="https://sysccom.mx/productos"
               style="background: #2549e3; color: white; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Ver Catalogo
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 28px;">
            Si no creaste esta cuenta, puedes ignorar este correo.<br>
            SYSCCOM Integradores | Chihuahua, Mexico | (614) 123-4567
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendOrderConfirmationEmail(
  email: string,
  firstName: string,
  orderNumber: string,
  total: number
): Promise<void> {
  await sendEmail({
    to: email,
    subject: `Pedido ${orderNumber} - SYSCCOM Integradores`,
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">SYSCCOM Integradores</h1>
          </div>

          <h2 style="color: #1e293b; font-size: 20px;">Pedido Recibido</h2>

          <p style="color: #475569; line-height: 1.6;">
            Hola ${firstName}, hemos recibido tu pedido exitosamente.
          </p>

          <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">Numero de pedido</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-size: 20px; font-weight: bold;">${orderNumber}</p>
          </div>

          <div style="background: #f0f4ff; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #475569; font-size: 14px;">Total</p>
            <p style="margin: 4px 0 0; color: #1e293b; font-size: 20px; font-weight: bold;">$${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
          </div>

          <p style="color: #475569; line-height: 1.6;">
            Te enviaremos un correo con los detalles de envio cuando tu pedido sea procesado.
          </p>

          <p style="color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 28px;">
            SYSCCOM Integradores | Chihuahua, Mexico | (614) 123-4567
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendPasswordResetEmail(
  email: string,
  firstName: string,
  resetUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Recupera tu contrasena - SYSCCOM',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">SYSCCOM Integradores</h1>
          </div>

          <h2 style="color: #1e293b; font-size: 20px;">Hola ${firstName},</h2>

          <p style="color: #475569; line-height: 1.6;">
            Recibimos una solicitud para restablecer tu contrasena. Haz clic en el boton para crear una nueva:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${resetUrl}"
               style="background: #2549e3; color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Restablecer Contrasena
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            Este enlace expira en 1 hora. Si no solicitaste este cambio, puedes ignorar este correo.
          </p>

          <p style="color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 28px;">
            SYSCCOM Integradores | Chihuahua, Mexico | (614) 123-4567
          </p>
        </div>
      </body>
      </html>
    `,
  })
}

export async function sendEmailVerification(
  email: string,
  firstName: string,
  verifyUrl: string
): Promise<void> {
  await sendEmail({
    to: email,
    subject: 'Verifica tu email - SYSCCOM',
    html: `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8fafc;">
        <div style="background: white; border-radius: 12px; padding: 32px; border: 1px solid #e2e8f0;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; font-size: 24px; margin: 0;">SYSCCOM Integradores</h1>
          </div>

          <h2 style="color: #1e293b; font-size: 20px;">Hola ${firstName},</h2>

          <p style="color: #475569; line-height: 1.6;">
            Confirma tu direccion de correo electronico haciendo clic en el siguiente boton:
          </p>

          <div style="text-align: center; margin: 28px 0;">
            <a href="${verifyUrl}"
               style="background: #10b981; color: white; text-decoration: none; padding: 14px 36px; border-radius: 8px; font-weight: 600; font-size: 14px;">
              Verificar Email
            </a>
          </div>

          <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
            Este enlace expira en 24 horas.
          </p>

          <p style="color: #94a3b8; font-size: 13px; border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 28px;">
            SYSCCOM Integradores | Chihuahua, Mexico | (614) 123-4567
          </p>
        </div>
      </body>
      </html>
    `,
  })
}
