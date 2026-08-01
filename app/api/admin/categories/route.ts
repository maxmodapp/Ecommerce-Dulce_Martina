import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  createAdminCategory,
  getAdminCategories,
  isUniqueConstraintError,
} from "@/lib/catalog"
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary"
import { slugify } from "@/lib/utils"

export const runtime = "nodejs"

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

export async function GET() {
  try {
    await requireAdminApiUser()
    const categories = await getAdminCategories()
    return NextResponse.json({ categories })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/categories error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminApiUser()
    const { input, imageFile } = await parseCategoryRequest(req)
    let uploadedImage: Awaited<ReturnType<typeof uploadImageToCloudinary>> | null = null

    try {
      if (imageFile) {
        uploadedImage = await uploadImageToCloudinary(imageFile, {
          folder: "dulce-martina/categorias",
        })
      }

      const category = await createAdminCategory({
        ...input,
        imageUrl: uploadedImage?.url ?? null,
        imagePublicId: uploadedImage?.publicId ?? null,
      })

      return NextResponse.json({ category }, { status: 201 })
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
    console.error("POST /api/admin/categories error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
