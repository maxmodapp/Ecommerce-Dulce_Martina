import "server-only"

import { createHmac, randomBytes, scrypt, timingSafeEqual } from "node:crypto"
import { promisify } from "node:util"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import type { SessionUser } from "@/lib/types"

const scryptAsync = promisify(scrypt)
const SESSION_COOKIE_NAME = "dulce_martina_session"
const SESSION_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30
const PASSWORD_KEY_LENGTH = 64

export const sessionUserSelect = {
  id: true,
  email: true,
  role: true,
  name: true,
  phone: true,
  direccion: true,
} as const

type SessionPayload = {
  userId: string
  exp: number
}

type DbSessionUser = {
  id: bigint
  email: string
  role: string
  name: string
  phone: string
  direccion: string | null
}

function getAuthSecret() {
  const secret =
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV !== "production"
      ? "dulce-martina-dev-secret-cambiar-en-produccion"
      : undefined)

  if (!secret) {
    throw new Error("Falta configurar AUTH_SECRET.")
  }

  return secret
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

export function normalizeOptionalText(value?: string | null) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export function normalizePhone(phone: string) {
  return phone.trim()
}

export function normalizeName(name: string) {
  return name.trim()
}

function encodeBase64Url(value: string) {
  return Buffer.from(value, "utf8").toString("base64url")
}

function decodeBase64Url(value: string) {
  return Buffer.from(value, "base64url").toString("utf8")
}

function signValue(value: string) {
  return createHmac("sha256", getAuthSecret()).update(value).digest("base64url")
}

function encodeSession(payload: SessionPayload) {
  const encodedPayload = encodeBase64Url(JSON.stringify(payload))
  const signature = signValue(encodedPayload)
  return `${encodedPayload}.${signature}`
}

function decodeSession(rawCookie?: string) {
  if (!rawCookie) return null

  const [encodedPayload, signature] = rawCookie.split(".")
  if (!encodedPayload || !signature) return null

  const expectedSignature = signValue(encodedPayload)
  const expectedBuffer = Buffer.from(expectedSignature)
  const signatureBuffer = Buffer.from(signature)

  if (
    expectedBuffer.length !== signatureBuffer.length ||
    !timingSafeEqual(expectedBuffer, signatureBuffer)
  ) {
    return null
  }

  try {
    const payload = JSON.parse(decodeBase64Url(encodedPayload)) as SessionPayload
    if (!payload?.userId || typeof payload.exp !== "number") return null
    if (payload.exp <= Date.now()) return null
    return payload
  } catch {
    return null
  }
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derivedKey = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer
  return `${salt}:${derivedKey.toString("hex")}`
}

export async function verifyPassword(password: string, storedHash: string) {
  const [salt, storedKey] = storedHash.split(":")
  if (!salt || !storedKey) return false

  const derivedKey = (await scryptAsync(password, salt, PASSWORD_KEY_LENGTH)) as Buffer
  const storedKeyBuffer = Buffer.from(storedKey, "hex")

  if (derivedKey.length !== storedKeyBuffer.length) return false
  return timingSafeEqual(derivedKey, storedKeyBuffer)
}

export function toSessionUser(user: DbSessionUser): SessionUser {
  return {
    id: user.id.toString(),
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    direccion: user.direccion,
  }
}

export async function createUserSession(userId: bigint | string) {
  const userIdValue = typeof userId === "bigint" ? userId.toString() : userId
  const expiresAt = Date.now() + SESSION_MAX_AGE_MS
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, encodeSession({ userId: userIdValue, exp: expiresAt }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  })
}

export async function clearUserSession() {
  const cookieStore = await cookies()

  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
}

export async function getCurrentUserId() {
  const cookieStore = await cookies()
  const session = decodeSession(cookieStore.get(SESSION_COOKIE_NAME)?.value)

  if (!session?.userId) return null

  try {
    return BigInt(session.userId)
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const userId = await getCurrentUserId()
  if (!userId) return null

  const user = await prisma.usuarios.findUnique({
    where: { id: userId },
    select: sessionUserSelect,
  })

  if (!user) return null
  return toSessionUser(user)
}

export function normalizeEmailInput(email: string) {
  return normalizeEmail(email)
}
