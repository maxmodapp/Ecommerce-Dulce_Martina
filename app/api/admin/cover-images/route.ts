import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import { createAdminCoverImage, getAdminCoverImages } from "@/lib/cover-images"
import { deleteImageFromCloudinary, uploadImageToCloudinary } from "@/lib/cloudinary"
import { revalidatePublicHome } from "@/lib/public-cache"

export const runtime = "nodejs"

function parseCoverImageFormData(formData: FormData) {
  const desktopFileValue = formData.get("desktopFile")
  const mobileFileValue = formData.get("mobileFile")
  const href = typeof formData.get("href") === "string" ? String(formData.get("href")).trim() : null
  const sortOrder = Number(formData.get("sortOrder") ?? 0)

  if (!(desktopFileValue instanceof File) || desktopFileValue.size <= 0) {
    throw new AdminApiError(400, "Selecciona la imagen para pantalla grande.", "INVALID_DESKTOP_FILE")
  }

  if (!(mobileFileValue instanceof File) || mobileFileValue.size <= 0) {
    throw new AdminApiError(400, "Selecciona la imagen para celular.", "INVALID_MOBILE_FILE")
  }

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return {
    desktopFile: desktopFileValue,
    mobileFile: mobileFileValue,
    href: href || null,
    sortOrder,
  }
}

export async function GET() {
  try {
    await requireAdminApiUser()
    const images = await getAdminCoverImages()
    return NextResponse.json({ images })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/cover-images error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    await requireAdminApiUser()
    let formData: FormData

    try {
      formData = await req.formData()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const input = parseCoverImageFormData(formData)
    const uploadedImages: string[] = []
    let images

    try {
      const desktopImage = await uploadImageToCloudinary(input.desktopFile, {
        folder: "dulce-martina/portada/desktop",
      })
      uploadedImages.push(desktopImage.publicId)

      const mobileImage = await uploadImageToCloudinary(input.mobileFile, {
        folder: "dulce-martina/portada/mobile",
      })
      uploadedImages.push(mobileImage.publicId)

      images = await createAdminCoverImage({
        desktopUrl: desktopImage.url,
        mobileUrl: mobileImage.url,
        desktopPublicId: desktopImage.publicId,
        mobilePublicId: mobileImage.publicId,
        href: input.href,
        sortOrder: input.sortOrder,
      })
    } catch (error) {
      await Promise.all(
        uploadedImages.map((publicId) => deleteImageFromCloudinary(publicId).catch(() => null))
      )
      throw error
    }

    revalidatePublicHome()
    return NextResponse.json({ images }, { status: 201 })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("POST /api/admin/cover-images error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
