import type { ReactNode } from "react"
import { CheckCircle2 } from "lucide-react"
import Image from "next/image"
import { OrderTimeline } from "@/components/order-timeline"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import {
  getDeliveryMethodLabel,
  getOrderStatusLabel,
  getOrderStatusMessage,
  getPaymentHelpText,
  getPaymentMethodLabel,
  getPaymentStateLabel,
} from "@/lib/order-display"
import type { OrderDetail } from "@/lib/types"

const TRANSFER_ACCOUNT = {
  cbu: "1234567890123456789012",
  alias: "dulce.martina.pagos",
}

interface OrderDetailViewProps {
  order: OrderDetail
  showSuccessBanner?: boolean
  topContent?: ReactNode
  footerContent?: ReactNode
}

export function OrderDetailView({
  order,
  showSuccessBanner = false,
  topContent,
  footerContent,
}: OrderDetailViewProps) {
  const statusLabel = getOrderStatusLabel(order.status, order.deliveryMethod)
  const statusMessage = getOrderStatusMessage(order.status, order.deliveryMethod)
  const deliveryLabel = getDeliveryMethodLabel(order.deliveryMethod)
  const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod)
  const paymentHelpText = getPaymentHelpText(
    order.paymentMethod,
    order.deliveryMethod,
    order.status
  )
  const showTransferState = order.paymentMethod === "TRANSFER"
  const showTransferPendingNotice = showTransferState && order.status === "PENDING"
  const showTransferAccount = showTransferState && order.status !== "PENDING"
  const transferAccountIntro =
    order.status === "CONFIRMED"
      ? "Realiza la transferencia a la siguiente cuenta con el monto exacto del total y envia el comprobante por WhatsApp (2345000000)."
      : "Datos de la cuenta de transferencia de este pedido."
  const transferAccountFooter =
    order.status === "CONFIRMED"
      ? "Cuando confirmemos el pago, pasaremos tu pedido a la siguiente etapa."
      : "El pago por transferencia ya figura confirmado."
  const showShippingRow = order.deliveryMethod === "DELIVERY"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:px-8">
      {showSuccessBanner && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col gap-4 py-6 sm:flex-row sm:items-start">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-serif text-2xl font-bold text-foreground">
                Pedido registrado con exito
              </h1>
              <p className="mt-2 text-sm text-muted-foreground sm:text-base">
                Tu pedido fue registrado correctamente y enviado.
              </p>
              <p className="mt-3 text-sm text-muted-foreground">
                Guarda el codigo{" "}
                <span className="order-number font-medium text-foreground">#{order.id}</span>{" "}
                para consultarlo cuando quieras.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {topContent}

      <Card className="overflow-hidden py-0">
        <CardHeader className="gap-3 border-b bg-secondary/20 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Pedido</p>
              <CardTitle className="order-number mt-1 font-serif text-3xl text-foreground">
                #{order.id}
              </CardTitle>
              <p className="mt-2 text-sm text-muted-foreground">
                Realizado el {new Date(order.createdAt).toLocaleDateString("es-AR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
              {showTransferPendingNotice && (
                <p className="mt-4 rounded-xl bg-secondary/30 p-4 text-sm text-muted-foreground">
                  Te diremos a donde debes transferir el dinero una vez que confirmemos tu pedido.
                </p>
              )}

              {showTransferAccount && (
                <div className="mt-4 space-y-3 text-sm">
                  <p className="font-medium text-foreground">{transferAccountIntro}</p>
                  <div className="space-y-1 text-muted-foreground">
                    <p>
                      <span className="font-medium text-foreground">Monto total:</span>{" "}
                      {formatPrice(order.total)}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">CBU:</span>{" "}
                      {TRANSFER_ACCOUNT.cbu}
                    </p>
                    <p>
                      <span className="font-medium text-foreground">Alias:</span>{" "}
                      {TRANSFER_ACCOUNT.alias}
                    </p>
                  </div>
                  <p className="text-muted-foreground">
                    {transferAccountFooter}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-start gap-2 sm:items-end">
              <Badge variant="secondary" className="px-3 py-1 text-xs">
                {statusLabel}
              </Badge>
              {statusMessage && (
                <p className="max-w-xs text-sm text-muted-foreground sm:text-right">
                  {statusMessage}
                </p>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <OrderTimeline
        status={order.status}
        deliveryMethod={order.deliveryMethod}
        paymentMethod={order.paymentMethod}
      />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos del pedido</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 rounded-xl border border-border p-4">
                <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-lg bg-secondary/30">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">{item.productName}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.color} / {item.size}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {formatPrice(item.subtotal)}
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:grid-cols-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide">Precio unitario</p>
                      <p className="mt-1 text-foreground">{formatPrice(item.unitPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Cantidad</p>
                      <p className="mt-1 text-foreground">{item.quantity}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Subtotal</p>
                      <p className="mt-1 text-foreground">{formatPrice(item.subtotal)}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacion de entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Metodo</p>
                <p className="mt-1 text-foreground">{deliveryLabel}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {order.deliveryMethod === "PICKUP" ? "Retiro" : "Direccion"}
                </p>
                <p className="mt-1 text-foreground">
                  {order.deliveryMethod === "PICKUP"
                    ? "Local Dulce Martina · Saladillo - Saavedra 2825"
                    : order.shippingAddress || "A confirmar"}
                </p>
              </div>

              {showShippingRow && order.shippingCost > 0 && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Costo de envio
                  </p>
                  <p className="mt-1 text-foreground">{formatPrice(order.shippingCost)}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informacion de pago</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Metodo</p>
                <p className="mt-1 text-foreground">{paymentMethodLabel}</p>
              </div>

              {showTransferState && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Estado</p>
                  <p className="mt-1 text-foreground">{getPaymentStateLabel(order.status)}</p>
                </div>
              )}

              {paymentHelpText && (
                <p className="rounded-lg bg-secondary/30 p-3 text-muted-foreground">
                  {paymentHelpText}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="font-medium text-foreground">{formatPrice(order.subtotal)}</span>
              </div>

              {showShippingRow && (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Envio</span>
                  <span className="font-medium text-foreground">
                    {order.shippingCost === 0 ? "Gratis" : formatPrice(order.shippingCost)}
                  </span>
                </div>
              )}

              <div className="h-px bg-border" />

              <div className="flex items-center justify-between text-base font-semibold text-foreground">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {footerContent}
    </div>
  )
}
