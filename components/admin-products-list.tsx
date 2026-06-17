"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { PencilLine } from "lucide-react"
import { AdminProductToggle } from "@/components/admin-product-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { formatPrice } from "@/lib/data"
import type { AdminProductListItem } from "@/lib/types"

type SortOrder = "newest" | "oldest"

export function AdminProductsList({ products }: { products: AdminProductListItem[] }) {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest")

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, { id: string; name: string }>()

    for (const product of products) {
      if (!product.category) continue
      uniqueCategories.set(product.category.id, {
        id: product.category.id,
        name: product.category.name,
      })
    }

    return Array.from(uniqueCategories.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "es")
    )
  }, [products])

  const visibleProducts = useMemo(() => {
    const filteredProducts =
      selectedCategory === "all"
        ? products
        : products.filter((product) => product.category?.id === selectedCategory)

    const direction = sortOrder === "newest" ? -1 : 1

    const sortByCreatedAt = (left: AdminProductListItem, right: AdminProductListItem) => {
      const leftTime = new Date(left.createdAt).getTime()
      const rightTime = new Date(right.createdAt).getTime()

      if (leftTime === rightTime) {
        return left.name.localeCompare(right.name, "es")
      }

      return (leftTime - rightTime) * direction
    }

    const activeProducts = filteredProducts
      .filter((product) => product.active)
      .slice()
      .sort(sortByCreatedAt)
    const inactiveProducts = filteredProducts
      .filter((product) => !product.active)
      .slice()
      .sort(sortByCreatedAt)

    return [...activeProducts, ...inactiveProducts]
  }, [products, selectedCategory, sortOrder])

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="category-filter"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Categoria
              </label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="sort-order"
                className="mb-1.5 block text-sm font-medium text-foreground"
              >
                Antiguedad
              </label>
              <select
                id="sort-order"
                value={sortOrder}
                onChange={(event) => setSortOrder(event.target.value as SortOrder)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Mas nuevos</option>
                <option value="oldest">Mas antiguos</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {visibleProducts.map((product) => (
        <Card key={product.id}>
          <CardContent className="space-y-5 py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <div className="flex w-full gap-4">
                <div className="flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-secondary/30">
                  {product.coverImageUrl ? (
                    <img
                      src={product.coverImageUrl}
                      alt={product.name}
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
                          {product.name}
                        </h2>
                        <Badge variant={product.active ? "default" : "secondary"}>
                          {product.active ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{product.slug}</p>
                    </div>

                    <p className="text-lg font-semibold text-foreground">
                      {formatPrice(product.price)}
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide">Categoria</p>
                      <p className="mt-1 text-foreground">
                        {product.category?.name ?? "Sin categoria"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide">Stock total</p>
                      <p className="mt-1 text-foreground">{product.totalStock}</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-xs uppercase tracking-wide">Descripcion</p>
                      <p className="mt-1 line-clamp-2 text-foreground">
                        {product.description || "Sin descripcion cargada."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
              <div className="flex flex-wrap gap-2">
                <Button asChild className="w-full sm:w-auto">
                  <Link href={`/admin/productos/${product.id}`}>
                    <PencilLine className="size-4" />
                    Abrir producto
                  </Link>
                </Button>
              </div>

              <AdminProductToggle productId={product.id} active={product.active} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
