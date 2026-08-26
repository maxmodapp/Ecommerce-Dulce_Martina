import "server-only"

import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PUBLIC_CATALOG_TAG } from "@/lib/public-cache"
import type {
  AdminCategoryOption,
  AdminSubcategoryOption,
  Audience,
  CatalogMenuCategory,
  MenuAudienceFilter,
} from "@/lib/types"
import { AUDIENCE_VALUES } from "@/lib/types"

const ZERO = BigInt(0)

type CategoryRow = {
  id: bigint
  nombre: string
  slug: string
  image_url: string | null
  image_public_id: string | null
  active: boolean
  sort_order: number
}

type SubcategoryRow = {
  id: bigint
  nombre: string
  slug: string
  audiencia: Audience
  active: boolean
  sort_order: number
  categorias: CategoryRow
  productos?: Array<{
    genero: Audience
  }>
}

export type CategoryInput = {
  name: string
  slug: string
  active: boolean
  sortOrder: number
  imageUrl?: string | null
  imagePublicId?: string | null
}

export type SubcategoryInput = {
  name: string
  slug: string
  categoryId: string
  audience: Audience
  active: boolean
  sortOrder: number
}

export function isAudience(value: unknown): value is Audience {
  return typeof value === "string" && AUDIENCE_VALUES.includes(value as Audience)
}

export function audienceFromMenuFilter(value: string | null): Audience | null {
  const normalized = value?.toLowerCase()

  if (normalized === "mujer") return "MUJER"
  if (normalized === "hombre") return "HOMBRE"
  return null
}

export function productGenderWhere(value: string | null) {
  const audience = audienceFromMenuFilter(value)

  if (!audience) return undefined
  return { in: [audience, "AMBOS"] as Audience[] }
}

function toBigIntId(value: string | bigint) {
  return typeof value === "bigint" ? value : BigInt(value)
}

function mapCategory(category: CategoryRow): AdminCategoryOption {
  return {
    id: category.id.toString(),
    name: category.nombre,
    slug: category.slug,
    imageUrl: category.image_url,
    imagePublicId: category.image_public_id,
    active: category.active,
    sortOrder: category.sort_order,
  }
}

function mapSubcategory(subcategory: SubcategoryRow): AdminSubcategoryOption {
  return {
    id: subcategory.id.toString(),
    name: subcategory.slug === "general" ? "Otros" : subcategory.nombre,
    slug: subcategory.slug,
    audience: subcategory.audiencia,
    active: subcategory.active,
    sortOrder: subcategory.sort_order,
    activeProductCount: subcategory.productos?.length ?? 0,
    activeProductGenders: subcategory.productos?.map((product) => product.genero) ?? [],
    category: mapCategory(subcategory.categorias),
  }
}

export function subcategoryVisibleForFilter(
  subcategory: Pick<AdminSubcategoryOption, "audience">,
  filter: MenuAudienceFilter
) {
  if (filter === "all") return true
  return subcategory.audience === filter || subcategory.audience === "AMBOS"
}

export function shouldHideSingleGeneralSubcategory(subcategories: AdminSubcategoryOption[]) {
  return subcategories.length === 1 && subcategories[0]?.slug === "general"
}

export async function getAdminCategories() {
  const categories = await prisma.categorias.findMany({
    orderBy: [{ sort_order: "asc" }, { nombre: "asc" }, { id: "asc" }],
    select: {
      id: true,
      nombre: true,
      slug: true,
      image_url: true,
      image_public_id: true,
      active: true,
      sort_order: true,
    },
  })

  return categories.map((category) => mapCategory(category as CategoryRow))
}

export async function getAdminSubcategories() {
  const subcategories = await prisma.subcategorias.findMany({
    orderBy: [
      { categorias: { sort_order: "asc" } },
      { categorias: { nombre: "asc" } },
      { sort_order: "asc" },
      { nombre: "asc" },
      { id: "asc" },
    ],
    include: {
      categorias: true,
    },
  })

  return subcategories.map((subcategory) => mapSubcategory(subcategory as SubcategoryRow))
}

export async function getAdminSubcategoryOptions() {
  return getAdminSubcategories()
}

