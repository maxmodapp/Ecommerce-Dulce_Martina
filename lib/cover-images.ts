import "server-only"

import { Prisma } from "@prisma/client"
import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"
import { PUBLIC_HOME_TAG } from "@/lib/public-cache"
import type { CoverImageItem } from "@/lib/types"

type CoverImageInput = {
  desktopUrl: string
  mobileUrl: string
  desktopPublicId?: string | null
  mobilePublicId?: string | null
  href: string | null
  sortOrder: number
}

type CoverImageMetaInput = {
  href: string | null
  sortOrder: number
}

type CoverImageRow = {
  id: number
  desktopUrl: string
  mobileUrl: string
  desktopPublicId: string | null
  mobilePublicId: string | null
  href: string | null
  sortOrder: number
}

const fallbackCoverImages: CoverImageItem[] = [
  {
    id: "fallback-hero",
    desktopUrl: "/images/hero.jpg",
    mobileUrl: "/images/hero.jpg",
    desktopPublicId: null,
    mobilePublicId: null,
    href: null,
    sortOrder: 0,
  },
]

function mapCoverImage(image: CoverImageRow): CoverImageItem {
  return {
    id: image.id.toString(),
    desktopUrl: image.desktopUrl,
    mobileUrl: image.mobileUrl,
    desktopPublicId: image.desktopPublicId,
    mobilePublicId: image.mobilePublicId,
    href: image.href,
    sortOrder: image.sortOrder,
  }
}

function normalizeHref(href: string | null) {
  const trimmed = href?.trim()
  return trimmed ? trimmed : null
}

function toIntId(value: string | number) {
  return typeof value === "number" ? value : Number(value)
}

function isMissingCoverImagesTable(error: unknown) {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021"
}

export async function getAdminCoverImages() {
  const images = await prisma.imagenPortada.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  })

  return images.map((image) => mapCoverImage(image))
}

export async function getAdminCoverImageById(id: string | number) {
  const image = await prisma.imagenPortada.findUnique({
    where: { id: toIntId(id) },
  })

  return image ? mapCoverImage(image) : null
}

async function getPublicCoverImagesUncached() {
  try {
    const images = await getAdminCoverImages()
    return images.length > 0 ? images : fallbackCoverImages
  } catch (error) {
    if (isMissingCoverImagesTable(error)) return fallbackCoverImages
    throw error
  }
}

const getCachedPublicCoverImages = unstable_cache(
  getPublicCoverImagesUncached,
  ["public-cover-images"],
  { tags: [PUBLIC_HOME_TAG], revalidate: 300 }
)

export async function getPublicCoverImages() {
  return getCachedPublicCoverImages()
}

export async function createAdminCoverImage(input: CoverImageInput) {
  await prisma.imagenPortada.create({
    data: {
      desktopUrl: input.desktopUrl,
      mobileUrl: input.mobileUrl,
      desktopPublicId: input.desktopPublicId ?? null,
      mobilePublicId: input.mobilePublicId ?? null,
      href: normalizeHref(input.href),
      sortOrder: input.sortOrder,
    },
  })

  return getAdminCoverImages()
}

export async function updateAdminCoverImage(id: string | number, input: CoverImageMetaInput) {
  await prisma.imagenPortada.update({
    where: { id: toIntId(id) },
    data: {
      href: normalizeHref(input.href),
      sortOrder: input.sortOrder,
    },
  })

  return getAdminCoverImages()
}

export async function deleteAdminCoverImage(id: string | number) {
  await prisma.imagenPortada.delete({
    where: { id: toIntId(id) },
  })

  return getAdminCoverImages()
}
