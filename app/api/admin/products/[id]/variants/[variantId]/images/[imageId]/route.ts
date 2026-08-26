import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  adminImageBelongsToVariant,
  adminVariantBelongsToProduct,
  deleteAdminVariantImage,
  getAdminVariantImageById,
  updateAdminVariantImage,
} from "@/lib/admin-products"
import { deleteImageFromCloudinary } from "@/lib/cloudinary"
import { revalidatePublicProducts } from "@/lib/public-cache"

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

function parseImageInput(body: any) {
  const sortOrder = Number(body?.sortOrder)

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return {
    sortOrder,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string; imageId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId, imageId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")
    const resolvedImageId = toBigIntId(imageId, "imagen")

    const validVariant = await adminVariantBelongsToProduct(productId, resolvedVariantId)
    const validImage = await adminImageBelongsToVariant(resolvedVariantId, resolvedImageId)

    if (!validVariant || !validImage) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseImageInput(body)
    const image = await updateAdminVariantImage(resolvedImageId, input)

    revalidatePublicProducts()
    return NextResponse.json({ image })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("PATCH /api/admin/products/[id]/variants/[variantId]/images/[imageId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string; variantId: string; imageId: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id, variantId, imageId } = await params
    const productId = toBigIntId(id, "producto")
    const resolvedVariantId = toBigIntId(variantId, "variante")
    const resolvedImageId = toBigIntId(imageId, "imagen")

    const validVariant = await adminVariantBelongsToProduct(productId, resolvedVariantId)
    const validImage = await adminImageBelongsToVariant(resolvedVariantId, resolvedImageId)

    if (!validVariant || !validImage) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    const image = await getAdminVariantImageById(resolvedImageId)

    if (!image) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    if (image.publicId) {
      await deleteImageFromCloudinary(image.publicId)
    }

    await deleteAdminVariantImage(resolvedImageId)
    revalidatePublicProducts()
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("DELETE /api/admin/products/[id]/variants/[variantId]/images/[imageId] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
