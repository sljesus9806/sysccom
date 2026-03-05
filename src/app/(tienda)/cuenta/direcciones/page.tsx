"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Edit3,
  Trash2,
  Star,
  ArrowLeft,
  X,
  Home,
  Building2,
  Briefcase,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface Address {
  id: string;
  label: string;
  street: string;
  colony: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const ESTADOS = [
  "Aguascalientes","Baja California","Baja California Sur","Campeche","Chiapas","Chihuahua",
  "Ciudad de Mexico","Coahuila","Colima","Durango","Estado de Mexico","Guanajuato","Guerrero",
  "Hidalgo","Jalisco","Michoacan","Morelos","Nayarit","Nuevo Leon","Oaxaca","Puebla",
  "Queretaro","Quintana Roo","San Luis Potosi","Sinaloa","Sonora","Tabasco","Tamaulipas",
  "Tlaxcala","Veracruz","Yucatan","Zacatecas",
];

const LABEL_OPTIONS = [
  { value: "Casa", icon: Home },
  { value: "Oficina", icon: Building2 },
  { value: "Trabajo", icon: Briefcase },
];

const emptyForm = {
  label: "Casa",
  street: "",
  colony: "",
  city: "",
  state: "",
  postalCode: "",
  isDefault: false,
};

export default function DireccionesPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch("/api/auth/addresses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (mounted && token) fetchAddresses();
  }, [mounted, token, fetchAddresses]);

  if (!mounted) return null;

  if (!user || !token) {
    router.push("/cuenta");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const method = editingId ? "PUT" : "POST";
      const body = editingId ? { id: editingId, ...form } : form;

      const res = await fetch("/api/auth/addresses", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(editingId ? "Direccion actualizada" : "Direccion agregada");
        setTimeout(() => setSuccess(""), 3000);
        setShowForm(false);
        setEditingId(null);
        setForm(emptyForm);
        fetchAddresses();
      } else {
        setError(data.error);
      }
    } catch {
      setError("Error de conexion");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      street: addr.street,
      colony: addr.colony,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      isDefault: addr.isDefault,
    });
    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Eliminar esta direccion?")) return;
    try {
      const res = await fetch(`/api/auth/addresses?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setSuccess("Direccion eliminada");
        setTimeout(() => setSuccess(""), 3000);
        fetchAddresses();
      } else {
        const data = await res.json();
        setError(data.error);
      }
    } catch {
      setError("Error al eliminar");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await fetch("/api/auth/addresses", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id, isDefault: true }),
      });
      fetchAddresses();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/cuenta"
            className="p-2 hover:bg-white rounded-lg transition-colors text-slate-400"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-slate-800">Mis Direcciones</h1>
            <p className="text-sm text-slate-400">
              Administra tus direcciones de envio
            </p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingId(null);
              setForm(emptyForm);
              setError("");
            }}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
          >
            <Plus size={16} />
            Agregar
          </button>
        </div>

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded-xl text-sm text-green-700">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Form modal */}
        {showForm && (
          <div className="mb-6 bg-white rounded-2xl border border-slate-200 p-6 animate-fade-in-up">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingId ? "Editar Direccion" : "Nueva Direccion"}
              </h2>
              <button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">
                  Tipo de direccion
                </label>
                <div className="flex gap-2">
                  {LABEL_OPTIONS.map(({ value, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setForm({ ...form, label: value })}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.label === value
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      <Icon size={14} />
                      {value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">
                  Calle y numero *
                </label>
                <input
                  type="text"
                  value={form.street}
                  onChange={(e) => setForm({ ...form, street: e.target.value })}
                  required
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                  placeholder="Av. Tecnologico #1234"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Colonia *
                  </label>
                  <input
                    type="text"
                    value={form.colony}
                    onChange={(e) => setForm({ ...form, colony: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    placeholder="Centro"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Codigo Postal *
                  </label>
                  <input
                    type="text"
                    value={form.postalCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 5);
                      setForm({ ...form, postalCode: val });
                    }}
                    required
                    maxLength={5}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    placeholder="31000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Ciudad *
                  </label>
                  <input
                    type="text"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none"
                    placeholder="Chihuahua"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">
                    Estado *
                  </label>
                  <select
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none bg-white"
                  >
                    <option value="">Seleccionar...</option>
                    {ESTADOS.map((e) => (
                      <option key={e} value={e}>
                        {e}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={(e) =>
                    setForm({ ...form, isDefault: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-slate-600">
                  Usar como direccion predeterminada
                </span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  {saving ? "Guardando..." : editingId ? "Actualizar" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Address list */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200 border-t-blue-600" />
          </div>
        ) : addresses.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
            <MapPin size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">
              No tienes direcciones guardadas
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Agrega una para agilizar tus compras
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`bg-white rounded-xl border p-4 transition-colors ${
                  addr.isDefault
                    ? "border-blue-200 bg-blue-50/30"
                    : "border-slate-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                      addr.isDefault
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <MapPin size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-slate-800">
                        {addr.label}
                      </span>
                      {addr.isDefault && (
                        <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                          Predeterminada
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500">
                      {addr.street}, {addr.colony}
                    </p>
                    <p className="text-sm text-slate-400">
                      {addr.city}, {addr.state} C.P. {addr.postalCode}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="p-2 hover:bg-amber-50 rounded-lg text-slate-400 hover:text-amber-500 transition-colors"
                        title="Hacer predeterminada"
                      >
                        <Star size={15} />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                      title="Editar"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
