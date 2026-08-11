export type Audience = "HOMBRE" | "MUJER" | "AMBOS"
export type ProductGender = Audience
export type MenuAudienceFilter = "all" | "MUJER" | "HOMBRE"
export type DeliveryMethod = "DELIVERY" | "PICKUP"
export type HomeSection = "FEATURED" | "NEW_ARRIVALS"

export interface PublicCategory {
  id: string
  name: string
  slug: string
}

export interface PublicSubcategory {
  id: string
  name: string
  slug: string
  audience: Audience
  category: PublicCategory
}

export type VariantPreview = {
  id: string
  name: string
  hex: string | null
  imageUrl: string | null
  imageAlt?: string | null
}

export type ProductVariantImage = {
  id: string
  url: string
  alt: string | null
  sortOrder: number
}

export type ProductVariantSize = {
  id: string
  label: string
  stock: number
}

export type ProductVariantDetail = {
  id: string
  name: string
  hex: string | null
  images: ProductVariantImage[]
  sizes: ProductVariantSize[]
}

export interface Product {
  id: number
  slug: string
  name: string
  price: number
  gender: ProductGender
  category: PublicCategory | null
  subcategory: PublicSubcategory | null
  description: string
  sizes: string[]
  colors: string[]
  images: string[]
  featured: boolean
  createdAt: string
  care: string
  shipping: string
  variantPreviews?: VariantPreview[]
  variantDetails?: ProductVariantDetail[]
}

export interface CartItem {
  variantId: string
  variantSizeId: string
  productId: number
  productSlug: string
  productName: string
  unitPrice: number
  image: string
  quantity: number
  size: string
  color: string
  maxStock: number
}

export interface AddCartItemInput {
  product: Product
  variantId: string
  variantSizeId: string
  size: string
  color: string
  quantity?: number
  image: string
  maxStock: number
}

export interface OrderData {
  customer: {
    name: string
    email: string
    phone: string
  }
  address: {
    street: string
    city: string
    province: string
    postalCode: string
  }
  paymentMethod: string
  items: CartItem[]
  total: number
}

// customer-facing order detail types
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PAYMENT_CONFIRMED'
  | 'READY'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItemDetail {
  id: string
  productName: string
  color: string
  size: string
  quantity: number
  unitPrice: number
  subtotal: number
  imageUrl: string | null
}

export interface OrderDetail {
  id: string
  status: OrderStatus
  createdAt: string
  paymentMethod: string
  deliveryMethod: string
  shippingAddress: string | null
  items: OrderItemDetail[]
  subtotal: number
  shippingCost: number
  total: number
}

export interface SessionUser {
  id: string
  email: string
  role: string
  name: string
  phone: string
  direccion: string | null
}

export interface AdminCategoryOption {
  id: string
  name: string
  slug: string
  imageUrl?: string | null
  imagePublicId?: string | null
  active?: boolean
  sortOrder?: number
}

export interface AdminSubcategoryOption {
  id: string
  name: string
  slug: string
  audience: Audience
  active?: boolean
  sortOrder?: number
  activeProductCount?: number
  activeProductGenders?: Audience[]
  category: AdminCategoryOption
}

export type CatalogMenuCategory = AdminCategoryOption & {
  subcategories: AdminSubcategoryOption[]
}

export interface AdminProductListItem {
  id: string
  name: string
  slug: string
  createdAt: string
  description: string | null
  price: number
  active: boolean
  gender: ProductGender
  category: AdminCategoryOption | null
  subcategory: AdminSubcategoryOption | null
  coverImageUrl: string | null
  totalStock: number
}

export interface AdminProductVariantImageItem {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number
}

export interface AdminProductVariantSizeItem {
  id: string
  label: string
  stock: number
}

export interface AdminProductVariantItem {
  id: string
  name: string
  hex: string | null
  active: boolean
  sortOrder: number
  images: AdminProductVariantImageItem[]
  sizes: AdminProductVariantSizeItem[]
}

export interface AdminProductDetail {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  active: boolean
  gender: ProductGender
  subcategoryId: string | null
  category: AdminCategoryOption | null
  subcategory: AdminSubcategoryOption | null
  homeSections: HomeSection[]
  variants: AdminProductVariantItem[]
}

export interface AdminHomeSectionItem {
  id: string
  section: HomeSection
  sortOrder: number
  product: {
    id: string
    name: string
    slug: string
    price: number
    active: boolean
    category: AdminCategoryOption | null
    subcategory: AdminSubcategoryOption | null
    coverImageUrl: string | null
  }
}

export interface CoverImageItem {
  id: string
  desktopUrl: string
  mobileUrl: string
  desktopPublicId: string | null
  mobilePublicId: string | null
  href: string | null
  sortOrder: number
}

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  createdAt: string
  status: OrderStatus
  total: number
  paymentMethod: string
  deliveryMethod: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export const AUDIENCE_VALUES: Audience[] = ["HOMBRE", "MUJER", "AMBOS"]

export const AUDIENCE_LABELS: Record<Audience, string> = {
  HOMBRE: "Hombre",
  MUJER: "Mujer",
  AMBOS: "Unisex/Ambos",
}

export const HOME_SECTION_VALUES: HomeSection[] = ["FEATURED", "NEW_ARRIVALS"]

export const HOME_SECTION_LABELS: Record<HomeSection, string> = {
  FEATURED: "Destacados",
  NEW_ARRIVALS: "Ultimos ingresos",
}

export const HOME_SECTION_ROUTE_SEGMENTS: Record<HomeSection, string> = {
  FEATURED: "destacados",
  NEW_ARRIVALS: "ultimos-ingresos",
}
