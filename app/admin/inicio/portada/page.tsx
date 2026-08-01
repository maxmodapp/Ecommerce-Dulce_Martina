import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminCoverImagesManager } from "@/components/admin-cover-images-manager"
import { Button } from "@/components/ui/button"
import { requireAdminPageUser } from "@/lib/admin"
import { getAdminCoverImages } from "@/lib/cover-images"

export const metadata = {
  title: "Portada | Administracion",
  description: "Gestiona las imagenes grandes de la portada de la home.",
}

export default async function AdminPortadaPage() {
  await requireAdminPageUser("/admin/inicio/portada")
  const images = await getAdminCoverImages()

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Inicio</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">Portada</h1>
          <p className="mt-4 text-muted-foreground">
            Administra las imagenes grandes de la portada. Puedes agregar URL, link opcional y
            orden visual.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin/inicio">
            <ArrowLeft className="size-4" />
            Volver a Inicio
          </Link>
        </Button>
      </div>

      <div className="mt-8">
        <AdminCoverImagesManager initialImages={images} />
      </div>
    </div>
  )
}
