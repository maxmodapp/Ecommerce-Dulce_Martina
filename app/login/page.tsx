import { redirect } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"

export const metadata = {
  title: "Iniciar sesion | Dulce Martina",
  description: "Ingresa a tu cuenta para guardar tus datos y seguir tus pedidos.",
}

export default async function LoginPage() {
  const user = await getCurrentUser()
  if (user) redirect("/mi-cuenta")

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-7xl items-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="max-w-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Tu cuenta
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Inicia sesion para guardar tus datos y comprar mas rapido
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Podes seguir comprando como invitada, pero con tu cuenta vas a tener tu informacion
            lista para futuras compras y mas adelante tambien tus pedidos en un solo lugar.
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
