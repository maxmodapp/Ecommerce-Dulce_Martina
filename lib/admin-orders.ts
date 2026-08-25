import "server-only"

import { apiOrderToUI } from "@/lib/adapters/order"
import { AdminApiError } from "@/lib/admin"
import { ORDER_STATUS_VALUES } from "@/lib/order-display"
import { prisma } from "@/lib/prisma"
import type { AdminOrderListItem, OrderDetail, OrderStatus } from "@/lib/types"

type OrderListRow = {
  id: bigint
  numero_orden: number
  created_at: Date
  status: string
  total: number
  payment_method: string
  delivery_method: string
  customer_name: string
  customer_email: string
  customer_phone: string
}

type AdminOrderRecord = {
  id: bigint
  numero_orden: number
  status: string
  created_at: Date
  payment_method: string
  delivery_method: string
  shipping_address: string | null
  total: number
  customer_name: string
  customer_email: string
  customer_phone: string
  usuarios: {
    direccion: string | null
  } | null
  orden_productos: Array<{
    id: bigint
    cantidad: number
    precio_unidad: number
    variante_talles: {
      talle: string
      variantes: {
        nombre_color: string
        productos: {
          nombre: string
        }
        variante_imagenes: Array<{
          url: string
        }>
      }
    } | null
  }>
}

type StockLine = {
  variantSizeId: bigint
  required: number
  available: number
  productName: string
  color: string
  size: string
}

export interface AdminOrderDetail {
  internalOrderId: string
  order: OrderDetail
  customer: {
    name: string
    email: string
    phone: string
    address: string | null
    paymentMethod: string
    deliveryMethod: string
  }
}

function toBigIntId(value: string | bigint) {
  return typeof value === "bigint" ? value : BigInt(value)
}

function asOrderStatus(status: string): OrderStatus {
  if (ORDER_STATUS_VALUES.includes(status as OrderStatus)) {
    return status as OrderStatus
  }

  throw new Error(`Estado de pedido invalido: ${status}`)
}

function toStockIssue(line: StockLine) {
  return {
    variantSizeId: line.variantSizeId.toString(),
    productName: line.productName,
    color: line.color,
    size: line.size,
    required: line.required,
    available: line.available,
  }
}

function buildStockLines(
  items: Array<{
    cantidad: number
    product_variant_size_id: bigint
    variante_talles: {
      stock: number
      talle: string
      variantes: {
        nombre_color: string
        productos: {
          nombre: string
        }
      }
    } | null
  }>
) {
  const grouped = new Map<string, StockLine>()

  for (const item of items) {
    const key = item.product_variant_size_id.toString()
    const current = grouped.get(key)
    const size = item.variante_talles
    const line: StockLine = {
      variantSizeId: item.product_variant_size_id,
      required: item.cantidad + (current?.required ?? 0),
      available: size?.stock ?? 0,
      productName: size?.variantes.productos.nombre ?? "Producto no disponible",
      color: size?.variantes.nombre_color ?? "Sin color",
      size: size?.talle ?? "Sin talle",
    }

    grouped.set(key, line)
  }

  return Array.from(grouped.values())
}

function toAdminOrderListItem(order: OrderListRow): AdminOrderListItem {
  return {
    id: order.id.toString(),
    orderNumber: order.numero_orden.toString(),
    createdAt: order.created_at.toISOString(),
    status: asOrderStatus(order.status),
    total: order.total,
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    customerPhone: order.customer_phone,
  }
}

function toCustomerOrderPayload(order: AdminOrderRecord) {
  return {
    order: {
      id: order.numero_orden.toString(),
      status: order.status,
      created_at: order.created_at,
      payment_method: order.payment_method,
      delivery_method: order.delivery_method,
      shipping_address: order.shipping_address,
      total: order.total,
      items: order.orden_productos.map((item) => ({
        id: item.id.toString(),
        cantidad: item.cantidad,
        precio_unidad: item.precio_unidad,
        producto_nombre: item.variante_talles?.variantes.productos.nombre ?? "",
        color: item.variante_talles?.variantes.nombre_color ?? "",
        talle: item.variante_talles?.talle ?? "",
        image_url: item.variante_talles?.variantes.variante_imagenes[0]?.url ?? null,
      })),
    },
  }
}

export async function getAdminOrders(options?: {
  status?: OrderStatus
}) {
  const where = options?.status ? { status: options.status } : undefined
  const orderBy = options?.status ? { created_at: "asc" as const } : { created_at: "desc" as const }

  const orders = await prisma.ordenes.findMany({
    where,
    orderBy,
    select: {
      id: true,
      numero_orden: true,
      created_at: true,
      status: true,
      total: true,
      payment_method: true,
      delivery_method: true,
      customer_name: true,
      customer_email: true,
      customer_phone: true,
    },
  })

  return orders.map(toAdminOrderListItem)
}

