-- Step 10: Normalization of Risk Types in risk_by_req

BEGIN;

-- 1. Ensure all types exist in the catalog
-- We use the max(id) + 1 to continue the sequence if needed, 
-- but since it is smallint we can just let it auto-increment if it was a serial.
-- Check if it has a sequence:
-- SELECT pg_get_serial_sequence('cat_tipo_riesgo', 'id');

INSERT INTO cat_tipo_riesgo (id, codigo, nombre, activo)
SELECT 
    row_number() OVER () + (SELECT COALESCE(MAX(id), 0) FROM cat_tipo_riesgo),
    UPPER(tipo),
    INITCAP(tipo),
    true
FROM (SELECT DISTINCT tipo FROM risk_by_req) sub
WHERE UPPER(tipo) NOT IN (SELECT codigo FROM cat_tipo_riesgo)
  AND INITCAP(tipo) NOT IN (SELECT nombre FROM cat_tipo_riesgo);

-- 2. Add foreign key column to risk_by_req
ALTER TABLE risk_by_req ADD COLUMN IF NOT EXISTS id_tipo_riesgo SMALLINT;

-- 3. Populate id_tipo_riesgo
UPDATE risk_by_req r
SET id_tipo_riesgo = c.id
FROM cat_tipo_riesgo c
WHERE UPPER(r.tipo) = c.codigo OR INITCAP(r.tipo) = c.nombre;

-- 4. Establish Foreign Key
ALTER TABLE risk_by_req 
    ADD CONSTRAINT fk_risk_tipo_riesgo 
    FOREIGN KEY (id_tipo_riesgo) REFERENCES cat_tipo_riesgo(id);

-- 5. Verification
SELECT 
    count(*) as total_risks,
    count(id_tipo_riesgo) as linked_risks,
    (SELECT count(*) FROM risk_by_req WHERE id_tipo_riesgo IS NULL) as orphans
FROM risk_by_req;

COMMIT;
