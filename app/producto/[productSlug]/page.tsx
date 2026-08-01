import { notFound } from "next/navigation"
import { ProductDetail } from "@/components/product-detail"
import { apiDetailToUI } from "@/lib/adapters/product"
import { getOrigin } from "@/lib/server/origin"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ productSlug: string }>
}) {
  const { productSlug } = await params
  const origin = await getOrigin()
  const res = await fetch(`${origin}/api/products/${encodeURIComponent(productSlug)}`, {
    cache: "no-store",
  })

  if (!res.ok) return { title: "Producto | Dulce Martina" }

  const data = await res.json()
  const product = data?.producto

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
  const origin = await getOrigin()
  const res = await fetch(`${origin}/api/products/${encodeURIComponent(productSlug)}`, {
    cache: "no-store",
  })

  if (!res.ok) notFound()

  const data = await res.json()
  if (!data?.producto) notFound()

  const product = apiDetailToUI(data.producto)
  return <ProductDetail product={product} />
}
