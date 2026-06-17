import "server-only"

import { apiOrderToUI } from "@/lib/adapters/order"
import { ORDER_STATUS_VALUES } from "@/lib/order-display"
import { prisma } from "@/lib/prisma"
import type { AdminOrderListItem, OrderDetail, OrderStatus } from "@/lib/types"

type OrderListRow = {
  id: bigint
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
  status: string
  created_at: Date
  payment_method: string
  delivery_method: string
  shipping_address: string | null
  total: number
  customer_name: string
  customer_email: string
  customer_phone: string
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

export interface AdminOrderDetail {
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

function toAdminOrderListItem(order: OrderListRow): AdminOrderListItem {
  return {
    id: order.id.toString(),
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
      id: order.id.toString(),
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
    },
  })

  if (!order) return null

  return {
    order: apiOrderToUI(toCustomerOrderPayload(order as AdminOrderRecord)),
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      paymentMethod: order.payment_method,
      deliveryMethod: order.delivery_method,
    },
  }
}

export async function updateAdminOrderStatus(id: string | bigint, status: OrderStatus) {
  const order = await prisma.ordenes.update({
    where: { id: toBigIntId(id) },
    data: { status },
    select: {
      id: true,
      status: true,
      delivery_method: true,
    },
  })

  return {
    id: order.id.toString(),
    status: asOrderStatus(order.status),
    deliveryMethod: order.delivery_method,
  }
}
