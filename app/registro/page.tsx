import { redirect } from "next/navigation"
import { RegisterForm } from "@/components/register-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getCurrentUser } from "@/lib/auth"

export const metadata = {
  title: "Registrarse | Dulce Martina",
  description: "Crea tu cuenta para guardar tus datos y continuar tus compras.",
}

export default async function RegistroPage() {
  const user = await getCurrentUser()
  if (user) redirect("/mi-cuenta")

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] w-full max-w-7xl items-center px-4 py-12 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-lg">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-primary">
            Crear cuenta
          </p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-foreground">
            Registrate para tener tu cuenta lista en la tienda
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Vas a poder guardar tus datos personales y dejar preparada la base para ver tus
            pedidos desde la web, sin afectar la compra invitada que ya funciona hoy.
          </p>
        </div>

        <Card className="border-border/80">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Registrarse</CardTitle>
            <CardDescription>
              Completa tus datos para crear tu cuenta.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
