import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  adminSizeBelongsToVariant,
  adminVariantBelongsToProduct,
  deleteAdminVariantSize,
  isUniqueConstraintError,
  updateAdminVariantSize,
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

function parseSizeInput(body: any) {
  const label = typeof body?.label === "string" ? body.label.trim().toUpperCase() : ""
  const stock = Number(body?.stock)

  if (!label) {
    throw new AdminApiError(400, "Ingresa un talle.", "INVALID_SIZE")
  }

  if (!Number.isFinite(stock) || !Number.isInteger(stock) || stock < 0) {
    throw new AdminApiError(400, "Ingresa un stock valido.", "INVALID_STOCK")
  }

  return {
    label,
    stock,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string; sizeId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId, sizeId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")
    const resolvedSizeId = toBigIntId(sizeId, "talle")

    const validVariant = await adminVariantBelongsToProduct(productId, resolvedVariantId)
    const validSize = await adminSizeBelongsToVariant(resolvedVariantId, resolvedSizeId)

    if (!validVariant || !validSize) {
      return NextResponse.json({ error: "Talle no encontrado" }, { status: 404 })
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseSizeInput(body)
    const size = await updateAdminVariantSize(resolvedSizeId, input)

    return NextResponse.json({ size })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        {
          error: "Ese talle ya existe para esta variante.",
          code: "DUPLICATE_SIZE",
        },
        { status: 409 }
      )
    }
    console.error("PATCH /api/admin/products/[id]/variants/[variantId]/sizes/[sizeId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string; sizeId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId, sizeId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")
    const resolvedSizeId = toBigIntId(sizeId, "talle")

    const validVariant = await adminVariantBelongsToProduct(productId, resolvedVariantId)
    const validSize = await adminSizeBelongsToVariant(resolvedVariantId, resolvedSizeId)

    if (!validVariant || !validSize) {
      return NextResponse.json({ error: "Talle no encontrado" }, { status: 404 })
    }

    await deleteAdminVariantSize(resolvedSizeId)
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("DELETE /api/admin/products/[id]/variants/[variantId]/sizes/[sizeId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
