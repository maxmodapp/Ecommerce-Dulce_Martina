import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  adminVariantBelongsToProduct,
  createAdminVariantSize,
  isUniqueConstraintError,
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

export async function POST(
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

    const input = parseSizeInput(body)
    const size = await createAdminVariantSize(resolvedVariantId, input)

    return NextResponse.json({ size }, { status: 201 })
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
    console.error("POST /api/admin/products/[id]/variants/[variantId]/sizes error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
