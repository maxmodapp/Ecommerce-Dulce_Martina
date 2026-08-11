ALTER TABLE "ordenes"
ADD COLUMN "numero_orden" INTEGER;

DO $$
DECLARE
  order_row RECORD;
  candidate INTEGER;
BEGIN
  IF (SELECT COUNT(*) FROM "ordenes") > 900000 THEN
    RAISE EXCEPTION 'No hay suficientes numeros de pedido de seis cifras';
  END IF;

  FOR order_row IN SELECT "id" FROM "ordenes" LOOP
    LOOP
      candidate := 100000 + floor(random() * 900000)::INTEGER;
      EXIT WHEN NOT EXISTS (
        SELECT 1 FROM "ordenes" WHERE "numero_orden" = candidate
      );
    END LOOP;

    UPDATE "ordenes"
    SET "numero_orden" = candidate
    WHERE "id" = order_row."id";
  END LOOP;
END $$;

ALTER TABLE "ordenes"
ALTER COLUMN "numero_orden" SET NOT NULL;

ALTER TABLE "ordenes"
ADD CONSTRAINT "ordenes_numero_orden_key" UNIQUE ("numero_orden"),
ADD CONSTRAINT "ordenes_numero_orden_range" CHECK (
  "numero_orden" BETWEEN 100000 AND 999999
);
