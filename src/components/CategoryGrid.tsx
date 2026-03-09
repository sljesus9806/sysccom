"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Camera,
  Network,
  Cable,
  Radio,
  Server,
  Phone,
  Fingerprint,
  ShieldAlert,
} from "lucide-react";
import type { Category } from "@/types";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Camera,
  Network,
  Cable,
  Radio,
  Server,
  Phone,
  Fingerprint,
  ShieldAlert,
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data: Category[]) => setCategories(data))
      .catch(() => {});
  }, []);

  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-3">
            Nuestras Categorías
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Encuentra todo lo que necesitas en telecomunicaciones y seguridad
            electrónica
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon];
            return (
              <Link
                key={category.id}
                href={`/productos?category=${category.slug}`}
                className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300"
              >
                <div className="relative h-32 lg:h-40 overflow-hidden">
                  <Image
                    src={category.image}
                    alt={category.name}
                    fill
                    unoptimized
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-blue-900/20 group-hover:from-blue-900/90" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    {Icon && (
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Icon size={24} className="text-white" />
                      </div>
                    )}
                    <h3 className="text-sm lg:text-base font-bold text-white leading-snug">
                      {category.name}
                    </h3>
                    <p className="text-xs text-blue-200 mt-1">
                      {category.productCount} productos
                    </p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
