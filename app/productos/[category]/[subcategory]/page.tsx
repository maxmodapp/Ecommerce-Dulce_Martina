import { notFound } from "next/navigation"
import { ProductsGrid } from "@/components/products-grid"
import { apiListToUI } from "@/lib/adapters/product"
import { getSubcategoryBySlugs } from "@/lib/catalog"
import { getOrigin } from "@/lib/server/origin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>
}) {
  const { category, subcategory } = await params
  const resolvedSubcategory = await getSubcategoryBySlugs(category, subcategory)

  if (!resolvedSubcategory) return { title: "Productos | Dulce Martina" }

  return {
    title: `${resolvedSubcategory.name} | Dulce Martina`,
    description: `Explora los productos de ${resolvedSubcategory.category.name} / ${resolvedSubcategory.name}.`,
  }
}

export default async function SubcategoryProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>
  searchParams: Promise<{ q?: string; genero?: string }>
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params
  const subcategory = await getSubcategoryBySlugs(categorySlug, subcategorySlug)

  if (!subcategory || subcategory.active === false || subcategory.category.active === false) {
    notFound()
  }

  const origin = await getOrigin()
  const query = await searchParams
  const apiParams = new URLSearchParams({
    categoria: subcategory.category.slug,
    subcategoria: subcategory.slug,
  })

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
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">
          {subcategory.category.name}
        </p>
        <h1 className="mt-2 font-serif text-3xl font-bold text-foreground md:text-4xl">
          {subcategory.name}
        </h1>
      </div>
      <ProductsGrid products={products} fixedCategory={subcategory.category.slug} />
    </div>
  )
}
