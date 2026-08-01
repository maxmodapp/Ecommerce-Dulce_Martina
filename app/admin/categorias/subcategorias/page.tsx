import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminSubcategoriesManager } from "@/components/admin-subcategories-manager"
import { Button } from "@/components/ui/button"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminCategories, getAdminSubcategories } from "@/lib/catalog"

export const metadata = {
  title: "Subcategorias | Administracion",
  description: "Gestiona las subcategorias del catalogo.",
}

export default async function AdminSubcategoriasPage() {
  await requireAdminPageUser("/admin/categorias/subcategorias")
  const [categories, subcategories] = await Promise.all([
    getAdminCategories(),
    getAdminSubcategories(),
  ])

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Categorias
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Subcategorias
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Define subcategorias, su categoria padre y para quien aparecen en el menu.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/categorias">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <AdminSubcategoriesManager
          categories={categories}
          initialSubcategories={subcategories}
        />
      </div>
    </div>
  )
}
