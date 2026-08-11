import Link from "next/link"
import { redirect } from "next/navigation"
import { ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import { getCurrentUser } from "@/lib/auth"
import { getOrdersForUser } from "@/lib/account-orders"
import { getDeliveryMethodLabel, getOrderStatusLabel } from "@/lib/order-display"

export const metadata = {
  title: "Mis pedidos | Dulce Martina",
  description: "Revisa los pedidos asociados a tu cuenta.",
}

export default async function MisPedidosPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/mis-pedidos")

  const orders = await getOrdersForUser(user.id)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Mis pedidos</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
          Tus compras
        </h1>
      </div>

      {orders.length === 0 ? (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Todavia no tenes pedidos asociados a tu cuenta.</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              Cuando hagas una compra con sesion iniciada, vas a verla automaticamente desde esta
              pagina.
            </p>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/productos">Ver productos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pedido</p>
                      <h2 className="order-number font-serif text-2xl font-bold text-foreground">
                        #{order.id}
                      </h2>
                    </div>
                    <Badge variant="secondary" className="w-fit px-3 py-1 text-xs">
                      {getOrderStatusLabel(order.status as any, order.deliveryMethod)}
                    </Badge>
                  </div>

                  <div className="mt-4 grid gap-4 text-sm text-muted-foreground sm:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide">Fecha</p>
                      <p className="mt-1 text-foreground">
                        {new Date(order.createdAt).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Entrega</p>
                      <p className="mt-1 text-foreground">
                        {getDeliveryMethodLabel(order.deliveryMethod)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Total</p>
                      <p className="mt-1 text-foreground">{formatPrice(order.total)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Estado</p>
                      <p className="mt-1 text-foreground">
                        {getOrderStatusLabel(order.status as any, order.deliveryMethod)}
                      </p>
                    </div>
                  </div>
                </div>

                <Button asChild variant="outline" className="shrink-0">
                  <Link href={`/pedido/${order.id}`}>
                    Ver detalle
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
