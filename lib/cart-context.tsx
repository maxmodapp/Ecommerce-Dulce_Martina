"use client"

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from "react"
import { getShippingCost } from "@/lib/cart-config"
import type { AddCartItemInput, CartItem, DeliveryMethod } from "./types"

const CART_STORAGE_KEY = "dulce-martina-cart-v1"
const DELIVERY_STORAGE_KEY = "dulce-martina-delivery-v1"

interface CartContextType {
  items: CartItem[]
  addItem: (input: AddCartItemInput) => void
  removeItem: (variantSizeId: string) => void
  updateQuantity: (variantSizeId: string, quantity: number) => void
  syncItemStock: (variantSizeId: string, maxStock: number) => void
  clearCart: () => void
  getItemQuantity: (variantSizeId: string) => number
  getRemainingStock: (variantSizeId: string, dbStock: number) => number
  deliveryMethod: DeliveryMethod
  setDeliveryMethod: (value: DeliveryMethod) => void
  totalItems: number
  subtotal: number
  shippingCost: number
  total: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function clampQuantity(quantity: number, maxStock: number) {
  if (maxStock <= 0) return 0
  return Math.max(0, Math.min(quantity, maxStock))
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [deliveryMethod, setDeliveryMethodState] = useState<DeliveryMethod>("DELIVERY")
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const rawItems = window.localStorage.getItem(CART_STORAGE_KEY)
      if (rawItems) {
        const parsed = JSON.parse(rawItems)
        if (Array.isArray(parsed)) {
          setItems(parsed)
        }
      }

      const rawDelivery = window.localStorage.getItem(DELIVERY_STORAGE_KEY)
      if (rawDelivery === "DELIVERY" || rawDelivery === "PICKUP") {
        setDeliveryMethodState(rawDelivery)
      }
    } catch {
      // si localStorage falla, seguimos con estado en memoria
    } finally {
      setHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items))
    } catch {
      // noop
    }
  }, [items, hydrated])

  useEffect(() => {
    if (!hydrated) return
    try {
      window.localStorage.setItem(DELIVERY_STORAGE_KEY, deliveryMethod)
    } catch {
      // noop
    }
  }, [deliveryMethod, hydrated])

  const addItem = useCallback((input: AddCartItemInput) => {
    const requestedQuantity = Math.max(1, Math.floor(input.quantity ?? 1))

    setItems((prev) => {
      const existing = prev.find((item) => item.variantSizeId === input.variantSizeId)
      const currentQuantity = existing?.quantity ?? 0
      const remaining = Math.max(0, input.maxStock - currentQuantity)
      const added = Math.min(requestedQuantity, remaining)

      if (added <= 0) {
        return prev.map((item) =>
          item.variantSizeId === input.variantSizeId
            ? {
                ...item,
                image: input.image,
                maxStock: input.maxStock,
                unitPrice: input.product.price,
              }
            : item
        )
      }

      if (existing) {
        return prev.map((item) =>
          item.variantSizeId === input.variantSizeId
            ? {
                ...item,
                productName: input.product.name,
                productSlug: input.product.slug,
                unitPrice: input.product.price,
                image: input.image,
                size: input.size,
                color: input.color,
                maxStock: input.maxStock,
                quantity: clampQuantity(item.quantity + added, input.maxStock),
              }
            : item
        )
      }

      return [
        ...prev,
        {
          variantId: input.variantId,
          variantSizeId: input.variantSizeId,
          productId: input.product.id,
          productSlug: input.product.slug,
          productName: input.product.name,
          unitPrice: input.product.price,
          image: input.image,
          quantity: added,
          size: input.size,
          color: input.color,
          maxStock: input.maxStock,
        },
      ]
    })
  }, [])

  const removeItem = useCallback((variantSizeId: string) => {
    setItems((prev) => prev.filter((item) => item.variantSizeId !== variantSizeId))
  }, [])

  const updateQuantity = useCallback((variantSizeId: string, quantity: number) => {
    setItems((prev) => {
      const current = prev.find((item) => item.variantSizeId === variantSizeId)
      if (!current) return prev

      const nextQuantity = clampQuantity(Math.floor(quantity), current.maxStock)

      if (nextQuantity <= 0) {
        return prev.filter((item) => item.variantSizeId !== variantSizeId)
      }

      return prev.map((item) =>
        item.variantSizeId === variantSizeId
          ? { ...item, quantity: nextQuantity }
          : item
      )
    })
  }, [])

  const syncItemStock = useCallback((variantSizeId: string, maxStock: number) => {
    setItems((prev) =>
      prev.map((item) =>
        item.variantSizeId === variantSizeId
          ? {
              ...item,
              maxStock,
              quantity: clampQuantity(item.quantity, maxStock),
            }
          : item
      )
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const getItemQuantity = useCallback(
    (variantSizeId: string) =>
      items.find((item) => item.variantSizeId === variantSizeId)?.quantity ?? 0,
    [items]
  )

  const getRemainingStock = useCallback(
    (variantSizeId: string, dbStock: number) => Math.max(0, dbStock - getItemQuantity(variantSizeId)),
    [getItemQuantity]
  )

  const setDeliveryMethod = useCallback((value: DeliveryMethod) => {
    setDeliveryMethodState(value)
  }, [])

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  )
  const shippingCost = useMemo(
    () => getShippingCost(subtotal, deliveryMethod),
    [subtotal, deliveryMethod]
  )
  const total = subtotal + shippingCost

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        syncItemStock,
        clearCart,
        getItemQuantity,
        getRemainingStock,
        deliveryMethod,
        setDeliveryMethod,
        totalItems,
        subtotal,
        shippingCost,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
}
