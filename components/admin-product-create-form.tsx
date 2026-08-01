"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import type { AdminSubcategoryOption, Audience } from "@/lib/types"
import { AUDIENCE_LABELS, AUDIENCE_VALUES } from "@/lib/types"

type FormState = {
  name: string
  slug: string
  description: string
  subcategoryId: string
  gender: Audience
  price: string
  active: boolean
}

function getInitialState(): FormState {
  return {
    name: "",
    slug: "",
    description: "",
    subcategoryId: "",
    gender: "AMBOS",
    price: "",
    active: true,
  }
}

export function AdminProductCreateForm({
  subcategories,
}: {
  subcategories: AdminSubcategoryOption[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(getInitialState)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          subcategoryId: form.subcategoryId,
          gender: form.gender,
          price: Number(form.price),
          active: form.active,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "No pudimos crear el producto.")
      }

      router.replace(`/admin/productos/${data.product.id}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos crear el producto.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
            Nombre
          </label>
          <input
            id="name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="Nombre del producto"
            autoComplete="off"
          />
        </div>

        <div>
          <label htmlFor="slug" className="mb-2 block text-sm font-medium text-foreground">
            Slug
          </label>
          <input
            id="slug"
            value={form.slug}
            onChange={(event) => updateField("slug", event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="producto-nuevo"
            autoComplete="off"
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="mb-2 block text-sm font-medium text-foreground">
          Descripcion
        </label>
        <textarea
          id="description"
          value={form.description}
          onChange={(event) => updateField("description", event.target.value)}
          rows={5}
          className="w-full rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          placeholder="Describe el producto"
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="subcategoryId" className="mb-2 block text-sm font-medium text-foreground">
            Subcategoria
          </label>
          <select
            id="subcategoryId"
            value={form.subcategoryId}
            onChange={(event) => updateField("subcategoryId", event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Seleccionar subcategoria</option>
            {subcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.category.name} / {subcategory.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="price" className="mb-2 block text-sm font-medium text-foreground">
            Precio
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="1"
            value={form.price}
            onChange={(event) => updateField("price", event.target.value)}
            className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
            placeholder="0"
          />
        </div>
      </div>

      <div>
        <label htmlFor="gender" className="mb-2 block text-sm font-medium text-foreground">
          Genero del producto
        </label>
        <select
          id="gender"
          value={form.gender}
          onChange={(event) => updateField("gender", event.target.value as Audience)}
          className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        >
          {AUDIENCE_VALUES.map((audience) => (
            <option key={audience} value={audience}>
              {AUDIENCE_LABELS[audience]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-foreground">Producto activo</p>
          <p className="text-xs text-muted-foreground">
            Si esta activo, va a poder mostrarse en la tienda publica.
          </p>
        </div>
        <Switch
          checked={form.active}
          onCheckedChange={(value) => updateField("active", value)}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? "Creando..." : "Crear producto"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => router.push("/admin/productos")}
        >
          Cancelar
        </Button>
      </div>
    </form>
  )
}
