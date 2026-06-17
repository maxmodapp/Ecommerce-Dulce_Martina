import { NextResponse } from "next/server"
import { adminJsonError, AdminApiError, requireAdminApiUser } from "@/lib/admin"
import { getAdminOrders } from "@/lib/admin-orders"

export const runtime = "nodejs"

export async function GET() {
  try {
    await requireAdminApiUser()
    const orders = await getAdminOrders()
    return NextResponse.json({ orders })
  } catch (error: any) {
    if (error instanceof AdminApiError) return adminJsonError(error)
    console.error("GET /api/admin/orders error:", error)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
