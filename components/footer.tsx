import Link from "next/link"
import Image from "next/image"
import { Instagram, MessageCircle, Mail } from "lucide-react"

export function Footer() {
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
              Elegancia, comodidad y estilo. Ropa femenina y lenceria
              seleccionada con amor para vos.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              Tienda
            </h3>
            <ul className="flex flex-col gap-2">
              <li>
                <Link
                  href="/productos/remeras"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Remeras
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/pantalones"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Pantalones
                </Link>
              </li>
              <li>
                <Link
                  href="/productos/ropa-interior"
                  className="text-sm text-muted-foreground transition-colors hover:text-primary"
                >
                  Ropa Interior
                </Link>
              </li>
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
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </a>
              <a
                href="https://wa.me/5491100000000"
                target="_blank"
                rel="noopener noreferrer"
                className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                aria-label="WhatsApp"
              >
                <MessageCircle className="size-5" />
              </a>
              <a
                href="mailto:hola@dulcemartina.com"
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
    </footer>
  )
}
