import type { Product } from "./types"

const fallbackCategories = {
  remeras: { id: "remeras", name: "Remeras", slug: "remeras" },
  pantalones: { id: "pantalones", name: "Pantalones", slug: "pantalones" },
  "ropa-interior": { id: "ropa-interior", name: "Ropa Interior", slug: "ropa-interior" },
}

const fallbackSubcategories = {
  remeras: {
    id: "remeras-general",
    name: "General",
    slug: "general",
    audience: "AMBOS" as const,
    category: fallbackCategories.remeras,
  },
  pantalones: {
    id: "pantalones-general",
    name: "General",
    slug: "general",
    audience: "AMBOS" as const,
    category: fallbackCategories.pantalones,
  },
  "ropa-interior": {
    id: "ropa-interior-general",
    name: "General",
    slug: "general",
    audience: "AMBOS" as const,
    category: fallbackCategories["ropa-interior"],
  },
}

export const products: Product[] = [
  // REMERAS
  {
    id: 1,
    slug: "remera-basica-blanca",
    name: "Remera Basica Blanca",
    price: 12500,
    gender: "AMBOS",
    category: fallbackCategories.remeras,
    subcategory: fallbackSubcategories.remeras,
    description:
      "Remera basica de algodon premium en color blanco. Corte clasico, ideal para combinar con todo. Tela suave al tacto con excelente caida.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Blanco", "Negro", "Gris"],
    images: ["/images/products/remera-basica-blanca.jpg"],
    featured: true,
    createdAt: "2025-12-01",
    care: "Lavar a mano o en ciclo delicado. No usar secadora. Planchar a temperatura baja.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 2,
    slug: "remera-oversize-rosa",
    name: "Remera Oversize Rosa",
    price: 15800,
    gender: "AMBOS",
    category: fallbackCategories.remeras,
    subcategory: fallbackSubcategories.remeras,
    description:
      "Remera oversize en tono rosa empolvado. Corte relajado y moderno, perfecta para un look casual y femenino.",
    sizes: ["S", "M", "L"],
    colors: ["Rosa", "Lila", "Blanco"],
    images: ["/images/products/remera-oversize-rosa.jpg"],
    featured: true,
    createdAt: "2025-12-05",
    care: "Lavar a mano o en ciclo delicado. No usar secadora. Planchar a temperatura baja.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 3,
    slug: "remera-crop-negra",
    name: "Remera Crop Negra",
    price: 13200,
    gender: "AMBOS",
    category: fallbackCategories.remeras,
    subcategory: fallbackSubcategories.remeras,
    description:
      "Crop top en negro con corte moderno. Ideal para combinar con pantalones de tiro alto. Tela elastizada y comoda.",
    sizes: ["S", "M", "L"],
    colors: ["Negro", "Blanco"],
    images: ["/images/products/remera-crop-negra.jpg"],
    featured: false,
    createdAt: "2025-12-10",
    care: "Lavar a mano o en ciclo delicado. No usar secadora. Planchar a temperatura baja.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 4,
    slug: "remera-tirantes-beige",
    name: "Musculosa Tirantes Beige",
    price: 11000,
    gender: "AMBOS",
    category: fallbackCategories.remeras,
    subcategory: fallbackSubcategories.remeras,
    description:
      "Musculosa de tirantes finos en color beige. Tela liviana y fluida, perfecta para los dias de calor o para usar debajo de un blazer.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Negro", "Blanco"],
    images: ["/images/products/remera-tirantes-beige.jpg"],
    featured: false,
    createdAt: "2025-12-12",
    care: "Lavar a mano o en ciclo delicado. No usar secadora. Planchar a temperatura baja.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },

  // PANTALONES
  {
    id: 5,
    slug: "pantalon-palazzo-negro",
    name: "Pantalon Palazzo Negro",
    price: 25900,
    gender: "AMBOS",
    category: fallbackCategories.pantalones,
    subcategory: fallbackSubcategories.pantalones,
    description:
      "Pantalon palazzo de pierna ancha en negro. Cintura alta con elastico, tela fluida y elegante. Ideal para ocasiones especiales o el dia a dia.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Negro", "Beige"],
    images: ["/images/products/pantalon-palazzo-negro.jpg"],
    featured: true,
    createdAt: "2025-12-02",
    care: "Lavar en ciclo delicado. Se puede usar secadora a baja temperatura. Planchar al reves.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 6,
    slug: "pantalon-jogger-rosa",
    name: "Pantalon Jogger Rosa",
    price: 19500,
    gender: "AMBOS",
    category: fallbackCategories.pantalones,
    subcategory: fallbackSubcategories.pantalones,
    description:
      "Jogger en rosa con punos elasticos. Comodidad y estilo en una sola prenda. Perfecto para un look sporty chic.",
    sizes: ["S", "M", "L"],
    colors: ["Rosa", "Gris", "Negro"],
    images: ["/images/products/pantalon-jogger-rosa.jpg"],
    featured: true,
    createdAt: "2025-12-08",
    care: "Lavar en ciclo delicado. Se puede usar secadora a baja temperatura.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 7,
    slug: "pantalon-recto-beige",
    name: "Pantalon Recto Beige",
    price: 22800,
    gender: "AMBOS",
    category: fallbackCategories.pantalones,
    subcategory: fallbackSubcategories.pantalones,
    description:
      "Pantalon de corte recto en beige. Cintura alta, tela con caida elegante. Un basico que no puede faltar en tu guardarropa.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Beige", "Negro", "Blanco"],
    images: ["/images/products/pantalon-recto-beige.jpg"],
    featured: false,
    createdAt: "2025-12-14",
    care: "Lavar en ciclo delicado. Planchar al reves a temperatura media.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },
  {
    id: 8,
    slug: "pantalon-cargo-verde",
    name: "Pantalon Cargo Verde",
    price: 24500,
    gender: "AMBOS",
    category: fallbackCategories.pantalones,
    subcategory: fallbackSubcategories.pantalones,
    description:
      "Pantalon cargo en verde oliva con bolsillos laterales. Look trendy y urbano con un toque femenino. Tela resistente y comoda.",
    sizes: ["S", "M", "L"],
    colors: ["Verde Oliva", "Negro", "Beige"],
    images: ["/images/products/pantalon-cargo-verde.jpg"],
    featured: false,
    createdAt: "2025-12-16",
    care: "Lavar en ciclo normal. Se puede usar secadora. Planchar a temperatura media.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias.",
  },

  // ROPA INTERIOR
  {
    id: 9,
    slug: "conjunto-encaje-negro",
    name: "Conjunto Encaje Negro",
    price: 18900,
    gender: "AMBOS",
    category: fallbackCategories["ropa-interior"],
    subcategory: fallbackSubcategories["ropa-interior"],
    description:
      "Conjunto de lenceria en encaje negro. Corpiño con arco y bombacha colaless a tono. Elegancia y sensualidad en cada detalle.",
    sizes: ["S", "M", "L"],
    colors: ["Negro", "Rojo"],
    images: ["/images/products/conjunto-encaje-negro.jpg"],
    featured: true,
    createdAt: "2025-12-03",
    care: "Lavar a mano con agua fria. No usar secadora. No planchar. Secar a la sombra.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias (con etiqueta).",
  },
  {
    id: 10,
    slug: "bralette-rosa",
    name: "Bralette Rosa",
    price: 9800,
    gender: "AMBOS",
    category: fallbackCategories["ropa-interior"],
    subcategory: fallbackSubcategories["ropa-interior"],
    description:
      "Bralette sin arco en rosa con terminaciones de encaje. Ultra comodo y femenino. Ideal para el dia a dia o para lucir debajo de prendas escotadas.",
    sizes: ["S", "M", "L"],
    colors: ["Rosa", "Negro", "Blanco"],
    images: ["/images/products/bralette-rosa.jpg"],
    featured: true,
    createdAt: "2025-12-06",
    care: "Lavar a mano con agua fria. No usar secadora. No planchar. Secar a la sombra.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias (con etiqueta).",
  },
  {
    id: 11,
    slug: "body-encaje-blanco",
    name: "Body Encaje Blanco",
    price: 21500,
    gender: "AMBOS",
    category: fallbackCategories["ropa-interior"],
    subcategory: fallbackSubcategories["ropa-interior"],
    description:
      "Body de encaje blanco con transparencias. Escote en V y espalda descubierta. Una pieza versatil para usar como prenda interior o exterior.",
    sizes: ["S", "M", "L"],
    colors: ["Blanco", "Negro"],
    images: ["/images/products/body-encaje-blanco.jpg"],
    featured: false,
    createdAt: "2025-12-11",
    care: "Lavar a mano con agua fria. No usar secadora. No planchar. Secar a la sombra.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias (con etiqueta).",
  },
  {
    id: 12,
    slug: "conjunto-saten-burdeos",
    name: "Conjunto Saten Burdeos",
    price: 23400,
    gender: "AMBOS",
    category: fallbackCategories["ropa-interior"],
    subcategory: fallbackSubcategories["ropa-interior"],
    description:
      "Conjunto de saten en color burdeos. Corpiño triangular y bombacha culotte. Tela sedosa con brillo sutil, perfecta para sentirte especial.",
    sizes: ["S", "M", "L", "XL"],
    colors: ["Burdeos", "Negro", "Nude"],
    images: ["/images/products/conjunto-saten-burdeos.jpg"],
    featured: false,
    createdAt: "2025-12-15",
    care: "Lavar a mano con agua fria. No usar secadora. No planchar el saten directamente.",
    shipping:
      "Envio gratis a todo el pais en compras mayores a $30.000. Cambios dentro de los 15 dias (con etiqueta).",
  },
]

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category?.slug === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
  }).format(price)
}
