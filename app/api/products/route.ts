import { NextResponse } from "next/server"
import { productGenderWhere } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const q = (searchParams.get("q") || "").trim()
  const categoriaSlug = (searchParams.get("categoria") || "").trim()
  const subcategoriaSlug = (searchParams.get("subcategoria") || "").trim()
  const genero = (searchParams.get("genero") || "").trim()
  const genderWhere = productGenderWhere(genero)

  const productos = await prisma.productos.findMany({
    where: {
      active: true,
      ...(genderWhere ? { genero: genderWhere } : {}),
      ...(q
        ? {
            OR: [
              { nombre: { contains: q, mode: "insensitive" } },
              { descripcion: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      subcategorias: {
        active: true,
        ...(subcategoriaSlug ? { slug: subcategoriaSlug } : {}),
        categorias: {
          active: true,
          ...(categoriaSlug ? { slug: categoriaSlug } : {}),
        },
      },
    },
    include: {
      subcategorias: {
        include: {
          categorias: true,
        },
      },
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
    genero: p.genero,
    active: p.active,
    created_at: p.created_at,
    update_at: p.update_at,

    categoria: p.subcategorias?.categorias
      ? {
          id: p.subcategorias.categorias.id.toString(),
          nombre: p.subcategorias.categorias.nombre,
          slug: p.subcategorias.categorias.slug,
        }
      : null,

    subcategoria: p.subcategorias
      ? {
          id: p.subcategorias.id.toString(),
          nombre: p.subcategorias.nombre,
          slug: p.subcategorias.slug,
          audiencia: p.subcategorias.audiencia,
        }
      : null,

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
