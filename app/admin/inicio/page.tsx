import Link from "next/link"
import { ArrowLeft, Sparkles, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { requireAdminPageUser } from "@/lib/admin"

export const metadata = {
  title: "Inicio | Administracion",
  description: "Gestiona las secciones manuales de productos que se muestran en la home.",
}

const homeSections = [
  {
    title: "Destacados",
    description:
      "Ordena y limpia la seccion destacada de la home con los productos ya asignados.",
    href: "/admin/inicio/destacados",
    icon: Star,
  },
  {
    title: "Ultimos ingresos",
    description:
      "Administra el orden visual de Ultimos ingresos sin agregar productos desde este panel.",
    href: "/admin/inicio/ultimos-ingresos",
    icon: Sparkles,
  },
]

export default async function AdminInicioPage() {
  await requireAdminPageUser("/admin/inicio")

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Inicio
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Secciones de la home
          </h1>
          <p className="mt-4 text-muted-foreground">
            Desde aqui ordenas y quitas productos ya asignados a cada seccion. La inclusion de un
            producto se define unicamente desde su ficha admin.
          </p>
        </div>

        <Button asChild variant="outline" className="w-full sm:w-auto">
          <Link href="/admin">
            <ArrowLeft className="size-4" />
            Volver al panel
          </Link>
        </Button>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {homeSections.map((section) => {
          const Icon = section.icon

          return (
            <Link key={section.href} href={section.href}>
              <Card className="h-full border-border/80 transition-colors hover:border-primary/30 hover:bg-secondary/20">
                <CardHeader className="space-y-3">
                  <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-xl">{section.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {section.description}
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
