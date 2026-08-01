import type { CatalogMenuCategory, MenuAudienceFilter } from "@/lib/types"

function subcategoryMatchesAudience(
  subcategory: CatalogMenuCategory["subcategories"][number],
  filter: MenuAudienceFilter
) {
  if (filter === "all") return true
  return subcategory.audience === filter || subcategory.audience === "AMBOS"
}

function productMatchesAudience(gender: string, filter: MenuAudienceFilter) {
  if (filter === "all") return true
  return gender === filter || gender === "AMBOS"
}

function subcategoryHasVisibleProducts(
  subcategory: CatalogMenuCategory["subcategories"][number],
  filter: MenuAudienceFilter
) {
  const genders = subcategory.activeProductGenders ?? []

  if (filter === "all") {
    return (subcategory.activeProductCount ?? genders.length) > 0
  }

  return genders.some((gender) => productMatchesAudience(gender, filter))
}

function shouldShowGeneralSubcategory(
  category: CatalogMenuCategory,
  generalSubcategory: CatalogMenuCategory["subcategories"][number],
  filter: MenuAudienceFilter
) {
  const hasProducts = subcategoryHasVisibleProducts(generalSubcategory, filter)
  const hasRealSubcategories = category.subcategories.some(
    (subcategory) => subcategory.slug !== "general"
  )

  return hasProducts && hasRealSubcategories
}

export function getVisibleCatalogMenu(
  catalogMenu: CatalogMenuCategory[],
  filter: MenuAudienceFilter
) {
  return catalogMenu.flatMap((category) => {
    const subcategories = category.subcategories.filter((subcategory) => {
      if (!subcategoryMatchesAudience(subcategory, filter)) return false

      if (subcategory.slug !== "general") {
        return true
      }

      return shouldShowGeneralSubcategory(category, subcategory, filter)
    })

    if (subcategories.length === 0 && !categoryHasOnlyHiddenGeneral(category, filter)) {
      return []
    }

    return [{ ...category, subcategories }]
  })
}

function categoryHasOnlyHiddenGeneral(category: CatalogMenuCategory, filter: MenuAudienceFilter) {
  const generalSubcategory = category.subcategories.find(
    (subcategory) => subcategory.slug === "general"
  )

  if (!generalSubcategory) return false
  if (!subcategoryMatchesAudience(generalSubcategory, filter)) return false
  if (!subcategoryHasVisibleProducts(generalSubcategory, filter)) return false

  return category.subcategories.every((subcategory) => subcategory.slug === "general")
}
