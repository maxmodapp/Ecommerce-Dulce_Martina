import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  deleteAdminSubcategory,
  isAudience,
  isForeignKeyError,
  isUniqueConstraintError,
  updateAdminSubcategory,
} from "@/lib/catalog"
import { slugify } from "@/lib/utils"

export const runtime = "nodejs"

const ZERO = BigInt(0)
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toBigIntId(value: unknown): bigint {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value.trim())) {
    throw new AdminApiError(400, "Subcategoria invalida.", "INVALID_ID")
  }

  const resolved = BigInt(value.trim())
  if (resolved <= ZERO) throw new AdminApiError(400, "Subcategoria invalida.", "INVALID_ID")
  return resolved
}

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

  if (!/^[0-9]+$/.test(categoryId) || BigInt(categoryId) <= ZERO) {
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

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const body = await req.json()
    const subcategory = await updateAdminSubcategory(toBigIntId(id), parseSubcategoryInput(body))
    return NextResponse.json({ subcategory })
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
    if (isForeignKeyError(error)) {
      return NextResponse.json(
        { error: "Selecciona una categoria valida.", code: "INVALID_CATEGORY" },
        { status: 400 }
      )
    }
    console.error("PATCH /api/admin/subcategories/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    await deleteAdminSubcategory(toBigIntId(id))
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (error?.message === "SUBCATEGORY_HAS_PRODUCTS") {
      return NextResponse.json(
        {
          error: "No se puede eliminar una subcategoria que tiene productos. Desactivala si no queres mostrarla.",
          code: "SUBCATEGORY_HAS_PRODUCTS",
        },
        { status: 409 }
      )
    }
    console.error("DELETE /api/admin/subcategories/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
