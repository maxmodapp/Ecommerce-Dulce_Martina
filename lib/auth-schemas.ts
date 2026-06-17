import { z } from "zod"

const requiredName = "Este dato es obligatorio."

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo.")
    .email("Ingresa un correo valido."),
  password: z
    .string()
    .min(1, "Ingresa tu contrasena.")
    .max(100, "La contrasena no es valida."),
})

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre.")
    .max(80, "Tu nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .min(1, "Ingresa tu correo.")
    .email("Ingresa un correo valido."),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresa un telefono valido.")
    .max(30, "El telefono es demasiado largo."),
  password: z
    .string()
    .min(6, "La contrasena debe tener al menos 6 caracteres.")
    .max(100, "La contrasena es demasiado larga."),
  direccion: z
    .string()
    .trim()
    .max(200, "La direccion es demasiado larga.")
    .optional()
    .or(z.literal("")),
})

export const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Ingresa tu nombre.")
    .max(80, "Tu nombre es demasiado largo."),
  email: z
    .string()
    .trim()
    .min(1, requiredName)
    .email("Ingresa un correo valido."),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresa un telefono valido.")
    .max(30, "El telefono es demasiado largo."),
  direccion: z
    .string()
    .trim()
    .max(200, "La direccion es demasiado larga.")
    .optional()
    .or(z.literal("")),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProfileInput = z.infer<typeof profileSchema>
