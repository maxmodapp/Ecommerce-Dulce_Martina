import "server-only"

import { revalidateTag } from "next/cache"

export const PUBLIC_CATALOG_TAG = "public-catalog"
export const PUBLIC_HOME_TAG = "public-home"
export const PUBLIC_PRODUCTS_TAG = "public-products"
const IMMEDIATE_EXPIRE = { expire: 0 }

export function revalidatePublicCatalog() {
  revalidateTag(PUBLIC_CATALOG_TAG, IMMEDIATE_EXPIRE)
  revalidateTag(PUBLIC_PRODUCTS_TAG, IMMEDIATE_EXPIRE)
  revalidateTag(PUBLIC_HOME_TAG, IMMEDIATE_EXPIRE)
}

export function revalidatePublicHome() {
  revalidateTag(PUBLIC_HOME_TAG, IMMEDIATE_EXPIRE)
}

export function revalidatePublicProducts() {
  revalidateTag(PUBLIC_PRODUCTS_TAG, IMMEDIATE_EXPIRE)
  revalidateTag(PUBLIC_HOME_TAG, IMMEDIATE_EXPIRE)
  revalidateTag(PUBLIC_CATALOG_TAG, IMMEDIATE_EXPIRE)
}
