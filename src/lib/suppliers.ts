/**
 * Supplier API integration layer
 * Connects to external suppliers like Syscom and Abasteo
 * to fetch real-time product data, pricing, and availability.
 */

interface SupplierConfig {
  name: string;
  baseUrl: string;
  apiKey?: string;
}

const suppliers: Record<string, SupplierConfig> = {
  syscom: {
    name: "Syscom",
    baseUrl: "https://developers.syscom.mx/api/v1",
  },
  abasteo: {
    name: "Abasteo",
    baseUrl: "https://api.abasteo.mx/v1",
  },
};

export interface SupplierProduct {
  supplierId: string;
  supplierSku: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  category: string;
  brand: string;
  specs: Record<string, string>;
}

/**
 * Fetch products from Syscom API
 * Documentation: https://developers.syscom.mx
 */
export async function fetchSyscomProducts(
  category?: string,
  search?: string
): Promise<SupplierProduct[]> {
  const config = suppliers.syscom;
  const params = new URLSearchParams();
  if (category) params.set("categoria", category);
  if (search) params.set("busqueda", search);

  try {
    const response = await fetch(
      `${config.baseUrl}/productos?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${config.apiKey || process.env.SYSCOM_API_KEY || ""}`,
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 }, // cache for 1 hour
      }
    );

    if (!response.ok) {
      console.warn(`Syscom API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.productos || [];
  } catch (error) {
    console.warn("Syscom API unavailable, using fallback data:", error);
    return [];
  }
}

/**
 * Fetch products from Abasteo API
 */
export async function fetchAbasteoProducts(
  category?: string,
  search?: string
): Promise<SupplierProduct[]> {
  const config = suppliers.abasteo;
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  if (search) params.set("q", search);

  try {
    const response = await fetch(
      `${config.baseUrl}/products?${params.toString()}`,
      {
        headers: {
          "X-Api-Key": config.apiKey || process.env.ABASTEO_API_KEY || "",
          "Content-Type": "application/json",
        },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      console.warn(`Abasteo API error: ${response.status}`);
      return [];
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.warn("Abasteo API unavailable, using fallback data:", error);
    return [];
  }
}

/**
 * Fetch products from all suppliers and merge results
 */
export async function fetchAllSupplierProducts(
  category?: string,
  search?: string
): Promise<SupplierProduct[]> {
  const [syscomProducts, abasteoProducts] = await Promise.all([
    fetchSyscomProducts(category, search),
    fetchAbasteoProducts(category, search),
  ]);

  return [...syscomProducts, ...abasteoProducts];
}

/**
 * Check real-time stock for a specific product from its supplier
 */
export async function checkSupplierStock(
  supplierId: string,
  sku: string
): Promise<{ available: boolean; quantity: number }> {
  const config = suppliers[supplierId];
  if (!config) return { available: false, quantity: 0 };

  try {
    const response = await fetch(`${config.baseUrl}/stock/${sku}`, {
      headers: {
        Authorization: `Bearer ${process.env[`${supplierId.toUpperCase()}_API_KEY`] || ""}`,
      },
      next: { revalidate: 300 }, // cache for 5 minutes
    });

    if (!response.ok) return { available: false, quantity: 0 };

    const data = await response.json();
    return {
      available: data.quantity > 0,
      quantity: data.quantity,
    };
  } catch {
    return { available: false, quantity: 0 };
  }
}
