"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";

interface ImageZoomProps {
  src: string;
  alt: string;
  zoomScale?: number;
}

export default function ImageZoom({ src, alt, zoomScale = 2.5 }: ImageZoomProps) {
  const [isZooming, setIsZooming] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setOrigin(`${x}% ${y}%`);
    },
    []
  );

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden cursor-crosshair"
      onMouseEnter={() => setIsZooming(true)}
      onMouseLeave={() => setIsZooming(false)}
      onMouseMove={handleMouseMove}
    >
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        className="object-contain transition-transform duration-100 ease-out"
        sizes="(max-width: 1024px) 100vw, 50vw"
        style={{
          transform: isZooming ? `scale(${zoomScale})` : "scale(1)",
          transformOrigin: origin,
        }}
        priority
      />
    </div>
  );
}
