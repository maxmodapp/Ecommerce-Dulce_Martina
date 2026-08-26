import { NextResponse } from "next/server"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs"

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

function toOrderNumber(value: string): number {
  const normalized = value.trim()
  if (!/^\d{6}$/.test(normalized)) {
    throw new ApiError(400, "Numero de pedido invalido", "INVALID_ORDER_NUMBER")
  }
  return Number(normalized)
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderNumberParam } = await params
    const orderNumber = toOrderNumber(orderNumberParam)
    const currentUser = await getCurrentUser()

    const order = await prisma.ordenes.findUnique({
      where: { numero_orden: orderNumber },
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

    const isAdmin = currentUser?.role === "ADMIN"
    const belongsToCurrentUser = Boolean(
      currentUser && order.user_id && order.user_id.toString() === currentUser.id
    )

    // Guest orders are public by order number. Account orders are restricted
    // to their owner, while administrators can inspect every order.
    if (order.user_id && !currentUser) {
      return NextResponse.json(
        {
          error: "Inicia sesion para ver este pedido",
          code: "AUTH_REQUIRED",
        },
        { status: 401 }
      )
    }

    if (order.user_id && !belongsToCurrentUser && !isAdmin) {
      return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 })
    }

    // prepare safe output matching adapter expectations
    const safeOrder = {
      id: order.numero_orden.toString(),
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
