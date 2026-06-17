import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  createAdminProduct,
  getAdminProducts,
  isUniqueConstraintError,
} from "@/lib/admin-products"

export const runtime = "nodejs"

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseProductInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const slugSource = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const descriptionSource = typeof body?.description === "string" ? body.description.trim() : ""
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId.trim() : ""
  const price = Number(body?.price)
  const active = Boolean(body?.active)

  if (name.length < 2) {
    throw new AdminApiError(400, "Ingresa un nombre valido.", "INVALID_NAME")
  }

  if (!SLUG_REGEX.test(slugSource)) {
    throw new AdminApiError(
      400,
      "El slug solo puede tener letras, numeros y guiones.",
      "INVALID_SLUG"
    )
  }

  if (!Number.isFinite(price) || !Number.isInteger(price) || price < 0) {
    throw new AdminApiError(400, "Ingresa un precio valido.", "INVALID_PRICE")
  }

  return {
    name,
    slug: slugSource,
    description: descriptionSource ? descriptionSource : null,
    categoryId: categoryId || null,
    price,
    active,
  }
}

export async function GET() {
  try {
    await requireAdminApiUser()
    const products = await getAdminProducts()
    return NextResponse.json({ products })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/products error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminApiUser()

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseProductInput(body)
    const product = await createAdminProduct(input)

    return NextResponse.json({ product }, { status: 201 })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug.", code: "DUPLICATE_SLUG" },
        { status: 409 }
      )
    }
    console.error("POST /api/admin/products error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
