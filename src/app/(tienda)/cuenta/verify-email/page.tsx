"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, Loader2, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Enlace invalido. Token no encontrado.");
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message);
        } else {
          setStatus("error");
          setMessage(data.error || "Error al verificar email");
        }
      })
      .catch(() => {
        setStatus("error");
        setMessage("Error de conexion");
      });
  }, [token]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 p-8 text-center">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-blue-600 animate-spin mx-auto mb-4" />
            <h1 className="text-xl font-bold text-slate-800">Verificando email...</h1>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check size={28} className="text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Email Verificado</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors text-sm"
            >
              Ir a Mi Cuenta <ArrowRight size={16} />
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={28} className="text-red-600" />
            </div>
            <h1 className="text-xl font-bold text-slate-800 mb-2">Error de Verificacion</h1>
            <p className="text-slate-500 text-sm mb-6">{message}</p>
            <Link
              href="/cuenta"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Volver a Mi Cuenta <ArrowRight size={16} />
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
