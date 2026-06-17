"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/data"
import { CATEGORY_LABELS } from "@/lib/types"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const variants = useMemo(() => {
    const v = (product.variantPreviews ?? []).filter((x) => !!x.imageUrl)
    if (v.length) return v

    // fallback si no hay variantes (o no hay imageUrl)
    return [
      {
        id: "cover",
        name: "Único",
        hex: "#999999",
        imageUrl: product.images?.[0] ?? "/placeholder.jpg",
        imageAlt: product.name,
      },
    ]
  }, [product])

  const [idx, setIdx] = useState(0)
  const current = variants[idx]
  const img = current?.imageUrl ?? product.images?.[0] ?? "/placeholder.jpg"
  const canNav = variants.length > 1

  const prev = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i - 1 + variants.length) % variants.length)
  }

  const next = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx((i) => (i + 1) % variants.length)
  }

  const select = (i: number) => (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIdx(i)
  }

  return (
    <Link
      href={`/productos/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
        {/* ✅ UNA sola imagen renderizada */}
        <Image
          key={img}
          src={img}
          alt={current?.imageAlt ?? product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
        />

        {canNav && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-90"
              aria-label="Anterior"
            >
              ‹
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 opacity-90"
              aria-label="Siguiente"
            >
              ›
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {CATEGORY_LABELS[product.category]}
        </span>

        <h3 className="text-sm font-semibold leading-snug text-card-foreground group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {canNav && (
          <div className="mt-1 flex items-center gap-2 overflow-x-auto overflow-y-visible py-1 overflow-x-visible px-1">
                {variants.map((v, i) => {
                  const selected = i === idx

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={select(i)}
                      title={v.name}
                      aria-label={v.name}
                      className="h-4 w-4 rounded-[4px]"
                      style={{
                        backgroundColor: v.hex || "#999999",

                        boxShadow: selected
                          ? "0 0 0 3px #000000"
                          : "0 0 0 1px #ffa3a3",
                      }}
                    />
                  )
                })}
          </div>
        )}

        <p className="mt-auto text-base font-bold text-foreground">
          {formatPrice(product.price)}
        </p>
      </div>
    </Link>
  )
}