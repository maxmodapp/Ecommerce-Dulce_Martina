import "server-only"

import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type {
  AdminCategoryOption,
  AdminProductDetail,
  AdminProductListItem,
  AdminProductVariantItem,
  HomeSection,
} from "@/lib/types"

type CategoryRow = {
  id: bigint
  nombre: string
  slug: string
}

type ProductListRow = {
  id: bigint
  nombre: string
  slug: string
  created_at: Date
  descripcion: string | null
  precio: number
  active: boolean
  categorias: CategoryRow | null
  variantes: Array<{
    variante_imagenes: Array<{
      url: string
    }>
    variante_talles: Array<{
      stock: number
    }>
  }>
}

type ProductDetailRow = {
  id: bigint
  nombre: string
  slug: string
  descripcion: string | null
  precio: number
  active: boolean
  categoria_id: bigint | null
  categorias: CategoryRow | null
  home_product_sections: Array<{
    section: string
  }>
  variantes: Array<{
    id: bigint
    nombre_color: string
    color_hex: string | null
    active: boolean
    sort_order: number
    variante_imagenes: Array<{
      id: bigint
      url: string
      public_id: string | null
      alt: string | null
      sort_order: number
    }>
    variante_talles: Array<{
      id: bigint
      talle: string
      stock: number
    }>
  }>
}

export type ProductBaseInput = {
  name: string
  slug: string
  description: string | null
  categoryId: string | null
  price: number
  active: boolean
}

export type ProductVariantInput = {
  name: string
  hex: string | null
  active: boolean
  sortOrder: number
}

export type ProductVariantImageInput = {
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number
}

export type ProductVariantSizeInput = {
  label: string
  stock: number
}

function toBigIntId(value: string | bigint | null | undefined) {
  if (value == null) return null
  return typeof value === "bigint" ? value : BigInt(value)
}

function mapCategory(category: CategoryRow | null): AdminCategoryOption | null {
  if (!category) return null

  return {
    id: category.id.toString(),
    name: category.nombre,
    slug: category.slug,
  }
}

function mapVariant(variant: ProductDetailRow["variantes"][number]): AdminProductVariantItem {
  return {
    id: variant.id.toString(),
    name: variant.nombre_color,
    hex: variant.color_hex,
    active: variant.active,
    sortOrder: variant.sort_order,
    images: variant.variante_imagenes.map((image) => ({
      id: image.id.toString(),
      url: image.url,
      publicId: image.public_id,
      alt: image.alt,
      sortOrder: image.sort_order,
    })),
    sizes: variant.variante_talles.map((size) => ({
      id: size.id.toString(),
      label: size.talle,
      stock: size.stock,
    })),
  }
}

function mapProductListItem(product: ProductListRow): AdminProductListItem {
  const coverImageUrl = product.variantes.find((variant) => variant.variante_imagenes[0]?.url)
    ?.variante_imagenes[0]?.url ?? null

  const totalStock = product.variantes.reduce(
    (sum, variant) => sum + variant.variante_talles.reduce((acc, size) => acc + size.stock, 0),
    0
  )

  return {
    id: product.id.toString(),
    name: product.nombre,
    slug: product.slug,
    createdAt: product.created_at.toISOString(),
    description: product.descripcion,
    price: product.precio,
    active: product.active,
    category: mapCategory(product.categorias),
    coverImageUrl,
    totalStock,
  }
}

function mapProductDetail(product: ProductDetailRow): AdminProductDetail {
  return {
    id: product.id.toString(),
    name: product.nombre,
    slug: product.slug,
    description: product.descripcion,
    price: product.precio,
    active: product.active,
    categoryId: product.categoria_id?.toString() ?? null,
    category: mapCategory(product.categorias),
    homeSections: product.home_product_sections.map((item) => item.section as HomeSection),
    variants: product.variantes.map(mapVariant),
  }
}

export async function getAdminCategories() {
  const categories = await prisma.categorias.findMany({
    orderBy: { nombre: "asc" },
    select: {
      id: true,
      nombre: true,
      slug: true,
    },
  })

  return categories.map((category) => ({
    id: category.id.toString(),
    name: category.nombre,
    slug: category.slug,
  }))
}

export async function getAdminProducts() {
  const products = await prisma.productos.findMany({
    orderBy: { created_at: "desc" },
    include: {
      categorias: true,
      variantes: {
        include: {
          variante_imagenes: {
            orderBy: { sort_order: "asc" },
            take: 1,
            select: { url: true },
          },
          variante_talles: {
            select: { stock: true },
          },
        },
      },
    },
  })

  return products.map(mapProductListItem)
}

export async function getAdminProductById(id: string | bigint) {
  const product = await prisma.productos.findUnique({
    where: { id: toBigIntId(id)! },
    include: {
      categorias: true,
      home_product_sections: {
        orderBy: [{ section: "asc" }],
        select: { section: true },
      },
      variantes: {
        orderBy: [{ sort_order: "asc" }, { id: "asc" }],
        include: {
          variante_imagenes: {
            orderBy: [{ sort_order: "asc" }, { id: "asc" }],
          },
          variante_talles: {
            orderBy: [{ talle: "asc" }, { id: "asc" }],
          },
        },
      },
    },
  })

  if (!product) return null
  return mapProductDetail(product as ProductDetailRow)
}

export async function adminProductExists(id: string | bigint) {
  const product = await prisma.productos.findUnique({
    where: { id: toBigIntId(id)! },
    select: { id: true },
  })

  return !!product
}

