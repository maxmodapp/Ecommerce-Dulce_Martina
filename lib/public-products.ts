import "server-only"

import { unstable_cache } from "next/cache"
import { productGenderWhere } from "@/lib/catalog"
import { prisma } from "@/lib/prisma"
import { PUBLIC_PRODUCTS_TAG } from "@/lib/public-cache"

export type PublicProductListFilters = {
  q?: string | null
  categoria?: string | null
  subcategoria?: string | null
  genero?: string | null
}

function normalizeFilterValue(value: string | null | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function normalizeFilters(filters: PublicProductListFilters) {
  return {
    q: normalizeFilterValue(filters.q),
    categoria: normalizeFilterValue(filters.categoria),
    subcategoria: normalizeFilterValue(filters.subcategoria),
    genero: normalizeFilterValue(filters.genero),
  }
}

async function findPublicProductListRows(filters: PublicProductListFilters) {
  const normalized = normalizeFilters(filters)
  const genderWhere = productGenderWhere(normalized.genero)

  return prisma.productos.findMany({
    where: {
      active: true,
      ...(genderWhere ? { genero: genderWhere } : {}),
      ...(normalized.q
        ? {
            OR: [
              { nombre: { contains: normalized.q, mode: "insensitive" } },
              { descripcion: { contains: normalized.q, mode: "insensitive" } },
            ],
          }
        : {}),
      subcategorias: {
        active: true,
        ...(normalized.subcategoria ? { slug: normalized.subcategoria } : {}),
        categorias: {
          active: true,
          ...(normalized.categoria ? { slug: normalized.categoria } : {}),
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
}

type PublicProductListRow = Awaited<ReturnType<typeof findPublicProductListRows>>[number]

function mapPublicProductListRow(product: PublicProductListRow) {
  return {
    id: product.id.toString(),
    nombre: product.nombre,
    slug: product.slug,
    descripcion: product.descripcion,
    precio: product.precio,
    genero: product.genero,
    active: product.active,
    created_at: product.created_at.toISOString(),
    update_at: product.update_at.toISOString(),

    categoria: product.subcategorias?.categorias
      ? {
          id: product.subcategorias.categorias.id.toString(),
          nombre: product.subcategorias.categorias.nombre,
          slug: product.subcategorias.categorias.slug,
        }
      : null,

    subcategoria: product.subcategorias
      ? {
          id: product.subcategorias.id.toString(),
          nombre: product.subcategorias.nombre,
          slug: product.subcategorias.slug,
          audiencia: product.subcategorias.audiencia,
        }
      : null,

    variantes: product.variantes.map((variant) => ({
      id: variant.id.toString(),
      sort_order: variant.sort_order,
      nombre_color: variant.nombre_color,
      color_hex: variant.color_hex,
      image_url: variant.variante_imagenes[0]?.url ?? null,
      image_alt: variant.variante_imagenes[0]?.alt ?? null,
    })),
  }
}

async function getPublicProductListUncached(filters: PublicProductListFilters) {
  const products = await findPublicProductListRows(filters)
  return products.map((product) => mapPublicProductListRow(product))
}

const getCachedPublicProductList = unstable_cache(
  async (categoria: string, subcategoria: string, genero: string) =>
    getPublicProductListUncached({
      categoria: categoria || null,
      subcategoria: subcategoria || null,
      genero: genero || null,
    }),
  ["public-product-list"],
  { tags: [PUBLIC_PRODUCTS_TAG], revalidate: 300 }
)

export async function getPublicProductList(filters: PublicProductListFilters = {}) {
  const normalized = normalizeFilters(filters)

  if (normalized.q) {
    return getPublicProductListUncached(normalized)
  }

  return getCachedPublicProductList(
    normalized.categoria ?? "",
    normalized.subcategoria ?? "",
    normalized.genero ?? ""
  )
}

async function findPublicProductDetailRow(slug: string) {
  return prisma.productos.findUnique({
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
}

type PublicProductDetailRow = NonNullable<Awaited<ReturnType<typeof findPublicProductDetailRow>>>

function mapPublicProductDetailRow(product: PublicProductDetailRow) {
  return {
    id: product.id.toString(),
    nombre: product.nombre,
    slug: product.slug,
    descripcion: product.descripcion,
    precio: product.precio,
    genero: product.genero,
    created_at: product.created_at.toISOString(),
    categoria: {
      id: product.subcategorias.categorias.id.toString(),
      nombre: product.subcategorias.categorias.nombre,
      slug: product.subcategorias.categorias.slug,
    },
    subcategoria: {
      id: product.subcategorias.id.toString(),
      nombre: product.subcategorias.nombre,
      slug: product.subcategorias.slug,
      audiencia: product.subcategorias.audiencia,
    },
    variantes: product.variantes.map((variant) => ({
      id: variant.id.toString(),
      nombre_color: variant.nombre_color,
      color_hex: variant.color_hex,
      imagenes: variant.variante_imagenes.map((image) => ({
        id: image.id.toString(),
        url: image.url,
        alt: image.alt,
        sort_order: image.sort_order,
      })),
      talles: variant.variante_talles.map((size) => ({
        id: size.id.toString(),
        talle: size.talle,
        stock: size.stock,
      })),
    })),
  }
}

export async function getPublicProductDetail(slug: string) {
  const normalizedSlug = slug.trim()
  if (!normalizedSlug) return null

  const product = await findPublicProductDetailRow(normalizedSlug)

  if (
    !product ||
    !product.active ||
    !product.subcategorias.active ||
    !product.subcategorias.categorias.active
  ) {
    return null
  }

  return mapPublicProductDetailRow(product)
}
