import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const ordenes = await prisma.ordenes.findMany({
      take: 20,
    })

    const orden1 = await prisma.ordenes.findUnique({
      where: { id: BigInt(1) },
    })

    return NextResponse.json({
      total_ordenes: ordenes.length,
      orden_id_1: orden1 ? {
        id: orden1.id.toString(),
        customer_name: orden1.customer_name,
        status: orden1.status,
        total: orden1.total,
      } : null,
      sample_ordenes: ordenes.map(o => ({
        id: o.id.toString(),
        customer_name: o.customer_name,
        status: o.status,
        total: o.total,
      })),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
