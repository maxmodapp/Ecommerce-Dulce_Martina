import Link from "next/link"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminOrders } from "@/lib/admin-orders"
import { AdminOrdersList } from "@/components/admin-orders-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ORDER_STATUS_VALUES, getOrderStatusLabel } from "@/lib/order-display"
import type { OrderStatus } from "@/lib/types"

export const metadata = {
  title: "Pedidos | Administracion",
  description: "Gestiona los pedidos desde el panel de administracion.",
}

function parseStatusFilter(value?: string): OrderStatus | undefined {
  if (!value) return undefined
  return ORDER_STATUS_VALUES.includes(value as OrderStatus) ? (value as OrderStatus) : undefined
}

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string }>
}) {
  await requireAdminPageUser("/admin/pedidos")
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const activeStatus = parseStatusFilter(resolvedSearchParams?.status)
  const orders = await getAdminOrders({ status: activeStatus })

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Pedidos</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
          Gestion de pedidos
        </h1>
        <p className="mt-4 text-muted-foreground">
          Revisa la informacion principal de cada pedido, entra al detalle y actualiza el estado
          sin salir de la lista.
        </p>
      </div>

      <Card className="mt-8">
        <CardHeader className="gap-3">
          <CardTitle className="text-xl">Filtrar pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="w-full sm:max-w-xs">
              <label
                htmlFor="status"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Estado
              </label>
              <select
                id="status"
                name="status"
                defaultValue={activeStatus ?? ""}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Todos los estados</option>
                {ORDER_STATUS_VALUES.map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status, "DELIVERY")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2">
              <Button type="submit">Aplicar</Button>
              {activeStatus ? (
                <Button asChild type="button" variant="outline">
                  <Link href="/admin/pedidos">Limpiar</Link>
                </Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>

      {orders.length === 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {activeStatus
                ? "No encontramos pedidos para ese estado."
                : "Todavia no hay pedidos cargados."}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {activeStatus
              ? "Proba con otro estado o limpia el filtro para ver el resto de los pedidos."
              : "Cuando entren pedidos nuevos, vas a poder gestionarlos desde esta pantalla."}
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8">
          <AdminOrdersList initialOrders={orders} activeStatus={activeStatus} />
        </div>
      )}
    </div>
  )
}
