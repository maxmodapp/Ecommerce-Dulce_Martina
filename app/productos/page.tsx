import { ProductsGrid } from "@/components/products-grid"
import { getOrigin } from "@/lib/server/origin"
import { apiListToUI } from "@/lib/adapters/product"

export const metadata = {
  title: "Productos | Dulce Martina",
  description: "Explora nuestra coleccion completa de remeras, pantalones y ropa interior.",
}

export default async function ProductosPage() {
  const origin = await getOrigin()
  const res = await fetch(`${origin}/api/products`, { cache: "no-store" })
  const data = await res.json()

  const products = (data.productos ?? []).map(apiListToUI)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Todos los Productos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora nuestra coleccion completa de moda femenina y lenceria.
        </p>
      </div>

      <ProductsGrid products={products} />
    </div>
  )
}