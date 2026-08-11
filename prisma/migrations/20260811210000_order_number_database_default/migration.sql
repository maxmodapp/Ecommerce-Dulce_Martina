CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS INTEGER
LANGUAGE plpgsql
VOLATILE
AS $$
DECLARE
  candidate INTEGER;
BEGIN
  -- Serialize number allocation across old and new application versions.
  PERFORM pg_advisory_xact_lock(684237);

  LOOP
    candidate := 100000 + floor(random() * 900000)::INTEGER;
    EXIT WHEN NOT EXISTS (
      SELECT 1 FROM "ordenes" WHERE "numero_orden" = candidate
    );
  END LOOP;

  RETURN candidate;
END;
$$;

ALTER TABLE "ordenes"
ALTER COLUMN "numero_orden" SET DEFAULT generate_order_number();
