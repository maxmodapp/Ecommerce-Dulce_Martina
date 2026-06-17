import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { loginSchema } from "@/lib/auth-schemas"
import {
  createUserSession,
  normalizeEmailInput,
  toSessionUser,
  verifyPassword,
} from "@/lib/auth"

export const runtime = "nodejs"

export async function POST(req: Request) {
  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "No pudimos procesar la solicitud. Intentá nuevamente." },
      { status: 400 }
    )
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." },
      { status: 400 }
    )
  }

  const email = normalizeEmailInput(parsed.data.email)
  const user = await prisma.usuarios.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      name: true,
      phone: true,
      direccion: true,
      password_hash: true,
    },
  })

  if (!user) {
    return NextResponse.json(
      { error: "No encontramos una cuenta con ese correo y contraseña." },
      { status: 401 }
    )
  }

  const isPasswordValid = await verifyPassword(parsed.data.password, user.password_hash)
  if (!isPasswordValid) {
    return NextResponse.json(
      { error: "No encontramos una cuenta con ese correo y contraseña." },
      { status: 401 }
    )
  }

  await createUserSession(user.id)

  return NextResponse.json({
    user: toSessionUser(user),
  })
}
