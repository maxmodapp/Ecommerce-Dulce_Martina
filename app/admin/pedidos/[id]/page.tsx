import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AdminOrderStatusSelect } from "@/components/admin-order-status-select"
import { OrderDetailView } from "@/components/order-detail-view"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getDeliveryMethodLabel, getPaymentMethodLabel } from "@/lib/order-display"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminOrderById } from "@/lib/admin-orders"

export const metadata = {
  title: "Detalle del pedido | Administracion",
  description: "Detalle operativo de un pedido dentro del panel de administracion.",
}

export default async function AdminPedidoDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  await requireAdminPageUser("/admin/pedidos")
  const { id } = await params
  const detail = await getAdminOrderById(id)

  if (!detail) notFound()

  const adminPanel = (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Administracion</p>
            <CardTitle className="mt-1 font-serif text-2xl text-foreground">
              Datos del cliente
            </CardTitle>
          </div>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/pedidos">
              <ArrowLeft className="size-4" />
              Volver a pedidos
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide">Nombre</p>
            <p className="mt-1 text-foreground">{detail.customer.name}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Telefono</p>
            <p className="mt-1 text-foreground">{detail.customer.phone}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide">Correo</p>
            <p className="mt-1 break-words text-foreground">{detail.customer.email}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-xs uppercase tracking-wide">Direccion</p>
            <p className="mt-1 text-foreground">{detail.customer.address || "A confirmar"}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Metodo de pago</p>
            <p className="mt-1 text-foreground">
              {getPaymentMethodLabel(detail.customer.paymentMethod)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide">Metodo de entrega</p>
            <p className="mt-1 text-foreground">
              {getDeliveryMethodLabel(detail.customer.deliveryMethod)}
            </p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado</p>
          <div className="mt-2">
            <AdminOrderStatusSelect
              orderId={detail.order.id}
              deliveryMethod={detail.order.deliveryMethod}
              status={detail.order.status}
              refreshOnSuccess
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return <OrderDetailView order={detail.order} topContent={adminPanel} />
}
