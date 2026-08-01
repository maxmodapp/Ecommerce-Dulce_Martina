DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'audiencia') THEN
    CREATE TYPE "audiencia" AS ENUM ('HOMBRE', 'MUJER', 'AMBOS');
  END IF;
END $$;

ALTER TABLE "categorias"
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "subcategorias" (
  "id" BIGSERIAL PRIMARY KEY,
  "categoria_id" BIGINT NOT NULL,
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "audiencia" "audiencia" NOT NULL DEFAULT 'AMBOS',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "subcategorias_categoria_id_fkey"
    FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE UNIQUE INDEX IF NOT EXISTS "uq_subcategorias_categoria_slug"
  ON "subcategorias"("categoria_id", "slug");
CREATE INDEX IF NOT EXISTS "idx_subcategorias_categoria"
  ON "subcategorias"("categoria_id");
CREATE INDEX IF NOT EXISTS "idx_subcategorias_active_sort"
  ON "subcategorias"("active", "sort_order", "id");
CREATE INDEX IF NOT EXISTS "idx_subcategorias_audiencia"
  ON "subcategorias"("audiencia");
CREATE INDEX IF NOT EXISTS "idx_categorias_active_sort"
  ON "categorias"("active", "sort_order", "id");

INSERT INTO "categorias" ("nombre", "slug", "active", "sort_order")
SELECT 'Sin categoria', 'sin-categoria', true, 9999
WHERE EXISTS (SELECT 1 FROM "productos" WHERE "categoria_id" IS NULL)
  AND NOT EXISTS (SELECT 1 FROM "categorias" WHERE "slug" = 'sin-categoria');

INSERT INTO "subcategorias" ("categoria_id", "nombre", "slug", "audiencia", "active", "sort_order")
SELECT c."id", 'General', 'general', 'AMBOS', true, 0
FROM "categorias" c
WHERE NOT EXISTS (
  SELECT 1
  FROM "subcategorias" s
  WHERE s."categoria_id" = c."id" AND s."slug" = 'general'
);

ALTER TABLE "productos"
  ADD COLUMN IF NOT EXISTS "subcategoria_id" BIGINT,
  ADD COLUMN IF NOT EXISTS "genero" "audiencia" NOT NULL DEFAULT 'AMBOS';

UPDATE "productos" p
SET "subcategoria_id" = s."id"
FROM "subcategorias" s
WHERE p."categoria_id" IS NOT NULL
  AND s."categoria_id" = p."categoria_id"
  AND s."slug" = 'general'
  AND p."subcategoria_id" IS NULL;

UPDATE "productos" p
SET "subcategoria_id" = s."id"
FROM "categorias" c
JOIN "subcategorias" s ON s."categoria_id" = c."id" AND s."slug" = 'general'
WHERE p."categoria_id" IS NULL
  AND c."slug" = 'sin-categoria'
  AND p."subcategoria_id" IS NULL;

ALTER TABLE "productos"
  ALTER COLUMN "subcategoria_id" SET NOT NULL;

ALTER TABLE "productos"
  ADD CONSTRAINT "productos_subcategoria_id_fkey"
  FOREIGN KEY ("subcategoria_id") REFERENCES "subcategorias"("id")
  ON UPDATE NO ACTION;

CREATE INDEX IF NOT EXISTS "idx_productos_subcategoria"
  ON "productos"("subcategoria_id");
CREATE INDEX IF NOT EXISTS "idx_productos_genero"
  ON "productos"("genero");

ALTER TABLE "productos" DROP CONSTRAINT IF EXISTS "productos_categoria_id_fkey";
DROP INDEX IF EXISTS "idx_productos_categoria";
ALTER TABLE "productos" DROP COLUMN IF EXISTS "categoria_id";
