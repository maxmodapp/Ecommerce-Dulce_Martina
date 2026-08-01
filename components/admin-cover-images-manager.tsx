"use client"

import { useEffect, useState, type FormEvent } from "react"
import { Plus, Save, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CoverImageItem } from "@/lib/types"

type CoverImageForm = {
  href: string
  sortOrder: string
}

const emptyForm: CoverImageForm = {
  href: "",
  sortOrder: "0",
}

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

function toForm(image: CoverImageItem): CoverImageForm {
  return {
    href: image.href ?? "",
    sortOrder: String(image.sortOrder),
  }
}

async function getResponseError(response: Response, fallback: string) {
  try {
    const data = await response.json()
    return data.error ?? fallback
  } catch {
    return fallback
  }
}

function CoverImageRow({
  image,
  onUpdated,
}: {
  image: CoverImageItem
  onUpdated: (images: CoverImageItem[]) => void
}) {
  const [form, setForm] = useState<CoverImageForm>(() => toForm(image))
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function update<K extends keyof CoverImageForm>(field: K, value: CoverImageForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/cover-images/${image.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          href: form.href,
          sortOrder: Number(form.sortOrder),
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar la imagen."))
      }

      const data = await response.json()
      onUpdated(data.images ?? [])
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar la imagen.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Esta imagen se eliminara de la portada. Continuar?")) return

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/cover-images/${image.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar la imagen."))
      }

      const data = await response.json()
      onUpdated(data.images ?? [])
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar la imagen.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSave} className="rounded-lg border border-border/70 p-4">
      <div className="grid gap-4 lg:grid-cols-[120px_120px_1fr_110px] lg:items-end">
        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">Desktop</p>
          <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
            <img
              src={image.desktopUrl}
              alt="Preview desktop de portada"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">Celular</p>
          <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
            <img
              src={image.mobileUrl}
              alt="Preview celular de portada"
              className="h-full w-full object-cover"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Link opcional
          </label>
          <input
            value={form.href}
            onChange={(event) => update("href", event.target.value)}
            className={inputClassName}
            placeholder="/productos"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) => update("sortOrder", event.target.value)}
            className={inputClassName}
          />
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSaving || isDeleting}>
          <Save className="size-4" />
          {isSaving ? "Guardando..." : "Guardar"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          className="text-destructive hover:text-destructive"
          onClick={() => void handleDelete()}
          disabled={isSaving || isDeleting}
        >
          <Trash2 className="size-4" />
          {isDeleting ? "Eliminando..." : "Eliminar"}
        </Button>
      </div>
    </form>
  )
}

export function AdminCoverImagesManager({
  initialImages,
}: {
  initialImages: CoverImageItem[]
}) {
  const [images, setImages] = useState(initialImages)
  const [newImage, setNewImage] = useState<CoverImageForm>(emptyForm)
  const [newDesktopFile, setNewDesktopFile] = useState<File | null>(null)
  const [newMobileFile, setNewMobileFile] = useState<File | null>(null)
  const [newDesktopPreviewUrl, setNewDesktopPreviewUrl] = useState("")
  const [newMobilePreviewUrl, setNewMobilePreviewUrl] = useState("")
  const [fileInputKey, setFileInputKey] = useState(0)
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!newDesktopFile) {
      setNewDesktopPreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(newDesktopFile)
    setNewDesktopPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [newDesktopFile])

  useEffect(() => {
    if (!newMobileFile) {
      setNewMobilePreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(newMobileFile)
    setNewMobilePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [newMobileFile])

  function update<K extends keyof CoverImageForm>(field: K, value: CoverImageForm[K]) {
    setNewImage((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsCreating(true)

    try {
      if (!newDesktopFile) {
        throw new Error("Selecciona la imagen para pantalla grande.")
      }

      if (!newMobileFile) {
        throw new Error("Selecciona la imagen para celular.")
      }

      const body = new FormData()
      body.append("desktopFile", newDesktopFile)
      body.append("mobileFile", newMobileFile)
      body.append("href", newImage.href)
      body.append("sortOrder", newImage.sortOrder)

      const response = await fetch("/api/admin/cover-images", {
        method: "POST",
        body,
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos agregar la imagen."))
      }

      const data = await response.json()
      setImages(data.images ?? [])
      setNewImage(emptyForm)
      setNewDesktopFile(null)
      setNewMobileFile(null)
      setFileInputKey((current) => current + 1)
    } catch (err: any) {
      setError(err.message ?? "No pudimos agregar la imagen.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nueva imagen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[1fr_1fr_1fr_110px] lg:items-end">
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">Imagen desktop</p>
                <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
                  {newDesktopPreviewUrl ? (
                    <img
                      src={newDesktopPreviewUrl}
                      alt="Preview desktop de portada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      Sin imagen
                    </span>
                  )}
                </div>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewDesktopFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground focus:ring-2 focus:ring-ring"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {newDesktopFile ? newDesktopFile.name : "Selecciona imagen grande"}
                </p>
              </div>
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">Imagen celular</p>
                <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
                  {newMobilePreviewUrl ? (
                    <img
                      src={newMobilePreviewUrl}
                      alt="Preview celular de portada"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      Sin imagen
                    </span>
                  )}
                </div>
                <input
                  key={`mobile-${fileInputKey}`}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewMobileFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground focus:ring-2 focus:ring-ring"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {newMobileFile ? newMobileFile.name : "Selecciona imagen celular"}
                </p>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Link opcional
                </label>
                <input
                  value={newImage.href}
                  onChange={(event) => update("href", event.target.value)}
                  className={inputClassName}
                  placeholder="/productos"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newImage.sortOrder}
                  onChange={(event) => update("sortOrder", event.target.value)}
                  className={inputClassName}
                />
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={isCreating}>
              <Plus className="size-4" />
              {isCreating ? "Agregando..." : "Agregar imagen"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Imagenes cargadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Todavia no hay imagenes cargadas. La home usa la imagen actual como fallback.
            </p>
          ) : (
            images.map((image) => (
              <CoverImageRow key={image.id} image={image} onUpdated={setImages} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
