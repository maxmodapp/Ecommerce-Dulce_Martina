"use client"

import Link from "next/link"
import Image from "next/image"
import { Check, Minus, Plus, Trash2, Truck } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/lib/cart-context"
import { useCartDrawer } from "@/lib/cart-drawer-context"
import { formatPrice } from "@/lib/data"
import {
  DELIVERY_LABEL,
  FREE_SHIPPING_THRESHOLD,
  PICKUP_ADDRESS,
  PICKUP_LABEL,
  getEstimatedDeliveryCost,
} from "@/lib/cart-config"
import type { DeliveryMethod } from "@/lib/types"

const DELIVERY_OPTIONS: Array<{
  value: DeliveryMethod
  title: string
  description: string
}> = [
  {
    value: "DELIVERY",
    title: DELIVERY_LABEL,
    description: "Costo estimado. Luego se puede ajustar mejor por código postal.",
  },
  {
    value: "PICKUP",
    title: PICKUP_LABEL,
    description: PICKUP_ADDRESS,
  },
]

export function CartDrawer() {
  const {
    items,
    removeItem,
    updateQuantity,
    subtotal,
    totalItems,
    deliveryMethod,
    setDeliveryMethod,
    shippingCost,
    total,
  } = useCart()
  const { isOpen, close } = useCartDrawer()

  const estimatedDeliveryCost = getEstimatedDeliveryCost()

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()}>
      <SheetContent side="right" className="flex min-h-0 flex-col bg-card sm:max-w-lg">
        <SheetHeader className="px-5 pt-5">
          <SheetTitle className="font-serif text-foreground">
            Tu Carrito ({totalItems})
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Revisa tus productos antes de finalizar la compra.
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="text-muted-foreground">Tu carrito esta vacio</p>
            <Button
              asChild
              variant="outline"
              onClick={close}
              className="border-border text-foreground hover:bg-secondary"
            >
              <Link href="/productos" prefetch={false}>
                Ver productos
              </Link>
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="min-h-0 flex-1 -mx-5 px-7">
              <div className="flex flex-col gap-4 px-2 pb-4">
                {items.map((item) => {
                  const canIncrease = item.quantity < item.maxStock

                  return (
                    <div key={item.variantSizeId} className="flex gap-3 pr-2">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={item.image}
                          alt={item.productName}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-1">
                        <p className="text-sm font-medium leading-tight text-foreground">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.color} / {item.size}
                        </p>
                        <p className="text-sm font-semibold text-foreground">
                          {formatPrice(item.unitPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Máximo disponible: {item.maxStock}
                        </p>
                        <div className="mt-1 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.variantSizeId, item.quantity - 1)}
                            className="flex size-6 items-center justify-center rounded border border-border text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="Reducir cantidad"
                          >
                            <Minus className="size-3" />
                          </button>
                          <span className="min-w-6 text-center text-sm text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.variantSizeId, item.quantity + 1)}
                            disabled={!canIncrease}
                            className="flex size-6 items-center justify-center rounded border border-border text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="size-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.variantSizeId)}
                            className="ml-auto rounded p-1 text-muted-foreground transition-colors hover:text-destructive focus:outline-none focus:ring-2 focus:ring-ring"
                            aria-label="Eliminar producto"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <Separator className="bg-border" />

              <div className="px-2 py-4">
                <div className="mb-3 flex items-center gap-2">
                  <Truck className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    Entrega
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  {DELIVERY_OPTIONS.map((option) => {
                    const selected = deliveryMethod === option.value
                    const optionCost = option.value === "PICKUP" ? 0 : estimatedDeliveryCost

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setDeliveryMethod(option.value)}
                        className={`rounded-xl border p-4 text-left transition-colors ${
                          selected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:bg-secondary/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border ${
                              selected
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-border text-transparent"
                            }`}
                          >
                            <Check className="size-3" />
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  {option.title}
                                </p>
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                                  {option.description}
                                </p>
                              </div>
                              <span className="min-w-[88px] shrink-0 text-right text-sm font-semibold text-foreground">
                                {optionCost === 0 ? "Gratis" : formatPrice(optionCost)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {estimatedDeliveryCost > 0 && (
                  <p className="mt-3 text-xs text-muted-foreground">
                    Envío gratis en compras mayores a {formatPrice(FREE_SHIPPING_THRESHOLD)}.
                  </p>
                )}
              </div>
            </ScrollArea>

            <Separator className="bg-border" />

            <SheetFooter className="shrink-0 flex-col gap-3 px-5 pb-5 pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium text-foreground">Subtotal</span>
                  <span className="min-w-[88px] text-right text-foreground">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-muted-foreground">
                  <span>Entrega</span>
                  <span className="min-w-[88px] text-right text-foreground">
                    {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-base font-bold text-foreground">
                  <span>Total estimado</span>
                  <span className="min-w-[88px] text-right">{formatPrice(total)}</span>
                </div>
              </div>
              <Button
                asChild
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={close}
              >
                <Link href="/checkout" prefetch={false}>
                  Finalizar compra
                </Link>
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
