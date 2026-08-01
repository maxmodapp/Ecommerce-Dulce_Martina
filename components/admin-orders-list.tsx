"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { AdminOrderStatusSelect } from "@/components/admin-order-status-select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import {
  getDeliveryMethodLabel,
  getOrderStatusLabel,
  getPaymentMethodLabel,
} from "@/lib/order-display"
import type { AdminOrderListItem, OrderStatus } from "@/lib/types"

export function AdminOrdersList({
  initialOrders,
  activeStatus,
}: {
  initialOrders: AdminOrderListItem[]
  activeStatus?: OrderStatus
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState(initialOrders)

  const currentPath = useMemo(() => {
    const query = searchParams.toString()
    return `${pathname}${query ? `?${query}` : ""}`
  }, [pathname, searchParams])

  function handleStatusUpdated(orderId: string, nextStatus: OrderStatus) {
    setOrders((prev) =>
      prev
        .map((order) =>
          order.id === orderId
            ? {
                ...order,
                status: nextStatus,
              }
            : order
        )
        .filter((order) => !activeStatus || order.status === activeStatus)
    )
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardContent className="space-y-5 py-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pedido</p>
                <h2 className="font-serif text-2xl font-bold text-foreground">#{order.id}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("es-AR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-col gap-3 lg:min-w-[240px] lg:items-end">
                <Badge variant="secondary" className="w-fit px-3 py-1 text-xs">
                  {getOrderStatusLabel(order.status, order.deliveryMethod)}
                </Badge>
                <div className="w-full lg:w-[220px]">
                  <AdminOrderStatusSelect
                    orderId={order.id}
                    deliveryMethod={order.deliveryMethod}
                    paymentMethod={order.paymentMethod}
                    status={order.status}
                    onUpdated={(nextStatus) => handleStatusUpdated(order.id, nextStatus)}
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <p className="text-xs uppercase tracking-wide">Cliente</p>
                <p className="mt-1 text-foreground">{order.customerName}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Telefono</p>
                <p className="mt-1 text-foreground">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Entrega</p>
                <p className="mt-1 text-foreground">
                  {getDeliveryMethodLabel(order.deliveryMethod)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Pago</p>
                <p className="mt-1 text-foreground">
                  {getPaymentMethodLabel(order.paymentMethod)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Correo</p>
                <p className="mt-1 break-words text-foreground">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Total</p>
                <p className="mt-1 text-foreground">{formatPrice(order.total)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Estado</p>
                <p className="mt-1 text-foreground">
                  {getOrderStatusLabel(order.status, order.deliveryMethod)}
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/admin/pedidos/${order.id}?returnTo=${encodeURIComponent(currentPath)}`}>
                Ver detalle
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