async function getCatalogMenuUncached() {
  const categories = await prisma.categorias.findMany({
    where: { active: true },
    orderBy: [{ sort_order: "asc" }, { nombre: "asc" }, { id: "asc" }],
    include: {
      subcategorias: {
        where: { active: true },
        orderBy: [{ sort_order: "asc" }, { nombre: "asc" }, { id: "asc" }],
        include: {
          productos: {
            where: { active: true },
            select: { genero: true },
          },
        },
      },
    },
  })

  return categories.map((category) => ({
    ...mapCategory(category as CategoryRow),
    subcategories: category.subcategorias.map((subcategory) =>
      mapSubcategory({
        ...subcategory,
        categorias: category,
      } as SubcategoryRow)
    ),
  }))
}

const getCachedCatalogMenu = unstable_cache(
  getCatalogMenuUncached,
  ["catalog-menu"],
  { tags: [PUBLIC_CATALOG_TAG], revalidate: 300 }
)

export async function getCatalogMenu() {
  return getCachedCatalogMenu()
}

export async function getCategoryBySlug(slug: string) {
  const category = await prisma.categorias.findUnique({
    where: { slug },
    select: {
      id: true,
      nombre: true,
      slug: true,
      image_url: true,
      image_public_id: true,
      active: true,
      sort_order: true,
    },
  })

  return category ? mapCategory(category as CategoryRow) : null
}

export async function getAdminCategoryById(id: string | bigint) {
  const category = await prisma.categorias.findUnique({
    where: { id: toBigIntId(id) },
    select: {
      id: true,
      nombre: true,
      slug: true,
      image_url: true,
      image_public_id: true,
      active: true,
      sort_order: true,
    },
  })

  return category ? mapCategory(category as CategoryRow) : null
}

export async function getSubcategoryBySlugs(categorySlug: string, subcategorySlug: string) {
  const subcategory = await prisma.subcategorias.findFirst({
    where: {
      slug: subcategorySlug,
      categorias: { slug: categorySlug },
    },
    include: {
      categorias: true,
    },
  })

  return subcategory ? mapSubcategory(subcategory as SubcategoryRow) : null
}

export async function createAdminCategory(input: CategoryInput) {
  const category = await prisma.categorias.create({
    data: {
      nombre: input.name,
      slug: input.slug,
      image_url: input.imageUrl ?? null,
      image_public_id: input.imagePublicId ?? null,
      active: input.active,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: category.id.toString() }
}

export async function updateAdminCategory(id: string | bigint, input: CategoryInput) {
  const category = await prisma.categorias.update({
    where: { id: toBigIntId(id) },
    data: {
      nombre: input.name,
      slug: input.slug,
      ...(input.imageUrl !== undefined ? { image_url: input.imageUrl } : {}),
      ...(input.imagePublicId !== undefined ? { image_public_id: input.imagePublicId } : {}),
      active: input.active,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: category.id.toString() }
}

export async function deleteAdminCategory(id: string | bigint) {
  const resolvedId = toBigIntId(id)
  if (resolvedId <= ZERO) throw new Error("INVALID_ID")

  const subcategoryCount = await prisma.subcategorias.count({
    where: { categoria_id: resolvedId },
  })

  if (subcategoryCount > 0) {
    throw new Error("CATEGORY_HAS_SUBCATEGORIES")
  }

  await prisma.categorias.delete({
    where: { id: resolvedId },
  })
}

export async function createAdminSubcategory(input: SubcategoryInput) {
  const subcategory = await prisma.subcategorias.create({
    data: {
      nombre: input.name,
      slug: input.slug,
      categoria_id: toBigIntId(input.categoryId),
      audiencia: input.audience,
      active: input.active,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: subcategory.id.toString() }
}

export async function updateAdminSubcategory(id: string | bigint, input: SubcategoryInput) {
  const subcategory = await prisma.subcategorias.update({
    where: { id: toBigIntId(id) },
    data: {
      nombre: input.name,
      slug: input.slug,
      categoria_id: toBigIntId(input.categoryId),
      audiencia: input.audience,
      active: input.active,
      sort_order: input.sortOrder,
      updated_at: new Date(),
    },
    select: { id: true },
  })

  return { id: subcategory.id.toString() }
}

export async function deleteAdminSubcategory(id: string | bigint) {
  const resolvedId = toBigIntId(id)
  if (resolvedId <= ZERO) throw new Error("INVALID_ID")

  const productCount = await prisma.productos.count({
    where: { subcategoria_id: resolvedId },
  })

  if (productCount > 0) {
    throw new Error("SUBCATEGORY_HAS_PRODUCTS")
  }

  await prisma.subcategorias.delete({
    where: { id: resolvedId },
  })
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}

export function isForeignKeyError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2003"
}
