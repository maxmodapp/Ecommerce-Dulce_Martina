import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminProductCreateForm } from "@/components/admin-product-create-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminCategories } from "@/lib/admin-products"

export const metadata = {
  title: "Nuevo producto | Administracion",
  description: "Crea el producto base y despues completa variantes, imagenes y talles.",
}

export default async function AdminNuevoProductoPage() {
  await requireAdminPageUser("/admin/productos/nuevo")
  const categories = await getAdminCategories()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Productos
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Crear producto
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Crea primero el producto base. Despues vas a poder cargar variantes, imagenes,
            talles y stock desde su ficha admin.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/productos">
            <ArrowLeft className="size-4" />
            Volver a productos
          </Link>
        </Button>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-xl">Datos generales</CardTitle>
        </CardHeader>
        <CardContent>
          <AdminProductCreateForm categories={categories} />
        </CardContent>
      </Card>
    </div>
  )
}
