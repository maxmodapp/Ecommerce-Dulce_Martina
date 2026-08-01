import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminProducts } from "@/lib/admin-products"
import { getAdminCategories } from "@/lib/catalog"
import { AdminProductsList } from "@/components/admin-products-list"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata = {
  title: "Productos | Administracion",
  description: "Gestiona productos, variantes, imagenes y stock desde el panel admin.",
}

export default async function AdminProductosPage() {
  await requireAdminPageUser("/admin/productos")
  const [products, categories] = await Promise.all([
    getAdminProducts(),
    getAdminCategories(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Productos
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Gestion de productos
          </h1>
          <p className="mt-4 text-muted-foreground">
            Crea productos base, abre su ficha admin y gestiona variantes, imagenes, talles y
            stock sin tocar la tienda publica.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin">
              <ArrowLeft className="size-4" />
              Volver al panel
            </Link>
          </Button>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/productos/nuevo">
              <Plus className="size-4" />
              Nuevo producto
            </Link>
          </Button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="mt-8">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Plus className="size-5" />
              </EmptyMedia>
              <EmptyTitle>Todavia no hay productos cargados.</EmptyTitle>
              <EmptyDescription>
                Crea el primer producto base y despues completa sus variantes, imagenes y talles.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button asChild>
                <Link href="/admin/productos/nuevo">Crear producto</Link>
              </Button>
            </EmptyContent>
          </Empty>
        </div>
      ) : (
        <div className="mt-8">
          <AdminProductsList products={products} categories={categories} />
        </div>
      )}
    </div>
  )
}