export async function createAdminProduct(input: ProductBaseInput) {
  const product = await prisma.productos.create({
    data: {
      nombre: input.name,
      slug: input.slug,
      descripcion: input.description,
      categoria_id: toBigIntId(input.categoryId),
      precio: input.price,
      active: input.active,
    },
    select: {
      id: true,
    },
  })

  return {
    id: product.id.toString(),
  }
}

export async function updateAdminProduct(id: string | bigint, input: ProductBaseInput) {
  const product = await prisma.productos.update({
    where: { id: toBigIntId(id)! },
    data: {
      nombre: input.name,
      slug: input.slug,
      descripcion: input.description,
      categoria_id: toBigIntId(input.categoryId),
      precio: input.price,
      active: input.active,
      update_at: new Date(),
    },
    select: {
      id: true,
    },
  })

  return {
    id: product.id.toString(),
  }
}

export async function setAdminProductActive(id: string | bigint, active: boolean) {
  const product = await prisma.productos.update({
    where: { id: toBigIntId(id)! },
    data: {
      active,
      update_at: new Date(),
    },
    select: {
      id: true,
      active: true,
    },
  })

  return {
    id: product.id.toString(),
    active: product.active,
  }
}

export async function createAdminVariant(productId: string | bigint, input: ProductVariantInput) {
  const variant = await prisma.variantes.create({
    data: {
      product_id: toBigIntId(productId)!,
      nombre_color: input.name,
      color_hex: input.hex,
      active: input.active,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: variant.id.toString() }
}

export async function updateAdminVariant(
  variantId: string | bigint,
  input: ProductVariantInput
) {
  const variant = await prisma.variantes.update({
    where: { id: toBigIntId(variantId)! },
    data: {
      nombre_color: input.name,
      color_hex: input.hex,
      active: input.active,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: variant.id.toString() }
}

export async function deleteAdminVariant(variantId: string | bigint) {
  await prisma.variantes.delete({
    where: { id: toBigIntId(variantId)! },
  })
}

export async function adminVariantBelongsToProduct(
  productId: string | bigint,
  variantId: string | bigint
) {
  const variant = await prisma.variantes.findUnique({
    where: { id: toBigIntId(variantId)! },
    select: { product_id: true },
  })

  if (!variant) return false
  return variant.product_id === toBigIntId(productId)
}

export async function createAdminVariantImage(
  variantId: string | bigint,
  input: ProductVariantImageInput
) {
  const image = await prisma.variante_imagenes.create({
    data: {
      variant_id: toBigIntId(variantId)!,
      url: input.url,
      public_id: input.publicId,
      alt: input.alt,
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: image.id.toString() }
}

export async function updateAdminVariantImage(
  imageId: string | bigint,
  input: { sortOrder: number }
) {
  const image = await prisma.variante_imagenes.update({
    where: { id: toBigIntId(imageId)! },
    data: {
      sort_order: input.sortOrder,
    },
    select: { id: true },
  })

  return { id: image.id.toString() }
}

export async function deleteAdminVariantImage(imageId: string | bigint) {
  await prisma.variante_imagenes.delete({
    where: { id: toBigIntId(imageId)! },
  })
}

export async function adminImageBelongsToVariant(
  variantId: string | bigint,
  imageId: string | bigint
) {
  const image = await prisma.variante_imagenes.findUnique({
    where: { id: toBigIntId(imageId)! },
    select: { variant_id: true },
  })

  if (!image) return false
  return image.variant_id === toBigIntId(variantId)
}

export async function getAdminProductName(id: string | bigint) {
  const product = await prisma.productos.findUnique({
    where: { id: toBigIntId(id)! },
    select: { nombre: true },
  })

  return product?.nombre ?? null
}

export async function getAdminVariantImageById(imageId: string | bigint) {
  const image = await prisma.variante_imagenes.findUnique({
    where: { id: toBigIntId(imageId)! },
    select: {
      id: true,
      url: true,
      public_id: true,
      alt: true,
      sort_order: true,
    },
  })

  if (!image) return null

  return {
    id: image.id.toString(),
    url: image.url,
    publicId: image.public_id,
    alt: image.alt,
    sortOrder: image.sort_order,
  }
}

export async function createAdminVariantSize(
  variantId: string | bigint,
  input: ProductVariantSizeInput
) {
  const size = await prisma.variante_talles.create({
    data: {
      variant_id: toBigIntId(variantId)!,
      talle: input.label,
      stock: input.stock,
    },
    select: { id: true },
  })

  return { id: size.id.toString() }
}

export async function updateAdminVariantSize(
  sizeId: string | bigint,
  input: ProductVariantSizeInput
) {
  const size = await prisma.variante_talles.update({
    where: { id: toBigIntId(sizeId)! },
    data: {
      talle: input.label,
      stock: input.stock,
    },
    select: { id: true },
  })

  return { id: size.id.toString() }
}

export async function deleteAdminVariantSize(sizeId: string | bigint) {
  await prisma.variante_talles.delete({
    where: { id: toBigIntId(sizeId)! },
  })
}

export async function adminSizeBelongsToVariant(
  variantId: string | bigint,
  sizeId: string | bigint
) {
  const size = await prisma.variante_talles.findUnique({
    where: { id: toBigIntId(sizeId)! },
    select: { variant_id: true },
  })

  if (!size) return false
  return size.variant_id === toBigIntId(variantId)
}

export function isUniqueConstraintError(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002"
}
