'use client'

import { useState, useEffect } from 'react'
import {
  Key,
  Check,
  AlertCircle,
  Loader2,
  Shield,
  ExternalLink,
  Eye,
  EyeOff,
  CreditCard,
} from 'lucide-react'

function getToken() {
  return localStorage.getItem('sysccom-admin-token') || ''
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json' }
}

interface MpConfig {
  configured: boolean
  publicKey?: string
  accessTokenHint?: string
  webhookSecretHint?: string | null
  isSandbox?: boolean
  updatedAt?: string
}

export default function MercadoPagoAdminPage() {
  const [config, setConfig] = useState<MpConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const [publicKey, setPublicKey] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [webhookSecret, setWebhookSecret] = useState('')
  const [isSandbox, setIsSandbox] = useState(true)
  const [showAccessToken, setShowAccessToken] = useState(false)
  const [showWebhookSecret, setShowWebhookSecret] = useState(false)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/mercadopago', { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setConfig(data)
        if (data.configured) {
          setPublicKey(data.publicKey || '')
          setIsSandbox(data.isSandbox ?? true)
        }
      }
    } catch {
      setMessage({ type: 'error', text: 'Error al cargar configuracion' })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage(null)

    try {
      const res = await fetch('/api/admin/mercadopago', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          publicKey,
          accessToken: accessToken || undefined,
          webhookSecret: webhookSecret || undefined,
          isSandbox,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        setMessage({ type: 'success', text: data.message })
        setAccessToken('')
        setWebhookSecret('')
        fetchConfig()
      } else {
        setMessage({ type: 'error', text: data.error })
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexion' })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <CreditCard className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">MercadoPago</h2>
          <p className="text-sm text-slate-400">Configura las credenciales para aceptar pagos con MercadoPago</p>
        </div>
      </div>

      {/* Status */}
      {config && (
        <div
          className={`rounded-xl p-4 flex items-center gap-3 ${
            config.configured
              ? 'bg-green-50 border border-green-200'
              : 'bg-amber-50 border border-amber-200'
          }`}
        >
          {config.configured ? (
            <>
              <Check className="w-5 h-5 text-green-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-green-800">MercadoPago configurado</p>
                <p className="text-xs text-green-600">
                  Public Key: {config.publicKey} | Access Token: {config.accessTokenHint}
                  {config.isSandbox && ' | Modo Sandbox'}
                  {config.updatedAt && ` | Actualizado: ${new Date(config.updatedAt).toLocaleDateString('es-MX')}`}
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-800">MercadoPago no configurado</p>
                <p className="text-xs text-amber-600">
                  Ingresa tus credenciales para habilitar pagos con MercadoPago
                </p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Message */}
      {message && (
        <div
          className={`rounded-xl p-4 text-sm ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSave} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Key className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-800">Credenciales</h3>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">Public Key *</label>
          <input
            type="text"
            value={publicKey}
            onChange={(e) => setPublicKey(e.target.value)}
            required
            placeholder="APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-mono"
          />
          <p className="text-xs text-slate-400 mt-1">Se encuentra en tu panel de MercadoPago en Credenciales</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Access Token * {config?.configured && <span className="text-slate-400 font-normal">(deja vacio para mantener el actual)</span>}
          </label>
          <div className="relative">
            <input
              type={showAccessToken ? 'text' : 'password'}
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              required={!config?.configured}
              placeholder={config?.configured ? '••••••••' : 'APP_USR-0000000000000000-000000-xxxxxxxxx-000000000'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowAccessToken(!showAccessToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Token de acceso para la API de MercadoPago</p>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 mb-1 block">
            Webhook Secret <span className="text-slate-400 font-normal">(opcional)</span>
          </label>
          <div className="relative">
            <input
              type={showWebhookSecret ? 'text' : 'password'}
              value={webhookSecret}
              onChange={(e) => setWebhookSecret(e.target.value)}
              placeholder="Tu secret para verificar webhooks"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none text-sm font-mono pr-10"
            />
            <button
              type="button"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Para verificar la autenticidad de las notificaciones webhook</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isSandbox}
              onChange={(e) => setIsSandbox(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500" />
          </label>
          <div>
            <p className="text-sm font-medium text-slate-700">Modo Sandbox (Pruebas)</p>
            <p className="text-xs text-slate-400">Usa las credenciales de prueba para testing. Desactiva para produccion.</p>
          </div>
        </div>

        <button
          type="submit"
          disabled={saving || !publicKey}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-semibold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" />Guardando...</>
          ) : (
            <><Shield className="w-4 h-4" />Guardar Credenciales</>
          )}
        </button>
      </form>

      {/* Help section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Como obtener las credenciales</h3>
        <ol className="space-y-2 text-sm text-slate-600">
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">1</span>
            Inicia sesion en tu cuenta de MercadoPago
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">2</span>
            Ve a &quot;Tu negocio&quot; → &quot;Configuracion&quot; → &quot;Credenciales&quot;
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">3</span>
            Copia la Public Key y el Access Token (de Produccion o Test)
          </li>
          <li className="flex gap-2">
            <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">4</span>
            Para webhooks, configura la URL: <code className="bg-white px-2 py-0.5 rounded text-xs border border-slate-200">https://tu-dominio.com/api/mercadopago/webhook</code>
          </li>
        </ol>
        <a
          href="https://www.mercadopago.com.mx/developers/panel/app"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Ir al panel de MercadoPago
        </a>
      </div>
    </div>
  )
}
