import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  deleteAdminCoverImage,
  getAdminCoverImageById,
  updateAdminCoverImage,
} from "@/lib/cover-images"
import { deleteImageFromCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"

const ZERO = 0

function toIntId(value: unknown) {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value.trim())) {
    throw new AdminApiError(400, "Imagen invalida.", "INVALID_ID")
  }

  const resolved = Number(value.trim())

  if (!Number.isSafeInteger(resolved) || resolved <= ZERO) {
    throw new AdminApiError(400, "Imagen invalida.", "INVALID_ID")
  }

  return resolved
}

function parseCoverImageInput(body: any) {
  const href = typeof body?.href === "string" ? body.href.trim() : null
  const sortOrder = Number(body?.sortOrder ?? 0)

  if (!Number.isFinite(sortOrder) || !Number.isInteger(sortOrder) || sortOrder < 0) {
    throw new AdminApiError(400, "Ingresa un orden valido.", "INVALID_SORT_ORDER")
  }

  return {
    href: href || null,
    sortOrder,
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const body = await req.json()
    const images = await updateAdminCoverImage(toIntId(id), parseCoverImageInput(body))
    return NextResponse.json({ images })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("PATCH /api/admin/cover-images/[id] error:", error)
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
    const imageId = toIntId(id)
    const image = await getAdminCoverImageById(imageId)

    if (!image) {
      return NextResponse.json(
        { error: "Imagen no encontrada.", code: "IMAGE_NOT_FOUND" },
        { status: 404 }
      )
    }

    await Promise.all(
      [image.desktopPublicId, image.mobilePublicId]
        .filter((publicId): publicId is string => Boolean(publicId))
        .map((publicId) => deleteImageFromCloudinary(publicId))
    )

    const images = await deleteAdminCoverImage(imageId)
    return NextResponse.json({ images })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("DELETE /api/admin/cover-images/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
