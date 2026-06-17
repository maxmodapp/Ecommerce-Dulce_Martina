"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { profileSchema, type ProfileInput } from "@/lib/auth-schemas"
import { useAuth } from "@/lib/auth-context"
import type { SessionUser } from "@/lib/types"
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
import { Textarea } from "@/components/ui/textarea"

function toDefaultValues(user: SessionUser): ProfileInput {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    direccion: user.direccion ?? "",
  }
}

export function AccountForm({ initialUser }: { initialUser: SessionUser }) {
  const { setUser } = useAuth()
  const [serverError, setServerError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: toDefaultValues(initialUser),
  })

  async function onSubmit(values: ProfileInput) {
    setServerError("")
    setSuccessMessage("")

    const response = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    })

    const data = await response.json()

    if (!response.ok) {
      setServerError(data.error ?? "No pudimos guardar tus cambios.")
      return
    }

    setUser(data.user)
    form.reset(toDefaultValues(data.user))
    setSuccessMessage("Tus datos se guardaron correctamente.")
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Telefono</FormLabel>
              <FormControl>
                <Input type="tel" autoComplete="tel" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="direccion"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Direccion</FormLabel>
              <FormControl>
                <Textarea rows={4} placeholder="Tu direccion" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
        {successMessage ? <p className="text-sm text-foreground">{successMessage}</p> : null}

        {form.formState.isDirty ? (
          <Button
            type="submit"
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? "Guardando..." : "Guardar cambios"}
          </Button>
        ) : null}
      </form>
    </Form>
  )
}
