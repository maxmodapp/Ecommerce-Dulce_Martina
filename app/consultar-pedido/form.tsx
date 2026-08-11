"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function ConsultarPedidoForm() {
  const [code, setCode] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = code.trim()
    if (!/^\d{6}$/.test(trimmed)) {
      setError("El número de pedido debe tener 6 cifras")
      return
    }
    setError("")
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(trimmed)}`)
      if (res.ok) {
        router.push(`/pedido/${encodeURIComponent(trimmed)}`)
      } else {
        setError("Pedido no encontrado. Verifica el código y volvé a intentar.")
      }
    } catch (err) {
      console.error("fetch order error", err)
      setError("Ocurrió un error, intentá nuevamente más tarde.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      <Input
        inputMode="numeric"
        maxLength={6}
        placeholder="Número de pedido (6 cifras)"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full">
        Ver pedido
      </Button>
    </form>
  )
}
