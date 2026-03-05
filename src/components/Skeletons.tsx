export function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden flex flex-col animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-4 flex flex-col flex-1">
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-4 bg-gray-200 rounded w-full mb-1" />
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
          <div className="flex gap-0.5 mb-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-gray-200 rounded-full" />
            ))}
          </div>
        </div>
        <div className="flex items-end justify-between gap-2 pt-2 border-t border-gray-50">
          <div>
            <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-9 bg-gray-200 rounded-xl w-20" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
