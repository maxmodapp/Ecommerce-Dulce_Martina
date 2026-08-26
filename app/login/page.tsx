import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"
import { getSafeInternalPath } from "@/lib/utils"

export const metadata = {
  title: "Iniciar sesion | Dulce Martina",
  description: "Ingresa a tu cuenta para guardar tus datos y seguir tus pedidos.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ next?: string | string[] }>
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const nextValue = Array.isArray(resolvedSearchParams?.next)
    ? resolvedSearchParams.next[0]
    : resolvedSearchParams?.next
  const nextPath = getSafeInternalPath(nextValue, "/mi-cuenta")
  const user = await getCurrentUser()
  if (user) redirect(nextPath)

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-7xl items-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Tu cuenta
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Iniciar sesion
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Podes seguir comprando como invitado, pero con tu cuenta vas a tener tu informacion
            lista para futuras compras y tambien ver tus pedidos en un solo lugar.
          </p>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Iniciar sesion</CardTitle>
            <CardDescription>
              Ingresa con tu correo y contrasena.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
