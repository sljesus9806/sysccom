import type { Product, Category } from "@/types";

export const categories: Category[] = [
  {
    id: "camaras",
    name: "Cámaras de Vigilancia",
    slug: "camaras",
    description: "CCTV, cámaras IP, DVR, NVR y accesorios de videovigilancia",
    icon: "Camera",
    image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    productCount: 156,
  },
  {
    id: "redes",
    name: "Redes y Conectividad",
    slug: "redes",
    description: "Switches, routers, access points y soluciones de networking",
    icon: "Network",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    productCount: 203,
  },
  {
    id: "cableado",
    name: "Cableado Estructurado",
    slug: "cableado",
    description: "Cable UTP, fibra óptica, patch panels, patch cords y herramientas",
    icon: "Cable",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    productCount: 89,
  },
  {
    id: "antenas",
    name: "Antenas y Enlaces",
    slug: "antenas",
    description: "Antenas sectoriales, enlaces punto a punto, torres y accesorios",
    icon: "Radio",
    image: "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=300&fit=crop",
    productCount: 67,
  },
  {
    id: "servidores",
    name: "Servidores y Almacenamiento",
    slug: "servidores",
    description: "Servidores rack, NAS, discos duros y soluciones de almacenamiento",
    icon: "Server",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    productCount: 45,
  },
  {
    id: "telefonia",
    name: "Telefonía IP",
    slug: "telefonia",
    description: "Conmutadores, teléfonos IP, gateways y soluciones VoIP",
    icon: "Phone",
    image: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop",
    productCount: 78,
  },
  {
    id: "control-acceso",
    name: "Control de Acceso",
    slug: "control-acceso",
    description: "Lectores biométricos, cerraduras electrónicas y control de acceso",
    icon: "Fingerprint",
    image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    productCount: 34,
  },
  {
    id: "alarmas",
    name: "Alarmas y Sensores",
    slug: "alarmas",
    description: "Sistemas de alarma, sensores de movimiento, detectores y paneles",
    icon: "ShieldAlert",
    image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop",
    productCount: 52,
  },
];

