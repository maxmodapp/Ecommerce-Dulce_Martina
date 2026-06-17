import type { Product, OrderData } from "./types"
import { products, getProductBySlug as getLocalProductBySlug } from "./data"

const API_BASE = "http://localhost:3001/api"
const USE_API = false // Toggle to true when backend is ready

export async function fetchProducts(): Promise<Product[]> {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/products`)
    if (!res.ok) throw new Error("Error al cargar productos")
    return res.json()
  }
  return products
}

export async function fetchProductBySlug(
  slug: string
): Promise<Product | undefined> {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/products/${slug}`)
    if (!res.ok) return undefined
    return res.json()
  }
  return getLocalProductBySlug(slug)
}

export async function submitOrder(
  order: OrderData
): Promise<{ success: boolean; message: string }> {
  if (USE_API) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(order),
    })
    if (!res.ok) throw new Error("Error al enviar el pedido")
    return res.json()
  }
  return { success: true, message: "Pedido recibido (mock)" }
}
