import { NextResponse } from "next/server"
import { isAudience } from "@/lib/catalog"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  getAdminProductById,
  isUniqueConstraintError,
  setAdminProductActive,
  updateAdminProduct,
} from "@/lib/admin-products"
import { isHomeSection, syncProductHomeSections } from "@/lib/home-sections"
import { revalidatePublicProducts } from "@/lib/public-cache"
import type { HomeSection } from "@/lib/types"

export const runtime = "nodejs"

const ZERO = BigInt(0)
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

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

function parseProductInput(body: any) {
  const name = typeof body?.name === "string" ? body.name.trim() : ""
  const slugSource = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : ""
  const descriptionSource = typeof body?.description === "string" ? body.description.trim() : ""
  const subcategoryId = typeof body?.subcategoryId === "string" ? body.subcategoryId.trim() : ""
  const gender = body?.gender
  const price = Number(body?.price)
  const active = Boolean(body?.active)

  if (name.length < 2) {
    throw new AdminApiError(400, "Ingresa un nombre valido.", "INVALID_NAME")
  }

  if (!SLUG_REGEX.test(slugSource)) {
    throw new AdminApiError(
      400,
      "El slug solo puede tener letras, numeros y guiones.",
      "INVALID_SLUG"
    )
  }

  if (!Number.isFinite(price) || !Number.isInteger(price) || price < 0) {
    throw new AdminApiError(400, "Ingresa un precio valido.", "INVALID_PRICE")
  }

  if (!/^[0-9]+$/.test(subcategoryId) || BigInt(subcategoryId) <= ZERO) {
    throw new AdminApiError(400, "Selecciona una subcategoria valida.", "INVALID_SUBCATEGORY")
  }

  if (!isAudience(gender)) {
    throw new AdminApiError(400, "Selecciona un genero valido.", "INVALID_GENDER")
  }

  return {
    name,
    slug: slugSource,
    description: descriptionSource ? descriptionSource : null,
    subcategoryId,
    gender,
    price,
    active,
  }
}

function parseHomeSections(value: unknown): HomeSection[] {
  if (value == null) return []

  if (!Array.isArray(value)) {
    throw new AdminApiError(400, "Las secciones del inicio no son validas.", "INVALID_HOME_SECTIONS")
  }

  const sections = value.filter(isHomeSection)

  if (sections.length !== value.length) {
    throw new AdminApiError(400, "Las secciones del inicio no son validas.", "INVALID_HOME_SECTIONS")
  }

  return Array.from(new Set(sections))
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const product = await getAdminProductById(toBigIntId(id, "id"))

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    return NextResponse.json({ product })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/products/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const resolvedId = toBigIntId(id, "id")

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    if (
      typeof (body as any)?.active === "boolean" &&
      (body as any)?.name == null &&
      (body as any)?.slug == null &&
      (body as any)?.description == null &&
      (body as any)?.subcategoryId == null &&
      (body as any)?.gender == null &&
      (body as any)?.price == null
    ) {
      const product = await setAdminProductActive(resolvedId, (body as any).active)
      revalidatePublicProducts()
      return NextResponse.json({ product })
    }

    const input = parseProductInput(body)
    const product = await updateAdminProduct(resolvedId, input)
    const homeSections = parseHomeSections((body as any)?.homeSections)

    await syncProductHomeSections(resolvedId, homeSections)

    revalidatePublicProducts()
    return NextResponse.json({ product })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (isUniqueConstraintError(error)) {
      return NextResponse.json(
        { error: "Ya existe un producto con ese slug.", code: "DUPLICATE_SLUG" },
        { status: 409 }
      )
    }
    console.error("PATCH /api/admin/products/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
