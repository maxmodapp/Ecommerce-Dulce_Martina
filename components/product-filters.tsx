"use client"

import { useCallback } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { CATEGORY_LABELS, type Category } from "@/lib/types"

const ALL_SIZES = ["S", "M", "L", "XL"]

interface ProductFiltersProps {
  search: string
  onSearchChange: (v: string) => void
  category: string
  onCategoryChange: (v: string) => void
  sort: string
  onSortChange: (v: string) => void
  selectedSizes: string[]
  onSizesChange: (v: string[]) => void
  resultCount: number
  hideCategory?: boolean
}

export function ProductFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  sort,
  onSortChange,
  selectedSizes,
  onSizesChange,
  resultCount,
  hideCategory = false,
}: ProductFiltersProps) {
  const toggleSize = useCallback(
    (size: string) => {
      if (selectedSizes.includes(size)) {
        onSizesChange(selectedSizes.filter((s) => s !== size))
      } else {
        onSizesChange([...selectedSizes, size])
      }
    },
    [selectedSizes, onSizesChange]
  )

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: search + sort + count */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-card border-border text-foreground placeholder:text-muted-foreground"
          />
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Limpiar busqueda"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        {!hideCategory && (
          <Select value={category} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-40 bg-card border-border text-foreground">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="bg-card border-border">
              <SelectItem value="all">Todas</SelectItem>
              {(Object.keys(CATEGORY_LABELS) as Category[]).map((key) => (
                <SelectItem key={key} value={key}>
                  {CATEGORY_LABELS[key]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sort} onValueChange={onSortChange}>
          <SelectTrigger className="w-44 bg-card border-border text-foreground">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent className="bg-card border-border">
            <SelectItem value="newest">Mas nuevos</SelectItem>
            <SelectItem value="price-asc">Menor precio</SelectItem>
            <SelectItem value="price-desc">Mayor precio</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {resultCount} {resultCount === 1 ? "resultado" : "resultados"}
        </span>
      </div>

      {/* Size chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">Talles:</span>
        {ALL_SIZES.map((size) => (
          <button
            key={size}
            onClick={() => toggleSize(size)}
            className="focus:outline-none focus:ring-2 focus:ring-ring rounded-md"
          >
            <Badge
              variant={selectedSizes.includes(size) ? "default" : "outline"}
              className={
                selectedSizes.includes(size)
                  ? "bg-primary text-primary-foreground cursor-pointer"
                  : "border-border text-foreground cursor-pointer hover:bg-secondary"
              }
            >
              {size}
            </Badge>
          </button>
        ))}
        {selectedSizes.length > 0 && (
          <button
            onClick={() => onSizesChange([])}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  )
}
