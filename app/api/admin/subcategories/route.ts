import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  createAdminSubcategory,
  getAdminSubcategories,
  isAudience,
  isUniqueConstraintError,
} from "@/lib/catalog"
import { revalidatePublicCatalog } from "@/lib/public-cache"
import { slugify } from "@/lib/utils"

export const runtime = "nodejs"

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function parseSubcategoryInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const rawSlug = typeof body?.slug === "string" ? body.slug : ""
  const slug = slugify(rawSlug || name)
  const categoryId = typeof body?.categoryId === "string" ? body.categoryId.trim() : ""
  const audience = body?.audience
  const sortOrder = Number(body?.sortOrder ?? 0)
  const active = Boolean(body?.active)

  if (name.length < 2) {
    throw new AdminApiError(400, "Ingresa un nombre valido.", "INVALID_NAME")
  }

  if (!SLUG_REGEX.test(slug)) {
    throw new AdminApiError(
      400,
      "No pudimos generar un slug valido. Revisa el nombre o escribi uno manualmente.",
      "INVALID_SLUG"
    )
  }

  if (!/^[0-9]+$/.test(categoryId) || BigInt(categoryId) <= BigInt(0)) {
    throw new AdminApiError(400, "Selecciona una categoria valida.", "INVALID_CATEGORY")
  }

  if (!isAudience(audience)) {
    throw new AdminApiError(400, "Selecciona una audiencia valida.", "INVALID_AUDIENCE")
  }

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return { name, slug, categoryId, audience, active, sortOrder }
}

export async function GET() {
  try {
    await requireAdminApiUser()
    const subcategories = await getAdminSubcategories()
    return NextResponse.json({ subcategories })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/subcategories error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminApiUser()
    const body = await req.json()
    const subcategory = await createAdminSubcategory(parseSubcategoryInput(body))
    revalidatePublicCatalog()
    return NextResponse.json({ subcategory }, { status: 201 })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          error: "Ya existe una subcategoria con ese slug dentro de esa categoria.",
          code: "DUPLICATE_SLUG",
        },
        { status: 409 }
      )
    }
    console.error("POST /api/admin/subcategories error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
