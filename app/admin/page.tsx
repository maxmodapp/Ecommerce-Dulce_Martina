import Link from "next/link"
import { House, Package, ShoppingBag, Tags } from "lucide-react"
import { requireAdminPageUser } from "@/lib/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Panel de administracion | Dulce Martina",
  description: "Accesos principales del panel de administracion.",
}

const adminSections = [
  {
    title: "Inicio",
    description: "Ordena las secciones manuales de la home sin duplicar la carga de productos.",
    href: "/admin/inicio",
    icon: House,
  },
  {
    title: "Pedidos",
    description: "Revisa pedidos, cambia estados y entra al detalle de cada compra.",
    href: "/admin/pedidos",
    icon: Package,
  },
  {
    title: "Productos",
    description: "Gestiona productos, variantes, imagenes y stock desde el panel admin.",
    href: "/admin/productos",
    icon: ShoppingBag,
  },
  {
    title: "Categorias",
    description: "Administra categorias, subcategorias y su visibilidad en el menu.",
    href: "/admin/categorias",
    icon: Tags,
  },
]

export default async function AdminPage() {
  await requireAdminPageUser("/admin")

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
          Administracion
        </p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
          Panel de administracion
        </h1>
        <p className="mt-4 text-muted-foreground">
          Accede a los modulos principales del panel desde un lugar simple y claro.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {adminSections.map((section) => {
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
