import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  deleteAdminCategory,
  getAdminCategoryById,
  isUniqueConstraintError,
  updateAdminCategory,
} from "@/lib/catalog"
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary"
import { slugify } from "@/lib/utils"

export const runtime = "nodejs"

const ZERO = BigInt(0)
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

function toBigIntId(value: unknown): bigint {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value.trim())) {
    throw new AdminApiError(400, "Categoria invalida.", "INVALID_ID")
  }

  const resolved = BigInt(value.trim())
  if (resolved <= ZERO) throw new AdminApiError(400, "Categoria invalida.", "INVALID_ID")
  return resolved
}

function parseActive(value: unknown) {
  if (typeof value === "boolean") return value
  if (typeof value === "string") return value === "true"
  return Boolean(value)
}

function parseCategoryInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const rawSlug = typeof body?.slug === "string" ? body.slug : ""
  const slug = slugify(rawSlug || name)
  const sortOrder = Number(body?.sortOrder ?? 0)
  const active = parseActive(body?.active)

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

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return { name, slug, active, sortOrder }
}

async function parseCategoryRequest(req: Request) {
  const contentType = req.headers.get("content-type") ?? ""

  if (contentType.includes("multipart/form-data")) {
    const formData = await req.formData()
    const imageFileValue = formData.get("imageFile")
    const imageFile =
      imageFileValue instanceof File && imageFileValue.size > 0 ? imageFileValue : null

    return {
      input: parseCategoryInput({
        name: formData.get("name"),
        slug: formData.get("slug"),
        sortOrder: formData.get("sortOrder"),
        active: formData.get("active"),
      }),
      imageFile,
    }
  }

  const body = await req.json()
  return {
    input: parseCategoryInput(body),
    imageFile: null,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const categoryId = toBigIntId(id)
    const currentCategory = await getAdminCategoryById(categoryId)

    if (!currentCategory) {
      return NextResponse.json(
        { error: "Categoria no encontrada.", code: "CATEGORY_NOT_FOUND" },
        { status: 404 }
      )
    }

    const { input, imageFile } = await parseCategoryRequest(req)
    let uploadedImage: Awaited<ReturnType<typeof uploadImageToCloudinary>> | null = null

    try {
      if (imageFile) {
        uploadedImage = await uploadImageToCloudinary(imageFile, {
          folder: "dulce-martina/categorias",
        })
      }

      const category = await updateAdminCategory(categoryId, {
        ...input,
        ...(uploadedImage
          ? {
              imageUrl: uploadedImage.url,
              imagePublicId: uploadedImage.publicId,
            }
          : {}),
      })

      if (uploadedImage && currentCategory.imagePublicId) {
        await deleteImageFromCloudinary(currentCategory.imagePublicId).catch(() => null)
      }

      return NextResponse.json({ category })
    } catch (error) {
      if (uploadedImage?.publicId) {
        await deleteImageFromCloudinary(uploadedImage.publicId).catch(() => null)
      }

      throw error
    }
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Ya existe una categoria con ese slug.", code: "DUPLICATE_SLUG" },
        { status: 409 }
      )
    }
    console.error("PATCH /api/admin/categories/[id] error:", error)
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
    const categoryId = toBigIntId(id)
    const currentCategory = await getAdminCategoryById(categoryId)

    await deleteAdminCategory(categoryId)

    if (currentCategory?.imagePublicId) {
      await deleteImageFromCloudinary(currentCategory.imagePublicId).catch(() => null)
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (error?.message === "CATEGORY_HAS_SUBCATEGORIES") {
      return NextResponse.json(
        {
          error: "No se puede eliminar una categoria que tiene subcategorias. Desactivala si no queres mostrarla.",
          code: "CATEGORY_HAS_SUBCATEGORIES",
        },
        { status: 409 }
      )
    }
    console.error("DELETE /api/admin/categories/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
