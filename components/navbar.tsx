"use client"

import { useEffect, useState, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronDown, Menu, Search, ShoppingBag, X } from "lucide-react"
import { AccountMenu } from "@/components/account-menu"
import { CatalogMenuContent } from "@/components/catalog-menu-content"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useCartDrawer } from "@/lib/cart-drawer-context"
import { cn } from "@/lib/utils"
import type { CatalogMenuCategory, MenuAudienceFilter } from "@/lib/types"

type NavbarProps = {
  catalogMenu: CatalogMenuCategory[]
}

const NAVBAR_COLLAPSE_SCROLL_Y = 220
const NAVBAR_EXPAND_SCROLL_Y = 160

export function Navbar({ catalogMenu }: NavbarProps) {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { open: openCart } = useCartDrawer()
  const { user, status, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)
  const [productsMenuOpen, setProductsMenuOpen] = useState(false)
  const [activeMenuFilter, setActiveMenuFilter] = useState<MenuAudienceFilter>("all")

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      setIsScrolled((current) => {
        if (current) return scrollY > NAVBAR_EXPAND_SCROLL_Y
        return scrollY > NAVBAR_COLLAPSE_SCROLL_Y
      })
    }

    handleScroll()
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  async function handleMobileLogout() {
    await logout()
    setMobileOpen(false)
    window.location.href = "/"
  }

  function closeSearch() {
    setSearchOpen(false)
    setSearchQuery("")
  }

  function toggleSearch() {
    setSearchOpen((current) => {
      const next = !current

      if (next) {
        setProductsMenuOpen(false)
        setMobileOpen(false)
      } else {
        setSearchQuery("")
      }

      return next
    })
  }

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const query = searchQuery.trim()
    if (!query) return

    window.location.href = `/productos?q=${encodeURIComponent(query)}`
    closeSearch()
  }

  const desktopLinkClass =
    "px-1 py-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
  const iconButtonClass =
    "rounded-md p-2 text-white/82 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"

  return (
    <header
      onMouseLeave={() => setProductsMenuOpen(false)}
      className={cn(
        "sticky top-0 z-50 border-b border-navbar-border bg-background-navbar/100 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isScrolled ? "h-16" : "h-20 lg:h-22"
      )}
    >
      <nav className="relative mx-auto h-full max-w-7xl px-4 lg:px-8">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex items-center justify-between px-4 pt-3 lg:px-8">
          <div className="pointer-events-auto hidden items-center gap-6 md:flex">
            <Link
              href="/"
              prefetch={false}
              className={cn(desktopLinkClass, pathname === "/" && "text-white")}
            >
              Inicio
            </Link>

            <div
              className="group"
              onMouseEnter={() => {
                setProductsMenuOpen(true)
                closeSearch()
              }}
            >
              <Link
                href="/productos"
                prefetch={false}
                className={cn(
                  desktopLinkClass,
                  "flex items-center gap-1",
                  pathname.startsWith("/productos") || pathname.startsWith("/producto")
                    ? "text-white"
                    : ""
                )}
              >
                Productos
                <ChevronDown
                  className={cn(
                    "size-3.5 transition-transform",
                    productsMenuOpen && "rotate-180"
                  )}
                />
              </Link>
            </div>

            <Link
              href="/nosotros"
              prefetch={false}
              className={cn(desktopLinkClass, pathname === "/nosotros" && "text-white")}
            >
              Nosotros
            </Link>

            {user?.role === "ADMIN" ? (
              <Link
                href="/admin"
                prefetch={false}
                className={cn(desktopLinkClass, pathname.startsWith("/admin") && "text-white")}
              >
                Admin
              </Link>
            ) : null}
          </div>

          <button
            onClick={toggleSearch}
            className={cn(iconButtonClass, "pointer-events-auto md:hidden")}
            aria-label={searchOpen ? "Cerrar busqueda" : "Buscar"}
          >
            {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
          </button>

          <div className="pointer-events-auto flex items-center gap-2">
            <button
              onClick={toggleSearch}
              className={cn(iconButtonClass, "hidden md:inline-flex")}
              aria-label={searchOpen ? "Cerrar busqueda" : "Buscar"}
            >
              {searchOpen ? <X className="size-5" /> : <Search className="size-5" />}
            </button>

            <div className="hidden md:block">
              <AccountMenu />
            </div>

            <button
              onClick={openCart}
              className={cn("relative", iconButtonClass)}
              aria-label={`Carrito (${totalItems} items)`}
            >
              <ShoppingBag className="size-5" />
              {totalItems > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                setMobileOpen(!mobileOpen)
                setSearchOpen(false)
              }}
              className={cn(iconButtonClass, "md:hidden")}
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        <div className="flex h-full items-center justify-center">
          <Link
            href="/"
            prefetch={false}
            className={cn(
              "relative z-20 flex min-h-14 min-w-40 items-center justify-center px-6 transition-all duration-300 sm:min-w-52",
              isScrolled ? "-translate-y-0" : "translate-y-0 lg:-translate-y-0"
            )}
            aria-label="Ir al inicio"
          >
            <Image
              src="/text4.png"
              alt="Dulce Martina"
              width={2048}
              height={415}
              priority
              className={cn(
                "h-auto w-auto object-contain transition-all duration-300",
                isScrolled ? "max-h-10" : "max-h-10 lg:max-h-14"
              )}
            />
          </Link>
        </div>
      </nav>

      {searchOpen && (
        <div className="absolute left-0 right-0 top-full z-50 border-t border-navbar-border bg-background-navbar shadow-sm">
          <form
            onSubmit={handleSearchSubmit}
            className="mx-auto max-w-7xl px-4 py-3 lg:px-8"
          >
            <div className="flex w-full gap-2 md:ml-auto md:max-w-xl">
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") closeSearch()
                }}
                placeholder="Buscar..."
                className="h-10 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-white/25"
                autoFocus
              />
              <button
                type="submit"
                className="flex size-10 items-center justify-center rounded-md bg-white text-black transition-colors hover:bg-white/85 focus:outline-none focus:ring-2 focus:ring-white/25"
                aria-label="Enviar busqueda"
              >
                <Search className="size-4" />
              </button>
            </div>
          </form>
        </div>
      )}

      {productsMenuOpen ? (
        <div
          onMouseEnter={() => {
            setProductsMenuOpen(true)
            setSearchOpen(false)
          }}
          className="absolute left-0 right-0 top-full z-40 hidden border-y border-border bg-white text-foreground shadow-sm md:block"
        >
          <CatalogMenuContent
            catalogMenu={catalogMenu}
            activeMenuFilter={activeMenuFilter}
            onFilterChange={setActiveMenuFilter}
          />
        </div>
      ) : null}

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default bg-black/20 md:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menu"
          />
          <div className="absolute left-0 right-0 top-full z-50 md:hidden">
            <div className="max-h-[calc(100svh-4rem)] overflow-y-auto border-t border-navbar-border bg-background-navbar shadow-lg">
              <div className="mx-auto max-w-7xl px-4 py-4">
                <div className="flex flex-col gap-1">
                  <Link
                    href="/"
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Inicio
                  </Link>

                  <div>
                    <button
                      onClick={() => setMobileSubOpen(!mobileSubOpen)}
                      className="flex w-full items-center justify-between rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      aria-expanded={mobileSubOpen}
                    >
                      Productos
                      <ChevronDown
                        className={cn(
                          "size-4 transition-transform",
                          mobileSubOpen && "rotate-180"
                        )}
                      />
                    </button>

                    {mobileSubOpen && (
                      <CatalogMenuContent
                        catalogMenu={catalogMenu}
                        activeMenuFilter={activeMenuFilter}
                        onFilterChange={setActiveMenuFilter}
                        onNavigate={() => setMobileOpen(false)}
                        variant="mobile"
                        className="px-3 py-3"
                      />
                    )}
                  </div>

                  <Link
                    href="/nosotros"
                    prefetch={false}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Nosotros
                  </Link>

                  {user?.role === "ADMIN" ? (
                    <Link
                      href="/admin"
                      prefetch={false}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                    >
                      Admin
                    </Link>
                  ) : null}

                  {status === "loading" ? (
                    <div className="rounded-md px-3 py-2.5 text-sm font-medium text-white/60">
                      Cargando cuenta...
                    </div>
                  ) : user ? (
                    <>
                      <Link
                        href="/mi-cuenta"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Mi cuenta
                      </Link>
                      <Link
                        href="/mis-pedidos"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Mis pedidos
                      </Link>
                      <button
                        onClick={() => void handleMobileLogout()}
                        className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Cerrar sesion
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Iniciar sesion
                      </Link>
                      <Link
                        href="/registro"
                        prefetch={false}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                      >
                        Registrarse
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
