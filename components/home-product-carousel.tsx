"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { Product } from "@/lib/types"

export function HomeProductCarousel({
  title,
  description,
  products,
}: {
  title: string
  description: string
  products: Product[]
}) {
  if (products.length === 0) return null

  return (
    <div>
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl font-bold text-foreground">{title}</h2>
          <p className="mt-2 text-muted-foreground">{description}</p>
        </div>
        <Link
          href="/productos"
          className="hidden items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-foreground md:flex"
        >
          Ver todo
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="relative px-10 sm:px-12">
        <Carousel
          opts={{
            align: "start",
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent>
            {products.map((product) => (
              <CarouselItem key={product.id} className="basis-1/2 md:basis-1/4">
                <ProductCard product={product} />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-0 top-[calc(50%-1rem)] size-10 border-border bg-background/95 text-foreground hover:bg-background" />
          <CarouselNext className="right-0 top-[calc(50%-1rem)] size-10 border-border bg-background/95 text-foreground hover:bg-background" />
        </Carousel>
      </div>

      <div className="mt-8 text-center md:hidden">
        <Button
          asChild
          variant="outline"
          className="border-border text-foreground hover:bg-secondary"
        >
          <Link href="/productos">Ver todos los productos</Link>
        </Button>
      </div>
    </div>
  )
}
