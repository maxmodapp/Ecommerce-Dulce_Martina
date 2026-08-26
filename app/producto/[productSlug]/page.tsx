import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"
import { apiDetailToUI } from "@/lib/adapters/product"
import { getPublicProductDetail } from "@/lib/public-products"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>
}) {
  const { productSlug } = await params
  const product = await getPublicProductDetail(productSlug)

  if (!product) return { title: "Producto | Dulce Martina" }

  return {
    title: `${product.nombre} | Dulce Martina`,
    description: product.descripcion ?? "Detalle de producto.",
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>
}) {
  const { productSlug } = await params
  const productData = await getPublicProductDetail(productSlug)
  if (!productData) notFound()

  const product = apiDetailToUI(productData)
  return <ProductDetail product={product} />
}
