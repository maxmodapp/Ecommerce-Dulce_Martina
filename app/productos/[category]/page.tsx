import { notFound } from "next/navigation"
import { ProductsGrid } from "@/components/products-grid"
import { ProductDetail } from "@/components/product-detail"
import { CATEGORY_LABELS, CATEGORY_DESCRIPTIONS, type Category } from "@/lib/types"
import { getOrigin } from "@/lib/server/origin"
import { apiListToUI, apiDetailToUI } from "@/lib/adapters/product"

const validCategories: Category[] = ["remeras", "pantalones", "ropa-interior"]

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params

  if (validCategories.includes(slug as Category)) {
    const cat = slug as Category
    return {
      title: `${CATEGORY_LABELS[cat]} | Dulce Martina`,
      description: CATEGORY_DESCRIPTIONS[cat],
    }
  }

  // Para producto, si querés metadata real desde DB lo sumamos después (no te lo complico ahora)
  return { title: "Producto | Dulce Martina" }
}

export default async function DynamicPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const origin = await getOrigin()

  // 1) Categoria (lista)
  if (validCategories.includes(slug as Category)) {
    const res = await fetch(`${origin}/api/products?categoria=${encodeURIComponent(slug)}`, {
      cache: "no-store",
    })
    const data = await res.json()
    const products = (data.productos ?? []).map(apiListToUI)

    const cat = slug as Category
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            {CATEGORY_LABELS[cat]}
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {CATEGORY_DESCRIPTIONS[cat]}
          </p>
        </div>
        <ProductsGrid products={products} fixedCategory={cat} />
      </div>
    )
  }

  // 2) Producto (detalle)
  const res = await fetch(`${origin}/api/products/${encodeURIComponent(slug)}`, { cache: "no-store" })
  if (!res.ok) notFound()

  const data = await res.json()
  if (!data?.producto) notFound()

  const product = apiDetailToUI(data.producto)
  return <ProductDetail product={product} />
}