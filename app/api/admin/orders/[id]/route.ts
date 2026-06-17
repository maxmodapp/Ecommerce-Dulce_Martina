import { NextResponse } from "next/server"
import { AdminApiError, adminJsonError, requireAdminApiUser } from "@/lib/admin"
import { getAdminOrderById, updateAdminOrderStatus } from "@/lib/admin-orders"
import { ORDER_STATUS_VALUES } from "@/lib/order-display"
import type { OrderStatus } from "@/lib/types"

export const runtime = "nodejs"
const ZERO = BigInt(0)

function toBigIntId(value: unknown, fieldName: string): bigint {
  if (typeof value === "bigint") {
    if (value <= ZERO) throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
    return value
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
      throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
    }
    return BigInt(value)
  }
  if (typeof value === "string") {
    const resolved = value.trim()
    if (!/^[0-9]+$/.test(resolved)) {
      throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
    }

    const id = BigInt(resolved)
    if (id <= ZERO) throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
    return id
  }

  throw new AdminApiError(400, `${fieldName} invalido`, "INVALID_ID")
}

function parseOrderStatus(value: unknown): OrderStatus {
  if (typeof value !== "string" || !ORDER_STATUS_VALUES.includes(value as OrderStatus)) {
    throw new AdminApiError(400, "Estado invalido", "INVALID_STATUS")
  }

  return value as OrderStatus
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApiUser()
    const { id } = await params
    const detail = await getAdminOrderById(toBigIntId(id, "id"))

    if (!detail) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    return NextResponse.json(detail)
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/orders/[id] error:", error)
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

    const status = parseOrderStatus((body as any)?.status)
    const order = await updateAdminOrderStatus(resolvedId, status)

    return NextResponse.json({ order })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("PATCH /api/admin/orders/[id] error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
