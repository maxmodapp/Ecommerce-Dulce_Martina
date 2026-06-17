import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params

  const producto = await prisma.productos.findUnique({
    where: { slug },
    include: {
      categorias: true,
      variantes: {
        where: { active: true },
        include: {
          variante_imagenes: { orderBy: { sort_order: "asc" } },
          variante_talles: { orderBy: { talle: "asc" } },
        },
        orderBy: [{ sort_order: "asc" }, { id: "asc" }],
      },
    },
  })

  if (!producto || !producto.active) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    producto: {
      id: producto.id.toString(),
      nombre: producto.nombre,
      slug: producto.slug,
      descripcion: producto.descripcion,
      precio: producto.precio,
      categoria: producto.categorias
        ? {
            id: producto.categorias.id.toString(),
            nombre: producto.categorias.nombre,
            slug: producto.categorias.slug,
          }
        : null,
      variantes: producto.variantes.map((v) => ({
        id: v.id.toString(),
        nombre_color: v.nombre_color,
        color_hex: v.color_hex,
        imagenes: v.variante_imagenes.map((img) => ({
          id: img.id.toString(),
          url: img.url,
          alt: img.alt,
          sort_order: img.sort_order,
        })),
        talles: v.variante_talles.map((t) => ({
          id: t.id.toString(),
          talle: t.talle,
          stock: t.stock,
        })),
      })),
    },
  })
}