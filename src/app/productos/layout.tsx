import { Suspense } from "react";

export default function ProductosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>{children}</Suspense>;
}
