ALTER TABLE "imagenes_portada"
  ADD COLUMN IF NOT EXISTS "desktop_url" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile_url" TEXT,
  ADD COLUMN IF NOT EXISTS "desktop_public_id" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile_public_id" TEXT;

UPDATE "imagenes_portada"
SET
  "desktop_url" = COALESCE("desktop_url", "url"),
  "mobile_url" = COALESCE("mobile_url", "url"),
  "desktop_public_id" = COALESCE("desktop_public_id", "public_id"),
  "mobile_public_id" = COALESCE("mobile_public_id", "public_id");

ALTER TABLE "imagenes_portada"
  ALTER COLUMN "desktop_url" SET NOT NULL,
  ALTER COLUMN "mobile_url" SET NOT NULL;

ALTER TABLE "imagenes_portada"
  DROP COLUMN IF EXISTS "url",
  DROP COLUMN IF EXISTS "public_id";
