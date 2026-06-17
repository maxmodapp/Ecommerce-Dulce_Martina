"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { ArrowDown, ArrowUp, PencilLine, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { formatPrice } from "@/lib/data"
import {
  HOME_SECTION_LABELS,
  HOME_SECTION_ROUTE_SEGMENTS,
  type AdminHomeSectionItem,
  type HomeSection,
} from "@/lib/types"

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = await response.json()
    return data.error ?? fallback
  } catch {
    return fallback
  }
}

export function AdminHomeSectionList({
  section,
  initialItems,
}: {
  section: HomeSection
  initialItems: AdminHomeSectionItem[]
}) {
  const [items, setItems] = useState(initialItems)
  const [error, setError] = useState("")
  const [pendingItemId, setPendingItemId] = useState<string | null>(null)

  const routeSegment = useMemo(() => HOME_SECTION_ROUTE_SEGMENTS[section], [section])

  async function runAction(
    itemId: string,
    payload:
      | { action: "move"; itemId: string; direction: "up" | "down" }
      | { action: "remove"; itemId: string }
  ) {
    setError("")
    setPendingItemId(itemId)

    try {
      const response = await fetch(`/api/admin/home-sections/${routeSegment}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos actualizar la seccion."))
      }

      const data = await response.json()
      setItems(data.items ?? [])
    } catch (err: any) {
      setError(err.message ?? "No pudimos actualizar la seccion.")
    } finally {
      setPendingItemId(null)
    }
  }

  if (items.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <PencilLine className="size-5" />
          </EmptyMedia>
          <EmptyTitle>No hay productos en {HOME_SECTION_LABELS[section].toLowerCase()}.</EmptyTitle>
          <EmptyDescription>
            Suma productos desde la ficha admin de cada producto y luego vuelve aqui para ordenarlos
            o quitarlos.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild variant="outline">
            <Link href="/admin/productos">Ir a productos</Link>
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-2 py-6 text-sm text-muted-foreground">
          <p>
            Esta lista muestra los productos ya incluidos en <strong>{HOME_SECTION_LABELS[section]}</strong>.
          </p>
          <p>Desde aqui solo puedes reordenarlos o quitarlos. La inclusion se hace desde Productos.</p>
        </CardContent>
      </Card>

      {items.map((item, index) => {
        const isPending = pendingItemId === item.id
        const isFirst = index === 0
        const isLast = index === items.length - 1

        return (
          <Card key={item.id}>
            <CardContent className="space-y-5 py-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                <div className="flex w-full gap-4">
                  <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/30">
                    {item.product.coverImageUrl ? (
                      <img
                        src={item.product.coverImageUrl}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="px-3 text-center text-xs text-muted-foreground">
                        Sin imagen
                      </span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="font-serif text-2xl font-bold text-foreground">
                            {item.product.name}
                          </h2>
                          <Badge variant={item.product.active ? "default" : "secondary"}>
                            {item.product.active ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">/{item.product.slug}</p>
                      </div>

                      <p className="text-lg font-semibold text-foreground">
                        {formatPrice(item.product.price)}
                      </p>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide">Categoria</p>
                        <p className="mt-1 text-foreground">
                          {item.product.category?.name ?? "Sin categoria"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide">Posicion</p>
                        <p className="mt-1 text-foreground">{index + 1}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide">Home</p>
                        <p className="mt-1 text-foreground">
                          {item.product.active
                            ? "Visible mientras siga activo."
                            : "No se mostrara en la home mientras este inactivo."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
                <div className="flex flex-wrap gap-2">
                  <Button asChild className="w-full sm:w-auto">
                    <Link href={`/admin/productos/${item.product.id}`}>
                      <PencilLine className="size-4" />
                      Abrir producto
                    </Link>
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isPending || isFirst}
                    onClick={() =>
                      void runAction(item.id, { action: "move", itemId: item.id, direction: "up" })
                    }
                  >
                    <ArrowUp className="size-4" />
                    Subir
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:w-auto"
                    disabled={isPending || isLast}
                    onClick={() =>
                      void runAction(item.id, {
                        action: "move",
                        itemId: item.id,
                        direction: "down",
                      })
                    }
                  >
                    <ArrowDown className="size-4" />
                    Bajar
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-destructive hover:text-destructive sm:w-auto"
                    disabled={isPending}
                    onClick={() =>
                      void runAction(item.id, {
                        action: "remove",
                        itemId: item.id,
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                    Quitar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
