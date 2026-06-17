"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Switch } from "@/components/ui/switch"

interface AdminProductToggleProps {
  productId: string
  active: boolean
}

export function AdminProductToggle({ productId, active }: AdminProductToggleProps) {
  const router = useRouter()
  const [checked, setChecked] = useState(active)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState("")

  async function handleCheckedChange(nextChecked: boolean) {
    const previous = checked

    setChecked(nextChecked)
    setIsSaving(true)
    setError("")

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: nextChecked }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos actualizar el producto.")
      }

      setChecked(Boolean(data.product?.active))
      router.refresh()
    } catch (err: any) {
      setChecked(previous)
      setError(err.message ?? "No pudimos actualizar el producto.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            {checked ? "Activo" : "Inactivo"}
          </p>
          <p className="text-xs text-muted-foreground">
            {checked ? "Visible en la tienda" : "Oculto en la tienda"}
          </p>
        </div>
        <Switch checked={checked} onCheckedChange={handleCheckedChange} disabled={isSaving} />
      </div>

      {error ? <p className="text-xs text-destructive">{error}</p> : null}
      {isSaving ? <p className="text-xs text-muted-foreground">Guardando...</p> : null}
    </div>
  )
}
