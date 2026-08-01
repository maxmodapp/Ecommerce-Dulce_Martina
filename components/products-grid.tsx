"use client"

import { useState, useMemo } from "react"
import { ProductCard } from "@/components/product-card"
import { ProductFilters } from "@/components/product-filters"
import type { Product } from "@/lib/types"

interface ProductsGridProps {
  products: Product[]
  fixedCategory?: string
}

export function ProductsGrid({ products, fixedCategory }: ProductsGridProps) {
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState<string>(fixedCategory || "all")
  const [sort, setSort] = useState("newest")

  const categories = useMemo(() => {
    const uniqueCategories = new Map<string, { slug: string; name: string }>()

    for (const product of products) {
      if (!product.category) continue
      uniqueCategories.set(product.category.slug, {
        slug: product.category.slug,
        name: product.category.name,
      })
    }

    return Array.from(uniqueCategories.values()).sort((left, right) =>
      left.name.localeCompare(right.name, "es")
    )
  }, [products])

  const filtered = useMemo(() => {
    let result = [...products]

    // Category
    if (category !== "all") {
      result = result.filter((p) => p.category?.slug === category)
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      )
    }

    // Sort
    switch (sort) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
      default:
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }

    return result
  }, [products, search, category, sort])

  return (
    <div className="flex flex-col gap-6">
      <ProductFilters
        search={search}
        onSearchChange={setSearch}
        category={category}
        categories={categories}
        onCategoryChange={setCategory}
        sort={sort}
        onSortChange={setSort}
        resultCount={filtered.length}
        hideCategory={!!fixedCategory}
      />

      {filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-lg text-muted-foreground">
            No encontramos productos con esos filtros.
          </p>
          <button
            onClick={() => {
              setSearch("")
              setCategory(fixedCategory || "all")
            }}
            className="mt-3 text-sm font-medium text-primary hover:text-foreground transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
