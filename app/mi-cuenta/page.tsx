import Link from "next/link"
import { redirect } from "next/navigation"
import { AccountForm } from "@/components/account-form"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { getOrderSummaryForUser } from "@/lib/account-orders"
import { getCurrentUser } from "@/lib/auth"
import { formatPrice } from "@/lib/data"
import { getDeliveryMethodLabel, getOrderStatusLabel } from "@/lib/order-display"

export const metadata = {
  title: "Mi cuenta | Dulce Martina",
  description: "Consulta y edita tu informacion personal.",
}

export default async function MiCuentaPage() {
  const user = await getCurrentUser()
  if (!user) redirect("/login?next=/mi-cuenta")
  const orderSummary = await getOrderSummaryForUser(user.id)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Mi cuenta</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
          Tus datos
        </h1>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Informacion personal</CardTitle>
            <CardDescription>
              Edita tu nombre, correo, telefono y direccion cuando lo necesites.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountForm initialUser={user} />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Cuenta activa</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Correo</p>
                <p className="mt-1 text-foreground">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Telefono</p>
                <p className="mt-1 text-foreground">{user.phone}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Direccion</p>
                <p className="mt-1 text-foreground">
                  {user.direccion || "Todavia no agregaste una direccion."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card id="mis-pedidos">
            <CardHeader>
              <CardTitle className="text-xl">Mis pedidos</CardTitle>
              <CardDescription>resumen</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              {orderSummary.totalCount > 0 && orderSummary.latestOrder ? (
                <>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Total de pedidos
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-foreground">
                      {orderSummary.totalCount}
                    </p>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Ultimo pedido
                    </p>
                    <p className="order-number font-medium text-foreground">
                      #{orderSummary.latestOrder.id}
                    </p>
                    <p className="text-muted-foreground">
                      {getOrderStatusLabel(
                        orderSummary.latestOrder.status as any,
                        orderSummary.latestOrder.deliveryMethod
                      )}{" "}
                      · {getDeliveryMethodLabel(orderSummary.latestOrder.deliveryMethod)}
                    </p>
                    <p className="font-medium text-foreground">
                      {formatPrice(orderSummary.latestOrder.total)}
                    </p>
                  </div>

                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/mis-pedidos">Ver mis pedidos</Link>
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">
                    Todavia no tenes pedidos asociados a tu cuenta.
                  </p>
                  <Button asChild variant="outline" className="w-full sm:w-auto">
                    <Link href="/productos">Ir a comprar</Link>
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
