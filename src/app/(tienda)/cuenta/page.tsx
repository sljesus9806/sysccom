"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  FileText,
  Eye,
  EyeOff,
  ArrowRight,
  Package,
  MapPin,
  LogOut,
  ChevronRight,
  ShoppingBag,
  Settings,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

type AuthMode = "login" | "register";

export default function CuentaPage() {
  const router = useRouter();
  const { user, token, setAuth, logout } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [rfc, setRfc] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // If logged in, show account dashboard
  if (user && token) {
    return <AccountDashboard />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    if (mode === "register" && password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      setIsSubmitting(false);
      return;
    }

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email, password }
          : { email, password, firstName, lastName, phone, company, rfc };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en la operación");
        setIsSubmitting(false);
        return;
      }

      setAuth(data.user, data.token);

      if (mode === "register") {
        setSuccess("Cuenta creada exitosamente");
      }
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setCompany("");
    setRfc("");
    setError("");
    setSuccess("");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-16">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {mode === "login"
              ? "Accede a tu cuenta para ver tus pedidos y más"
              : "Regístrate para comprar y rastrear tus pedidos"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre *
                    </label>
                    <div className="relative">
                      <User
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                        placeholder="Juan"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Pérez"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña *
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="Mínimo 6 caracteres"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Contraseña *
                  </label>
                  <div className="relative">
                    <Lock
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Repite tu contraseña"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="(614) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Nombre de tu empresa (opcional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    RFC
                  </label>
                  <div className="relative">
                    <FileText
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                      type="text"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      maxLength={13}
                      className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Para facturación (opcional)"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 text-center">
            <p className="text-sm text-gray-500">
              {mode === "login" ? (
                <>
                  ¿No tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Regístrate aquí
                  </button>
                </>
              ) : (
                <>
                  ¿Ya tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Inicia sesión
                  </button>
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AccountDashboard() {
  const { user, token, logout, setAuth } = useAuthStore();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    company: user?.company || "",
    rfc: user?.rfc || "",
  });
  const [message, setMessage] = useState("");

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch {
      // Ignore
    }
    logout();
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (res.ok) {
        setAuth(data.user, token!);
        setIsEditing(false);
        setMessage("Perfil actualizado exitosamente");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mi Cuenta</h1>
            <p className="text-gray-500 text-sm mt-1">
              Bienvenido, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 bg-red-50 hover:bg-red-100 rounded-xl transition-colors"
          >
            <LogOut size={16} />
            Cerrar Sesión
          </button>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-600">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quick links */}
          <div className="lg:col-span-1 space-y-3">
            <Link
              href="/cuenta/pedidos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Package size={20} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Mis Pedidos</p>
                <p className="text-xs text-gray-500">Historial y rastreo</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <Link
              href="/productos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group"
            >
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <ShoppingBag size={20} className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Seguir Comprando</p>
                <p className="text-xs text-gray-500">Explorar catálogo</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </Link>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all group w-full text-left"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <Settings size={20} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 text-sm">Editar Perfil</p>
                <p className="text-xs text-gray-500">Datos personales</p>
              </div>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Profile info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <User size={20} className="text-blue-600" />
                {isEditing ? "Editar Perfil" : "Información Personal"}
              </h2>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({ ...editData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={editData.company}
                      onChange={(e) =>
                        setEditData({ ...editData, company: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      RFC
                    </label>
                    <input
                      type="text"
                      value={editData.rfc}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          rfc: e.target.value.toUpperCase(),
                        })
                      }
                      maxLength={13}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoItem
                      icon={<User size={16} />}
                      label="Nombre"
                      value={`${user?.firstName} ${user?.lastName}`}
                    />
                    <InfoItem
                      icon={<Mail size={16} />}
                      label="Email"
                      value={user?.email || ""}
                    />
                    <InfoItem
                      icon={<Phone size={16} />}
                      label="Teléfono"
                      value={user?.phone || "No registrado"}
                    />
                    <InfoItem
                      icon={<Building2 size={16} />}
                      label="Empresa"
                      value={user?.company || "No registrada"}
                    />
                    <InfoItem
                      icon={<FileText size={16} />}
                      label="RFC"
                      value={user?.rfc || "No registrado"}
                    />
                    <InfoItem
                      icon={<MapPin size={16} />}
                      label="Miembro desde"
                      value={
                        user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("es-MX", {
                              year: "numeric",
                              month: "long",
                            })
                          : ""
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <div className="text-gray-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}
