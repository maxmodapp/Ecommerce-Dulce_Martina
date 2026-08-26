import Link from "next/link"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { OrderDetailView } from "@/components/order-detail-view"
import { OrderWhatsAppFallback } from "@/components/order-whatsapp-fallback"
import { Card, CardContent } from "@/components/ui/card"
import { apiOrderToUI } from "@/lib/adapters/order"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import { getOrigin } from "@/lib/server/origin"
import type { OrderDetail } from "@/lib/types"

export const metadata = {
  title: "Pedido | Dulce Martina",
  description: "Consulta el detalle de tu pedido",
}

export default async function PedidoPage({
  params,
  searchParams,
}: {
  params: Promise<{ codigo: string }>
  searchParams?: Promise<{
    success?: string | string[]
    whatsapp?: string | string[]
  }>
}) {
  const { codigo } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const showSuccessBanner = Array.isArray(resolvedSearchParams?.success)
    ? resolvedSearchParams.success.includes("1")
    : resolvedSearchParams?.success === "1"
  const showWhatsAppFallback = Array.isArray(resolvedSearchParams?.whatsapp)
    ? resolvedSearchParams.whatsapp.includes("blocked")
    : resolvedSearchParams?.whatsapp === "blocked"

  const origin = await getOrigin()
  const requestHeaders = await headers()
  const cookie = requestHeaders.get("cookie")

  const response = await fetch(`${origin}/api/orders/${encodeURIComponent(codigo)}`, {
    cache: "no-store",
    headers: cookie ? { cookie } : undefined,
  })

  if (response.status === 401) {
    const errorData = await response.json().catch(() => null)

    if (errorData?.code === "AUTH_REQUIRED") {
      const orderPath = `/pedido/${encodeURIComponent(codigo)}`
      redirect(`/login?next=${encodeURIComponent(orderPath)}`)
    }
  }

  if (!response.ok) {
    return (
      <div className="mx-auto max-w-md px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Pedido no encontrado</h1>
        <p className="mt-2 text-muted-foreground">
          No pudimos encontrar un pedido con el codigo {codigo}. Verifica el codigo e intenta
          nuevamente.
        </p>
      </div>
    )
  }

  const data = await response.json()
  const order: OrderDetail = apiOrderToUI(data)

  const footerContent = (
    <Card>
      <CardContent className="py-6 text-center text-sm text-muted-foreground">
        Podes consultar el estado de tu pedido en todo momento desde "Consultar pedido" usando el
        numero de orden. Si tenes dudas sobre tu pedido, podes escribirnos por{" "}
        <Link
          href={BUSINESS_CONTACT.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-4"
        >
          WhatsApp
        </Link>
        .
      </CardContent>
    </Card>
  )

  return (
    <OrderDetailView
      order={order}
      showSuccessBanner={showSuccessBanner}
      successAction={
        showSuccessBanner && showWhatsAppFallback ? (
          <OrderWhatsAppFallback orderNumber={order.id} />
        ) : null
      }
      footerContent={footerContent}
    />
  )
}
