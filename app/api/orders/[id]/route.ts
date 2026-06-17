import { NextResponse } from "next/server"
import { getCurrentUserId } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"
const ZERO = BigInt(0)

class ApiError extends Error {
  status: number
  code: string
  constructor(status: number, message: string, code = "BAD_REQUEST") {
    super(message)
    this.status = status
    this.code = code
  }
}

function jsonError(err: ApiError) {
  return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
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

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = toBigIntId(idParam, "id")
    const currentUserId = await getCurrentUserId()

    const order = await prisma.ordenes.findUnique({
      where: { id },
      include: {
        orden_productos: {
          include: {
            variante_talles: {
              include: {
                variantes: {
                  include: {
                    productos: true,
                    variante_imagenes: {
                      orderBy: { sort_order: "asc" },
                      take: 1,
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!order) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // Los pedidos asociados a una cuenta solo pueden ser vistos por esa misma cuenta.
    if (order.user_id && order.user_id !== currentUserId) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // prepare safe output matching adapter expectations
    const safeOrder = {
      id: order.id.toString(),
      status: order.status,
      created_at: order.created_at,
      payment_method: order.payment_method,
      delivery_method: order.delivery_method,
      shipping_address: order.shipping_address,
      total: order.total,
      items: order.orden_productos.map((op) => {
        const talla = op.variante_talles
        const variante = talla?.variantes
        const producto = variante?.productos
        const image = variante?.variante_imagenes[0]
        return {
          id: op.id.toString(),
          cantidad: op.cantidad,
          precio_unidad: op.precio_unidad,
          // extras for UI adapter
          producto_nombre: producto?.nombre ?? "",
          color: variante?.nombre_color ?? "",
          talle: talla?.talle ?? "",
          image_url: image?.url ?? null,
        }
      }),
    }

    return NextResponse.json({ order: safeOrder })
  } catch (err: any) {
    if (err instanceof ApiError) return jsonError(err)
    console.error("GET /api/orders/[id] error:", err)
    return NextResponse.json({ error: "Error interno" }, { status: 500 })
  }
}
