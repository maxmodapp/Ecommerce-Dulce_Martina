"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { AdminCategoryOption } from "@/lib/types"
import { slugify } from "@/lib/utils"

type CategoryForm = {
  name: string
  slug: string
  sortOrder: string
  active: boolean
}

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

function toForm(category?: AdminCategoryOption): CategoryForm {
  return {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    sortOrder: String(category?.sortOrder ?? 0),
    active: category?.active ?? true,
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

function CategoryRow({ category }: { category: AdminCategoryOption }) {
  const router = useRouter()
  const [form, setForm] = useState<CategoryForm>(() => toForm(category))
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState("")
  const [fileInputKey, setFileInputKey] = useState(0)
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const displayImageUrl = previewUrl || category.imageUrl || ""

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(imageFile)
    setPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [imageFile])

  function update<K extends keyof CategoryForm>(field: K, value: CategoryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)
    const slug = slugify(form.slug || form.name)
    const body = new FormData()
    body.append("name", form.name)
    body.append("slug", slug)
    body.append("sortOrder", form.sortOrder)
    body.append("active", String(form.active))

    if (imageFile) {
      body.append("imageFile", imageFile)
    }

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "PATCH",
        body,
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar la categoria."))
      }

      setForm((current) => ({ ...current, slug }))
      setImageFile(null)
      setFileInputKey((current) => current + 1)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar la categoria.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Esta categoria se eliminara solo si no tiene subcategorias. Continuar?")) {
      return
    }

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/categories/${category.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar la categoria."))
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar la categoria.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border/70 p-4">
      <div className="grid gap-3 lg:grid-cols-[150px_1fr_1fr_120px_160px]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Imagen</label>
          <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={`Imagen de ${category.name}`}
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
            onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-foreground focus:ring-2 focus:ring-ring"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
          <input
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            className={inputClassName}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Slug opcional
          </label>
          <input
            value={form.slug}
            onChange={(event) => update("slug", event.target.value)}
            className={inputClassName}
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
        <div className="flex items-end">
          <div className="flex h-10 w-full items-center justify-between rounded-md border border-border/70 px-3">
            <span className="text-sm text-foreground">Activa</span>
            <Switch checked={form.active} onCheckedChange={(value) => update("active", value)} />
          </div>
        </div>
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button type="submit" disabled={isSaving || isDeleting}>
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
          Eliminar
        </Button>
      </div>
    </form>
  )
}

export function AdminCategoriesManager({
  initialCategories,
}: {
  initialCategories: AdminCategoryOption[]
}) {
  const router = useRouter()
  const [newCategory, setNewCategory] = useState<CategoryForm>(() => toForm())
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newPreviewUrl, setNewPreviewUrl] = useState("")
  const [newFileInputKey, setNewFileInputKey] = useState(0)
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    if (!newImageFile) {
      setNewPreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(newImageFile)
    setNewPreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [newImageFile])

  function update<K extends keyof CategoryForm>(field: K, value: CategoryForm[K]) {
    setNewCategory((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsCreating(true)
    const slug = slugify(newCategory.slug || newCategory.name)
    const body = new FormData()
    body.append("name", newCategory.name)
    body.append("slug", slug)
    body.append("sortOrder", newCategory.sortOrder)
    body.append("active", String(newCategory.active))

    if (newImageFile) {
      body.append("imageFile", newImageFile)
    }

    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        body,
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos crear la categoria."))
      }

      setNewCategory(toForm())
      setNewImageFile(null)
      setNewFileInputKey((current) => current + 1)
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos crear la categoria.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nueva categoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-[150px_1fr_1fr_120px_160px]">
              <div>
                <p className="mb-1.5 text-sm font-medium text-foreground">Imagen</p>
                <div className="mb-2 flex h-20 w-full items-center justify-center overflow-hidden rounded-md bg-secondary/40">
                  {newPreviewUrl ? (
                    <img
                      src={newPreviewUrl}
                      alt="Preview de categoria"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="px-2 text-center text-xs text-muted-foreground">
                      Sin imagen
                    </span>
                  )}
                </div>
                <input
                  key={newFileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={(event) => setNewImageFile(event.target.files?.[0] ?? null)}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-xs text-foreground outline-none file:mr-2 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1.5 file:text-xs file:font-medium file:text-foreground focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
                <input
                  value={newCategory.name}
                  onChange={(event) => update("name", event.target.value)}
                  className={inputClassName}
                  placeholder="Indumentaria"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Slug opcional
                </label>
                <input
                  value={newCategory.slug}
                  onChange={(event) => update("slug", event.target.value)}
                  className={inputClassName}
                  placeholder="Se genera desde el nombre"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newCategory.sortOrder}
                  onChange={(event) => update("sortOrder", event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex items-end">
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-border/70 px-3">
                  <span className="text-sm text-foreground">Activa</span>
                  <Switch
                    checked={newCategory.active}
                    onCheckedChange={(value) => update("active", value)}
                  />
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear categoria"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Categorias cargadas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {initialCategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavia no hay categorias cargadas.</p>
          ) : (
            initialCategories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
