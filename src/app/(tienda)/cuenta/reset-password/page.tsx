"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Eye, EyeOff, Check, ArrowRight, Shield } from "lucide-react";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [mounted, setMounted] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  if (!token) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <p className="text-slate-500">Enlace invalido. Solicita un nuevo enlace de recuperacion.</p>
        <Link href="/cuenta" className="mt-4 text-blue-600 hover:text-blue-700 font-medium text-sm">
          Volver a Iniciar Sesion
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contrasenas no coinciden");
      return;
    }
    if (password.length < 8) {
      setError("La contrasena debe tener al menos 8 caracteres");
      return;
    }
    if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      setError("La contrasena debe incluir al menos una mayuscula y un numero");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        setError(data.error || "Error al restablecer la contrasena");
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="bg-white rounded-2xl border border-slate-200 p-8">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Contrasena Actualizada</h1>
            <p className="text-slate-400 text-sm mb-6">Tu contrasena ha sido restablecida exitosamente.</p>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Iniciar Sesion <ArrowRight size={16} />
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
          <h1 className="text-2xl font-bold text-slate-800">Nueva Contrasena</h1>
          <p className="text-slate-400 text-sm mt-2">Ingresa tu nueva contrasena</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Nueva Contrasena *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="Min 8 caracteres, 1 mayuscula, 1 numero"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Confirmar Contrasena *</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="Repite tu contrasena"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {isSubmitting ? "Guardando..." : "Guardar Nueva Contrasena"}
            </button>
          </form>
        </div>

        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
          <Shield size={12} />
          <span>Conexion segura</span>
        </div>
      </div>
    </div>
  );
}
