CREATE TABLE IF NOT EXISTS "categorias" (
  "id" BIGSERIAL,
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL,

  CONSTRAINT "categoria_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "categoria_slug_key" UNIQUE ("slug")
);

CREATE TABLE IF NOT EXISTS "productos" (
  "id" BIGSERIAL PRIMARY KEY,
  "nombre" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "descripcion" TEXT,
  "categoria_id" BIGINT,
  "precio" INTEGER NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "update_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "productos_categoria_id_fkey"
    FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_productos_categoria"
  ON "productos"("categoria_id");

CREATE TABLE IF NOT EXISTS "usuarios" (
  "id" BIGSERIAL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password_hash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "direccion" TEXT,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "variantes" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "nombre_color" TEXT NOT NULL,
  "color_hex" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "uq_variantes_producto_color" UNIQUE ("product_id", "nombre_color"),
  CONSTRAINT "variantes_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "productos"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_variantes_producto"
  ON "variantes"("product_id");
CREATE INDEX IF NOT EXISTS "idx_variantes_producto_sort"
  ON "variantes"("product_id", "sort_order", "id");

CREATE TABLE IF NOT EXISTS "variante_imagenes" (
  "id" BIGSERIAL PRIMARY KEY,
  "variant_id" BIGINT NOT NULL,
  "url" TEXT NOT NULL,
  "public_id" TEXT,
  "alt" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "variante_imagenes_variant_id_fkey"
    FOREIGN KEY ("variant_id") REFERENCES "variantes"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_variante_imagenes_variant"
  ON "variante_imagenes"("variant_id");

CREATE TABLE IF NOT EXISTS "variante_talles" (
  "id" BIGSERIAL PRIMARY KEY,
  "variant_id" BIGINT NOT NULL,
  "talle" TEXT NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,

  CONSTRAINT "uq_variante_talles" UNIQUE ("variant_id", "talle"),
  CONSTRAINT "variante_talles_variant_id_fkey"
    FOREIGN KEY ("variant_id") REFERENCES "variantes"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_variante_talles_variant"
  ON "variante_talles"("variant_id");

CREATE TABLE IF NOT EXISTS "ordenes" (
  "id" BIGSERIAL PRIMARY KEY,
  "user_id" BIGINT,
  "customer_name" TEXT NOT NULL,
  "customer_phone" TEXT NOT NULL,
  "customer_email" TEXT NOT NULL,
  "delivery_method" TEXT NOT NULL,
  "shipping_address" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "payment_method" TEXT NOT NULL DEFAULT 'TRANSFER',
  "total" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "ordenes_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "usuarios"("id")
    ON DELETE SET NULL ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_ordenes_status"
  ON "ordenes"("status");
CREATE INDEX IF NOT EXISTS "idx_ordenes_user"
  ON "ordenes"("user_id");

CREATE TABLE IF NOT EXISTS "orden_productos" (
  "id" BIGSERIAL PRIMARY KEY,
  "order_id" BIGINT NOT NULL,
  "product_variant_size_id" BIGINT NOT NULL,
  "cantidad" INTEGER NOT NULL,
  "precio_unidad" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "orden_productos_order_id_fkey"
    FOREIGN KEY ("order_id") REFERENCES "ordenes"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "orden_productos_product_variant_size_id_fkey"
    FOREIGN KEY ("product_variant_size_id") REFERENCES "variante_talles"("id")
    ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE INDEX IF NOT EXISTS "idx_orden_productos_order"
  ON "orden_productos"("order_id");
CREATE INDEX IF NOT EXISTS "idx_orden_productos_sku"
  ON "orden_productos"("product_variant_size_id");

CREATE TABLE IF NOT EXISTS "home_product_sections" (
  "id" BIGSERIAL PRIMARY KEY,
  "product_id" BIGINT NOT NULL,
  "section" TEXT NOT NULL,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),

  CONSTRAINT "home_product_sections_product_id_fkey"
    FOREIGN KEY ("product_id") REFERENCES "productos"("id")
    ON DELETE CASCADE ON UPDATE NO ACTION,
  CONSTRAINT "uq_home_product_sections_product_section"
    UNIQUE ("product_id", "section")
);

CREATE INDEX IF NOT EXISTS "idx_home_product_sections_product"
  ON "home_product_sections"("product_id");
CREATE INDEX IF NOT EXISTS "idx_home_product_sections_section_sort"
  ON "home_product_sections"("section", "sort_order", "id");
