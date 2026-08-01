import "server-only"

import { NextResponse } from "next/server"
import { notFound, redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/auth"
import type { SessionUser } from "@/lib/types"

export class AdminApiError extends Error {
  status: number
  code: string
  details?: Record<string, unknown>

  constructor(
    status: number,
    message: string,
    code = "FORBIDDEN",
    details?: Record<string, unknown>
  ) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function adminJsonError(error: AdminApiError) {
  return NextResponse.json(
    {
      error: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    },
    { status: error.status }
  )
}

export async function requireAdminPageUser(nextPath: string): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`)
  }

  if (user.role !== "ADMIN") {
    notFound()
  }

  return user
}

export async function requireAdminApiUser(): Promise<SessionUser> {
  const user = await getCurrentUser()

  if (!user) {
    throw new AdminApiError(401, "Necesitas iniciar sesion para continuar.", "UNAUTHORIZED")
  }

  if (user.role !== "ADMIN") {
    throw new AdminApiError(403, "No tenes permisos para esta accion.", "FORBIDDEN")
  }

  return user
}
