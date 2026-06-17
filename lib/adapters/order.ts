import type { OrderDetail, OrderItemDetail } from "@/lib/types"

// converts raw API order object (snake-case from endpoint) into UI-friendly OrderDetail
export function apiOrderToUI(raw: any): OrderDetail {
  // raw.order is the object
  const o = raw?.order
  if (!o) throw new Error("order missing in api response")

  const items: OrderItemDetail[] = (o.items || []).map((it: any) => {
    const quantity = Number(it.cantidad || 0)
    const unitPrice = Number(it.precio_unidad || 0)
    return {
      id: String(it.id),
      productName: String(it.producto_nombre || ""),
      color: String(it.color || ""),
      size: String(it.talle || ""),
      quantity,
      unitPrice,
      subtotal: quantity * unitPrice,
      imageUrl: it.image_url || null,
    }
  })

  const subtotal = items.reduce((sum, x) => sum + x.subtotal, 0)
  const total = Number(o.total || 0)
  const shippingCost = total - subtotal

  return {
    id: String(o.id),
    status: String(o.status) as OrderDetail['status'],
    createdAt: o.created_at,
    paymentMethod: String(o.payment_method || ""),
    deliveryMethod: String(o.delivery_method || ""),
    shippingAddress: o.shipping_address || null,
    items,
    subtotal,
    shippingCost,
    total,
  }
}