export const products: Product[] = [
  {
    id: "cam-001",
    name: "Cámara IP Domo 4MP PoE IR 30m",
    description:
      "Cámara de vigilancia tipo domo con resolución 4 Megapíxeles, alimentación PoE, visión nocturna infrarroja hasta 30 metros. Ideal para interiores y exteriores con clasificación IP67.",
    price: 1899,
    originalPrice: 2299,
    images: [
      "https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=600&fit=crop",
    ],
    category: "camaras",
    subcategory: "Cámaras IP",
    brand: "Hikvision",
    sku: "DS-2CD1143G0-I",
    supplier: "syscom",
    stock: 45,
    specs: {
      Resolución: "4 MP (2560 × 1440)",
      "Tipo de lente": "2.8 mm fijo",
      "IR alcance": "30 metros",
      Alimentación: "PoE (802.3af)",
      "Grado IP": "IP67",
      Compresión: "H.265+ / H.264+",
    },
    rating: 4.7,
    reviewCount: 128,
    featured: true,
    discount: 17,
  },
  {
    id: "cam-002",
    name: "Cámara Bullet 2MP Turbo HD IR 40m",
    description:
      "Cámara tipo bullet con resolución Full HD 1080p, tecnología Turbo HD, visión nocturna hasta 40m. Carcasa metálica resistente para exteriores.",
    price: 1299,
    images: [
      "https://images.unsplash.com/photo-1580910051074-3eb694886571?w=600&h=600&fit=crop",
    ],
    category: "camaras",
    subcategory: "Cámaras Turbo HD",
    brand: "Hikvision",
    sku: "DS-2CE16D0T-IT3F",
    supplier: "syscom",
    stock: 78,
    specs: {
      Resolución: "2 MP (1920 × 1080)",
      "Tipo de lente": "3.6 mm fijo",
      "IR alcance": "40 metros",
      Alimentación: "12 VDC",
      "Grado IP": "IP67",
    },
    rating: 4.5,
    reviewCount: 95,
    featured: true,
  },
  {
    id: "cam-003",
    name: "DVR 8 Canales 4MP Turbo HD + 2 IP",
    description:
      "Grabador digital de video de 8 canales compatible con cámaras Turbo HD hasta 4MP y 2 canales IP adicionales. Incluye detección de movimiento inteligente.",
    price: 3450,
    originalPrice: 3999,
    images: [
      "https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=600&fit=crop",
    ],
    category: "camaras",
    subcategory: "DVR / NVR",
    brand: "Hikvision",
    sku: "DS-7208HQHI-K1",
    supplier: "syscom",
    stock: 23,
    specs: {
      Canales: "8 Turbo HD + 2 IP",
      "Resolución grabación": "4MP Lite",
      "Salida video": "HDMI / VGA",
      "Bahías HDD": "1 × SATA (hasta 10TB)",
      Red: "10/100 Mbps",
    },
    rating: 4.8,
    reviewCount: 67,
    featured: true,
    discount: 14,
  },
  {
    id: "red-001",
    name: "Switch PoE+ 24 Puertos Gigabit Administrable",
    description:
      "Switch de capa 2 administrable con 24 puertos Gigabit PoE+ y 4 puertos SFP. Presupuesto PoE de 370W ideal para instalaciones de videovigilancia y telefonía IP.",
    price: 8750,
    images: [
      "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=600&fit=crop",
    ],
    category: "redes",
    subcategory: "Switches",
    brand: "TP-Link",
    sku: "TL-SG3428MP",
    supplier: "abasteo",
    stock: 12,
    specs: {
      Puertos: "24 × GE PoE+ / 4 × SFP",
      "Presupuesto PoE": "370W",
      "Capacidad switching": "56 Gbps",
      Administración: "Web / CLI / SNMP",
      Capa: "L2+",
    },
    rating: 4.6,
    reviewCount: 43,
    featured: true,
    isNew: true,
  },
  {
    id: "red-002",
    name: "Access Point WiFi 6 AX3000 Montaje en Techo",
    description:
      "Punto de acceso empresarial WiFi 6 con velocidades de hasta 3000 Mbps. Diseño elegante para montaje en techo con PoE. Soporta hasta 256 clientes simultáneos.",
    price: 4200,
    originalPrice: 4800,
    images: [
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop",
    ],
    category: "redes",
    subcategory: "Access Points",
    brand: "Ubiquiti",
    sku: "U6-PRO",
    supplier: "syscom",
    stock: 34,
    specs: {
      Estándar: "WiFi 6 (802.11ax)",
      Velocidad: "Hasta 3000 Mbps",
      Bandas: "Dual Band (2.4 GHz + 5 GHz)",
      Alimentación: "PoE+ (802.3at)",
      "Clientes máx.": "256",
    },
    rating: 4.9,
    reviewCount: 89,
    featured: true,
    discount: 13,
  },
  {
    id: "red-003",
    name: "Router Empresarial Balanceo Multi-WAN",
    description:
      "Router VPN empresarial con 5 puertos Gigabit WAN/LAN configurables. Balanceo de carga, failover automático y servidor VPN integrado.",
    price: 3850,
    images: [
      "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop",
    ],
    category: "redes",
    subcategory: "Routers",
    brand: "TP-Link",
    sku: "ER7206",
    supplier: "abasteo",
    stock: 18,
    specs: {
      Puertos: "5 × GE (configurable WAN/LAN)",
      VPN: "IPSec / OpenVPN / L2TP / PPTP",
      Firewall: "SPI + DoS Defense",
      "Usuarios concurrentes": "150",
    },
    rating: 4.4,
    reviewCount: 56,
  },
  {
    id: "cab-001",
    name: "Bobina Cable UTP Cat6 305m Exterior Gel",
    description:
      "Cable UTP categoría 6 para exteriores con relleno de gel para protección contra humedad. 305 metros, conductor de cobre sólido 23 AWG.",
    price: 2650,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop",
    ],
    category: "cableado",
    subcategory: "Cable UTP",
    brand: "Panduit",
    sku: "PUC6004BU-FE",
    supplier: "syscom",
    stock: 50,
    specs: {
      Categoría: "Cat 6",
      Longitud: "305 metros",
      Conductor: "Cobre sólido 23 AWG",
      Uso: "Exterior con gel",
      Certificación: "UL Listed",
    },
    rating: 4.7,
    reviewCount: 112,
  },
  {
    id: "ant-001",
    name: "Antena Sectorial 5GHz 19dBi 120°",
    description:
      "Antena sectorial para enlaces inalámbricos en banda de 5 GHz. Ganancia de 19 dBi con apertura de 120 grados. Ideal para proveedores de internet inalámbrico.",
    price: 5400,
    images: [
      "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=600&h=600&fit=crop",
    ],
    category: "antenas",
    subcategory: "Sectoriales",
    brand: "Ubiquiti",
    sku: "AM-5AC21-60",
    supplier: "syscom",
    stock: 8,
    specs: {
      Frecuencia: "5.15 - 5.85 GHz",
      Ganancia: "19 dBi",
      Apertura: "120° H / 6.2° V",
      Conector: "2 × RP-SMA",
      Polarización: "Dual",
    },
    rating: 4.8,
    reviewCount: 38,
    isNew: true,
  },
  {
    id: "srv-001",
    name: "NAS 4 Bahías Intel Celeron 4GB RAM",
    description:
      "Servidor NAS de 4 bahías con procesador Intel Celeron quad-core, 4GB RAM DDR4. Ideal para pequeñas y medianas empresas con soporte RAID 0/1/5/6/10.",
    price: 12500,
    originalPrice: 14200,
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=600&fit=crop",
    ],
    category: "servidores",
    subcategory: "NAS",
    brand: "Synology",
    sku: "DS423+",
    supplier: "abasteo",
    stock: 6,
    specs: {
      Procesador: "Intel Celeron J4125 Quad-core",
      RAM: "4 GB DDR4 (hasta 8 GB)",
      Bahías: "4 × 3.5\" / 2.5\"",
      RAID: "0 / 1 / 5 / 6 / 10 / JBOD",
      Red: "2 × GbE LAN",
    },
    rating: 4.9,
    reviewCount: 29,
    featured: true,
    discount: 12,
  },
  {
    id: "tel-001",
    name: "Teléfono IP Empresarial 6 Líneas PoE",
    description:
      "Teléfono IP de escritorio con pantalla a color, 6 cuentas SIP, PoE integrado, Bluetooth y WiFi. Audio HD y conferencia de 5 vías.",
    price: 3200,
    images: [
      "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=600&h=600&fit=crop",
    ],
    category: "telefonia",
    subcategory: "Teléfonos IP",
    brand: "Grandstream",
    sku: "GRP2616",
    supplier: "syscom",
    stock: 25,
    specs: {
      Pantalla: "4.3\" color + 2.4\" secundaria",
      "Cuentas SIP": "6",
      Alimentación: "PoE (802.3af)",
      Audio: "HD Wideband",
      Conectividad: "Bluetooth + WiFi",
    },
    rating: 4.5,
    reviewCount: 44,
  },
  {
    id: "acc-001",
    name: "Terminal Biométrica Control de Acceso y Asistencia",
    description:
      "Terminal biométrica de huella digital y reconocimiento facial para control de acceso y asistencia. Capacidad de 3,000 huellas y 1,500 rostros.",
    price: 6800,
    originalPrice: 7500,
    images: [
      "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop",
    ],
    category: "control-acceso",
    subcategory: "Biométricos",
    brand: "ZKTeco",
    sku: "SPEEDFACE-V5L",
    supplier: "abasteo",
    stock: 15,
    specs: {
      "Capacidad huellas": "3,000",
      "Capacidad rostros": "1,500",
      Pantalla: "5\" Touch",
      Comunicación: "TCP/IP, WiFi, USB",
      "Verificación velocidad": "< 0.5s",
    },
    rating: 4.3,
    reviewCount: 31,
    discount: 9,
  },
  {
    id: "alm-001",
    name: "Panel de Alarma Híbrido 8 Zonas WiFi",
    description:
      "Panel de alarma híbrido con 8 zonas cableadas y expansión inalámbrica. Comunicación WiFi, Ethernet y línea telefónica. Compatible con app móvil.",
    price: 4500,
    images: [
      "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop",
    ],
    category: "alarmas",
    subcategory: "Paneles",
    brand: "DSC",
    sku: "HS2032-PKG",
    supplier: "syscom",
    stock: 20,
    specs: {
      "Zonas cableadas": "8 (expandible a 32)",
      "Zonas inalámbricas": "Hasta 72",
      Comunicación: "WiFi / Ethernet / Tel",
      "Particiones": "4",
      "Usuarios": "72 códigos",
    },
    rating: 4.6,
    reviewCount: 22,
    isNew: true,
  },
];

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(categorySlug: string): Product[] {
  return products.filter((p) => p.category === categorySlug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export function searchProducts(query: string): Product[] {
  const lower = query.toLowerCase();
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(lower) ||
      p.description.toLowerCase().includes(lower) ||
      p.brand.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower)
  );
}
