import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
const ZERO = BigInt(0)
type Json = Record<string, unknown>

class ApiError extends Error {
  status: number
  code: string
  details?: Json

  constructor(status: number, message: string, code = "BAD_REQUEST", details?: Json) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

function jsonError(err: ApiError) {
  return NextResponse.json(
    {
      error: err.message,
      code: err.code,
      ...(err.details ? { details: err.details } : {}),
    },
    { status: err.status }
  )
}

function toBigIntId(value: unknown, fieldName: string): bigint {
  if (typeof value === "bigint") {
    if (value <= ZERO) throw new ApiError(400, `${fieldName} inválido`, "INVALID_ID")
    return value
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value) || value <= 0) {
      throw new ApiError(400, `${fieldName} inválido`, "INVALID_ID")
    }
    return BigInt(value)
  }
  if (typeof value === "string") {
    const s = value.trim()
    if (!/^[0-9]+$/.test(s)) throw new ApiError(400, `${fieldName} inválido`, "INVALID_ID")
    const id = BigInt(s)
    if (id <= ZERO) throw new ApiError(400, `${fieldName} inválido`, "INVALID_ID")
    return id
  }
  throw new ApiError(400, `${fieldName} inválido`, "INVALID_ID")
}

function asNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== "string") throw new ApiError(400, `${fieldName} es obligatorio`, "VALIDATION")
  const s = value.trim()
  if (!s) throw new ApiError(400, `${fieldName} es obligatorio`, "VALIDATION")
  return s
}

function asOptionalString(value: unknown): string | null {
  if (value == null) return null
  if (typeof value !== "string") return null
  const s = value.trim()
  return s ? s : null
}

function asPositiveInt(value: unknown, fieldName: string): number {
  if (typeof value !== "number" || !Number.isFinite(value) || !Number.isInteger(value)) {
    throw new ApiError(400, `${fieldName} inválido`, "VALIDATION")
  }
  if (value <= 0) throw new ApiError(400, `${fieldName} inválido`, "VALIDATION")
  return value
}

