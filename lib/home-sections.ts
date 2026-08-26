import "server-only"

import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { apiListToUI } from "@/lib/adapters/product"
import { PUBLIC_HOME_TAG, PUBLIC_PRODUCTS_TAG } from "@/lib/public-cache"
import type { AdminHomeSectionItem, Audience, HomeSection, Product } from "@/lib/types"
import {
  HOME_SECTION_LABELS,
  HOME_SECTION_ROUTE_SEGMENTS,
  HOME_SECTION_VALUES,
} from "@/lib/types"

type ProductSectionProductRow = {
  id: bigint
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  active: boolean
  created_at: Date
  genero: Audience
  subcategorias: {
    id: bigint
    nombre: string
    slug: string
    audiencia: Audience
    categorias: {
      id: bigint
      nombre: string
      slug: string
    }
  } | null
  variantes: Array<{
    id: bigint
    sort_order: number
    nombre_color: string
    color_hex: string | null
    active: boolean
    variante_imagenes: Array<{
      url: string
      alt: string | null
    }>
  }>
}

type ProductSectionRow = {
  id: bigint
  section: string
  sort_order: number
  productos: ProductSectionProductRow
}

const ZERO = BigInt(0)

function toBigIntId(value: string | bigint) {
  return typeof value === "bigint" ? value : BigInt(value)
}

function mapSectionProductToUi(product: ProductSectionProductRow): Product {
  return apiListToUI({
    id: product.id.toString(),
    nombre: product.nombre,
    slug: product.slug,
    descripcion: product.descripcion,
    precio: product.precio,
    active: product.active,
    created_at: product.created_at,
    genero: product.genero,
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
  })
}

function mapAdminSectionItem(item: ProductSectionRow): AdminHomeSectionItem {
  const coverImageUrl =
    item.productos.variantes.find((variant) => variant.variante_imagenes[0]?.url)?.variante_imagenes[0]
      ?.url ?? null

  return {
    id: item.id.toString(),
    section: item.section as HomeSection,
    sortOrder: item.sort_order,
    product: {
      id: item.productos.id.toString(),
      name: item.productos.nombre,
      slug: item.productos.slug,
      price: item.productos.precio,
      active: item.productos.active,
      category: item.productos.subcategorias?.categorias
        ? {
            id: item.productos.subcategorias.categorias.id.toString(),
            name: item.productos.subcategorias.categorias.nombre,
            slug: item.productos.subcategorias.categorias.slug,
          }
        : null,
      subcategory: item.productos.subcategorias
        ? {
            id: item.productos.subcategorias.id.toString(),
            name: item.productos.subcategorias.nombre,
            slug: item.productos.subcategorias.slug,
            audience: item.productos.subcategorias.audiencia,
            category: {
              id: item.productos.subcategorias.categorias.id.toString(),
              name: item.productos.subcategorias.categorias.nombre,
              slug: item.productos.subcategorias.categorias.slug,
            },
          }
        : null,
      coverImageUrl,
    },
  }
}

function sectionQuery(section: HomeSection, onlyActiveProducts: boolean) {
  return {
    where: {
      section,
      ...(onlyActiveProducts ? { productos: { active: true } } : {}),
    },
    orderBy: [{ sort_order: "asc" as const }, { id: "asc" as const }],
    include: {
      productos: {
        include: {
          subcategorias: {
            include: {
              categorias: true,
            },
          },
          variantes: {
            where: onlyActiveProducts ? { active: true } : undefined,
            orderBy: [{ sort_order: "asc" as const }, { id: "asc" as const }],
            include: {
              variante_imagenes: {
                orderBy: [{ sort_order: "asc" as const }, { id: "asc" as const }],
                take: 1,
                select: {
                  url: true,
                  alt: true,
                },
              },
            },
          },
        },
      },
    },
  }
}

async function normalizeHomeSectionOrderInTransaction(
  tx: Prisma.TransactionClient,
  section: HomeSection
) {
  const items = await tx.home_product_sections.findMany({
    where: { section },
    orderBy: [{ sort_order: "asc" }, { id: "asc" }],
    select: { id: true },
  })

  await Promise.all(
    items.map((item, index) =>
      tx.home_product_sections.update({
        where: { id: item.id },
        data: {
          sort_order: index,
          updated_at: new Date(),
        },
      })
    )
  )
}

export function isHomeSection(value: unknown): value is HomeSection {
  return typeof value === "string" && HOME_SECTION_VALUES.includes(value as HomeSection)
}

