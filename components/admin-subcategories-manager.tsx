"use client"

import { useMemo, useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import type { AdminCategoryOption, AdminSubcategoryOption, Audience } from "@/lib/types"
import { AUDIENCE_LABELS, AUDIENCE_VALUES } from "@/lib/types"
import { slugify } from "@/lib/utils"

type SubcategoryForm = {
  name: string
  slug: string
  categoryId: string
  audience: Audience
  sortOrder: string
  active: boolean
}

type AudienceFilter = "all" | Audience

const inputClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"

const audienceFilterOptions: Array<{ value: AudienceFilter; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "AMBOS", label: AUDIENCE_LABELS.AMBOS },
  { value: "MUJER", label: AUDIENCE_LABELS.MUJER },
  { value: "HOMBRE", label: AUDIENCE_LABELS.HOMBRE },
]

function compareBySortOrderAndName<
  T extends { name: string; sortOrder?: number }
>(left: T, right: T) {
  const leftOrder = left.sortOrder ?? Number.MAX_SAFE_INTEGER
  const rightOrder = right.sortOrder ?? Number.MAX_SAFE_INTEGER

  if (leftOrder !== rightOrder) return leftOrder - rightOrder
  return left.name.localeCompare(right.name, "es")
}

function toForm(subcategory?: AdminSubcategoryOption): SubcategoryForm {
  return {
    name: subcategory?.name ?? "",
    slug: subcategory?.slug ?? "",
    categoryId: subcategory?.category.id ?? "",
    audience: subcategory?.audience ?? "AMBOS",
    sortOrder: String(subcategory?.sortOrder ?? 0),
    active: subcategory?.active ?? true,
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

function SubcategoryRow({
  categories,
  subcategory,
}: {
  categories: AdminCategoryOption[]
  subcategory: AdminSubcategoryOption
}) {
  const router = useRouter()
  const [form, setForm] = useState<SubcategoryForm>(() => toForm(subcategory))
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  function update<K extends keyof SubcategoryForm>(field: K, value: SubcategoryForm[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsSaving(true)
    const slug = slugify(form.slug || form.name)

    try {
      const response = await fetch(`/api/admin/subcategories/${subcategory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          slug,
          categoryId: form.categoryId,
          audience: form.audience,
          sortOrder: Number(form.sortOrder),
          active: form.active,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos guardar la subcategoria."))
      }

      setForm((current) => ({ ...current, slug }))
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos guardar la subcategoria.")
    } finally {
      setIsSaving(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm("Esta subcategoria se eliminara solo si no tiene productos. Continuar?")) {
      return
    }

    setError("")
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/admin/subcategories/${subcategory.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos eliminar la subcategoria."))
      }

      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos eliminar la subcategoria.")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-border/70 p-4">
      <div className="grid gap-3 lg:grid-cols-3">
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
          <label className="mb-1.5 block text-sm font-medium text-foreground">Categoria padre</label>
          <select
            value={form.categoryId}
            onChange={(event) => update("categoryId", event.target.value)}
            className={inputClassName}
          >
            <option value="">Seleccionar categoria</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_140px_160px]">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">Audiencia</label>
          <select
            value={form.audience}
            onChange={(event) => update("audience", event.target.value as Audience)}
            className={inputClassName}
          >
            {AUDIENCE_VALUES.map((audience) => (
              <option key={audience} value={audience}>
                {AUDIENCE_LABELS[audience]}
              </option>
            ))}
          </select>
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

export function AdminSubcategoriesManager({
  categories,
  initialSubcategories,
}: {
  categories: AdminCategoryOption[]
  initialSubcategories: AdminSubcategoryOption[]
}) {
  const router = useRouter()
  const [newSubcategory, setNewSubcategory] = useState<SubcategoryForm>(() => toForm())
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("all")
  const [error, setError] = useState("")
  const [isCreating, setIsCreating] = useState(false)

  const sortedCategories = useMemo(
    () => categories.slice().sort(compareBySortOrderAndName),
    [categories]
  )

  const groupedSubcategories = useMemo(() => {
    const filteredSubcategories = initialSubcategories.filter((subcategory) => {
      const matchesCategory =
        categoryFilter === "all" || subcategory.category.id === categoryFilter
      const matchesAudience =
        audienceFilter === "all" || subcategory.audience === audienceFilter

      return matchesCategory && matchesAudience
    })

    return sortedCategories.flatMap((category) => {
      const subcategories = filteredSubcategories
        .filter((subcategory) => subcategory.category.id === category.id)
        .slice()
        .sort(compareBySortOrderAndName)

      if (subcategories.length === 0) return []
      return [{ category, subcategories }]
    })
  }, [audienceFilter, categoryFilter, initialSubcategories, sortedCategories])

  function update<K extends keyof SubcategoryForm>(field: K, value: SubcategoryForm[K]) {
    setNewSubcategory((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")
    setIsCreating(true)
    const slug = slugify(newSubcategory.slug || newSubcategory.name)

    try {
      const response = await fetch("/api/admin/subcategories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubcategory.name,
          slug,
          categoryId: newSubcategory.categoryId,
          audience: newSubcategory.audience,
          sortOrder: Number(newSubcategory.sortOrder),
          active: newSubcategory.active,
        }),
      })

      if (!response.ok) {
        throw new Error(await getResponseError(response, "No pudimos crear la subcategoria."))
      }

      setNewSubcategory(toForm())
      router.refresh()
    } catch (err: any) {
      setError(err.message ?? "No pudimos crear la subcategoria.")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Nueva subcategoria</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid gap-3 lg:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Nombre</label>
                <input
                  value={newSubcategory.name}
                  onChange={(event) => update("name", event.target.value)}
                  className={inputClassName}
                  placeholder="Remeras"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Slug opcional
                </label>
                <input
                  value={newSubcategory.slug}
                  onChange={(event) => update("slug", event.target.value)}
                  className={inputClassName}
                  placeholder="Se genera desde el nombre"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Categoria padre
                </label>
                <select
                  value={newSubcategory.categoryId}
                  onChange={(event) => update("categoryId", event.target.value)}
                  className={inputClassName}
                >
                  <option value="">Seleccionar categoria</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-[1fr_140px_160px]">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Audiencia</label>
                <select
                  value={newSubcategory.audience}
                  onChange={(event) => update("audience", event.target.value as Audience)}
                  className={inputClassName}
                >
                  {AUDIENCE_VALUES.map((audience) => (
                    <option key={audience} value={audience}>
                      {AUDIENCE_LABELS[audience]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Orden</label>
                <input
                  type="number"
                  min="0"
                  value={newSubcategory.sortOrder}
                  onChange={(event) => update("sortOrder", event.target.value)}
                  className={inputClassName}
                />
              </div>
              <div className="flex items-end">
                <div className="flex h-10 w-full items-center justify-between rounded-md border border-border/70 px-3">
                  <span className="text-sm text-foreground">Activa</span>
                  <Switch
                    checked={newSubcategory.active}
                    onCheckedChange={(value) => update("active", value)}
                  />
                </div>
              </div>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}

            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creando..." : "Crear subcategoria"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <CardTitle className="text-xl">Subcategorias cargadas</CardTitle>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
              <div>
                <label
                  htmlFor="subcategory-category-filter"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Categoria padre
                </label>
                <select
                  id="subcategory-category-filter"
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  className={inputClassName}
                >
                  <option value="all">Todos</option>
                  {sortedCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="subcategory-audience-filter"
                  className="mb-1.5 block text-sm font-medium text-foreground"
                >
                  Audiencia
                </label>
                <select
                  id="subcategory-audience-filter"
                  value={audienceFilter}
                  onChange={(event) => setAudienceFilter(event.target.value as AudienceFilter)}
                  className={inputClassName}
                >
                  {audienceFilterOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {initialSubcategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavia no hay subcategorias cargadas.</p>
          ) : groupedSubcategories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No encontramos subcategorias con esos filtros.
            </p>
          ) : (
            groupedSubcategories.map((group) => (
              <section key={group.category.id} className="space-y-3">
                <div className="rounded-md bg-secondary/40 px-3 py-2">
                  <h3 className="text-sm font-semibold text-foreground">{group.category.name}</h3>
                </div>
                {group.subcategories.map((subcategory) => (
                  <SubcategoryRow
                    key={subcategory.id}
                    categories={categories}
                    subcategory={subcategory}
                  />
                ))}
              </section>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}
