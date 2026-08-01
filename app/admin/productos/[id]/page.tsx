import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { AdminProductDetailView } from "@/components/admin-product-detail"
import { Button } from "@/components/ui/button"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminProductById, getAdminSubcategoryOptions } from "@/lib/admin-products"
import { getSafeInternalPath } from "@/lib/utils"

export const metadata = {
  title: "Producto | Administracion",
  description: "Gestiona datos, variantes, imagenes y talles de un producto.",
}

export default async function AdminProductoDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams?: Promise<{ returnTo?: string }>
}) {
  await requireAdminPageUser("/admin/productos")
  const { id } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const returnHref = getSafeInternalPath(resolvedSearchParams?.returnTo, "/admin/productos")

  const [product, subcategories] = await Promise.all([
    getAdminProductById(id),
    getAdminSubcategoryOptions(),
  ])

  if (!product) notFound()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Productos
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Gestion del producto
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Edita los datos generales y completa la estructura comercial del producto desde una
            sola vista admin.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href={returnHref}>
            <ArrowLeft className="size-4" />
            Volver a productos
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <AdminProductDetailView initialProduct={product} subcategories={subcategories} />
      </div>
    </div>
  )
}
