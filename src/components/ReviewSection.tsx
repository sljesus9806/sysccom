"use client";

import { useState } from "react";
import {
  Star,
  ThumbsUp,
  MessageSquare,
  User,
  ChevronDown,
} from "lucide-react";
import { useAuthStore } from "@/store/auth";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    firstName: string;
    lastName: string;
  };
  helpful: number;
}

interface ReviewSectionProps {
  productId: string;
  productName: string;
  rating: number;
  reviewCount: number;
}

// Demo reviews for display
const demoReviews: Review[] = [
  {
    id: "r1",
    rating: 5,
    comment:
      "Excelente producto, la calidad de imagen es impresionante. La instalación fue muy sencilla y la visión nocturna funciona perfectamente. Totalmente recomendado para cualquier proyecto de videovigilancia.",
    createdAt: "2026-02-15T10:00:00Z",
    user: { firstName: "Carlos", lastName: "Mendoza" },
    helpful: 12,
  },
  {
    id: "r2",
    rating: 4,
    comment:
      "Buen producto, cumple con lo prometido. La única observación es que el manual podría ser más detallado, pero por lo demás todo perfecto. El envío fue rápido.",
    createdAt: "2026-02-10T14:30:00Z",
    user: { firstName: "María", lastName: "González" },
    helpful: 8,
  },
  {
    id: "r3",
    rating: 5,
    comment:
      "Ya es el tercer equipo que compro de esta marca y nunca me ha fallado. El soporte de SYSCCOM fue muy profesional al ayudarme con la configuración.",
    createdAt: "2026-01-28T09:15:00Z",
    user: { firstName: "Roberto", lastName: "Sánchez" },
    helpful: 15,
  },
  {
    id: "r4",
    rating: 3,
    comment:
      "El producto está bien, funciona correctamente. Sin embargo, esperaba un poco más de calidad en los acabados del gabinete. La relación calidad-precio es aceptable.",
    createdAt: "2026-01-20T16:45:00Z",
    user: { firstName: "Ana", lastName: "López" },
    helpful: 3,
  },
  {
    id: "r5",
    rating: 5,
    comment:
      "Increíble rendimiento. Lo uso en un proyecto empresarial y el cliente quedó muy satisfecho. Compatible con todos los sistemas que probamos.",
    createdAt: "2026-01-15T11:20:00Z",
    user: { firstName: "Luis", lastName: "Ramírez" },
    helpful: 20,
  },
];

