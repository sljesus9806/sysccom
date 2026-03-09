"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import DOMPurify from "dompurify";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart,
  Star,
  Minus,
  Plus,
  Truck,
  Shield,
  ArrowLeft,
  Package,
  Check,
  X,
} from "lucide-react";
import { formatPrice, formatDiscount } from "@/lib/format";
import { useCartStore } from "@/store/cart";
import ProductCard from "@/components/ProductCard";
import ReviewSection from "@/components/ReviewSection";
import ImageZoom from "@/components/ImageZoom";
import type { Product } from "@/types";

export default function ProductoPage() {
  const params = useParams();
  const addItem = useCartStore((s) => s.addItem);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const id = params.id as string;

    Promise.all([
      fetch(`/api/products/${id}`).then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      }),
      fetch("/api/products").then((res) => res.json()),
    ])
      .then(([prod, allProducts]: [Product, Product[]]) => {
        setProduct(prod);
        setRelatedProducts(
          allProducts
            .filter((p: Product) => p.category === prod.category && p.id !== prod.id)
            .slice(0, 4)
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Cargando...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Producto no encontrado
        </h1>
        <Link
          href="/productos"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-blue-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <Link
              href="/productos"
              className="hover:text-blue-600 transition-colors"
            >
              Productos
            </Link>
            <span>/</span>
            <Link
              href={`/productos?category=${product.category}`}
              className="hover:text-blue-600 transition-colors capitalize"
            >
              {product.category}
            </Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">
              {product.name}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-10">
        <Link
          href="/productos"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al catálogo
        </Link>

        {/* Product detail */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
            {/* Image section */}
            <div className="lg:border-r border-gray-100">
              <div className="flex flex-col-reverse lg:flex-row">
                {/* Thumbnail strip: horizontal on mobile, vertical on desktop */}
                {product.images.length > 1 && (
                  <div className="flex lg:flex-col gap-2 p-3 lg:p-4 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden lg:max-h-[500px] lg:w-24 shrink-0 border-t lg:border-t-0 lg:border-r border-gray-100">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImage(idx)}
                        className={`relative w-16 h-16 lg:w-full lg:h-16 rounded-lg border-2 overflow-hidden shrink-0 transition-all ${
                          selectedImage === idx
                            ? "border-blue-600 ring-1 ring-blue-600/30"
                            : "border-gray-200 hover:border-gray-400"
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${product.name} ${idx + 1}`}
                          fill
                          className="object-contain p-1"
                          sizes="64px"
                        />
                      </button>
                    ))}
                  </div>
                )}

                {/* Main image */}
                <div
                  className="relative aspect-square bg-gray-50 flex-1 min-w-0"
                  onClick={() => setShowImageModal(true)}
                >
                  {/* Desktop: zoom on hover */}
                  <div className="hidden lg:block w-full h-full">
                    <ImageZoom
                      src={product.images[selectedImage]}
                      alt={product.name}
                    />
                  </div>
                  {/* Mobile: tap to open modal */}
                  <div className="lg:hidden w-full h-full relative cursor-zoom-in">
                    <Image
                      src={product.images[selectedImage]}
                      alt={product.name}
                      fill
                      unoptimized
                      className="object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
                    {product.discount && (
                      <span className="bg-red-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                        {formatDiscount(product.discount)}
                      </span>
                    )}
                    {product.isNew && (
                      <span className="bg-green-500 text-white text-sm font-bold px-3 py-1.5 rounded-lg">
                        Nuevo
                      </span>
                    )}
                  </div>
                  {/* Image counter indicator */}
                  {product.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-medium px-2.5 py-1 rounded-full pointer-events-none">
                      {selectedImage + 1} / {product.images.length}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Info section */}
            <div className="p-6 lg:p-10">
              <div className="mb-2">
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  {product.brand}
                </span>
                <span className="text-xs text-gray-400 ml-3">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-6">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-200"
                      }
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating} ({product.reviewCount} opiniones)
                </span>
              </div>

              {/* Price */}
              <div className="mb-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex items-end gap-3">
                  <span className="text-3xl font-black text-blue-900">
                    {formatPrice(product.price)}
                  </span>
                  {product.discount && product.originalPrice && (
                    <span className="text-lg text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  )}
                </div>
                {product.discount && product.originalPrice && (
                  <p className="text-sm text-green-600 font-medium mt-1">
                    Ahorras{" "}
                    {formatPrice(product.originalPrice - product.price)}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">IVA incluido</p>
              </div>

              {/* Description - show plain text inline, or a short extract for HTML descriptions */}
              {/<[a-z][\s\S]*>/i.test(product.description) ? (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {product.description
                    .replace(/<[^>]*>/g, " ")
                    .replace(/\s+/g, " ")
                    .trim()
                    .slice(0, 200)}
                  {product.description.replace(/<[^>]*>/g, "").length > 200
                    ? "..."
                    : ""}
                </p>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed mb-6">
                  {product.description}
                </p>
              )}

              {/* Stock */}
              <div className="flex items-center gap-2 mb-6">
                {product.stock > 0 ? (
                  <>
                    <Check size={16} className="text-green-500" />
                    <span className="text-sm font-medium text-green-600">
                      En stock ({product.stock} disponibles)
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-red-500">
                    Agotado
                  </span>
                )}
                <span className="text-xs text-gray-400 ml-2">
                  Proveedor: {product.supplier.toUpperCase()}
                </span>
              </div>

              {/* Quantity and add to cart */}
              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-6 py-3 font-semibold text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-3 hover:bg-gray-50 transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 flex items-center justify-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition-all active:scale-[0.98] ${
                    addedToCart
                      ? "bg-green-500 text-white"
                      : product.stock > 0
                        ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/30"
                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {addedToCart ? (
                    <>
                      <Check size={18} />
                      Agregado al Carrito
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={18} />
                      Agregar al Carrito
                    </>
                  )}
                </button>
              </div>

              {/* Features */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Truck size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Envío a todo México
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Shield size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Garantía oficial
                  </span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Package size={16} className="text-blue-600 shrink-0" />
                  <span className="text-xs text-gray-600">
                    Producto original
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Specs table */}
          {Object.keys(product.specs).length > 0 && (
            <div className="border-t border-gray-100 p-6 lg:p-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Especificaciones Técnicas
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
                {Object.entries(product.specs).map(([key, value]) => (
                  <div
                    key={key}
                    className="flex justify-between py-3 border-b border-gray-100"
                  >
                    <span className="text-sm text-gray-500 font-medium">
                      {key}
                    </span>
                    <span className="text-sm text-gray-900 font-semibold text-right">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rich description section (full width, for HTML content with videos/images) */}
          {/<[a-z][\s\S]*>/i.test(product.description) && (
            <div className="border-t border-gray-100 p-6 lg:p-10">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Descripción del Producto
              </h2>
              <div
                className="product-description"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(product.description, {
                    ADD_TAGS: ["iframe"],
                    ADD_ATTR: [
                      "allowfullscreen",
                      "frameborder",
                      "target",
                      "style",
                      "src",
                      "alt",
                      "href",
                    ],
                  }),
                }}
              />
            </div>
          )}

          {/* Reviews section */}
          <ReviewSection
            productId={product.id}
            productName={product.name}
            rating={product.rating}
            reviewCount={product.reviewCount}
          />
        </div>

        {/* Related products */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Productos Relacionados
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
      {/* Image zoom modal */}
      {showImageModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            onClick={() => setShowImageModal(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
          >
            <X size={28} />
          </button>
          <div
            className="relative w-full max-w-4xl aspect-square"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={product.images[selectedImage]}
              alt={product.name}
              fill
              unoptimized
              className="object-contain"
              sizes="100vw"
              quality={100}
            />
          </div>
          {/* Modal thumbnails */}
          {product.images.length > 1 && (
            <div
              className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`relative w-14 h-14 rounded-lg border-2 overflow-hidden shrink-0 transition-colors ${
                    selectedImage === idx
                      ? "border-white"
                      : "border-white/30 hover:border-white/60"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
