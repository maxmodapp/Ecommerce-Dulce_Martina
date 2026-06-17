import type { DeliveryMethod } from "@/lib/types"

export const FREE_SHIPPING_THRESHOLD = 30000000
export const ESTIMATED_DELIVERY_COST = 3500
export const PICKUP_ADDRESS = "Saladillo - Saavedra 2825"
export const DELIVERY_LABEL = "Correo Argentino Clásico a domicilio"
export const PICKUP_LABEL = "Local Dulce Martina"


export function getEstimatedDeliveryCost() {
  return ESTIMATED_DELIVERY_COST
}

export function getShippingCost(subtotal: number, deliveryMethod: DeliveryMethod) {
  if (deliveryMethod === "PICKUP") return 0
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : ESTIMATED_DELIVERY_COST
}
