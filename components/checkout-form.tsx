"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/auth-context"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import { useCart } from "@/lib/cart-context"
import { DELIVERY_LABEL, PICKUP_ADDRESS, PICKUP_LABEL } from "@/lib/cart-config"
import { formatPrice } from "@/lib/data"
import { getOrderWhatsAppStorageKey } from "@/lib/order-whatsapp"

export function CheckoutForm() {
  const {
    items,
    subtotal,
    clearCart,
    totalItems,
    deliveryMethod: cartDeliveryMethod,
    shippingCost,
    total,
  } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefillAppliedRef = useRef(!!user)
  const [form, setForm] = useState(() => ({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    deliveryMethod: cartDeliveryMethod,
    street: user?.direccion ?? "",
    city: "",
    province: "",
    postalCode: "",
    paymentMethod: "transferencia",
  }))

  const isPickup = form.deliveryMethod === "PICKUP"
  const paymentOptions = isPickup
    ? [
        { value: "transferencia", label: "Transferencia bancaria" },
        { value: "efectivo", label: "Efectivo al recibir" },
      ]
    : [{ value: "transferencia", label: "Transferencia bancaria" }]

  useEffect(() => {
    if (!user || prefillAppliedRef.current) return

    setForm((prev) => {
      let changed = false
      const next = { ...prev }

      if (!prev.name.trim() && user.name) {
        next.name = user.name
        changed = true
      }
      if (!prev.email.trim() && user.email) {
        next.email = user.email
        changed = true
      }
      if (!prev.phone.trim() && user.phone) {
        next.phone = user.phone
        changed = true
      }
      if (!prev.street.trim() && user.direccion) {
        next.street = user.direccion
        changed = true
      }

      return changed ? next : prev
    })

    prefillAppliedRef.current = true
  }, [user])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleDeliveryChange = (method: "DELIVERY" | "PICKUP") => {
    setForm((prev) => ({
      ...prev,
      deliveryMethod: method,
      paymentMethod: method === "DELIVERY" ? "transferencia" : prev.paymentMethod,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const shippingAddress = isPickup
      ? null
      : `${form.street}, ${form.city}, ${form.province} (${form.postalCode})`

    const paymentMethod = form.paymentMethod === "transferencia" ? "TRANSFER" : "CASH"

    const orderData = {
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      delivery_method: form.deliveryMethod,
      shipping_address: shippingAddress,
      payment_method: paymentMethod,
      items: items.map((item) => ({
        variant_size_id: item.variantSizeId,
        cantidad: item.quantity,
      })),
    }

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al crear la orden")
      }

      const { orden } = await res.json()

      const itemsList = items
        .map(
          (item) =>
            `- ${item.productName} (${item.color}/${item.size}) x${item.quantity}: ${formatPrice(item.unitPrice * item.quantity)}`
        )
        .join("\n")

      const deliveryText = isPickup
        ? `${PICKUP_LABEL} - ${PICKUP_ADDRESS}`
        : `${DELIVERY_LABEL} (${shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)})`

      const addressText = shippingAddress || PICKUP_ADDRESS

      const message = `Hola! Quiero realizar un pedido (Orden #${orden.id}):\n\n${itemsList}\n\nSubtotal: ${formatPrice(subtotal)}\nEntrega: ${deliveryText}\nTotal: ${formatPrice(total)}\n\nDatos:\nNombre: ${form.name}\nEmail: ${form.email}\nTel: ${form.phone}\nDireccion: ${addressText}\nPago: ${form.paymentMethod}`

      const whatsappUrl = `${BUSINESS_CONTACT.whatsappUrl}?text=${encodeURIComponent(message)}`
      const whatsappWindow = window.open(whatsappUrl, "_blank")
      const whatsappWasBlocked = !whatsappWindow

      if (whatsappWindow) {
        whatsappWindow.opener = null
      } else {
        try {
          window.sessionStorage.setItem(getOrderWhatsAppStorageKey(orden.id), whatsappUrl)
        } catch {
          // El boton de respaldo igualmente abrira el chat de WhatsApp.
        }
      }

      clearCart()
      router.push(
        `/pedido/${orden.id}?success=1${whatsappWasBlocked ? "&whatsapp=blocked" : ""}`
      )
    } catch (err: any) {
      setError(err.message || "Error desconocido")
      setLoading(false)
    }
  }

  if (totalItems === 0 && !loading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20 text-center lg:px-8">
        <p className="text-lg text-muted-foreground">
          Tu carrito esta vacio.
        </p>
        <Button
          asChild
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Link href="/productos">Ver productos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <Link
        href="/productos"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Seguir comprando
      </Link>

      <h1 className="mb-8 font-serif text-3xl font-bold text-foreground">
        Finalizar compra
      </h1>

      <div className="grid gap-10 lg:grid-cols-5">
        <form onSubmit={handleSubmit} className="lg:col-span-3">
          <div className="flex flex-col gap-8">
            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-foreground">
                Datos personales
              </legend>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={form.name}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="tu@email.com"
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-sm font-medium text-foreground"
                  >
                    Telefono
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={form.phone}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="11 1234-5678"
                  />
                </div>
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-foreground">
                Metodo de entrega
              </legend>
              <div className="flex flex-col gap-3">
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    form.deliveryMethod === "DELIVERY"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="DELIVERY"
                    checked={form.deliveryMethod === "DELIVERY"}
                    onChange={() => handleDeliveryChange("DELIVERY")}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {DELIVERY_LABEL}
                  </span>
                </label>
                <label
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                    form.deliveryMethod === "PICKUP"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-secondary/50"
                  }`}
                >
                  <input
                    type="radio"
                    name="deliveryMethod"
                    value="PICKUP"
                    checked={form.deliveryMethod === "PICKUP"}
                    onChange={() => handleDeliveryChange("PICKUP")}
                    className="accent-primary"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {PICKUP_LABEL}
                  </span>
                </label>
              </div>
            </fieldset>

            {!isPickup && (
              <fieldset>
                <legend className="mb-4 text-lg font-semibold text-foreground">
                  Direccion de envio
                </legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="street"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Calle y numero
                    </label>
                    <input
                      type="text"
                      id="street"
                      name="street"
                      required
                      value={form.street}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Av. Ejemplo 1234"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="city"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Ciudad
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      required
                      value={form.city}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="Buenos Aires"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="province"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Provincia
                    </label>
                    <input
                      type="text"
                      id="province"
                      name="province"
                      required
                      value={form.province}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="CABA"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="postalCode"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Codigo postal
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      required
                      value={form.postalCode}
                      onChange={handleChange}
                      className="h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="1234"
                    />
                  </div>
                </div>
              </fieldset>
            )}

            {isPickup && (
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Retiro seleccionado</p>
                <p className="mt-1 text-sm text-muted-foreground">{PICKUP_LABEL}</p>
                <p className="text-sm text-muted-foreground">{PICKUP_ADDRESS}</p>
              </div>
            )}

            <fieldset>
              <legend className="mb-4 text-lg font-semibold text-foreground">
                Metodo de pago
              </legend>
              <div className="flex flex-col gap-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      form.paymentMethod === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-secondary/50"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={option.value}
                      checked={form.paymentMethod === option.value}
                      onChange={handleChange}
                      className="accent-primary"
                    />
                    <span className="text-sm font-medium text-foreground">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Procesando...
                </>
              ) : (
                "Enviar pedido"
              )}
            </Button>

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </div>
        </form>

        <aside className="lg:col-span-2">
          <div className="sticky top-24 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-lg font-semibold text-card-foreground">
              Resumen del pedido
            </h2>
            <div className="flex flex-col gap-4">
              {items.map((item) => (
                <div key={item.variantSizeId} className="flex gap-3">
                  <div className="relative size-14 shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={item.image}
                      alt={item.productName}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium leading-tight text-card-foreground">
                      {item.productName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.color} / {item.size} x{item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-card-foreground">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </p>
                </div>
              ))}
            </div>

            <Separator className="my-4 bg-border" />

            <div className="flex flex-col gap-2 text-sm">
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-muted-foreground">
                <span className="font-medium text-foreground">Entrega: </span>
                {isPickup ? `${PICKUP_LABEL} - ${PICKUP_ADDRESS}` : DELIVERY_LABEL}
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Envio</span>
                <span className="text-foreground">
                  {shippingCost === 0 ? "Gratis" : formatPrice(shippingCost)}
                </span>
              </div>
              <Separator className="my-1 bg-border" />
              <div className="flex justify-between text-base font-bold text-foreground">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
