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
  "PAYMENT_CONFIRMED",
  "READY",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
]

export function getDeliveryMethodLabel(deliveryMethod: DeliveryMethod) {
  return deliveryMethod === "PICKUP" ? "Retiro en local" : "Envio a domicilio"
}

export function getPaymentMethodLabel(paymentMethod: PaymentMethod) {
  if (paymentMethod === "CASH") return "Pago en efectivo"
  if (paymentMethod === "TRANSFER") return "Pago por transferencia"
  return paymentMethod
}

export function getPaymentStateLabel(orderStatus: OrderStatus) {
  if (orderStatus === "PENDING") return "Pendiente"
  if (orderStatus === "CONFIRMED") return "Pendiente de confirmacion"
  if (orderStatus === "CANCELLED") return "Cancelado"
  return "Confirmado"
}

export function getOrderStatusLabel(status: OrderStatus, deliveryMethod: DeliveryMethod) {
  const isPickup = deliveryMethod === "PICKUP"

  switch (status) {
    case "PENDING":
      return "Pendiente"
    case "CONFIRMED":
      return "Pedido confirmado"
    case "PAYMENT_CONFIRMED":
      return "Pago confirmado"
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
    case "PAYMENT_CONFIRMED":
      return "El pago fue confirmado."
    case "READY":
      return "Estamos preparando tu pedido."
    case "SHIPPED":
      return isPickup ? "Tu pedido ya esta listo para retirar." : "Tu pedido fue despachado."
    case "DELIVERED":
      return isPickup ? "El pedido fue retirado." : "El pedido ya fue entregado."
    case "CANCELLED":
      return "Este pedido fue cancelado."
    default:
      return ""
  }
}

export function getTimelineSteps(
  deliveryMethod: DeliveryMethod,
  paymentMethod: PaymentMethod
): OrderTimelineStep[] {
  const isPickup = deliveryMethod === "PICKUP"
  const isTransfer = paymentMethod === "TRANSFER"

  return [
    { key: "PENDING", label: "Pendiente" },
    { key: "CONFIRMED", label: "Pedido confirmado" },
    ...(isTransfer
      ? ([{ key: "PAYMENT_CONFIRMED", label: "Pago confirmado" }] as OrderTimelineStep[])
      : []),
    { key: "READY", label: "Preparando" },
    { key: "SHIPPED", label: isPickup ? "Listo para retirar" : "Enviado" },
    { key: "DELIVERED", label: isPickup ? "Retirado" : "Entregado" },
  ]
}

export function getOrderStatusOptions(
  deliveryMethod: DeliveryMethod,
  paymentMethod: PaymentMethod
) {
  return ORDER_STATUS_VALUES.filter(
    (status) => status !== "PAYMENT_CONFIRMED" || paymentMethod === "TRANSFER"
  ).map((status) => ({
    value: status,
    label: getOrderStatusLabel(status, deliveryMethod),
  }))
}

export function getPaymentHelpText(
  paymentMethod: PaymentMethod,
  deliveryMethod: DeliveryMethod,
  status: OrderStatus
) {
  if (paymentMethod === "TRANSFER") {
    if (status === "PENDING") {
      return "Te diremos a donde debes transferir el dinero una vez que confirmemos tu pedido."
    }

    if (status === "CONFIRMED") {
      return "Cuando confirmemos el pago, pasaremos tu pedido a la siguiente etapa."
    }

    return "El pago por transferencia ya figura confirmado."
  }

  if (paymentMethod === "CASH") {
    return deliveryMethod === "PICKUP"
      ? "Abonas en efectivo al momento de retirar tu pedido en el local."
      : ""
  }

  return ""
}

export function getOrderStatusDescription(
  status: OrderStatus,
  deliveryMethod: DeliveryMethod,
  paymentMethod: PaymentMethod
) {
  const isPickup = deliveryMethod === "PICKUP"
  const isTransfer = paymentMethod === "TRANSFER"

  switch (status) {
    case "PENDING":
      return isTransfer
        ? "Estamos revisando tu pedido. Te diremos a donde debes transferir el dinero una vez que confirmemos tu pedido."
        : "Estamos revisando tu pedido. Cuando lo confirmemos, avanzara a la preparacion."
    case "CONFIRMED":
      return isTransfer
        ? "Tu pedido ya fue confirmado. Pasara a la siguiente etapa cuando confirmemos el pago."
        : "Tu pedido ya fue confirmado. Lo abonas en efectivo al momento de retirar en el local."
    case "PAYMENT_CONFIRMED":
      return "Ya confirmamos el pago. Vamos a preparar tu pedido para la siguiente etapa."
    case "READY":
      return "Estamos preparando los productos de tu pedido con cuidado."
    case "SHIPPED":
      return isPickup
        ? "Tu pedido ya esta listo para retirar por el local."
        : "Tu pedido ya fue enviado. Pronto estara en camino a la direccion indicada."
    case "DELIVERED":
      return isPickup ? "El pedido ya fue retirado." : "El pedido ya fue entregado."
    case "CANCELLED":
      return "Este pedido fue cancelado."
    default:
      return ""
  }
}
