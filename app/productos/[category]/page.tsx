import { notFound, redirect } from "next/navigation"
import { ProductsGrid } from "@/components/products-grid"
import { apiListToUI } from "@/lib/adapters/product"
import { getCategoryBySlug } from "@/lib/catalog"
import { getOrigin } from "@/lib/server/origin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category: slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) return { title: "Productos | Dulce Martina" }

  return {
    title: `${category.name} | Dulce Martina`,
    description: `Explora los productos de ${category.name}.`,
  }
}

export default async function CategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<{ q?: string; genero?: string }>
}) {
  const { category: categorySlug } = await params
  const category = await getCategoryBySlug(categorySlug)
  const origin = await getOrigin()

  if (!category || category.active === false) {
    const legacyProduct = await fetch(`${origin}/api/products/${encodeURIComponent(categorySlug)}`, {
      cache: "no-store",
    })

    if (legacyProduct.ok) {
      redirect(`/producto/${categorySlug}`)
    }

    notFound()
  }

  const query = await searchParams
  const apiParams = new URLSearchParams({ categoria: category.slug })

  if (query.q) apiParams.set("q", query.q)
  if (query.genero) apiParams.set("genero", query.genero)

  const res = await fetch(`${origin}/api/products?${apiParams.toString()}`, {
    cache: "no-store",
  })
  const data = await res.json()
  const products = (data.productos ?? []).map(apiListToUI)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {category.name}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Explora los productos de esta categoria.
        </p>
      </div>
      <ProductsGrid products={products} fixedCategory={category.slug} />
    </div>
  )
}
