import "dotenv/config";
import { Pool } from "pg";  // Add this import
import { PrismaPg } from "@prisma/adapter-pg";  // Add this import
import { PrismaClient, Supplier } from "../src/generated/prisma";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });  // Updated instantiation
async function main() {
  console.log("🌱 Iniciando seed de la base de datos...\n");

  // ============================================================
  // CATEGORÍAS
  // ============================================================
  const categoriesData = [
    {
      name: "Cámaras de Vigilancia",
      slug: "camaras",
      description: "CCTV, cámaras IP, DVR, NVR y accesorios de videovigilancia",
      icon: "Camera",
      image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop",
    },
    {
      name: "Redes y Conectividad",
      slug: "redes",
      description: "Switches, routers, access points y soluciones de networking",
      icon: "Network",
      image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400&h=300&fit=crop",
    },
    {
      name: "Cableado Estructurado",
      slug: "cableado",
      description: "Cable UTP, fibra óptica, patch panels, patch cords y herramientas",
      icon: "Cable",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    },
    {
      name: "Antenas y Enlaces",
      slug: "antenas",
      description: "Antenas sectoriales, enlaces punto a punto, torres y accesorios",
      icon: "Radio",
      image: "https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=400&h=300&fit=crop",
    },
    {
      name: "Servidores y Almacenamiento",
      slug: "servidores",
      description: "Servidores rack, NAS, discos duros y soluciones de almacenamiento",
      icon: "Server",
      image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    },
    {
      name: "Telefonía IP",
      slug: "telefonia",
      description: "Conmutadores, teléfonos IP, gateways y soluciones VoIP",
      icon: "Phone",
      image: "https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=400&h=300&fit=crop",
    },
    {
      name: "Control de Acceso",
      slug: "control-acceso",
      description: "Lectores biométricos, cerraduras electrónicas y control de acceso",
      icon: "Fingerprint",
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    },
    {
      name: "Alarmas y Sensores",
      slug: "alarmas",
      description: "Sistemas de alarma, sensores de movimiento, detectores y paneles",
      icon: "ShieldAlert",
      image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop",
    },
  ];

  console.log("📁 Creando categorías...");
  const categories: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    });
    categories[cat.slug] = created.id;
  }
  console.log(`   ✅ ${Object.keys(categories).length} categorías creadas\n`);

  // ============================================================
  // MARCAS
  // ============================================================
  const brandsData = [
    { name: "Hikvision", slug: "hikvision" },
    { name: "TP-Link", slug: "tp-link" },
    { name: "Ubiquiti", slug: "ubiquiti" },
    { name: "Panduit", slug: "panduit" },
    { name: "Synology", slug: "synology" },
    { name: "Grandstream", slug: "grandstream" },
    { name: "ZKTeco", slug: "zkteco" },
    { name: "DSC", slug: "dsc" },
  ];

  console.log("🏷️  Creando marcas...");
  const brands: Record<string, string> = {};
  for (const brand of brandsData) {
    const created = await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: brand,
      create: brand,
    });
    brands[brand.slug] = created.id;
  }
  console.log(`   ✅ ${Object.keys(brands).length} marcas creadas\n`);

  // ============================================================
  // PRODUCTOS (los 12 del mock original)
  // ============================================================
  const productsData = [
    {
      name: "Cámara IP Domo 4MP PoE IR 30m",
      slug: "camara-ip-domo-4mp-poe-ir-30m",
      description: "Cámara de vigilancia tipo domo con resolución 4 Megapíxeles, alimentación PoE, visión nocturna infrarroja hasta 30 metros. Ideal para interiores y exteriores con clasificación IP67.",
      price: 1899,
      originalPrice: 2299,
      sku: "DS-2CD1143G0-I",
      stock: 45,
      supplier: Supplier.SYSCOM,
      rating: 4.7,
      reviewCount: 128,
      featured: true,
      discount: 17,
      categorySlug: "camaras",
      subcategory: "Cámaras IP",
      brandSlug: "hikvision",
      images: ["https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=600&h=600&fit=crop"],
      specs: {
        "Resolución": "4 MP (2560 × 1440)",
        "Tipo de lente": "2.8 mm fijo",
        "IR alcance": "30 metros",
        "Alimentación": "PoE (802.3af)",
        "Grado IP": "IP67",
        "Compresión": "H.265+ / H.264+",
      },
    },
    {
      name: "Cámara Bullet 2MP Turbo HD IR 40m",
      slug: "camara-bullet-2mp-turbo-hd-ir-40m",
      description: "Cámara tipo bullet con resolución Full HD 1080p, tecnología Turbo HD, visión nocturna hasta 40m. Carcasa metálica resistente para exteriores.",
      price: 1299,
      originalPrice: null,
      sku: "DS-2CE16D0T-IT3F",
      stock: 78,
      supplier: Supplier.SYSCOM,
      rating: 4.5,
      reviewCount: 95,
      featured: true,
      discount: null,
      categorySlug: "camaras",
      subcategory: "Cámaras Turbo HD",
      brandSlug: "hikvision",
      images: ["https://images.unsplash.com/photo-1580910051074-3eb694886571?w=600&h=600&fit=crop"],
      specs: {
        "Resolución": "2 MP (1920 × 1080)",
        "Tipo de lente": "3.6 mm fijo",
        "IR alcance": "40 metros",
        "Alimentación": "12 VDC",
        "Grado IP": "IP67",
      },
    },
    {
      name: "DVR 8 Canales 4MP Turbo HD + 2 IP",
      slug: "dvr-8-canales-4mp-turbo-hd-2-ip",
      description: "Grabador digital de video de 8 canales compatible con cámaras Turbo HD hasta 4MP y 2 canales IP adicionales. Incluye detección de movimiento inteligente.",
      price: 3450,
      originalPrice: 3999,
      sku: "DS-7208HQHI-K1",
      stock: 23,
      supplier: Supplier.SYSCOM,
      rating: 4.8,
      reviewCount: 67,
      featured: true,
      discount: 14,
      categorySlug: "camaras",
      subcategory: "DVR / NVR",
      brandSlug: "hikvision",
      images: ["https://images.unsplash.com/photo-1606567595334-d39972c85dbe?w=600&h=600&fit=crop"],
      specs: {
        "Canales": "8 Turbo HD + 2 IP",
        "Resolución grabación": "4MP Lite",
        "Salida video": "HDMI / VGA",
        "Bahías HDD": "1 × SATA (hasta 10TB)",
        "Red": "10/100 Mbps",
      },
    },
    {
      name: "Switch PoE+ 24 Puertos Gigabit Administrable",
      slug: "switch-poe-24-puertos-gigabit-administrable",
      description: "Switch de capa 2 administrable con 24 puertos Gigabit PoE+ y 4 puertos SFP. Presupuesto PoE de 370W ideal para instalaciones de videovigilancia y telefonía IP.",
      price: 8750,
      originalPrice: null,
      sku: "TL-SG3428MP",
      stock: 12,
      supplier: Supplier.ABASTEO,
      rating: 4.6,
      reviewCount: 43,
      featured: true,
      isNew: true,
      discount: null,
      categorySlug: "redes",
      subcategory: "Switches",
      brandSlug: "tp-link",
      images: ["https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&h=600&fit=crop"],
      specs: {
        "Puertos": "24 × GE PoE+ / 4 × SFP",
        "Presupuesto PoE": "370W",
        "Capacidad switching": "56 Gbps",
        "Administración": "Web / CLI / SNMP",
        "Capa": "L2+",
      },
    },
    {
      name: "Access Point WiFi 6 AX3000 Montaje en Techo",
      slug: "access-point-wifi-6-ax3000-montaje-techo",
      description: "Punto de acceso empresarial WiFi 6 con velocidades de hasta 3000 Mbps. Diseño elegante para montaje en techo con PoE. Soporta hasta 256 clientes simultáneos.",
      price: 4200,
      originalPrice: 4800,
      sku: "U6-PRO",
      stock: 34,
      supplier: Supplier.SYSCOM,
      rating: 4.9,
      reviewCount: 89,
      featured: true,
      discount: 13,
      categorySlug: "redes",
      subcategory: "Access Points",
      brandSlug: "ubiquiti",
      images: ["https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop"],
      specs: {
        "Estándar": "WiFi 6 (802.11ax)",
        "Velocidad": "Hasta 3000 Mbps",
        "Bandas": "Dual Band (2.4 GHz + 5 GHz)",
        "Alimentación": "PoE+ (802.3at)",
        "Clientes máx.": "256",
      },
    },
    {
      name: "Router Empresarial Balanceo Multi-WAN",
      slug: "router-empresarial-balanceo-multi-wan",
      description: "Router VPN empresarial con 5 puertos Gigabit WAN/LAN configurables. Balanceo de carga, failover automático y servidor VPN integrado.",
      price: 3850,
      originalPrice: null,
      sku: "ER7206",
      stock: 18,
      supplier: Supplier.ABASTEO,
      rating: 4.4,
      reviewCount: 56,
      featured: false,
      discount: null,
      categorySlug: "redes",
      subcategory: "Routers",
      brandSlug: "tp-link",
      images: ["https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&h=600&fit=crop"],
      specs: {
        "Puertos": "5 × GE (configurable WAN/LAN)",
        "VPN": "IPSec / OpenVPN / L2TP / PPTP",
        "Firewall": "SPI + DoS Defense",
        "Usuarios concurrentes": "150",
      },
    },
    {
      name: "Bobina Cable UTP Cat6 305m Exterior Gel",
      slug: "bobina-cable-utp-cat6-305m-exterior-gel",
      description: "Cable UTP categoría 6 para exteriores con relleno de gel para protección contra humedad. 305 metros, conductor de cobre sólido 23 AWG.",
      price: 2650,
      originalPrice: null,
      sku: "PUC6004BU-FE",
      stock: 50,
      supplier: Supplier.SYSCOM,
      rating: 4.7,
      reviewCount: 112,
      featured: false,
      discount: null,
      categorySlug: "cableado",
      subcategory: "Cable UTP",
      brandSlug: "panduit",
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=600&fit=crop"],
      specs: {
        "Categoría": "Cat 6",
        "Longitud": "305 metros",
        "Conductor": "Cobre sólido 23 AWG",
        "Uso": "Exterior con gel",
        "Certificación": "UL Listed",
      },
    },
    {
      name: "Antena Sectorial 5GHz 19dBi 120°",
      slug: "antena-sectorial-5ghz-19dbi-120",
      description: "Antena sectorial para enlaces inalámbricos en banda de 5 GHz. Ganancia de 19 dBi con apertura de 120 grados. Ideal para proveedores de internet inalámbrico.",
      price: 5400,
      originalPrice: null,
      sku: "AM-5AC21-60",
      stock: 8,
      supplier: Supplier.SYSCOM,
      rating: 4.8,
      reviewCount: 38,
      featured: false,
      isNew: true,
      discount: null,
      categorySlug: "antenas",
      subcategory: "Sectoriales",
      brandSlug: "ubiquiti",
      images: ["https://images.unsplash.com/photo-1590422749897-47036da0b0ff?w=600&h=600&fit=crop"],
      specs: {
        "Frecuencia": "5.15 - 5.85 GHz",
        "Ganancia": "19 dBi",
        "Apertura": "120° H / 6.2° V",
        "Conector": "2 × RP-SMA",
        "Polarización": "Dual",
      },
    },
    {
      name: "NAS 4 Bahías Intel Celeron 4GB RAM",
      slug: "nas-4-bahias-intel-celeron-4gb-ram",
      description: "Servidor NAS de 4 bahías con procesador Intel Celeron quad-core, 4GB RAM DDR4. Ideal para pequeñas y medianas empresas con soporte RAID 0/1/5/6/10.",
      price: 12500,
      originalPrice: 14200,
      sku: "DS423+",
      stock: 6,
      supplier: Supplier.ABASTEO,
      rating: 4.9,
      reviewCount: 29,
      featured: true,
      discount: 12,
      categorySlug: "servidores",
      subcategory: "NAS",
      brandSlug: "synology",
      images: ["https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&h=600&fit=crop"],
      specs: {
        "Procesador": "Intel Celeron J4125 Quad-core",
        "RAM": "4 GB DDR4 (hasta 8 GB)",
        "Bahías": "4 × 3.5\" / 2.5\"",
        "RAID": "0 / 1 / 5 / 6 / 10 / JBOD",
        "Red": "2 × GbE LAN",
      },
    },
    {
      name: "Teléfono IP Empresarial 6 Líneas PoE",
      slug: "telefono-ip-empresarial-6-lineas-poe",
      description: "Teléfono IP de escritorio con pantalla a color, 6 cuentas SIP, PoE integrado, Bluetooth y WiFi. Audio HD y conferencia de 5 vías.",
      price: 3200,
      originalPrice: null,
      sku: "GRP2616",
      stock: 25,
      supplier: Supplier.SYSCOM,
      rating: 4.5,
      reviewCount: 44,
      featured: false,
      discount: null,
      categorySlug: "telefonia",
      subcategory: "Teléfonos IP",
      brandSlug: "grandstream",
      images: ["https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=600&h=600&fit=crop"],
      specs: {
        "Pantalla": "4.3\" color + 2.4\" secundaria",
        "Cuentas SIP": "6",
        "Alimentación": "PoE (802.3af)",
        "Audio": "HD Wideband",
        "Conectividad": "Bluetooth + WiFi",
      },
    },
    {
      name: "Terminal Biométrica Control de Acceso y Asistencia",
      slug: "terminal-biometrica-control-acceso-asistencia",
      description: "Terminal biométrica de huella digital y reconocimiento facial para control de acceso y asistencia. Capacidad de 3,000 huellas y 1,500 rostros.",
      price: 6800,
      originalPrice: 7500,
      sku: "SPEEDFACE-V5L",
      stock: 15,
      supplier: Supplier.ABASTEO,
      rating: 4.3,
      reviewCount: 31,
      featured: false,
      discount: 9,
      categorySlug: "control-acceso",
      subcategory: "Biométricos",
      brandSlug: "zkteco",
      images: ["https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=600&h=600&fit=crop"],
      specs: {
        "Capacidad huellas": "3,000",
        "Capacidad rostros": "1,500",
        "Pantalla": "5\" Touch",
        "Comunicación": "TCP/IP, WiFi, USB",
        "Verificación velocidad": "< 0.5s",
      },
    },
    {
      name: "Panel de Alarma Híbrido 8 Zonas WiFi",
      slug: "panel-alarma-hibrido-8-zonas-wifi",
      description: "Panel de alarma híbrido con 8 zonas cableadas y expansión inalámbrica. Comunicación WiFi, Ethernet y línea telefónica. Compatible con app móvil.",
      price: 4500,
      originalPrice: null,
      sku: "HS2032-PKG",
      stock: 20,
      supplier: Supplier.SYSCOM,
      rating: 4.6,
      reviewCount: 22,
      featured: false,
      isNew: true,
      discount: null,
      categorySlug: "alarmas",
      subcategory: "Paneles",
      brandSlug: "dsc",
      images: ["https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=600&h=600&fit=crop"],
      specs: {
        "Zonas cableadas": "8 (expandible a 32)",
        "Zonas inalámbricas": "Hasta 72",
        "Comunicación": "WiFi / Ethernet / Tel",
        "Particiones": "4",
        "Usuarios": "72 códigos",
      },
    },
  ];

  console.log("📦 Creando productos...");
  for (const p of productsData) {
    const { images, specs, categorySlug, brandSlug, ...productData } = p;

    const product = await prisma.product.upsert({
      where: { sku: productData.sku },
      update: {
        ...productData,
        categoryId: categories[categorySlug],
        brandId: brands[brandSlug],
      },
      create: {
        ...productData,
        categoryId: categories[categorySlug],
        brandId: brands[brandSlug],
      },
    });

    // Imágenes
    for (let i = 0; i < images.length; i++) {
      await prisma.productImage.upsert({
        where: { id: `${product.id}-img-${i}` },
        update: { url: images[i], position: i },
        create: {
          id: `${product.id}-img-${i}`,
          productId: product.id,
          url: images[i],
          position: i,
        },
      });
    }

    // Specs
    for (const [key, value] of Object.entries(specs)) {
      await prisma.productSpec.upsert({
        where: { productId_key: { productId: product.id, key } },
        update: { value },
        create: { productId: product.id, key, value },
      });
    }

    console.log(`   ✅ ${product.name}`);
  }

  // ============================================================
  // USUARIO ADMIN (dueño)
  // ============================================================
  console.log("\n👤 Creando usuario administrador...");

  // SHA-256 hash of "admin123" - change this password in production!
  const crypto = await import("crypto");
  const adminPassword = crypto.createHash("sha256").update("admin123").digest("hex");

  await prisma.user.upsert({
    where: { email: "admin@sysccom.com" },
    update: {
      password: adminPassword,
      role: "OWNER",
    },
    create: {
      email: "admin@sysccom.com",
      password: adminPassword,
      firstName: "Admin",
      lastName: "SYSCCOM",
      role: "OWNER",
      emailVerified: true,
      isActive: true,
    },
  });
  console.log("   ✅ admin@sysccom.com / admin123 (OWNER)");

  console.log(`\n🎉 Seed completado: ${productsData.length} productos insertados`);
  console.log("   8 categorías, 8 marcas, imágenes y especificaciones incluidas");
  console.log("   1 usuario administrador creado\n");
  console.log(`\n🎉 Seed completado: ${productsData.length} productos insertados`);
  console.log("   8 categorías, 8 marcas, imágenes y especificaciones incluidas\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
