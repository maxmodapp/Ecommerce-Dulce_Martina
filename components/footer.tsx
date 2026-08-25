"use client"

import Link from "next/link"
import Image from "next/image"
import { Instagram, Mail, MessageCircle, X } from "lucide-react"
import { useState } from "react"
import { CatalogMenuContent } from "@/components/catalog-menu-content"
import { BUSINESS_CONTACT } from "@/lib/business-config"
import type { CatalogMenuCategory, MenuAudienceFilter } from "@/lib/types"

type FooterProps = {
  catalogMenu: CatalogMenuCategory[]
}

export function Footer({ catalogMenu }: FooterProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeMenuFilter, setActiveMenuFilter] = useState<MenuAudienceFilter>("all")
  const footerCategories = catalogMenu.slice(0, 3)

  return (
    <footer className="border-t border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/images/logo.png"
                alt="Dulce Martina Lingerie"
                width={40}
                height={40}
                className="rounded-full"
              />
              <span className="font-serif text-lg font-bold text-foreground">
                Dulce Martina
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Elegancia, comodidad y estilo. Ropa y lenceria seleccionada para vos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Tienda
            </h3>
            <ul className="flex flex-col gap-2">
              {footerCategories.map((category) => (
                <li key={category.id}>
                  <Link
                    href={`/productos/${category.slug}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
              {catalogMenu.length > 0 ? (
                <li>
                  <button
                    type="button"
                    onClick={() => setMenuOpen(true)}
                    className="text-left text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Ver todo
                  </button>
                </li>
              ) : (
                <li>
                  <Link
                    href="/productos"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    Ver todo
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Informacion
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Nosotros
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Como comprar
                </Link>
              </li>
              <li>
                <Link
                  href="/nosotros"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Contacto
                </Link>
              </li>
              <li>
                <Link
                  href="/consultar-pedido"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Consultar pedido
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Seguinos
            </h3>
            <div className="flex gap-3">
              <a
                href={BUSINESS_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href={BUSINESS_CONTACT.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href={`mailto:${BUSINESS_CONTACT.email}`}
                className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Email"
              >
                <Mail className="size-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center">
          <p className="text-xs text-muted-foreground">
            {"© 2026 Dulce Martina. Todos los derechos reservados."}
          </p>
        </div>
      </div>

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
    </footer>
  )
}
