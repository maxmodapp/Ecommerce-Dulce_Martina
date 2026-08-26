import { NextResponse } from "next/server"
import { getPublicProductList } from "@/lib/public-products"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const productos = await getPublicProductList({
    q: searchParams.get("q"),
    categoria: searchParams.get("categoria"),
    subcategoria: searchParams.get("subcategoria"),
    genero: searchParams.get("genero"),
  })

  return NextResponse.json({ productos })
}
