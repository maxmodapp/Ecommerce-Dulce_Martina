import type { OrderStatus } from "@/lib/types"

export type DeliveryMethod = "DELIVERY" | "PICKUP" | string
export type PaymentMethod = "TRANSFER" | "CASH" | string

export interface OrderTimelineStep {
  key: OrderStatus
  label: string
}

export const ORDER_STATUS_VALUES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export function getDeliveryMethodLabel(deliveryMethod: DeliveryMethod) {
  return deliveryMethod === "PICKUP" ? "Retiro en local" : "Envío a domicilio"
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod) {
  if (paymentMethod === "CASH") return "Pago en efectivo"
  if (paymentMethod === "TRANSFER") return "Pago por transferencia"
  return paymentMethod
}

export function getPaymentStateLabel(orderStatus: OrderStatus) {
  if (orderStatus === "PENDING") return "Pendiente de confirmación"
  if (orderStatus === "CANCELLED") return "Cancelado"
  return "Confirmado"
}

export function getOrderStatusLabel(status: OrderStatus, deliveryMethod: DeliveryMethod) {
  const isPickup = deliveryMethod === "PICKUP"

  switch (status) {
    case "PENDING":
      return "Pendiente"
    case "CONFIRMED":
      return "Confirmado"
    case "READY":
      return "Preparando"
    case "SHIPPED":
      return isPickup ? "Listo para retirar" : "Enviado"
    case "DELIVERED":
      return isPickup ? "Retirado" : "Entregado"
    case "CANCELLED":
      return "Cancelado"
    default:
      return status
  }
}

export function getOrderStatusMessage(status: OrderStatus, deliveryMethod: DeliveryMethod) {
  const isPickup = deliveryMethod === "PICKUP"

  switch (status) {
    case "PENDING":
      return "Estamos revisando tu pedido."
    case "CONFIRMED":
      return "Tu pedido fue confirmado."
    case "READY":
      return "Estamos preparando tu pedido."
    case "SHIPPED":
      return isPickup ? "Tu pedido ya está listo para retirar." : "Tu pedido fue despachado."
    case "DELIVERED":
      return isPickup ? "El pedido fue retirado." : "El pedido ya fue entregado."
    case "CANCELLED":
      return "Este pedido fue cancelado."
    default:
      return ""
  }
}

export function getTimelineSteps(deliveryMethod: DeliveryMethod): OrderTimelineStep[] {
  const isPickup = deliveryMethod === "PICKUP"

  return [
    { key: "PENDING", label: "Pendiente" },
    { key: "CONFIRMED", label: "Confirmado" },
    { key: "READY", label: "Preparando" },
    { key: "SHIPPED", label: isPickup ? "Listo para retirar" : "Enviado" },
    { key: "DELIVERED", label: isPickup ? "Retirado" : "Entregado" },
  ]
}

export function getOrderStatusOptions(deliveryMethod: DeliveryMethod) {
  return ORDER_STATUS_VALUES.map((status) => ({
    value: status,
    label: getOrderStatusLabel(status, deliveryMethod),
  }))
}

export function getPaymentHelpText(paymentMethod: PaymentMethod, deliveryMethod: DeliveryMethod) {
  if (paymentMethod === "TRANSFER") {
    return "Cuando verifiquemos la transferencia, actualizaremos el estado de tu pedido."
  }

  if (paymentMethod === "CASH") {
    return "Abonás en efectivo al momento de retirar tu pedido en el local."

  }

  return ""
}
