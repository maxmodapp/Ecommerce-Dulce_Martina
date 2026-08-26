"use client"

import { useEffect, useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { ShoppingBag, Minus, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useCart } from "@/lib/cart-context"
import { useCartDrawer } from "@/lib/cart-drawer-context"
import type { Product } from "@/lib/types"
import { formatPrice } from "@/lib/data"

interface ProductDetailProps {
  product: Product
}

export function ProductDetail({ product }: ProductDetailProps) {
  const variantDetails = product.variantDetails ?? []

  const [selectedColor, setSelectedColor] = useState(
    variantDetails[0]?.name ?? product.colors[0] ?? ""
  )
  const [selectedSize, setSelectedSize] = useState("")
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  const { addItem, getRemainingStock, syncItemStock } = useCart()
  const { open: openCart } = useCartDrawer()

  const selectedVariant = useMemo(
    () => variantDetails.find((variant) => variant.name === selectedColor) ?? null,
    [variantDetails, selectedColor]
  )

  const variantImages = useMemo(() => {
    if (selectedVariant && selectedVariant.images.length > 0) {
      return selectedVariant.images
    }

    return product.images.map((url, index) => ({
      id: `${product.id}-fallback-${index}`,
      url,
      alt: product.name,
      sortOrder: index,
    }))
  }, [product.id, product.images, product.name, selectedVariant])

  const availableSizesForColor = selectedVariant?.sizes ?? []
  const selectedSizeData = availableSizesForColor.find((size) => size.label === selectedSize) ?? null
  const availableStock = selectedSizeData
    ? getRemainingStock(selectedSizeData.id, selectedSizeData.stock)
    : 0

  useEffect(() => {
    setSelectedImage(0)
  }, [selectedColor])

  useEffect(() => {
    if (!selectedSizeData) return
    syncItemStock(selectedSizeData.id, selectedSizeData.stock)
  }, [selectedSizeData, syncItemStock])

  useEffect(() => {
    if (availableSizesForColor.length === 0) {
      setSelectedSize("")
      setQuantity(1)
      return
    }

    const stillExists = availableSizesForColor.some((size) => size.label === selectedSize)
    const selectedStillHasStock = availableSizesForColor.some(
      (size) => size.label === selectedSize && getRemainingStock(size.id, size.stock) > 0
    )

    if (stillExists && selectedStillHasStock) {
      return
    }

    const firstWithStock = availableSizesForColor.find(
      (size) => getRemainingStock(size.id, size.stock) > 0
    )
    const firstAny = availableSizesForColor[0]
    setSelectedSize(firstWithStock?.label ?? firstAny?.label ?? "")
    setQuantity(1)
  }, [availableSizesForColor, getRemainingStock, selectedSize])

  useEffect(() => {
    if (availableStock <= 0) {
      setQuantity(1)
      return
    }

    if (quantity > availableStock) {
      setQuantity(availableStock)
    }
  }, [availableStock, quantity])

  const canAddToCart = !!selectedVariant && !!selectedSizeData && availableStock > 0

  const handleAddToCart = () => {
    if (!canAddToCart || !selectedVariant || !selectedSizeData) return

    addItem({
      product,
      variantId: selectedVariant.id,
      variantSizeId: selectedSizeData.id,
      size: selectedSizeData.label,
      color: selectedVariant.name,
      quantity,
      image: variantImages[selectedImage]?.url ?? variantImages[0]?.url ?? product.images[0],
      maxStock: selectedSizeData.stock,
    })

    openCart()
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" prefetch={false} className="transition-colors hover:text-foreground">
          Inicio
        </Link>
        <span>/</span>
        <Link href="/productos" prefetch={false} className="transition-colors hover:text-foreground">
          Productos
        </Link>
        <span>/</span>
        {product.category ? (
          <Link
            href={`/productos/${product.category.slug}`}
            prefetch={false}
            className="transition-colors hover:text-foreground"
          >
            {product.category.name}
          </Link>
        ) : (
          <span>Categoria</span>
        )}
        {product.subcategory && product.subcategory.slug !== "general" ? (
          <>
            <span>/</span>
            <Link
              href={`/productos/${product.category?.slug}/${product.subcategory.slug}`}
              prefetch={false}
              className="transition-colors hover:text-foreground"
            >
              {product.subcategory.name}
            </Link>
          </>
        ) : null}
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-secondary">
            <Image
              src={variantImages[selectedImage]?.url ?? product.images[0]}
              alt={variantImages[selectedImage]?.alt ?? product.name}
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          {variantImages.length > 1 && (
            <div className="flex flex-wrap gap-3">
              {variantImages.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(i)}
                  className={`relative size-20 overflow-hidden rounded-lg border-2 transition-all ${
                    selectedImage === i
                      ? "border-primary"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.alt ?? `${product.name} - imagen ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {product.subcategory && product.subcategory.slug !== "general"
                ? product.subcategory.name
                : product.category?.name ?? "Producto"}
            </span>
            <h1 className="mt-1 font-serif text-3xl font-bold text-foreground md:text-4xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-bold text-foreground">{formatPrice(product.price)}</p>
          </div>

          <p className="leading-relaxed text-muted-foreground">{product.description}</p>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Color</label>
            <div className="flex flex-wrap gap-2">
              {variantDetails.map((variant) => (
                <button
                  key={variant.id}
                  onClick={() => setSelectedColor(variant.name)}
                  className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <Badge
                    variant={selectedColor === variant.name ? "default" : "outline"}
                    className={
                      selectedColor === variant.name
                        ? "cursor-pointer bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                        : "cursor-pointer border-border px-4 py-1.5 text-sm text-foreground hover:bg-secondary"
                    }
                  >
                    {variant.name}
                  </Badge>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Talle</label>
            <div className="flex flex-wrap gap-2">
              {availableSizesForColor.map((size) => {
                const remainingStock = getRemainingStock(size.id, size.stock)
                const disabled = remainingStock <= 0
                const selected = selectedSize === size.label

                return (
                  <button
                    key={size.id}
                    onClick={() => !disabled && setSelectedSize(size.label)}
                    disabled={disabled}
                    className="rounded-md focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed"
                  >
                    <Badge
                      variant={selected ? "default" : "outline"}
                      className={
                        disabled
                          ? "cursor-not-allowed border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground opacity-60"
                          : selected
                            ? "cursor-pointer bg-primary px-4 py-1.5 text-sm text-primary-foreground"
                            : "cursor-pointer border-border px-4 py-1.5 text-sm text-foreground hover:bg-secondary"
                      }
                    >
                      {size.label}
                    </Badge>
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Cantidad</label>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={!canAddToCart || quantity <= 1}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Reducir cantidad"
                >
                  <Minus className="size-4" />
                </button>
                <span className="min-w-8 text-center text-lg font-medium text-foreground">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                  disabled={!canAddToCart || quantity >= availableStock}
                  className="flex size-9 items-center justify-center rounded-lg border border-border text-foreground transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Aumentar cantidad"
                >
                  <Plus className="size-4" />
                </button>
              </div>

              <p className="text-sm text-muted-foreground">
                Disponibles: <span className="font-medium text-foreground">{availableStock}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!canAddToCart}
              className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ShoppingBag className="mr-2 size-5" />
              Agregar al carrito
            </Button>
          </div>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="description">
              <AccordionTrigger className="text-foreground">Descripcion</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {product.description}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="care">
              <AccordionTrigger className="text-foreground">Cuidados</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {product.care}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="shipping">
              <AccordionTrigger className="text-foreground">Envios y cambios</AccordionTrigger>
              <AccordionContent className="leading-relaxed text-muted-foreground">
                {product.shipping}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </div>
  )
}
