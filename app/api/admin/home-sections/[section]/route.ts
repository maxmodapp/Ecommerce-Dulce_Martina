import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import {
  getAdminHomeSectionItems,
  getHomeSectionFromRouteSegment,
  moveHomeSectionItem,
  removeHomeSectionItem,
} from "@/lib/home-sections"
import { revalidatePublicHome } from "@/lib/public-cache"

export const runtime = "nodejs"

const ZERO = BigInt(0)

function toBigIntId(value: unknown, fieldName: string) {
  if (typeof value !== "string" || !/^[0-9]+$/.test(value.trim())) {
    throw new AdminApiError(400, `${fieldName} invalido.`, "INVALID_ID")
  }

  const resolved = BigInt(value.trim())

  if (resolved <= ZERO) {
    throw new AdminApiError(400, `${fieldName} invalido.`, "INVALID_ID")
  }

  return resolved
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ section: string }> }
) {
  try {
    await requireAdminApiUser()

    const { section: routeSection } = await params
    const section = getHomeSectionFromRouteSegment(routeSection)

    if (!section) {
      return NextResponse.json(
        { error: "Seccion no encontrada.", code: "SECTION_NOT_FOUND" },
        { status: 404 }
      )
    }

    let body: unknown

    try {
      body = await req.json()
    } catch {
      throw new AdminApiError(400, "No pudimos procesar la solicitud.", "BAD_REQUEST")
    }

    const action = typeof (body as any)?.action === "string" ? (body as any).action : ""
    const itemId = toBigIntId((body as any)?.itemId, "itemId")

    if (action === "move") {
      const direction = (body as any)?.direction

      if (direction !== "up" && direction !== "down") {
        throw new AdminApiError(400, "La direccion no es valida.", "INVALID_DIRECTION")
      }

      await moveHomeSectionItem(section, itemId, direction)
    } else if (action === "remove") {
      await removeHomeSectionItem(section, itemId)
    } else {
      throw new AdminApiError(400, "La accion solicitada no es valida.", "INVALID_ACTION")
    }

    const items = await getAdminHomeSectionItems(section)
    revalidatePublicHome()
    return NextResponse.json({ items })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    if (error instanceof Error && error.message === "ITEM_NOT_FOUND") {
      return NextResponse.json(
        { error: "No encontramos ese producto dentro de la seccion.", code: "ITEM_NOT_FOUND" },
        { status: 404 }
      )
    }
    console.error("PATCH /api/admin/home-sections/[section] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
