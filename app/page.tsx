import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { HomeProductCarousel } from "@/components/home-product-carousel"
import { Button } from "@/components/ui/button"
import { getHomepageSectionsData } from "@/lib/home-sections"

const categories = [
  {
    name: "Remeras",
    href: "/productos/remeras",
    image: "/images/cat-remeras.jpg",
    description: "Basicas, oversize, crop tops y mas",
  },
  {
    name: "Pantalones",
    href: "/productos/pantalones",
    image: "/images/cat-pantalones.jpg",
    description: "Palazzo, joggers, rectos y cargo",
  },
  {
    name: "Ropa Interior",
    href: "/productos/ropa-interior",
    image: "/images/cat-ropa-interior.jpg",
    description: "Conjuntos, bralettes y bodys",
  },
]

export default async function HomePage() {
  const { featured, newArrivals } = await getHomepageSectionsData()

  return (
    <div>
      {/* Hero */}
      <section className="relative flex min-h-[70vh] items-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/hero.jpg"
            alt="Dulce Martina - Moda femenina y lenceria"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/60 via-foreground/30 to-transparent" />
        </div>
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <div className="max-w-lg">
            <p className="mb-3 text-sm font-medium uppercase tracking-widest text-accent">
              Nueva Coleccion
            </p>
            <h1 className="font-serif text-4xl font-bold leading-tight text-primary-foreground md:text-5xl lg:text-6xl text-balance">
              Elegancia que te abraza
            </h1>
            <p className="mt-4 text-base leading-relaxed text-primary-foreground/80 md:text-lg">
              Descubri nuestra coleccion de lenceria y moda femenina.
              Prendas pensadas para que te sientas unica, comoda y hermosa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                asChild
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/productos">
                  Ver productos
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Link href="/nosotros">Conocenos</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-3xl font-bold text-foreground">
            Categorias
          </h2>
          <p className="mt-2 text-muted-foreground">
            Explora nuestras colecciones pensadas para vos
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.href}
              href={cat.href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
              <div className="relative z-10 p-6">
                <h3 className="font-serif text-2xl font-bold text-primary-foreground">
                  {cat.name}
                </h3>
                <p className="mt-1 text-sm text-primary-foreground/80">
                  {cat.description}
                </p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors group-hover:text-primary-foreground">
                  Ver coleccion
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {featured.length > 0 ? (
        <section className="bg-secondary/30 py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <HomeProductCarousel
              title="Destacados"
              description="Una seleccion especial de productos elegidos para mostrar en portada."
              products={featured}
            />
          </div>
        </section>
      ) : null}

      {newArrivals.length > 0 ? (
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-4 lg:px-8">
            <HomeProductCarousel
              title="Ultimos ingresos"
              description="Nuevos productos elegidos manualmente para renovar la home."
              products={newArrivals}
            />
          </div>
        </section>
      ) : null}

      {/* CTA WhatsApp */}
      <section className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="rounded-2xl bg-primary/10 p-8 text-center md:p-12">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            {"¿Necesitas ayuda?"}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Escribinos por WhatsApp y te asesoramos con tu compra.
            Estamos para vos.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <a
              href="https://wa.me/5491100000000?text=Hola!%20Quiero%20consultar%20sobre%20productos"
              target="_blank"
              rel="noopener noreferrer"
            >
              Escribinos por WhatsApp
            </a>
          </Button>
        </div>
      </section>
    </div>
  )
}
