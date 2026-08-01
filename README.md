# Dulce Martina

E-commerce desarrollado con Next.js, Prisma, PostgreSQL y Cloudinary.

## Requisitos

- Node.js
- npm
- PostgreSQL
- Cuenta de Cloudinary

## Configuracion local

1. Instalar dependencias:

```bash
npm install
```

2. Copiar las variables de entorno:

```bash
cp .env.example .env
```

3. Completar `.env` con los datos reales:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
AUTH_SECRET="cambiar-por-un-secreto-largo-y-seguro"
CLOUDINARY_URL="cloudinary://API_KEY:API_SECRET@CLOUD_NAME"
```

4. Aplicar migraciones y generar Prisma Client:

```bash
npx prisma migrate dev
npx prisma generate
```

5. Levantar el proyecto:

```bash
npm run dev
```

## Produccion

En produccion configurar las mismas variables de entorno en el hosting y aplicar migraciones con:

```bash
npx prisma migrate deploy
npx prisma generate
```

Antes de publicar conviene validar:

```bash
npx prisma validate
npx tsc --noEmit --incremental false
npm run build
```
