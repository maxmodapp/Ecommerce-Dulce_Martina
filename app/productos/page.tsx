import { ProductsGrid } from "@/components/products-grid"
import { apiListToUI } from "@/lib/adapters/product"
import { getPublicProductList } from "@/lib/public-products"

export const metadata = {
  title: "Productos | Dulce Martina",
  description: "Explora nuestra coleccion completa.",
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; genero?: string; categoria?: string; subcategoria?: string }>
}) {
  const params = await searchParams
  const data = await getPublicProductList({
    q: params.q,
    genero: params.genero,
    categoria: params.categoria,
    subcategoria: params.subcategoria,
  })

  const products = data.map(apiListToUI)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Todos los Productos
        </h1>
        <p className="mt-2 text-muted-foreground">
          Explora nuestra coleccion completa
        </p>
      </div>

      <ProductsGrid products={products} />
    </div>
  )
}
