import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = (searchParams.get("q") || "").trim()
  const categoriaSlug = (searchParams.get("categoria") || "").trim()

  const productos = await prisma.productos.findMany({
    where: {
      active: true,
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { descripcion: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(categoriaSlug ? { categorias: { slug: categoriaSlug } } : {}),
    },
    include: {
      categorias: true,
      variantes: {
        where: { active: true },
        orderBy: [{ sort_order: "asc" }, { id: "asc" }],
        include: {
          variante_imagenes: {
            orderBy: { sort_order: "asc" },
            take: 1,
            select: { url: true, alt: true, sort_order: true },
          },
        },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const safe = productos.map((p) => ({
    id: p.id.toString(),
    nombre: p.nombre,
    slug: p.slug,
    descripcion: p.descripcion,
    precio: p.precio,
    active: p.active,
    created_at: p.created_at,
    update_at: p.update_at,

    categoria: p.categorias
      ? {
          id: p.categorias.id.toString(),
          nombre: p.categorias.nombre,
          slug: p.categorias.slug,
        }
      : null,

    // ✅ ÚNICO campo para UI (color + url)
    variantes: p.variantes.map((v) => ({
      id: v.id.toString(),
      sort_order: v.sort_order,
      nombre_color: v.nombre_color,
      color_hex: v.color_hex,
      image_url: v.variante_imagenes[0]?.url ?? null,
      image_alt: v.variante_imagenes[0]?.alt ?? null,
    })),
  }))

  return NextResponse.json({ productos: safe })
}