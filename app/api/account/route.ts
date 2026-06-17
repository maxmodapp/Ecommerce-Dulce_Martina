import { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"
import { profileSchema } from "@/lib/auth-schemas"
import {
  getCurrentUser,
  normalizeEmailInput,
  normalizeName,
  normalizeOptionalText,
  normalizePhone,
  sessionUserSelect,
  toSessionUser,
} from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

function unauthorizedResponse() {
  return NextResponse.json(
    { error: "Necesitás iniciar sesión para continuar." },
    { status: 401 }
  )
}

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return unauthorizedResponse()

  return NextResponse.json({ user })
}

export async function PATCH(req: Request) {
  const currentUser = await getCurrentUser()
  if (!currentUser) return unauthorizedResponse()

  let body: unknown

  try {
    body = await req.json()
  } catch {
    return NextResponse.json(
      { error: "No pudimos procesar la solicitud. Intentá nuevamente." },
      { status: 400 }
    )
  }

  const parsed = profileSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Revisá los datos ingresados." },
      { status: 400 }
    )
  }

  const email = normalizeEmailInput(parsed.data.email)

  try {
    const user = await prisma.usuarios.update({
      where: { id: BigInt(currentUser.id) },
      data: {
        name: normalizeName(parsed.data.name),
        email,
        phone: normalizePhone(parsed.data.phone),
        direccion: normalizeOptionalText(parsed.data.direccion),
      },
      select: sessionUserSelect,
    })

    return NextResponse.json({ user: toSessionUser(user) })
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Ese correo ya está siendo usado por otra cuenta." },
        { status: 409 }
      )
    }

    console.error("PATCH /api/account error:", error)
    return NextResponse.json(
      { error: "No pudimos guardar tus cambios. Intentá nuevamente." },
      { status: 500 }
    )
  }
}
