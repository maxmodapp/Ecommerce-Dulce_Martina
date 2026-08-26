import Link from "next/link"
import { ArrowLeft, Layers2, Tags } from "lucide-react"
import { requireAdminPageUser } from "@/lib/admin"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Categorias | Administracion",
  description: "Gestiona categorias y subcategorias del catalogo.",
}

const sections = [
  {
    title: "Categorias principales",
    description: "Crea, ordena y activa las categorias padre del catalogo.",
    href: "/admin/categorias/principales",
    icon: Tags,
  },
  {
    title: "Subcategorias",
    description: "Define subcategorias, audiencia visible y categoria padre.",
    href: "/admin/categorias/subcategorias",
    icon: Layers2,
  },
]

export default async function AdminCategoriasPage() {
  await requireAdminPageUser("/admin/categorias")

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Categorias
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Gestion de categorias
          </h1>
          <p className="mt-4 text-muted-foreground">
            Organiza el catalogo y el menu visual de productos.
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
        {sections.map((section) => {
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
