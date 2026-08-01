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
      subcategorias: {
        include: {
          categorias: true,
        },
      },
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

  if (
    !producto ||
    !producto.active ||
    !producto.subcategorias.active ||
    !producto.subcategorias.categorias.active
  ) {
    return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
  }

  return NextResponse.json({
    producto: {
      id: producto.id.toString(),
      nombre: producto.nombre,
      slug: producto.slug,
      descripcion: producto.descripcion,
      precio: producto.precio,
      genero: producto.genero,
      created_at: producto.created_at,
      categoria: {
        id: producto.subcategorias.categorias.id.toString(),
        nombre: producto.subcategorias.categorias.nombre,
        slug: producto.subcategorias.categorias.slug,
      },
      subcategoria: {
        id: producto.subcategorias.id.toString(),
        nombre: producto.subcategorias.nombre,
        slug: producto.subcategorias.slug,
        audiencia: producto.subcategorias.audiencia,
      },
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
