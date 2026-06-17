import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  adminVariantBelongsToProduct,
  isUniqueConstraintError,
  updateAdminVariant,
  deleteAdminVariant,
} from "@/lib/admin-products"

export const runtime = "nodejs"

const ZERO = BigInt(0)

function toBigIntId(value: unknown, fieldName: string): bigint {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value.trim())) {
    throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
  }

  const resolved = BigInt(value.trim())
  if (resolved <= ZERO) {
    throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
  }

  return resolved
}

function parseVariantInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const hexSource = typeof body?.hex === "string" ? body.hex.trim() : ""
  const sortOrder = Number(body?.sortOrder)
  const active = Boolean(body?.active)

  if (!name) {
    throw new AdminApiError(400, "Ingresa un nombre para la variante.", "INVALID_NAME")
  }

  if (hexSource && !/^#?[0-9a-fA-F]{6}$/.test(hexSource)) {
    throw new AdminApiError(400, "El color hex no es valido.", "INVALID_HEX")
  }

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return {
    name,
    hex: hexSource ? (hexSource.startsWith("#") ? hexSource : `#${hexSource}`) : null,
    active,
    sortOrder,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")

    if (!(await adminVariantBelongsToProduct(productId, resolvedVariantId))) {
      return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 })
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseVariantInput(body)
    const variant = await updateAdminVariant(resolvedVariantId, input)

    return NextResponse.json({ variant })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          error: "Ya existe una variante con ese nombre para este producto.",
          code: "DUPLICATE_VARIANT",
        },
        { status: 409 }
      )
    }
    console.error("PATCH /api/admin/products/[id]/variants/[variantId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")

    if (!(await adminVariantBelongsToProduct(productId, resolvedVariantId))) {
      return NextResponse.json({ error: "Variante no encontrada" }, { status: 404 })
    }

    await deleteAdminVariant(resolvedVariantId)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("DELETE /api/admin/products/[id]/variants/[variantId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
