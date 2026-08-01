import type {
  Audience,
  Product,
  ProductVariantDetail,
  PublicCategory,
  PublicSubcategory,
  VariantPreview,
} from "@/lib/types"

const FALLBACK_IMG = "/placeholder.jpg"
const DEFAULT_CARE = "Lavar a mano o en ciclo delicado. No usar blanqueador."
const DEFAULT_SHIPPING = "Envios a todo el pais. Cambios dentro de los 10 dias."

function safeAudience(value: unknown): Audience {
  return value === "HOMBRE" || value === "MUJER" || value === "AMBOS" ? value : "AMBOS"
}

function mapCategory(raw: any): PublicCategory | null {
  if (!raw) return null

  return {
    id: String(raw.id),
    name: String(raw.nombre ?? raw.name ?? ""),
    slug: String(raw.slug ?? ""),
  }
}

function mapSubcategory(raw: any, category: PublicCategory | null): PublicSubcategory | null {
  if (!raw || !category) return null

  return {
    id: String(raw.id),
    name: String(raw.nombre ?? raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    audience: safeAudience(raw.audiencia ?? raw.audience),
    category,
  }
}

export function apiListToUI(p: any): Product {
  const category = mapCategory(p?.categoria)
  const subcategory = mapSubcategory(p?.subcategoria, category)

  const variantPreviews: VariantPreview[] = (p?.variantes ?? []).map((v: any) => ({
    id: String(v.id),
    name: String(v.nombre_color ?? ""),
    hex: v.color_hex ?? null,
    imageUrl: v.image_url ?? null,
    imageAlt: v.image_alt ?? null,
  }))

  const cover = variantPreviews.find((x) => !!x.imageUrl)?.imageUrl || FALLBACK_IMG

  return {
    id: Number(p.id),
    slug: p.slug,
    name: p.nombre,
    price: Number(p.precio),
    gender: safeAudience(p?.genero),
    category,
    subcategory,
    description: p.descripcion ?? "",
    sizes: ["S", "M", "L", "XL"],
    colors: variantPreviews.map((x) => x.name),
    images: [cover],
    featured: false,
    createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    care: DEFAULT_CARE,
    shipping: DEFAULT_SHIPPING,
    variantPreviews,
  }
}

export function apiDetailToUI(p: any): Product {
  const category = mapCategory(p?.categoria)
  const subcategory = mapSubcategory(p?.subcategoria, category)

  const variantDetails: ProductVariantDetail[] = (p?.variantes ?? []).map((v: any) => ({
    id: String(v.id),
    name: String(v.nombre_color ?? ""),
    hex: v.color_hex ?? null,
    images:
      (v?.imagenes ?? []).map((img: any) => ({
        id: String(img.id),
        url: img.url ?? FALLBACK_IMG,
        alt: img.alt ?? null,
        sortOrder: Number(img.sort_order ?? 0),
      })) || [],
    sizes:
      (v?.talles ?? []).map((t: any) => ({
        id: String(t.id),
        label: String(t.talle ?? ""),
        stock: Number(t.stock ?? 0),
      })) || [],
  }))

  const firstVariant = variantDetails[0]
  const allSizes = Array.from(
    new Set(variantDetails.flatMap((variant) => variant.sizes.map((size) => size.label)))
  )
  const allColors = variantDetails.map((variant) => variant.name)
  const images = firstVariant?.images.map((img) => img.url) ?? [FALLBACK_IMG]

  return {
    id: Number(p.id),
    slug: p.slug,
    name: p.nombre,
    price: Number(p.precio),
    gender: safeAudience(p?.genero),
    category,
    subcategory,
    description: p.descripcion ?? "",
    sizes: allSizes,
    colors: allColors,
    images,
    featured: false,
    createdAt: p.created_at ? new Date(p.created_at).toISOString() : new Date().toISOString(),
    care: DEFAULT_CARE,
    shipping: DEFAULT_SHIPPING,
    variantDetails,
    variantPreviews: variantDetails.map((variant) => ({
      id: variant.id,
      name: variant.name,
      hex: variant.hex,
      imageUrl: variant.images[0]?.url ?? null,
      imageAlt: variant.images[0]?.alt ?? null,
    })),
  }
}
