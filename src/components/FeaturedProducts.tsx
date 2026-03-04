"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "./ProductCard";
import { getFeaturedProducts } from "@/lib/mock-data";

export default function FeaturedProducts() {
  const featured = getFeaturedProducts();

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              Productos Destacados
            </h2>
            <p className="text-gray-500">
              Los mejores productos seleccionados para tu proyecto
            </p>
          </div>
          <Link
            href="/productos"
            className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Ver todos
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {featured.slice(0, 8).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="md:hidden mt-8 text-center">
          <Link
            href="/productos"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600"
          >
            Ver todos los productos
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
