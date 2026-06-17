import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { registerSchema } from "@/lib/auth-schemas"
import {
  createUserSession,
  hashPassword,
  normalizeEmailInput,
  normalizeName,
  normalizeOptionalText,
  normalizePhone,
  toSessionUser,
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

  const parsed = registerSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." },
      { status: 400 }
    )
  }

  const email = normalizeEmailInput(parsed.data.email)
  const passwordHash = await hashPassword(parsed.data.password)

  try {
    const user = await prisma.usuarios.create({
      data: {
        name: normalizeName(parsed.data.name),
        email,
        phone: normalizePhone(parsed.data.phone),
        direccion: normalizeOptionalText(parsed.data.direccion),
        password_hash: passwordHash,
      },
      select: {
        id: true,
        email: true,
        role: true,
        name: true,
        phone: true,
        direccion: true,
      },
    })

    await createUserSession(user.id)

    return NextResponse.json(
      {
        user: toSessionUser(user),
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ya existe una cuenta registrada con ese correo." },
        { status: 409 }
      )
    }

    console.error("POST /api/auth/register error:", error)
    return NextResponse.json(
      { error: "No pudimos crear tu cuenta. Intentá nuevamente en unos minutos." },
      { status: 500 }
    )
  }
}
