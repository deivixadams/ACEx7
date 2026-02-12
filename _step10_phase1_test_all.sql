-- Step 10: Phase 1 - test_all Shadow Columns and Mapping

BEGIN;

-- 1. Add shadow columns
ALTER TABLE test_all ADD COLUMN IF NOT EXISTS id_tipo_prueba_uuid UUID;
ALTER TABLE test_all ADD COLUMN IF NOT EXISTS id_clasificacion_uuid UUID;
ALTER TABLE test_all ADD COLUMN IF NOT EXISTS id_trigger_uuid UUID;
ALTER TABLE test_all ADD COLUMN IF NOT EXISTS id_recurrencia_uuid UUID;

-- 2. Populate columns via joins

-- Map Tipo Prueba
UPDATE test_all t 
SET id_tipo_prueba_uuid = c.id_tipo_prueba 
FROM test_type c 
WHERE t.id_tipo_prueba = c.codigo;

-- Map Clasificacion (Checks both legacy_id and codigo)
UPDATE test_all t 
SET id_clasificacion_uuid = c.id 
FROM test_classifier c 
WHERE t.id_clasificacion = c.legacy_id OR t.id_clasificacion = c.codigo;

-- Map Trigger
UPDATE test_all t 
SET id_trigger_uuid = c.id_trigger 
FROM test_trigger c 
WHERE t.id_trigger = c.codigo;

-- Map Recurrencia (Frequency)
UPDATE test_all t 
SET id_recurrencia_uuid = c.id_frecuency 
FROM test_frecuency c 
WHERE t.id_recurrencia = c.id_recurrencia;

-- 3. Verification Check
SELECT 
    (SELECT count(*) FROM test_all WHERE id_tipo_prueba_uuid IS NULL) as orphans_type,
    (SELECT count(*) FROM test_all WHERE id_clasificacion_uuid IS NULL) as orphans_class,
    (SELECT count(*) FROM test_all WHERE id_trigger_uuid IS NULL) as orphans_trigger,
    (SELECT count(*) FROM test_all WHERE id_recurrencia_uuid IS NULL AND id_recurrencia IS NOT NULL AND id_recurrencia <> '') as orphans_freq;

COMMIT;
