import { notFound, redirect } from "next/navigation"
import { ProductsGrid } from "@/components/products-grid"
import { apiListToUI } from "@/lib/adapters/product"
import { getCategoryBySlug } from "@/lib/catalog"
import { getPublicProductDetail, getPublicProductList } from "@/lib/public-products"

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

  if (!category || category.active === false) {
    const legacyProduct = await getPublicProductDetail(categorySlug)

    if (legacyProduct) {
      redirect(`/producto/${categorySlug}`)
    }

    notFound()
  }

  const query = await searchParams
  const data = await getPublicProductList({
    categoria: category.slug,
    q: query.q,
    genero: query.genero,
  })
  const products = data.map(apiListToUI)

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {category.name}
        </h1>
      </div>
      <ProductsGrid products={products} fixedCategory={category.slug} />
    </div>
  )
}