export default function ReviewSection({
  productId,
  productName,
  rating,
  reviewCount,
}: ReviewSectionProps) {
  const { user, token } = useAuthStore();
  const [reviews] = useState<Review[]>(demoReviews);
  const [showForm, setShowForm] = useState(false);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [filterRating, setFilterRating] = useState(0);
  const [sortBy, setSortBy] = useState("newest");
  const [showAll, setShowAll] = useState(false);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<string>>(new Set());

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage:
      reviews.length > 0
        ? (reviews.filter((r) => r.rating === star).length / reviews.length) *
          100
        : 0,
  }));

  // Filter and sort reviews
  const filteredReviews = reviews
    .filter((r) => (filterRating > 0 ? r.rating === filterRating : true))
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sortBy === "highest") return b.rating - a.rating;
      if (sortBy === "lowest") return a.rating - b.rating;
      if (sortBy === "helpful") return b.helpful - a.helpful;
      return 0;
    });

  const displayedReviews = showAll
    ? filteredReviews
    : filteredReviews.slice(0, 3);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newRating === 0) {
      setSubmitMessage("Selecciona una calificación");
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment }),
      });

      if (res.ok) {
        setSubmitMessage("Reseña publicada exitosamente");
        setShowForm(false);
        setNewRating(0);
        setComment("");
      } else {
        const data = await res.json();
        setSubmitMessage(data.error || "Error al publicar reseña");
      }
    } catch {
      setSubmitMessage("Error de conexión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleHelpful = (reviewId: string) => {
    setHelpfulClicked((prev) => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  return (
    <div className="border-t border-gray-100 p-6 lg:p-10">
      <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <MessageSquare size={22} className="text-blue-600" />
        Opiniones y Valoraciones
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Rating summary */}
        <div className="lg:col-span-1">
          <div className="bg-gray-50 rounded-xl p-6 text-center">
            <div className="text-4xl font-black text-gray-900 mb-1">
              {rating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-0.5 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={18}
                  className={
                    i < Math.floor(rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-200"
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-500">
              {reviewCount} opiniones
            </p>

            {/* Rating bars */}
            <div className="mt-4 space-y-2">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <button
                  key={star}
                  onClick={() =>
                    setFilterRating(filterRating === star ? 0 : star)
                  }
                  className={`flex items-center gap-2 w-full text-left group ${
                    filterRating === star ? "opacity-100" : "opacity-70 hover:opacity-100"
                  }`}
                >
                  <span className="text-xs text-gray-600 w-3">{star}</span>
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {filterRating > 0 && (
              <button
                onClick={() => setFilterRating(0)}
                className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Mostrar todas
              </button>
            )}
          </div>

          {/* Write review button */}
          <button
            onClick={() => {
              if (!user) {
                window.location.href = "/cuenta";
                return;
              }
              setShowForm(!showForm);
            }}
            className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
          >
            Escribir una Opinión
          </button>
        </div>

        {/* Reviews list */}
        <div className="lg:col-span-2">
          {/* Sort */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {filterRating > 0
                ? `${filteredReviews.length} opiniones de ${filterRating} estrella${filterRating > 1 ? "s" : ""}`
                : `${filteredReviews.length} opiniones`}
            </p>
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-gray-50 border border-gray-200 rounded-lg text-xs pl-3 pr-7 py-1.5 outline-none cursor-pointer"
              >
                <option value="newest">Más recientes</option>
                <option value="highest">Mayor calificación</option>
                <option value="lowest">Menor calificación</option>
                <option value="helpful">Más útiles</option>
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>

          {/* Review form */}
          {showForm && (
            <div className="mb-6 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-sm">
                Tu opinión sobre {productName}
              </h3>

              {submitMessage && (
                <div
                  className={`mb-4 p-3 rounded-lg text-sm ${
                    submitMessage.includes("exitosamente")
                      ? "bg-green-50 text-green-600"
                      : "bg-red-50 text-red-600"
                  }`}
                >
                  {submitMessage}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Calificación *
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setNewRating(star)}
                        className="p-0.5 transition-transform hover:scale-110"
                      >
                        <Star
                          size={28}
                          className={
                            star <= (hoverRating || newRating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                    {newRating > 0 && (
                      <span className="ml-2 text-sm text-gray-500 self-center">
                        {newRating === 1
                          ? "Malo"
                          : newRating === 2
                            ? "Regular"
                            : newRating === 3
                              ? "Bueno"
                              : newRating === 4
                                ? "Muy bueno"
                                : "Excelente"}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comentario
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 outline-none resize-none"
                    placeholder="Comparte tu experiencia con este producto..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    {isSubmitting ? "Publicando..." : "Publicar Opinión"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Reviews */}
          {displayedReviews.length > 0 ? (
            <div className="space-y-4">
              {displayedReviews.map((review) => (
                <div
                  key={review.id}
                  className="p-4 bg-gray-50 rounded-xl"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
                        <User size={16} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {review.user.firstName} {review.user.lastName.charAt(0)}.
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            "es-MX",
                            {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }
                        />
                      ))}
                    </div>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-gray-600 leading-relaxed mb-3 ml-12">
                      {review.comment}
                    </p>
                  )}

                  <div className="ml-12">
                    <button
                      onClick={() => toggleHelpful(review.id)}
                      className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                        helpfulClicked.has(review.id)
                          ? "text-blue-600"
                          : "text-gray-400 hover:text-gray-600"
                      }`}
                    >
                      <ThumbsUp size={13} />
                      Útil ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
                    </button>
                  </div>
                </div>
              ))}

              {filteredReviews.length > 3 && !showAll && (
                <button
                  onClick={() => setShowAll(true)}
                  className="w-full py-3 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-xl transition-colors"
                >
                  Ver todas las opiniones ({filteredReviews.length})
                </button>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <MessageSquare
                size={32}
                className="text-gray-200 mx-auto mb-3"
              />
              <p className="text-sm text-gray-500">
                {filterRating > 0
                  ? "No hay opiniones con esta calificación"
                  : "Aún no hay opiniones. ¡Sé el primero!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
