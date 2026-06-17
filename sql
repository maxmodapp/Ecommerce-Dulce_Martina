-- =========================
-- 1) CATEGORIA
-- =========================
create table if not exists categoria (
  id      bigint generated always as identity primary key,
  nombre  text not null,
  slug    text not null unique
);

-- =========================
-- 2) PRODUCTOS
-- =========================
create table if not exists productos (
  id           bigint generated always as identity primary key,
  nombre       text not null,
  slug         text not null unique,
  descripcion  text,
  categoria_id bigint references categoria(id) on delete set null,
  precio       int not null, -- en centavos recomendado (ej: 12990*100)
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  update_at    timestamptz not null default now()
);

create index if not exists idx_productos_categoria on productos(categoria_id);

-- =========================
-- 3) VARIANTES (COLOR)
-- =========================
create table if not exists variantes (
  id          bigint generated always as identity primary key,
  product_id  bigint not null references productos(id) on delete cascade,
  nombre_color text not null,
  color_hex   text,
  active      boolean not null default true,
  constraint uq_variantes_producto_color unique (product_id, nombre_color)
);

create index if not exists idx_variantes_producto on variantes(product_id);

-- =========================
-- 4) VARIANTE_IMAGENES (IMAGENES POR COLOR)
-- =========================
create table if not exists variante_imagenes (
  id         bigint generated always as identity primary key,
  variant_id bigint not null references variantes(id) on delete cascade,
  url        text not null,
  alt        text,
  sort_order int not null default 0
);

create index if not exists idx_variante_imagenes_variant on variante_imagenes(variant_id);

-- =========================
-- 5) VARIANTE_TALLES (SKU = color + talle)
-- =========================
create table if not exists variante_talles (
  id         bigint generated always as identity primary key,
  variant_id bigint not null references variantes(id) on delete cascade,
  talle      text not null,
  stock      int not null default 0,
  constraint uq_variante_talles unique (variant_id, talle)
);

create index if not exists idx_variante_talles_variant on variante_talles(variant_id);

-- =========================
-- 6) USUARIOS
-- =========================
create table if not exists usuarios (
  id            bigint generated always as identity primary key,
  email         text not null unique,
  password_hash text not null,
  role          text not null default 'CUSTOMER', -- ADMIN / CUSTOMER
  name          text not null,
  phone         text not null,
  direccion     text,
  created_at    timestamptz not null default now()
);

-- =========================
-- 7) ORDENES
-- =========================
create table if not exists ordenes (
  id              bigint generated always as identity primary key,
  user_id         bigint references usuarios(id) on delete set null,

  customer_name   text not null,
  customer_phone  text not null,
  customer_email  text not null, -- como pediste: obligatorio

  delivery_method text not null, -- DELIVERY / PICKUP
  shipping_address text,         -- nullable si retiro

  status          text not null default 'PENDING',  -- PENDING / CONFIRMED / READY / SHIPPED / DELIVERED / CANCELLED
  payment_method  text not null default 'TRANSFER', -- TRANSFER / CASH (y futuro MP/CARD si querés)

  total           int not null default 0, -- en centavos
  created_at      timestamptz not null default now()
);

create index if not exists idx_ordenes_user on ordenes(user_id);
create index if not exists idx_ordenes_status on ordenes(status);

-- =========================
-- 8) ORDEN_PRODUCTOS (items de la orden)
-- =========================
create table if not exists orden_productos (
  id                    bigint generated always as identity primary key,
  order_id              bigint not null references ordenes(id) on delete cascade,

  product_variant_size_id bigint not null references variante_talles(id),
  cantidad              int not null,
  precio_unidad         int not null, -- snapshot del precio al comprar

  created_at            timestamptz not null default now()
);

create index if not exists idx_orden_productos_order on orden_productos(order_id);
create index if not exists idx_orden_productos_sku on orden_productos(product_variant_size_id);