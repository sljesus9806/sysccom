import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "SYSCCOM Integradores | Telecomunicaciones y Tecnología",
  description:
    "Tienda en línea de equipos de telecomunicaciones, videovigilancia, redes, cableado estructurado, antenas y servidores. Distribuidores autorizados con envío a toda la República Mexicana.",
  keywords:
    "telecomunicaciones, cámaras de seguridad, redes, cableado estructurado, antenas, servidores, CCTV, videovigilancia, control de acceso, sysccom",
  openGraph: {
    title: "SYSCCOM Integradores | Telecomunicaciones y Tecnología",
    description:
      "Equipos de telecomunicaciones y seguridad electrónica. Distribuidores autorizados.",
    type: "website",
    locale: "es_MX",
    siteName: "SYSCCOM Integradores",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="bg-white text-gray-900 antialiased">
        <Navbar />
        <main className="min-h-screen pt-[104px] lg:pt-[148px]">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
