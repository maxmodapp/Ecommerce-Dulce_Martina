"use client"

import Link from "next/link"
import { useMemo } from "react"
import { getVisibleCatalogMenu } from "@/lib/catalog-menu"
import { cn } from "@/lib/utils"
import type { CatalogMenuCategory, MenuAudienceFilter } from "@/lib/types"

export const catalogMenuTabs: Array<{
  value: MenuAudienceFilter
  label: string
  query: string | null
}> = [
  { value: "all", label: "Ver todo", query: null },
  { value: "MUJER", label: "Mujer", query: "mujer" },
  { value: "HOMBRE", label: "Hombre", query: "hombre" },
]

export function withAudienceQuery(path: string, filter: MenuAudienceFilter) {
  const tab = catalogMenuTabs.find((item) => item.value === filter)
  if (!tab?.query) return path
  return `${path}?genero=${tab.query}`
}

type CatalogMenuContentProps = {
  catalogMenu: CatalogMenuCategory[]
  activeMenuFilter: MenuAudienceFilter
  onFilterChange: (filter: MenuAudienceFilter) => void
  onNavigate?: () => void
  variant?: "desktop" | "mobile"
  className?: string
}

export function CatalogMenuContent({
  catalogMenu,
  activeMenuFilter,
  onFilterChange,
  onNavigate,
  variant = "desktop",
  className,
}: CatalogMenuContentProps) {
  const visibleMenu = useMemo(
    () => getVisibleCatalogMenu(catalogMenu, activeMenuFilter),
    [catalogMenu, activeMenuFilter]
  )

  if (variant === "mobile") {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="flex flex-wrap gap-2">
          {catalogMenuTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => onFilterChange(tab.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                activeMenuFilter === tab.value
                  ? "bg-white text-black"
                  : "bg-white/10 text-white/72 hover:bg-white/15 hover:text-white"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href={withAudienceQuery("/productos", activeMenuFilter)}
          onClick={onNavigate}
          className="block rounded-md px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
        >
          Ver todos los productos
        </Link>

        {visibleMenu.length === 0 ? (
          <div className="rounded-md px-3 py-3 text-sm text-white/60">
            No hay categorias visibles por ahora.
          </div>
        ) : (
          visibleMenu.map((category) => {
            const categoryHref = withAudienceQuery(
              `/productos/${category.slug}`,
              activeMenuFilter
            )

            return (
              <div key={category.id} className="space-y-1">
                <Link
                  href={categoryHref}
                  onClick={onNavigate}
                  className="block rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition-colors hover:bg-white/10"
                >
                  {category.name}
                </Link>
                <Link
                  href={categoryHref}
                  onClick={onNavigate}
                  className="block rounded-md px-6 py-2 text-sm text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                >
                  Ver todos
                </Link>
                {category.subcategories.map((subcategory) => (
                  <Link
                    key={subcategory.id}
                    href={withAudienceQuery(
                      `/productos/${category.slug}/${subcategory.slug}`,
                      activeMenuFilter
                    )}
                    onClick={onNavigate}
                    className="block rounded-md px-6 py-2 text-sm text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    {subcategory.name}
                  </Link>
                ))}
              </div>
            )
          })
        )}
      </div>
    )
  }

  return (
    <div className={cn("mx-auto max-w-7xl px-6 py-8", className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-5">
        {catalogMenuTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => onFilterChange(tab.value)}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeMenuFilter === tab.value
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {visibleMenu.length === 0 ? (
        <div className="py-8 text-sm text-muted-foreground">
          No hay categorias visibles por ahora.
        </div>
      ) : (
        <div className="grid gap-x-10 gap-y-8 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {visibleMenu.map((category) => {
            const categoryHref = withAudienceQuery(
              `/productos/${category.slug}`,
              activeMenuFilter
            )

            return (
              <div key={category.id} className="space-y-3">
                <Link
                  href={categoryHref}
                  onClick={onNavigate}
                  className="block text-xs font-semibold uppercase tracking-[0.18em] text-foreground transition-colors hover:text-muted-foreground"
                >
                  {category.name}
                </Link>
                <div className="space-y-2">
                  <Link
                    href={categoryHref}
                    onClick={onNavigate}
                    className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Ver todos
                  </Link>
                  {category.subcategories.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      href={withAudienceQuery(
                        `/productos/${category.slug}/${subcategory.slug}`,
                        activeMenuFilter
                      )}
                      onClick={onNavigate}
                      className="block text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {subcategory.name}
                    </Link>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
