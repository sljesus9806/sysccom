"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, Check, Shield } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (res.ok) {
        setSent(true);
      } else {
        setError(data.error || "Error al enviar el correo");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Correo Enviado</h1>
            <p className="text-slate-400 text-sm mb-6">
              Si {email} esta registrado, recibiras un enlace para restablecer tu contrasena.
              Revisa tu bandeja de entrada y spam.
            </p>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              <ArrowLeft size={16} />
              Volver a Iniciar Sesion
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4">
            <Image src="/logo.svg" alt="SYSCCOM" width={56} height={56} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Recuperar Contrasena</h1>
          <p className="text-slate-400 text-sm mt-2">
            Ingresa tu email y te enviaremos un enlace de recuperacion
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Email *</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {isSubmitting ? "Enviando..." : "Enviar Enlace de Recuperacion"}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600"
            >
              <ArrowLeft size={14} />
              Volver a Iniciar Sesion
            </Link>
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
          <Shield size={12} />
          <span>Conexion segura</span>
        </div>
      </div>
    </div>
  );
}
