import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  adminVariantBelongsToProduct,
  createAdminVariantImage,
  getAdminProductName,
} from "@/lib/admin-products"
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary"
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

function parseImageFormData(formData: FormData) {
  const fileValue = formData.get("file")
  const sortOrder = Number(formData.get("sortOrder"))

  if (!(fileValue instanceof File) || fileValue.size <= 0) {
    throw new AdminApiError(400, "Selecciona una imagen antes de subirla.", "INVALID_FILE")
  }

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return {
    file: fileValue,
    sortOrder,
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

    let formData: FormData

    try {
      formData = await req.formData()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseImageFormData(formData)
    const productName = await getAdminProductName(productId)

    if (!productName) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const uploadedImage = await uploadImageToCloudinary(input.file, {
      folder: `dulce-martina/productos/${productId.toString()}/variantes/${resolvedVariantId.toString()}`,
    })

    let image

    try {
      image = await createAdminVariantImage(resolvedVariantId, {
        url: uploadedImage.url,
        publicId: uploadedImage.publicId,
        alt: productName,
        sortOrder: input.sortOrder,
      })
    } catch (error) {
      await deleteImageFromCloudinary(uploadedImage.publicId).catch(() => null)
      throw error
    }

    revalidatePublicProducts()
    return NextResponse.json({ image }, { status: 201 })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("POST /api/admin/products/[id]/variants/[variantId]/images error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
