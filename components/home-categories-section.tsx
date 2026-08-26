"use client"

import Image from "next/image"
import Link from "next/link"
import { ArrowRight, X } from "lucide-react"
import { useState } from "react"
import { CatalogMenuContent } from "@/components/catalog-menu-content"
import { Button } from "@/components/ui/button"
import type { CatalogMenuCategory, MenuAudienceFilter } from "@/lib/types"

const categoryCardImages = [
  "/images/cat-remeras.jpg",
  "/images/cat-pantalones.jpg",
  "/images/cat-ropa-interior.jpg",
]

type HomeCategoriesSectionProps = {
  catalogMenu: CatalogMenuCategory[]
}

export function HomeCategoriesSection({ catalogMenu }: HomeCategoriesSectionProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenuFilter, setActiveMenuFilter] = useState<MenuAudienceFilter>("all")
  const previewCategories = catalogMenu.slice(0, 3)

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-serif text-3xl font-bold text-foreground">
          Categorias
        </h2>
        <p className="mt-2 text-muted-foreground">
          Explora nuestras colecciones
        </p>
      </div>

      {previewCategories.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-3">
          {previewCategories.map((category, index) => (
            <Link
              key={category.id}
              href={`/productos/${category.slug}`}
              prefetch={false}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Image
                src={category.imageUrl || categoryCardImages[index % categoryCardImages.length]}
                alt={category.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="relative z-10 p-6">
                <h3 className="font-serif text-2xl font-bold text-primary-foreground">
                  {category.name}
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  Ver productos de {category.name}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors group-hover:text-primary-foreground">
                  Ver coleccion
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Todavia no hay categorias visibles.
        </div>
      )}

      {catalogMenu.length > 0 ? (
        <div className="mt-8 flex justify-center">
          <Button type="button" variant="outline" onClick={() => setMenuOpen(true)}>
            Ver todas las categorias
          </Button>
        </div>
      ) : null}

      {menuOpen ? (
        <div
          className="fixed inset-0 z-[70] bg-black/10"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="absolute inset-x-0 top-16 hidden max-h-[calc(100svh-4rem)] overflow-y-auto border-y border-border bg-white text-foreground shadow-sm md:block"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mx-auto flex max-w-7xl justify-end px-6 pt-4">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-md p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Cerrar categorias"
              >
                <X className="size-4" />
              </button>
            </div>
            <CatalogMenuContent
              catalogMenu={catalogMenu}
              activeMenuFilter={activeMenuFilter}
              onFilterChange={setActiveMenuFilter}
              onNavigate={() => setMenuOpen(false)}
              className="pt-3"
            />
          </div>

          <div
            className="absolute inset-x-0 top-16 max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-navbar-border bg-background-navbar md:hidden"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex justify-end px-4 pt-3">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="rounded-md p-2 text-white/82 transition-colors hover:bg-white/10 hover:text-white"
                aria-label="Cerrar categorias"
              >
                <X className="size-5" />
              </button>
            </div>
            <CatalogMenuContent
              catalogMenu={catalogMenu}
              activeMenuFilter={activeMenuFilter}
              onFilterChange={setActiveMenuFilter}
              onNavigate={() => setMenuOpen(false)}
              variant="mobile"
              className="px-4 pb-5 pt-3"
            />
          </div>
        </div>
      ) : null}
    </section>
  )
}
