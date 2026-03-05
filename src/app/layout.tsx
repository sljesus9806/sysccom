import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteUrl = process.env.NEXT_PUBLIC_URL || "https://sysccom.mx";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SYSCCOM Integradores | Telecomunicaciones y Tecnologia",
    template: "%s | SYSCCOM Integradores",
  },
  description:
    "Distribuidor mayorista de tecnologia, telecomunicaciones, CCTV, redes y energia en Mexico. Marcas como Hikvision, Ubiquiti, Epcom y mas.",
  keywords: [
    "telecomunicaciones",
    "CCTV",
    "camaras de seguridad",
    "redes",
    "energia solar",
    "Hikvision",
    "Ubiquiti",
    "Epcom",
    "distribuidor mayorista",
    "tecnologia Mexico",
    "SYSCCOM",
  ],
  authors: [{ name: "SYSCCOM Integradores" }],
  openGraph: {
    type: "website",
    locale: "es_MX",
    url: siteUrl,
    siteName: "SYSCCOM Integradores",
    title: "SYSCCOM Integradores | Telecomunicaciones y Tecnologia",
    description:
      "Distribuidor mayorista de tecnologia, telecomunicaciones, CCTV, redes y energia en Mexico.",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SYSCCOM Integradores",
    description:
      "Distribuidor mayorista de tecnologia, telecomunicaciones, CCTV, redes y energia en Mexico.",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className={`${inter.className} bg-white text-slate-800 antialiased`}>
        {children}
      </body>
    </html>
  );
}
