"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
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
  Shield,
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

    if (mode === "register") {
      if (password !== confirmPassword) {
        setError("Las contrasenas no coinciden");
        setIsSubmitting(false);
        return;
      }
      if (password.length < 8) {
        setError("La contrasena debe tener al menos 8 caracteres");
        setIsSubmitting(false);
        return;
      }
      if (!/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
        setError("La contrasena debe incluir al menos una mayuscula y un numero");
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
      const body =
        mode === "login"
          ? { email: email.trim().toLowerCase(), password }
          : {
              email: email.trim().toLowerCase(),
              password,
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone.trim() || undefined,
              company: company.trim() || undefined,
              rfc: rfc.trim() || undefined,
            };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en la operacion");
        setIsSubmitting(false);
        return;
      }

      setAuth(data.user, data.token);

      if (mode === "register") {
        setSuccess("Cuenta creada exitosamente. Te enviamos un correo de confirmacion.");
      }
    } catch {
      setError("Error de conexion. Intenta de nuevo.");
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
    <div className="min-h-screen bg-slate-50 py-8 lg:py-16">
      <div className="max-w-md mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto mb-4">
            <Image src="/logo.svg" alt="SYSCCOM" width={56} height={56} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">
            {mode === "login" ? "Iniciar Sesion" : "Crear Cuenta"}
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {mode === "login"
              ? "Accede a tu cuenta para ver tus pedidos y mas"
              : "Registrate para comprar y rastrear tus pedidos"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Nombre *
                  </label>
                  <div className="relative">
                    <User
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      autoComplete="given-name"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Juan"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    autoComplete="family-name"
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    placeholder="Perez"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Email *
              </label>
              <div className="relative">
                <Mail
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
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

            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Contrasena *
              </label>
              <div className="relative">
                <Lock
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={mode === "register" ? 8 : 6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  className="w-full pl-9 pr-10 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder={mode === "register" ? "Min 8 caracteres, 1 mayuscula, 1 numero" : "Tu contrasena"}
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

            {mode === "register" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Confirmar Contrasena *
                  </label>
                  <div className="relative">
                    <Lock
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={8}
                      autoComplete="new-password"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Repite tu contrasena"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Telefono
                  </label>
                  <div className="relative">
                    <Phone
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      autoComplete="tel"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="(614) 123-4567"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Empresa
                  </label>
                  <div className="relative">
                    <Building2
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      autoComplete="organization"
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Nombre de tu empresa (opcional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    RFC
                  </label>
                  <div className="relative">
                    <FileText
                      size={15}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="text"
                      value={rfc}
                      onChange={(e) => setRfc(e.target.value.toUpperCase())}
                      maxLength={13}
                      className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                      placeholder="Para facturacion (opcional)"
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
                  {mode === "login" ? "Iniciar Sesion" : "Crear Cuenta"}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-sm text-slate-400">
              {mode === "login" ? (
                <>
                  <Link
                    href="/cuenta/forgot-password"
                    className="text-blue-600 hover:text-blue-800 font-medium text-xs block mb-3"
                  >
                    Olvidaste tu contrasena?
                  </Link>
                  No tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("register");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Registrate aqui
                  </button>
                </>
              ) : (
                <>
                  Ya tienes cuenta?{" "}
                  <button
                    onClick={() => {
                      setMode("login");
                      resetForm();
                    }}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Inicia sesion
                  </button>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-slate-400">
          <Shield size={12} />
          <span>Conexion segura. Tus datos estan protegidos.</span>
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
        setMessage("Perfil actualizado");
        setTimeout(() => setMessage(""), 3000);
      }
    } catch {
      setMessage("Error al guardar");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Mi Cuenta</h1>
            <p className="text-slate-400 text-sm mt-0.5">
              Bienvenido, {user?.firstName} {user?.lastName}
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 font-medium px-4 py-2 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={15} />
            Cerrar Sesion
          </button>
        </div>

        {message && (
          <div className="mb-6 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Quick links */}
          <div className="lg:col-span-1 space-y-2.5">
            <Link
              href="/cuenta/pedidos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Package size={18} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-700 text-sm">Mis Pedidos</p>
                <p className="text-xs text-slate-400">Historial y rastreo</p>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </Link>

            <Link
              href="/cuenta/direcciones"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-9 h-9 bg-emerald-50 rounded-lg flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <MapPin size={18} className="text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-700 text-sm">Mis Direcciones</p>
                <p className="text-xs text-slate-400">Direcciones de envio</p>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </Link>

            <Link
              href="/productos"
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group"
            >
              <div className="w-9 h-9 bg-amber-50 rounded-lg flex items-center justify-center group-hover:bg-amber-100 transition-colors">
                <ShoppingBag size={18} className="text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-700 text-sm">Seguir Comprando</p>
                <p className="text-xs text-slate-400">Explorar catalogo</p>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </Link>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 transition-all group w-full text-left"
            >
              <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center group-hover:bg-violet-100 transition-colors">
                <Settings size={18} className="text-violet-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-slate-700 text-sm">Editar Perfil</p>
                <p className="text-xs text-slate-400">Datos personales</p>
              </div>
              <ChevronRight size={15} className="text-slate-300" />
            </button>
          </div>

          {/* Profile info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-base font-semibold text-slate-800 mb-5 flex items-center gap-2">
                <User size={18} className="text-blue-600" />
                {isEditing ? "Editar Perfil" : "Informacion Personal"}
              </h2>

              {isEditing ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={editData.firstName}
                        onChange={(e) =>
                          setEditData({ ...editData, firstName: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">
                        Apellido
                      </label>
                      <input
                        type="text"
                        value={editData.lastName}
                        onChange={(e) =>
                          setEditData({ ...editData, lastName: e.target.value })
                        }
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Telefono
                    </label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
                      Empresa
                    </label>
                    <input
                      type="text"
                      value={editData.company}
                      onChange={(e) =>
                        setEditData({ ...editData, company: e.target.value })
                      }
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">
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
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none"
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      {isSaving ? "Guardando..." : "Guardar Cambios"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <InfoItem
                    icon={<User size={15} />}
                    label="Nombre"
                    value={`${user?.firstName} ${user?.lastName}`}
                  />
                  <InfoItem
                    icon={<Mail size={15} />}
                    label="Email"
                    value={user?.email || ""}
                  />
                  <InfoItem
                    icon={<Phone size={15} />}
                    label="Telefono"
                    value={user?.phone || "No registrado"}
                  />
                  <InfoItem
                    icon={<Building2 size={15} />}
                    label="Empresa"
                    value={user?.company || "No registrada"}
                  />
                  <InfoItem
                    icon={<FileText size={15} />}
                    label="RFC"
                    value={user?.rfc || "No registrado"}
                  />
                  <InfoItem
                    icon={<MapPin size={15} />}
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
    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
      <div className="text-slate-400 mt-0.5">{icon}</div>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value}</p>
      </div>
    </div>
  );
}
