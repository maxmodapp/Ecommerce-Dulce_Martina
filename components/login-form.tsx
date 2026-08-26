"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useRouter, useSearchParams } from "next/navigation"
import { loginSchema, type LoginInput } from "@/lib/auth-schemas"
import { useAuth } from "@/lib/auth-context"
import { getSafeInternalPath } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { setUser } = useAuth()
  const [serverError, setServerError] = useState("")

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginInput) {
    setServerError("")

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (!response.ok) {
      setServerError(data.error ?? "No pudimos iniciar sesion. Intenta nuevamente.")
      return
    }

    setUser(data.user)
    router.replace(getSafeInternalPath(searchParams.get("next"), "/"))
    router.refresh()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input type="email" placeholder="tu@correo.com" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Contrasena</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Tu contrasena"
                  autoComplete="current-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

        <Button
          type="submit"
          size="lg"
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Ingresando..." : "Iniciar sesion"}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Todavia no tenes cuenta?{" "}
          <Link href="/registro" className="font-medium text-primary underline underline-offset-4">
            Registrate
          </Link>
        </p>
      </form>
    </Form>
  )
}
