"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrderStatusOptions } from "@/lib/order-display"
import type { OrderStatus } from "@/lib/types"

interface AdminOrderStatusSelectProps {
  orderId: string
  deliveryMethod: string
  paymentMethod: string
  status: OrderStatus
  onUpdated?: (status: OrderStatus) => void
  refreshOnSuccess?: boolean
}

type StockIssue = {
  variantSizeId?: string
  productName?: string
  color?: string
  size?: string
  required?: number
  available?: number
}

export function AdminOrderStatusSelect({
  orderId,
  deliveryMethod,
  paymentMethod,
  status,
  onUpdated,
  refreshOnSuccess = false,
}: AdminOrderStatusSelectProps) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")
  const [emailWarning, setEmailWarning] = useState("")
  const [pendingCancellation, setPendingCancellation] = useState(false)
  const [stockIssues, setStockIssues] = useState<StockIssue[]>([])

  async function saveStatus(resolvedStatus: OrderStatus) {
    setError("")
    setEmailWarning("")
    setStockIssues([])
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: resolvedStatus }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        const items = data?.details?.items
        setStockIssues(Array.isArray(items) ? items : [])
        throw new Error(data.error ?? "No pudimos actualizar el estado.")
      }

      setCurrentStatus(data.order.status)
      setPendingCancellation(false)
      onUpdated?.(data.order.status)

      if (data?.notification?.emailAttempted && !data?.notification?.emailSent) {
        setEmailWarning(
          "El estado se actualizo, pero no pudimos enviar el correo al cliente."
        )
      }

      if (refreshOnSuccess) {
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message ?? "No pudimos actualizar el estado.")
    } finally {
      setIsSaving(false)
    }
  }

  function handleStatusChange(nextStatus: string) {
    const resolvedStatus = nextStatus as OrderStatus

    setError("")
    setEmailWarning("")
    setStockIssues([])

    if (resolvedStatus === currentStatus) {
      setPendingCancellation(false)
      return
    }

    if (resolvedStatus === "CANCELLED" && currentStatus !== "CANCELLED") {
      setPendingCancellation(true)
      return
    }

    setPendingCancellation(false)
    void saveStatus(resolvedStatus)
  }

  return (
    <div className="space-y-2">
      <Select value={currentStatus} onValueChange={(value) => void handleStatusChange(value)}>
        <SelectTrigger className="w-full" disabled={isSaving}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {getOrderStatusOptions(deliveryMethod, paymentMethod).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {emailWarning ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
          {emailWarning}
        </p>
      ) : null}
      {pendingCancellation ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Confirmar cancelacion del pedido</p>
          <p className="mt-1">
            Al cancelarlo se recuperara el stock y el pedido quedara cancelado. Si despues lo
            reactivas, intentaremos descontar el stock otra vez y puede fallar si no hay unidades.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={isSaving}
              onClick={() => void saveStatus("CANCELLED")}
            >
              Cancelar pedido
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSaving}
              onClick={() => setPendingCancellation(false)}
            >
              Volver
            </Button>
          </div>
        </div>
      ) : null}
      {stockIssues.length > 0 ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">Productos sin stock suficiente</p>
          <ul className="mt-2 space-y-1">
            {stockIssues.map((item) => (
              <li key={item.variantSizeId}>
                {item.productName ?? "Producto"} ({item.color ?? "Color"}, talle{" "}
                {item.size ?? "sin talle"}): necesita {item.required ?? 0}, disponible{" "}
                {item.available ?? 0}.
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {isSaving ? <p className="text-xs text-muted-foreground">Guardando...</p> : null}
    </div>
  )
}
