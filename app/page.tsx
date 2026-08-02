import { HomeCoverCarousel } from "@/components/home-cover-carousel"
import { HomeCategoriesSection } from "@/components/home-categories-section"
import { HomeProductCarousel } from "@/components/home-product-carousel"
import { Button } from "@/components/ui/button"
import { getCatalogMenu } from "@/lib/catalog"
import { getPublicCoverImages } from "@/lib/cover-images"
import { getHomepageSectionsData } from "@/lib/home-sections"

export default async function HomePage() {
  const [{ featured, newArrivals }, coverImages, catalogMenu] = await Promise.all([
    getHomepageSectionsData(),
    getPublicCoverImages(),
    getCatalogMenu(),
  ])

  return (
    <div>
      {/* Hero */}
      <section className="relative h-[calc(80svh)] min-h-[520px] overflow-hidden">
        <HomeCoverCarousel images={coverImages} />
      </section>

      {/* Categories */}
      <HomeCategoriesSection catalogMenu={catalogMenu} />

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