function isValidEmail(email: string): boolean {
  // Validación simple (MVP): suficiente para evitar basura obvia.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

type OrderInputItem = {
  variant_size_id: unknown
  cantidad: unknown
}

export async function POST(req: Request) {
  let body: any
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 })
  }

  try {
    const customer_name = asNonEmptyString(body?.customer_name, "customer_name")
    const customer_phone = asNonEmptyString(body?.customer_phone, "customer_phone")
    const customer_email = asNonEmptyString(body?.customer_email, "customer_email")
    const userId = await getCurrentUserId()

    if (!isValidEmail(customer_email)) {
      throw new ApiError(400, "customer_email inválido", "VALIDATION")
    }

    const delivery_method = asNonEmptyString(body?.delivery_method, "delivery_method")
    const payment_method = asNonEmptyString(body?.payment_method, "payment_method")
    const shipping_address_in = asOptionalString(body?.shipping_address)

    if (delivery_method !== "DELIVERY" && delivery_method !== "PICKUP") {
      throw new ApiError(400, "delivery_method debe ser DELIVERY o PICKUP", "VALIDATION")
    }
    if (payment_method !== "TRANSFER" && payment_method !== "CASH") {
      throw new ApiError(400, "payment_method debe ser TRANSFER o CASH", "VALIDATION")
    }
    if (delivery_method === "DELIVERY" && payment_method === "CASH") {
      throw new ApiError(
        400,
        "Para envios a domicilio solo esta disponible el pago por transferencia.",
        "VALIDATION"
      )
    }

    const shipping_address = delivery_method === "DELIVERY" ? shipping_address_in : null
    if (delivery_method === "DELIVERY" && !shipping_address) {
      throw new ApiError(
        400,
        "shipping_address es obligatorio si delivery_method=DELIVERY",
        "VALIDATION"
      )
    }

    const rawItems = body?.items
    if (!Array.isArray(rawItems) || rawItems.length === 0) {
      throw new ApiError(400, "items debe ser un array no vacío", "VALIDATION")
    }

    // Normaliza items: mergea repetidos por variant_size_id.
    const itemMap = new Map<string, { id: bigint; cantidad: number }>()
    for (const it of rawItems as OrderInputItem[]) {
      const id = toBigIntId(it?.variant_size_id, "variant_size_id")
      const cantidad = asPositiveInt(it?.cantidad, "cantidad")
      const key = id.toString()
      const prev = itemMap.get(key)
      itemMap.set(key, { id, cantidad: (prev?.cantidad ?? 0) + cantidad })
    }

    const items = Array.from(itemMap.values())
    if (items.length === 0) {
      throw new ApiError(400, "items debe ser un array no vacío", "VALIDATION")
    }

    const order = await prisma.$transaction(async (tx) => {
      // 1) Trae los SKUs (variante_talles) + producto para calcular precios.
      const skuRows = await tx.variante_talles.findMany({
        where: { id: { in: items.map((i) => i.id) } },
        include: {
          variantes: {
            include: {
              productos: true,
            },
          },
        },
      })

      const skuById = new Map<string, (typeof skuRows)[number]>()
      for (const row of skuRows) skuById.set(row.id.toString(), row)

      // 2) Validaciones de existencia / activo.
      for (const it of items) {
        const row = skuById.get(it.id.toString())
        if (!row) {
          throw new ApiError(400, `variant_size_id inexistente: ${it.id.toString()}`, "INVALID_ITEM")
        }
        if (!row.variantes?.active) {
          throw new ApiError(
            409,
            `Variante (color) inactiva para variant_size_id=${it.id.toString()}`,
            "INACTIVE_VARIANT"
          )
        }
        if (!row.variantes?.productos?.active) {
          throw new ApiError(
            409,
            `Producto inactivo para variant_size_id=${it.id.toString()}`,
            "INACTIVE_PRODUCT"
          )
        }
      }

      // 3) Calcula total y prepara líneas (snapshot de precio_unidad = productos.precio).
      const lineas = items.map((it) => {
        const row = skuById.get(it.id.toString())!
        const precio_unidad = row.variantes.productos.precio
        return {
          product_variant_size_id: row.id,
          cantidad: it.cantidad,
          precio_unidad,
          // útil para mensajes
          _stock_actual: row.stock,
          _talle: row.talle,
          _color: row.variantes.nombre_color,
          _producto: row.variantes.productos.nombre,
        }
      })

      // Pre-check de stock para error amigable.
      for (const li of lineas) {
        if (li._stock_actual < li.cantidad) {
          throw new ApiError(
            409,
            `Stock insuficiente: ${li._producto} (${li._color}, talle ${li._talle}). Disponible=${li._stock_actual}, pedido=${li.cantidad}`,
            "OUT_OF_STOCK",
            { variant_size_id: li.product_variant_size_id.toString() }
          )
        }
      }

      const total = lineas.reduce((acc, li) => acc + li.cantidad * li.precio_unidad, 0)

      // 4) Descuenta stock de forma atómica (evita stock negativo ante concurrencia).
      for (const li of lineas) {
        const updated = await tx.variante_talles.updateMany({
          where: { id: li.product_variant_size_id, stock: { gte: li.cantidad } },
          data: { stock: { decrement: li.cantidad } },
        })
        if (updated.count !== 1) {
          throw new ApiError(
            409,
            `Stock insuficiente (actualizado). Volvé a intentar. variant_size_id=${li.product_variant_size_id.toString()}`,
            "OUT_OF_STOCK"
          )
        }
      }

      // 5) Crea orden + líneas.
      const created = await tx.ordenes.create({
        data: {
          user_id: userId,
          customer_name,
          customer_phone,
          customer_email,
          delivery_method,
          shipping_address,
          payment_method,
          status: "PENDING",
          total,
          orden_productos: {
            create: lineas.map((li) => ({
              product_variant_size_id: li.product_variant_size_id,
              cantidad: li.cantidad,
              precio_unidad: li.precio_unidad,
            })),
          },
        },
        include: { orden_productos: true },
      })

      return created
    })

    return NextResponse.json(
      {
        orden: {
          id: order.id.toString(),
          status: order.status,
          payment_method: order.payment_method,
          delivery_method: order.delivery_method,
          total: order.total,
          created_at: order.created_at,
          items: order.orden_productos.map((op) => ({
            id: op.id.toString(),
            variant_size_id: op.product_variant_size_id.toString(),
            cantidad: op.cantidad,
            precio_unidad: op.precio_unidad,
            created_at: op.created_at,
          })),
        },
      },
      { status: 201 }
    )
  } catch (err: any) {
    if (err instanceof ApiError) return jsonError(err)

    const message = typeof err?.message === "string" ? err.message : "Error interno"
    console.error("POST /api/orders error:", err)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}



export async function GET(req: Request) {
  try {
    const url = new URL(req.url)

    // MVP sin login: solo permite consultar TUS pedidos con email + phone.
    const email = (url.searchParams.get("email") ?? "").trim().toLowerCase()
    const phone = (url.searchParams.get("phone") ?? "").trim()

    if (!email) {
      return NextResponse.json(
        { error: "email es obligatorio", code: "VALIDATION" },
        { status: 400 }
      )
    }

    // Recomendado para no exponer pedidos solo con saber un mail
    if (!phone) {
      return NextResponse.json(
        { error: "phone es obligatorio", code: "VALIDATION" },
        { status: 400 }
      )
    }

    const orders = await prisma.ordenes.findMany({
      where: {
        customer_email: email,
        customer_phone: phone,
      },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        created_at: true,
        status: true,
        total: true,
        payment_method: true,
        delivery_method: true,
        shipping_address: true,
        _count: { select: { orden_productos: true } },
      },
    })

    return NextResponse.json({
      orders: orders.map((o) => ({
        id: o.id.toString(),
        created_at: o.created_at,
        status: o.status,
        total: o.total,
        payment_method: o.payment_method,
        delivery_method: o.delivery_method,
        shipping_address: o.shipping_address,
        items_count: o._count.orden_productos,
      })),
    })
  } catch (err) {
    console.error("GET /api/orders error:", err)
    return NextResponse.json({ error: "Error interno", code: "INTERNAL" }, { status: 500 })
  }
}
