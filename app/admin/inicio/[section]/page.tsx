import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { notFound } from "next/navigation"
import { AdminHomeSectionList } from "@/components/admin-home-section-list"
import { Button } from "@/components/ui/button"
import { requireAdminPageUser } from "@/lib/admin"
import {
  getAdminHomeSectionItems,
  getHomeSectionFromRouteSegment,
  getHomeSectionLabel,
} from "@/lib/home-sections"

export default async function AdminHomeSectionPage({
  params,
}: {
  params: Promise<{ section: string }>
}) {
  await requireAdminPageUser("/admin/inicio")
  const { section: routeSection } = await params
  const section = getHomeSectionFromRouteSegment(routeSection)

  if (!section) {
    notFound()
  }

  const items = await getAdminHomeSectionItems(section)

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">Inicio</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            {getHomeSectionLabel(section)}
          </h1>
          <p className="mt-4 text-muted-foreground">
            Aqui solo puedes reordenar o quitar productos ya asignados. Para sumar un producto a
            esta seccion, entra a su ficha admin y activalo desde Datos generales.
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
        <AdminHomeSectionList section={section} initialItems={items} />
      </div>
    </div>
  )
}
