ALTER TABLE "categorias"
ADD COLUMN IF NOT EXISTS "image_url" TEXT,
ADD COLUMN IF NOT EXISTS "image_public_id" TEXT;
