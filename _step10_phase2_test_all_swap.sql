-- Step 10: Phase 2 - test_all Column Swap and FK Restoration

BEGIN;

-- 1. Drop existing Foreign Keys (Text-based)
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_type;
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_classifier;
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_trigger;
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_recurrencia;

-- 2. Rename columns to keep legacy data temporarily
ALTER TABLE test_all RENAME COLUMN id_tipo_prueba TO id_tipo_prueba_text;
ALTER TABLE test_all RENAME COLUMN id_clasificacion TO id_clasificacion_text;
ALTER TABLE test_all RENAME COLUMN id_trigger TO id_trigger_text;
ALTER TABLE test_all RENAME COLUMN id_recurrencia TO id_recurrencia_text;

-- 3. Promote shadow columns to official names
ALTER TABLE test_all RENAME COLUMN id_tipo_prueba_uuid TO id_tipo_prueba;
ALTER TABLE test_all RENAME COLUMN id_clasificacion_uuid TO id_clasificacion;
ALTER TABLE test_all RENAME COLUMN id_trigger_uuid TO id_trigger;
ALTER TABLE test_all RENAME COLUMN id_recurrencia_uuid TO id_recurrencia;

-- 4. Restore Foreign Keys (UUID-based)
ALTER TABLE test_all 
    ADD CONSTRAINT fk_test_all_type 
    FOREIGN KEY (id_tipo_prueba) REFERENCES test_type(id_tipo_prueba);

ALTER TABLE test_all 
    ADD CONSTRAINT fk_test_all_classifier 
    FOREIGN KEY (id_clasificacion) REFERENCES test_classifier(id);

ALTER TABLE test_all 
    ADD CONSTRAINT fk_test_all_trigger 
    FOREIGN KEY (id_trigger) REFERENCES test_trigger(id_trigger);

ALTER TABLE test_all 
    ADD CONSTRAINT fk_test_all_recurrencia 
    FOREIGN KEY (id_recurrencia) REFERENCES test_frecuency(id_frecuency);

-- 5. Cleanup legacy columns
ALTER TABLE test_all DROP COLUMN id_tipo_prueba_text;
ALTER TABLE test_all DROP COLUMN id_clasificacion_text;
ALTER TABLE test_all DROP COLUMN id_trigger_text;
ALTER TABLE test_all DROP COLUMN id_recurrencia_text;

COMMIT;
