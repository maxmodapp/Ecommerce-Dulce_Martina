"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getOrderStatusOptions } from "@/lib/order-display"
import type { OrderStatus } from "@/lib/types"

interface AdminOrderStatusSelectProps {
  orderId: string
  deliveryMethod: string
  status: OrderStatus
  onUpdated?: (status: OrderStatus) => void
  refreshOnSuccess?: boolean
}

export function AdminOrderStatusSelect({
  orderId,
  deliveryMethod,
  status,
  onUpdated,
  refreshOnSuccess = false,
}: AdminOrderStatusSelectProps) {
  const router = useRouter()
  const [currentStatus, setCurrentStatus] = useState<OrderStatus>(status)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleStatusChange(nextStatus: string) {
    const previousStatus = currentStatus
    const resolvedStatus = nextStatus as OrderStatus

    setError("")
    setCurrentStatus(resolvedStatus)
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: resolvedStatus }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos actualizar el estado.")
      }

      setCurrentStatus(data.order.status)
      onUpdated?.(data.order.status)

      if (refreshOnSuccess) {
        router.refresh()
      }
    } catch (err: any) {
      setCurrentStatus(previousStatus)
      setError(err.message ?? "No pudimos actualizar el estado.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <Select value={currentStatus} onValueChange={(value) => void handleStatusChange(value)}>
        <SelectTrigger className="w-full" disabled={isSaving}>
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          {getOrderStatusOptions(deliveryMethod).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {isSaving ? <p className="text-xs text-muted-foreground">Guardando...</p> : null}
    </div>
  )
}
