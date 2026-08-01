"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CoverImageItem } from "@/lib/types"

function CoverSlide({ image }: { image: CoverImageItem }) {
  const content = (
    <picture className="block h-full w-full">
      <source media="(min-width: 768px)" srcSet={image.desktopUrl} />
      <img
        src={image.mobileUrl}
        alt="Portada Dulce Martina"
        className="h-full w-full object-cover"
      />
    </picture>
  )

  if (image.href) {
    return (
      <Link href={image.href} className="block h-full w-full">
        {content}
      </Link>
    )
  }

  return content
}

export function HomeCoverCarousel({ images }: { images: CoverImageItem[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const hasMultipleImages = images.length > 1

  function goToPrevious() {
    setActiveIndex((current) => (current === 0 ? images.length - 1 : current - 1))
  }

  function goToNext() {
    setActiveIndex((current) => (current + 1) % images.length)
  }

  return (
    <div className="absolute inset-0">
      {images.map((image, index) => (
        <div
          key={image.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-500",
            index === activeIndex
              ? "pointer-events-auto z-10 opacity-100"
              : "pointer-events-none z-0 opacity-0"
          )}
          aria-hidden={index !== activeIndex}
        >
          <CoverSlide image={image} />
        </div>
      ))}

      {hasMultipleImages ? (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Ver imagen anterior"
          >
            <ChevronLeft className="size-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="absolute right-4 top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white transition-colors hover:bg-black/55 focus:outline-none focus:ring-2 focus:ring-white/70"
            aria-label="Ver imagen siguiente"
          >
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  )
}
