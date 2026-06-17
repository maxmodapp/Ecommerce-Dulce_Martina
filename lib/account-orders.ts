import "server-only"

import { prisma } from "@/lib/prisma"

export type AccountOrderPreview = {
  id: string
  createdAt: string
  status: string
  total: number
  deliveryMethod: string
}

type OrderRow = {
  id: bigint
  created_at: Date
  status: string
  total: number
  delivery_method: string
}

function toUserId(userId: string | bigint) {
  return typeof userId === "bigint" ? userId : BigInt(userId)
}

function mapOrderPreview(order: OrderRow): AccountOrderPreview {
  return {
    id: order.id.toString(),
    createdAt: order.created_at.toISOString(),
    status: order.status,
    total: order.total,
    deliveryMethod: order.delivery_method,
  }
}

export async function getOrdersForUser(userId: string | bigint, take?: number) {
  const orders = await prisma.ordenes.findMany({
    where: { user_id: toUserId(userId) },
    orderBy: { created_at: "desc" },
    take,
    select: {
      id: true,
      created_at: true,
      status: true,
      total: true,
      delivery_method: true,
    },
  })

  return orders.map(mapOrderPreview)
}

export async function getOrderSummaryForUser(userId: string | bigint) {
  const resolvedUserId = toUserId(userId)

  const [totalCount, latestOrder] = await prisma.$transaction([
    prisma.ordenes.count({
      where: { user_id: resolvedUserId },
    }),
    prisma.ordenes.findFirst({
      where: { user_id: resolvedUserId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        created_at: true,
        status: true,
        total: true,
        delivery_method: true,
      },
    }),
  ])

  return {
    totalCount,
    latestOrder: latestOrder ? mapOrderPreview(latestOrder) : null,
  }
}
