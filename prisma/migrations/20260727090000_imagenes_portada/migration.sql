CREATE TABLE IF NOT EXISTS "imagenes_portada" (
  "id" SERIAL PRIMARY KEY,
  "url" TEXT NOT NULL,
  "href" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS "idx_imagenes_portada_sort"
  ON "imagenes_portada"("sort_order", "id");