export function getHomeSectionFromRouteSegment(segment: string): HomeSection | null {
  const resolvedEntry = Object.entries(HOME_SECTION_ROUTE_SEGMENTS).find(
    ([, routeSegment]) => routeSegment === segment
  )

  if (!resolvedEntry) return null
  return resolvedEntry[0] as HomeSection
}

export function getHomeSectionRouteSegment(section: HomeSection) {
  return HOME_SECTION_ROUTE_SEGMENTS[section]
}

export function getHomeSectionLabel(section: HomeSection) {
  return HOME_SECTION_LABELS[section]
}

async function getHomeSectionProductsUncached(section: HomeSection) {
  const items = await prisma.home_product_sections.findMany(sectionQuery(section, true))
  return items.map((item) => mapSectionProductToUi(item.productos as ProductSectionProductRow))
}

const getCachedHomeSectionProducts = unstable_cache(
  getHomeSectionProductsUncached,
  ["home-section-products"],
  { tags: [PUBLIC_HOME_TAG, PUBLIC_PRODUCTS_TAG], revalidate: 300 }
)

export async function getHomeSectionProducts(section: HomeSection) {
  return getCachedHomeSectionProducts(section)
}

export async function getHomepageSectionsData() {
  const [featured, newArrivals] = await Promise.all([
    getHomeSectionProducts("FEATURED"),
    getHomeSectionProducts("NEW_ARRIVALS"),
  ])

  return {
    featured,
    newArrivals,
  }
}

export async function getAdminHomeSectionItems(section: HomeSection) {
  const items = await prisma.home_product_sections.findMany(sectionQuery(section, false))
  return items.map((item) => mapAdminSectionItem(item as ProductSectionRow))
}

export async function syncProductHomeSections(
  productId: string | bigint,
  nextSections: HomeSection[]
) {
  const resolvedProductId = toBigIntId(productId)

  await prisma.$transaction(async (tx) => {
    const existingItems = await tx.home_product_sections.findMany({
      where: { product_id: resolvedProductId },
      select: { id: true, section: true },
    })

    const existingSections = new Set(existingItems.map((item) => item.section as HomeSection))
    const nextSectionSet = new Set(nextSections)
    const removedSections = new Set<HomeSection>()

    for (const item of existingItems) {
      const section = item.section as HomeSection

      if (!nextSectionSet.has(section)) {
        await tx.home_product_sections.delete({
          where: { id: item.id },
        })
        removedSections.add(section)
      }
    }

    for (const section of nextSections) {
      if (existingSections.has(section)) continue

      const maxSortOrder = await tx.home_product_sections.aggregate({
        where: { section },
        _max: { sort_order: true },
      })

      await tx.home_product_sections.create({
        data: {
          product_id: resolvedProductId,
          section,
          sort_order: (maxSortOrder._max.sort_order ?? -1) + 1,
        },
      })
    }

    for (const removedSection of removedSections) {
      await normalizeHomeSectionOrderInTransaction(tx, removedSection)
    }
  })
}

export async function moveHomeSectionItem(
  section: HomeSection,
  itemId: string | bigint,
  direction: "up" | "down"
) {
  const resolvedItemId = toBigIntId(itemId)

  await prisma.$transaction(async (tx) => {
    const items = await tx.home_product_sections.findMany({
      where: { section },
      orderBy: [{ sort_order: "asc" }, { id: "asc" }],
      select: { id: true },
    })

    const currentIndex = items.findIndex((item) => item.id === resolvedItemId)

    if (currentIndex < 0) {
      throw new Error("ITEM_NOT_FOUND")
    }

    const nextIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1

    if (nextIndex < 0 || nextIndex >= items.length) {
      return
    }

    const reorderedItems = items.slice()
    const [currentItem] = reorderedItems.splice(currentIndex, 1)
    reorderedItems.splice(nextIndex, 0, currentItem)

    await Promise.all(
      reorderedItems.map((item, index) =>
        tx.home_product_sections.update({
          where: { id: item.id },
          data: {
            sort_order: index,
            updated_at: new Date(),
          },
        })
      )
    )
  })
}

export async function removeHomeSectionItem(section: HomeSection, itemId: string | bigint) {
  const resolvedItemId = toBigIntId(itemId)

  await prisma.$transaction(async (tx) => {
    const item = await tx.home_product_sections.findUnique({
      where: { id: resolvedItemId },
      select: { id: true, section: true },
    })

    if (!item || item.id <= ZERO || item.section !== section) {
      throw new Error("ITEM_NOT_FOUND")
    }

    await tx.home_product_sections.delete({
      where: { id: resolvedItemId },
    })

    await normalizeHomeSectionOrderInTransaction(tx, section)
  })
}