export async function getAdminOrderById(id: string | bigint): Promise<AdminOrderDetail | null> {
  const order = await prisma.ordenes.findUnique({
    where: { id: toBigIntId(id) },
    include: {
      orden_productos: {
        include: {
          variante_talles: {
            include: {
              variantes: {
                include: {
                  productos: true,
                  variante_imagenes: {
                    orderBy: { sort_order: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      },
      usuarios: {
        select: {
          direccion: true,
        },
      },
    },
  })

  if (!order) return null

  return {
    internalOrderId: order.id.toString(),
    order: apiOrderToUI(toCustomerOrderPayload(order as AdminOrderRecord)),
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address:
        order.delivery_method === "PICKUP"
          ? order.shipping_address ?? order.usuarios?.direccion ?? null
          : order.shipping_address,
      paymentMethod: order.payment_method,
      deliveryMethod: order.delivery_method,
    },
  }
}

export async function updateAdminOrderStatus(id: string | bigint, status: OrderStatus) {
  const orderId = toBigIntId(id)

  const order = await prisma.$transaction(async (tx) => {
    const currentOrder = await tx.ordenes.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        numero_orden: true,
        status: true,
        payment_method: true,
        delivery_method: true,
        customer_name: true,
        customer_email: true,
        orden_productos: {
          select: {
            cantidad: true,
            product_variant_size_id: true,
            variante_talles: {
              select: {
                stock: true,
                talle: true,
                variantes: {
                  select: {
                    nombre_color: true,
                    productos: {
                      select: {
                        nombre: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!currentOrder) {
      throw new AdminApiError(404, "Pedido no encontrado", "ORDER_NOT_FOUND")
    }

    if (status === "PAYMENT_CONFIRMED" && currentOrder.payment_method !== "TRANSFER") {
      throw new AdminApiError(
        400,
        "Solo los pedidos con pago por transferencia pueden pasar a pago confirmado.",
        "INVALID_STATUS_FOR_PAYMENT"
      )
    }

    const currentStatus = asOrderStatus(currentOrder.status)
    if (currentStatus === status) {
      return {
        id: currentOrder.id,
        numero_orden: currentOrder.numero_orden,
        status: currentOrder.status,
        payment_method: currentOrder.payment_method,
        delivery_method: currentOrder.delivery_method,
        customer_name: currentOrder.customer_name,
        customer_email: currentOrder.customer_email,
        previousStatus: currentStatus,
        changed: false,
      }
    }

    const stockLines = buildStockLines(currentOrder.orden_productos)

    if (currentStatus !== "CANCELLED" && status === "CANCELLED") {
      for (const line of stockLines) {
        const updated = await tx.variante_talles.updateMany({
          where: { id: line.variantSizeId },
          data: { stock: { increment: line.required } },
        })

        if (updated.count !== 1) {
          throw new AdminApiError(
            409,
            "No pudimos recuperar el stock de este pedido.",
            "ORDER_CANCEL_STOCK_ERROR",
            { items: [toStockIssue(line)] }
          )
        }
      }
    }

    if (currentStatus === "CANCELLED" && status !== "CANCELLED") {
      const stockIssues = stockLines.filter((line) => line.available < line.required)

      if (stockIssues.length > 0) {
        throw new AdminApiError(
          409,
          "No hay stock suficiente para reactivar este pedido.",
          "ORDER_REACTIVATION_OUT_OF_STOCK",
          { items: stockIssues.map(toStockIssue) }
        )
      }

      for (const line of stockLines) {
        const updated = await tx.variante_talles.updateMany({
          where: { id: line.variantSizeId, stock: { gte: line.required } },
          data: { stock: { decrement: line.required } },
        })

        if (updated.count !== 1) {
          const freshSize = await tx.variante_talles.findUnique({
            where: { id: line.variantSizeId },
            select: { stock: true },
          })

          throw new AdminApiError(
            409,
            "No hay stock suficiente para reactivar este pedido.",
            "ORDER_REACTIVATION_OUT_OF_STOCK",
            {
              items: [
                toStockIssue({
                  ...line,
                  available: freshSize?.stock ?? 0,
                }),
              ],
            }
          )
        }
      }
    }

    const updatedOrder = await tx.ordenes.update({
      where: { id: orderId },
      data: { status },
      select: {
        id: true,
        numero_orden: true,
        status: true,
        payment_method: true,
        delivery_method: true,
        customer_name: true,
        customer_email: true,
      },
    })

    return {
      ...updatedOrder,
      previousStatus: currentStatus,
      changed: true,
    }
  })

  return {
    id: order.id.toString(),
    orderNumber: order.numero_orden.toString(),
    status: asOrderStatus(order.status),
    paymentMethod: order.payment_method,
    deliveryMethod: order.delivery_method,
    customerName: order.customer_name,
    customerEmail: order.customer_email,
    previousStatus: order.previousStatus,
    changed: order.changed,
  }
}
