"use client"

import { useEffect, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { formatPrice } from "@/lib/data"
import type {
  AdminSubcategoryOption,
  Audience,
  AdminProductDetail,
  AdminProductVariantImageItem,
  AdminProductVariantItem,
  AdminProductVariantSizeItem,
  HomeSection,
} from "@/lib/types"
import { AUDIENCE_LABELS, AUDIENCE_VALUES, HOME_SECTION_LABELS } from "@/lib/types"

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
const textareaClassName =
  "w-full rounded-md border border-input bg-background px-3 py-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

type ProductFormState = {
  name: string
  slug: string
  description: string
  subcategoryId: string
  gender: Audience
  price: string
  active: boolean
  homeSections: HomeSection[]
}

type VariantFormState = {
  name: string
  hex: string
  sortOrder: string
  active: boolean
}

type ImageFormState = {
  sortOrder: string
}

type SizeFormState = {
  label: string
  stock: string
}

function toProductForm(product: AdminProductDetail): ProductFormState {
  return {
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    subcategoryId: product.subcategoryId ?? "",
    gender: product.gender,
    price: String(product.price),
    active: product.active,
    homeSections: product.homeSections,
  }
}

function toVariantForm(variant: AdminProductVariantItem): VariantFormState {
  return {
    name: variant.name,
    hex: variant.hex ?? "",
    sortOrder: String(variant.sortOrder),
    active: variant.active,
  }
}

function toImageForm(image: AdminProductVariantImageItem): ImageFormState {
  return {
    sortOrder: String(image.sortOrder),
  }
}

function toSizeForm(size: AdminProductVariantSizeItem): SizeFormState {
  return {
    label: size.label,
    stock: String(size.stock),
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

function ProductSummary({ product }: { product: AdminProductDetail }) {
  const totalStock = product.variants.reduce(
    (sum, variant) => sum + variant.sizes.reduce((variantSum, size) => variantSum + size.stock, 0),
    0
  )

  return (
    <Card>
      <CardHeader className="gap-3">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Producto</p>
            <CardTitle className="mt-1 font-serif text-3xl text-foreground">
              {product.name}
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">/{product.slug}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={product.active ? "default" : "secondary"}>
              {product.active ? "Activo" : "Inactivo"}
            </Badge>
            <Badge variant="outline">{formatPrice(product.price)}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-6">
        <div>
          <p className="text-xs uppercase tracking-wide">Categoria</p>
          <p className="mt-1 text-foreground">{product.category?.name ?? "Sin categoria"}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Subcategoria</p>
          <p className="mt-1 text-foreground">
            {product.subcategory?.name ?? "Sin subcategoria"}
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Genero</p>
          <p className="mt-1 text-foreground">{AUDIENCE_LABELS[product.gender]}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Variantes</p>
          <p className="mt-1 text-foreground">{product.variants.length}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Stock total</p>
          <p className="mt-1 text-foreground">{totalStock}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide">Imagenes</p>
          <p className="mt-1 text-foreground">
            {product.variants.reduce((sum, variant) => sum + variant.images.length, 0)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

function VariantImageRow({
  productId,
  variantId,
  image,
  onRefresh,
}: {
  productId: string
  variantId: string
  image: AdminProductVariantImageItem
  onRefresh: () => void
}) {
  const [form, setForm] = useState<ImageFormState>(() => toImageForm(image))
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/images/${image.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sortOrder: Number(form.sortOrder),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar la imagen."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar la imagen.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Esta imagen se eliminara de la variante. Continuar?")) return

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/images/${image.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar la imagen."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar la imagen.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border/70 p-4">
      <div className="grid gap-3 xl:grid-cols-[96px_1fr_140px_auto]">
        <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
          {image.url ? (
            <img
              src={image.url}
              alt={image.alt || "Imagen de variante"}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-muted-foreground">Sin imagen</span>
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-foreground">Imagen actual</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Puedes cambiar su orden o eliminarla si ya no corresponde.
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
          <input
            type="number"
            min="0"
            value={form.sortOrder}
            onChange={(event) =>
              setForm((current) => ({ ...current, sortOrder: event.target.value }))
            }
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col justify-end gap-2">
          <Button type="submit" variant="outline" disabled={isSaving || isDeleting}>
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
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </form>
  )
}

function VariantSizeRow({
  productId,
  variantId,
  size,
  onRefresh,
}: {
  productId: string
  variantId: string
  size: AdminProductVariantSizeItem
  onRefresh: () => void
}) {
  const [form, setForm] = useState<SizeFormState>(() => toSizeForm(size))
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/sizes/${size.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label: form.label,
            stock: Number(form.stock),
          }),
        }
      )

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar el talle."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar el talle.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Este talle se eliminara de la variante. Continuar?")) return

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/variants/${variantId}/sizes/${size.id}`,
        { method: "DELETE" }
      )

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar el talle."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar el talle.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border/70 p-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Talle</label>
          <input
            value={form.label}
            onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
            className={inputClassName}
            placeholder="M"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Stock</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: event.target.value }))}
            className={inputClassName}
          />
        </div>

        <div className="flex flex-col justify-end gap-2 sm:flex-row">
          <Button type="submit" variant="outline" disabled={isSaving || isDeleting}>
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
      </div>

      {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
    </form>
  )
}

function VariantCard({
  productId,
  variant,
  onRefresh,
}: {
  productId: string
  variant: AdminProductVariantItem
  onRefresh: () => void
}) {
  const [form, setForm] = useState<VariantFormState>(() => toVariantForm(variant))
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [newSize, setNewSize] = useState<SizeFormState>({ label: "", stock: "0" })
  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [newImageSortOrder, setNewImageSortOrder] = useState("0")
  const [newImagePreviewUrl, setNewImagePreviewUrl] = useState("")
  const [fileInputKey, setFileInputKey] = useState(0)
  const [newImageError, setNewImageError] = useState("")
  const [newSizeError, setNewSizeError] = useState("")
  const [isCreatingImage, setIsCreatingImage] = useState(false)
  const [isCreatingSize, setIsCreatingSize] = useState(false)

  useEffect(() => {
    if (!newImageFile) {
      setNewImagePreviewUrl("")
      return
    }

    const objectUrl = URL.createObjectURL(newImageFile)
    setNewImagePreviewUrl(objectUrl)

    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [newImageFile])

  async function handleVariantSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          hex: form.hex,
          sortOrder: Number(form.sortOrder),
          active: form.active,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar la variante."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar la variante.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDeleteVariant() {
    if (!window.confirm("La variante se eliminara con sus imagenes y talles. Continuar?")) return

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar la variante."))
      }

      onRefresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar la variante.")
    } finally {
      setIsDeleting(false)
    }
  }

  async function handleCreateImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewImageError("")
    setIsCreatingImage(true)

    try {
      if (!newImageFile) {
        throw new Error("Selecciona una imagen antes de subirla.")
      }

      const body = new FormData()
      body.append("file", newImageFile)
      body.append("sortOrder", newImageSortOrder)

      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}/images`, {
        method: "POST",
        body,
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos agregar la imagen."))
      }

      setNewImageFile(null)
      setNewImageSortOrder("0")
      setFileInputKey((current) => current + 1)
      onRefresh()
    } catch (err: any) {
      setNewImageError(err.message ?? "No pudimos agregar la imagen.")
    } finally {
      setIsCreatingImage(false)
    }
  }

  async function handleCreateSize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewSizeError("")
    setIsCreatingSize(true)

    try {
      const response = await fetch(`/api/admin/products/${productId}/variants/${variant.id}/sizes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: newSize.label,
          stock: Number(newSize.stock),
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos agregar el talle."))
      }

      setNewSize({ label: "", stock: "0" })
      onRefresh()
    } catch (err: any) {
      setNewSizeError(err.message ?? "No pudimos agregar el talle.")
    } finally {
      setIsCreatingSize(false)
    }
  }

  return (
    <Card className="border-border/80 bg-secondary/10 py-0">
      <CardHeader className="gap-4 border-b py-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl text-foreground">{variant.name}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {variant.images.length} imagenes - {variant.sizes.length} talles
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant={variant.active ? "default" : "secondary"}>
              {variant.active ? "Activa" : "Inactiva"}
            </Badge>
            {variant.hex ? <Badge variant="outline">{variant.hex}</Badge> : null}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 py-6">
        <form onSubmit={handleVariantSubmit} className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">
                Color / nombre
              </label>
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className={inputClassName}
                placeholder="Beige"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Hex</label>
              <input
                value={form.hex}
                onChange={(event) => setForm((current) => ({ ...current, hex: event.target.value }))}
                className={inputClassName}
                placeholder="#D8C3B5"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
              <input
                type="number"
                min="0"
                value={form.sortOrder}
                onChange={(event) =>
                  setForm((current) => ({ ...current, sortOrder: event.target.value }))
                }
                className={inputClassName}
              />
            </div>

            <div className="flex items-end">
              <div className="flex w-full items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium text-foreground">Activa</p>
                  <p className="text-xs text-muted-foreground">Disponible para vender</p>
                </div>
                <Switch
                  checked={form.active}
                  onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))}
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit" variant="outline" disabled={isSaving || isDeleting}>
              {isSaving ? "Guardando..." : "Guardar variante"}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="text-destructive hover:text-destructive"
              onClick={() => void handleDeleteVariant()}
              disabled={isSaving || isDeleting}
            >
              <Trash2 className="size-4" />
              Eliminar variante
            </Button>
          </div>

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
        </form>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Imagenes</h3>
            <p className="text-sm text-muted-foreground">
              Carga las imagenes de esta variante y define su orden de aparicion.
            </p>
          </div>

          {variant.images.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavia no cargaste imagenes.</p>
          ) : (
            <div className="space-y-3">
              {variant.images.map((image) => (
                <VariantImageRow
                  key={image.id}
                  productId={productId}
                  variantId={variant.id}
                  image={image}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}

          <form onSubmit={handleCreateImage} className="rounded-xl border border-dashed p-4">
            <div className="grid gap-3 xl:grid-cols-[96px_1fr_140px_auto]">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-lg bg-secondary/30">
                {newImagePreviewUrl ? (
                  <img
                    src={newImagePreviewUrl}
                    alt="Preview de la nueva imagen"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="px-2 text-center text-xs text-muted-foreground">
                    Sin preview
                  </span>
                )}
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Nueva imagen
                </label>
                <input
                  key={fileInputKey}
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setNewImageFile(event.target.files?.[0] ?? null)
                  }
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-2 file:text-sm file:font-medium file:text-foreground focus:ring-2 focus:ring-ring"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  {newImageFile ? newImageFile.name : "Selecciona un archivo de imagen"}
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newImageSortOrder}
                  onChange={(event) => setNewImageSortOrder(event.target.value)}
                  className={inputClassName}
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={isCreatingImage} className="w-full">
                  {isCreatingImage ? "Subiendo..." : "Subir imagen"}
                </Button>
              </div>
            </div>

            {newImageError ? (
              <p className="mt-3 text-sm text-destructive">{newImageError}</p>
            ) : null}
          </form>
        </div>

        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground">Talles y stock</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona cada talle y su stock para esta variante.
            </p>
          </div>

          {variant.sizes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavia no cargaste talles.</p>
          ) : (
            <div className="space-y-3">
              {variant.sizes.map((size) => (
                <VariantSizeRow
                  key={size.id}
                  productId={productId}
                  variantId={variant.id}
                  size={size}
                  onRefresh={onRefresh}
                />
              ))}
            </div>
          )}

          <form onSubmit={handleCreateSize} className="rounded-xl border border-dashed p-4">
            <div className="grid gap-3 sm:grid-cols-[1fr_180px_auto]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Nuevo talle
                </label>
                <input
                  value={newSize.label}
                  onChange={(event) =>
                    setNewSize((current) => ({ ...current, label: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="M"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={newSize.stock}
                  onChange={(event) =>
                    setNewSize((current) => ({ ...current, stock: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div className="flex items-end">
                <Button type="submit" disabled={isCreatingSize} className="w-full">
                  {isCreatingSize ? "Agregando..." : "Agregar talle"}
                </Button>
              </div>
            </div>

            {newSizeError ? <p className="mt-3 text-sm text-destructive">{newSizeError}</p> : null}
          </form>
        </div>
      </CardContent>
    </Card>
  )
}

export function AdminProductDetailView({
  initialProduct,
  subcategories,
}: {
  initialProduct: AdminProductDetail
  subcategories: AdminSubcategoryOption[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<ProductFormState>(() => toProductForm(initialProduct))
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [newVariant, setNewVariant] = useState<VariantFormState>({
    name: "",
    hex: "",
    sortOrder: String(initialProduct.variants.length),
    active: true,
  })
  const [newVariantError, setNewVariantError] = useState("")
  const [isCreatingVariant, setIsCreatingVariant] = useState(false)

  function toggleHomeSection(section: HomeSection, checked: boolean) {
    setForm((current) => ({
      ...current,
      homeSections: checked
        ? Array.from(new Set([...current.homeSections, section]))
        : current.homeSections.filter((currentSection) => currentSection !== section),
    }))
  }

  function refreshPage() {
    router.refresh()
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setSuccess("")
    setIsSaving(true)

    try {
      const response = await fetch(`/api/admin/products/${initialProduct.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug: form.slug,
          description: form.description,
          subcategoryId: form.subcategoryId,
          gender: form.gender,
          price: Number(form.price),
          active: form.active,
          homeSections: form.homeSections,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar el producto."))
      }

      setSuccess("Los datos generales se guardaron correctamente.")
      refreshPage()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar el producto.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleCreateVariant(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setNewVariantError("")
    setIsCreatingVariant(true)

    try {
      const response = await fetch(`/api/admin/products/${initialProduct.id}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newVariant.name,
          hex: newVariant.hex,
          sortOrder: Number(newVariant.sortOrder),
          active: newVariant.active,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos crear la variante."))
      }

      setNewVariant({
        name: "",
        hex: "",
        sortOrder: String(initialProduct.variants.length + 1),
        active: true,
      })
      refreshPage()
    } catch (err: any) {
      setNewVariantError(err.message ?? "No pudimos crear la variante.")
    } finally {
      setIsCreatingVariant(false)
    }
  }

  return (
    <div className="space-y-6">
      <ProductSummary product={initialProduct} />

      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Datos generales</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleProductSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Nombre</label>
                <input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Slug</label>
                <input
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Descripcion
              </label>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                className={textareaClassName}
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">
                  Subcategoria
                </label>
                <select
                  value={form.subcategoryId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, subcategoryId: event.target.value }))
                  }
                  className={inputClassName}
                >
                  <option value="">Seleccionar subcategoria</option>
                  {subcategories.map((subcategory) => (
                    <option key={subcategory.id} value={subcategory.id}>
                      {subcategory.category.name} / {subcategory.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Precio</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, price: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">
                Genero del producto
              </label>
              <select
                value={form.gender}
                onChange={(event) =>
                  setForm((current) => ({ ...current, gender: event.target.value as Audience }))
                }
                className={inputClassName}
              >
                {AUDIENCE_VALUES.map((audience) => (
                  <option key={audience} value={audience}>
                    {AUDIENCE_LABELS[audience]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/70 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Producto activo</p>
                <p className="text-xs text-muted-foreground">
                  Puedes desactivarlo sin perder variantes, imagenes ni stock.
                </p>
              </div>
              <Switch
                checked={form.active}
                onCheckedChange={(value) => setForm((current) => ({ ...current, active: value }))}
              />
            </div>

            <div className="rounded-lg border border-border/70 px-4 py-4">
              <div>
                <p className="text-sm font-medium text-foreground">Secciones de inicio</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Desde aqui defines si el producto forma parte de Destacados o Ultimos ingresos.
                  El orden se administra aparte desde el modulo Inicio.
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {(["FEATURED", "NEW_ARRIVALS"] as HomeSection[]).map((section) => (
                  <div
                    key={section}
                    className="flex items-center justify-between rounded-lg border border-border/60 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {HOME_SECTION_LABELS[section]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {section === "FEATURED"
                          ? "Se muestra en la seccion Destacados de la home."
                          : "Se muestra en la seccion Ultimos ingresos de la home."}
                      </p>
                    </div>
                    <Switch
                      checked={form.homeSections.includes(section)}
                      onCheckedChange={(checked) => toggleHomeSection(section, checked)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-foreground">{success}</p> : null}

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-3">
          <CardTitle className="text-xl">Variantes</CardTitle>
          <p className="text-sm text-muted-foreground">
            Crea una variante base y luego completa sus imagenes, talles y stock.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {initialProduct.variants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Este producto todavia no tiene variantes cargadas.
            </p>
          ) : (
            <div className="space-y-5">
              {initialProduct.variants.map((variant) => (
                <VariantCard
                  key={variant.id}
                  productId={initialProduct.id}
                  variant={variant}
                  onRefresh={refreshPage}
                />
              ))}
            </div>
          )}

          <form onSubmit={handleCreateVariant} className="rounded-xl border border-dashed p-4">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-foreground">Agregar variante</h3>
              <p className="text-sm text-muted-foreground">
                Primero crea la variante base y despues completa imagenes y talles.
              </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Color / nombre
                </label>
                <input
                  value={newVariant.name}
                  onChange={(event) =>
                    setNewVariant((current) => ({ ...current, name: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="Negro"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Hex</label>
                <input
                  value={newVariant.hex}
                  onChange={(event) =>
                    setNewVariant((current) => ({ ...current, hex: event.target.value }))
                  }
                  className={inputClassName}
                  placeholder="#111111"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newVariant.sortOrder}
                  onChange={(event) =>
                    setNewVariant((current) => ({ ...current, sortOrder: event.target.value }))
                  }
                  className={inputClassName}
                />
              </div>

              <div className="flex items-end">
                <div className="flex w-full items-center justify-between rounded-lg border border-border/70 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">Activa</p>
                    <p className="text-xs text-muted-foreground">Disponible para vender</p>
                  </div>
                  <Switch
                    checked={newVariant.active}
                    onCheckedChange={(value) =>
                      setNewVariant((current) => ({ ...current, active: value }))
                    }
                  />
                </div>
              </div>
            </div>

            {newVariantError ? (
              <p className="mt-4 text-sm text-destructive">{newVariantError}</p>
            ) : null}

            <Button type="submit" className="mt-4" disabled={isCreatingVariant}>
              {isCreatingVariant ? "Creando..." : "Agregar variante"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
