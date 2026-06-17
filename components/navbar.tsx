"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Search,
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
} from "lucide-react"
import { AccountMenu } from "@/components/account-menu"
import { useAuth } from "@/lib/auth-context"
import { useCart } from "@/lib/cart-context"
import { useCartDrawer } from "@/lib/cart-drawer-context"
import { cn } from "@/lib/utils"

const subcategories = [
  { label: "Remeras", href: "/productos/remeras" },
  { label: "Pantalones", href: "/productos/pantalones" },
  { label: "Ropa Interior", href: "/productos/ropa-interior" },
]

export function Navbar() {
  const pathname = usePathname()
  const { totalItems } = useCart()
  const { open: openCart } = useCartDrawer()
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [mobileSubOpen, setMobileSubOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200)
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

  const desktopLinkClass = "px-1 py-1 text-sm font-medium text-white/60 transition-colors hover:text-white"
  const iconButtonClass =
    "rounded-md p-2 text-white/82 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b  border-navbar-border bg-background-navbar/95 backdrop-blur-sm transition-all duration-300 ease-in-out",
        isScrolled ? "h-16" : "h-20 lg:h-20"
      )}
    >
      <nav className="relative mx-auto h-full max-w-7xl px-4 lg:px-8">
        {/* Top row: links left + icons right, anchored to top */}
        <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-4 pt-3 lg:px-8">
          {/* Left - Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                desktopLinkClass,
                pathname === "/" && "text-white"
              )}
            >
              Inicio
            </Link>

            {/* Productos dropdown */}
            <div className="group relative">
              <Link
                href="/productos"
                className={cn(
                  desktopLinkClass,
                  "flex items-center gap-1",
                  pathname.startsWith("/productos")
                    ? "text-white"
                    : ""
                )}
              >
                Productos
                <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />
              </Link>

              {/* Mega menu */}
              <div className="invisible absolute left-0 top-full pt-2 opacity-0 transition-all group-hover:visible group-hover:opacity-100">
                <div className="min-w-48 rounded-lg border border-border bg-card p-2 shadow-lg">
                  {subcategories.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm text-card-foreground transition-colors hover:bg-muted"
                    >
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                      {cat.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <Link
              href="/nosotros"
              className={cn(
                desktopLinkClass,
                pathname === "/nosotros" && "text-white"
              )}
            >
              Nosotros
            </Link>
          </div>

          {/* Spacer for mobile (no left links) */}
          <div className="md:hidden" />

          {/* Right - Icons */}
          <div className="flex items-center gap-2">
            {/* Search */}
            {searchOpen ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar..."
                  className="h-8 w-32 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring sm:w-48"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && searchQuery.trim()) {
                      window.location.href = `/productos?q=${encodeURIComponent(searchQuery.trim())}`
                      setSearchOpen(false)
                      setSearchQuery("")
                    }
                    if (e.key === "Escape") {
                      setSearchOpen(false)
                      setSearchQuery("")
                    }
                  }}
                />
                <button
                  onClick={() => {
                    setSearchOpen(false)
                    setSearchQuery("")
                  }}
                  className="rounded-md p-1.5 text-white/82 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/25"
                  aria-label="Cerrar busqueda"
                >
                  <X className="size-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className={iconButtonClass}
                aria-label="Buscar"
              >
                <Search className="size-5" />
              </button>
            )}

            <AccountMenu />

            {/* Cart */}
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

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(iconButtonClass, "md:hidden")}
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
            >
              {mobileOpen ? (
                <X className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Center - Logo, vertically centered in the full header height 
        <div className="flex h-full items-center justify-center">
          <Link href="/" className={cn(
      "relative block transition-transform duration-300 ease-in-out",
      // baja un poquito en ambos estados (ajustá los números)
      isScrolled ? "translate-y-1" : "translate-y-1 lg:translate-y-1"
    )}>
            <Image
              src="/text3w.png"
              alt="Dulce Martina"
              width={220}
              height={60}
              priority
              className={cn(
                "object-contain w-auto transition-all duration-300 ease-in-out",
                isScrolled ? "h-[200px]" : "h-[200px] lg:h-[300px]"
              )}
            />
          </Link>
        </div>
        */}

        {/* Center - Brand text */}

        <div className="flex h-full items-center justify-center">
          <Link
            href="/"
            className={cn(
              "font-serif text-xl font-bold tracking-wide text-white transition-all duration-300",
              isScrolled ? "-translate-y-1 text-xl" : "translate-y-1 lg:-translate-y-1 lg:text-3xl"
            )}
          >
            Dulce Martina
          </Link>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-navbar-border bg-background-navbar md:hidden">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Inicio
              </Link>

              {/* Productos with sub */}
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
                  <div className="ml-4 flex flex-col gap-1 py-1">
                    <Link
                      href="/productos"
                      onClick={() => setMobileOpen(false)}
                      className="rounded-md px-3 py-2 text-sm text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Todos los productos
                    </Link>
                    {subcategories.map((cat) => (
                      <Link
                        key={cat.href}
                        href={cat.href}
                        onClick={() => setMobileOpen(false)}
                        className="rounded-md px-3 py-2 text-sm text-white/72 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/nosotros"
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Nosotros
              </Link>

              {user ? (
                <>
                  <Link
                    href="/mi-cuenta"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Mi cuenta
                  </Link>
                  <Link
                    href="/mis-pedidos"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Mis pedidos
                  </Link>
                  <button
                    onClick={() => void handleMobileLogout()}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                  >
                    Iniciar sesión
                  </Link>
                  <Link
                    href="/registro"
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
      )}
    </header>
  )
}
