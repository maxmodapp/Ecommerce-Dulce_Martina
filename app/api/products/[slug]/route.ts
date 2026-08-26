import { NextResponse } from "next/server"
import { getPublicProductDetail } from "@/lib/public-products"

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params
  const producto = await getPublicProductDetail(slug)

  if (!producto) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json({ producto })
}
