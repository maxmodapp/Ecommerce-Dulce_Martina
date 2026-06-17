import "server-only"

import { createHash } from "node:crypto"

type CloudinaryConfig = {
  cloudName: string
  apiKey: string
  apiSecret: string
}

function getCloudinaryConfig(): CloudinaryConfig {
  const rawValue = process.env.CLOUDINARY_URL

  if (!rawValue) {
    throw new Error("Falta configurar CLOUDINARY_URL.")
  }

  const parsed = new URL(rawValue)

  if (parsed.protocol !== "cloudinary:") {
    throw new Error("CLOUDINARY_URL no tiene un formato valido.")
  }

  const cloudName = parsed.hostname
  const apiKey = decodeURIComponent(parsed.username)
  const apiSecret = decodeURIComponent(parsed.password)

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("CLOUDINARY_URL no tiene las credenciales completas.")
  }

  return {
    cloudName,
    apiKey,
    apiSecret,
  }
}

function signCloudinaryParams(
  params: Record<string, string | number | boolean | null | undefined>,
  apiSecret: string
) {
  const base = Object.entries(params)
    .filter(([, value]) => value !== null && value !== undefined && value !== "")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&")

  return createHash("sha1").update(`${base}${apiSecret}`).digest("hex")
}

export async function uploadImageToCloudinary(
  file: File,
  options?: { folder?: string }
) {
  const config = getCloudinaryConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const folder = options?.folder ?? ""

  const signature = signCloudinaryParams(
    {
      folder,
      timestamp,
    },
    config.apiSecret
  )

  const body = new FormData()
  body.append("file", file, file.name)
  body.append("api_key", config.apiKey)
  body.append("timestamp", String(timestamp))
  body.append("signature", signature)

  if (folder) {
    body.append("folder", folder)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`,
    {
      method: "POST",
      body,
    }
  )

  const data = await response.json()

  if (!response.ok || !data?.secure_url || !data?.public_id) {
    throw new Error(data?.error?.message ?? "No pudimos subir la imagen a Cloudinary.")
  }

  return {
    url: String(data.secure_url),
    publicId: String(data.public_id),
  }
}

export async function deleteImageFromCloudinary(publicId: string) {
  const config = getCloudinaryConfig()
  const timestamp = Math.floor(Date.now() / 1000)
  const invalidate = true

  const signature = signCloudinaryParams(
    {
      invalidate,
      public_id: publicId,
      timestamp,
    },
    config.apiSecret
  )

  const body = new FormData()
  body.append("public_id", publicId)
  body.append("invalidate", String(invalidate))
  body.append("api_key", config.apiKey)
  body.append("timestamp", String(timestamp))
  body.append("signature", signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${config.cloudName}/image/destroy`,
    {
      method: "POST",
      body,
    }
  )

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data?.error?.message ?? "No pudimos eliminar la imagen en Cloudinary.")
  }

  const result = String(data?.result ?? "")

  if (result !== "ok" && result !== "not found") {
    throw new Error("Cloudinary no confirmo la eliminacion de la imagen.")
  }

  return result
}
