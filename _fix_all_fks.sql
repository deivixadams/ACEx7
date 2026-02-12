-- Step 2: Final Resolution of 8 Missing Foreign Keys

-- 1. module.id_dominio -> domain.id_dominio (DIRECT UUID)
ALTER TABLE module DROP CONSTRAINT IF EXISTS fk_module_domain;
ALTER TABLE module ADD CONSTRAINT fk_module_domain FOREIGN KEY (id_dominio) REFERENCES domain(id_dominio);

-- 2. Corregir duplicados en test_frecuency para permitir UNIQUE y FK
UPDATE test_frecuency SET id_recurrencia = 'RCR-06' WHERE codigo = 'SEMESTRAL' AND id_recurrencia = 'RCR-05';
ALTER TABLE test_frecuency DROP CONSTRAINT IF EXISTS uq_test_frecuency_id_recurrencia;
ALTER TABLE test_frecuency ADD CONSTRAINT uq_test_frecuency_id_recurrencia UNIQUE (id_recurrencia);

-- 3. test_all -> test_frecuency (TEXT to TEXT link)
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_recurrencia;
ALTER TABLE test_all ADD CONSTRAINT fk_test_all_recurrencia FOREIGN KEY (id_recurrencia) REFERENCES test_frecuency(id_recurrencia);

-- 4. test_all.id_schedule -> test_schedule.id_schedule (DIRECT UUID)
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_schedule;
ALTER TABLE test_all ADD CONSTRAINT fk_test_all_schedule FOREIGN KEY (id_schedule) REFERENCES test_schedule(id_schedule);

-- 5. test_req_map.requerimiento_id -> requirements.id_requerimiento (DIRECT UUID)
ALTER TABLE test_req_map DROP CONSTRAINT IF EXISTS fk_test_req_map_req;
ALTER TABLE test_req_map ADD CONSTRAINT fk_test_req_map_req FOREIGN KEY (requerimiento_id) REFERENCES requirements(id_requerimiento);

-- 6. test_control_map.id_control -> controls.id_control (DIRECT TEXT)
ALTER TABLE test_control_map DROP CONSTRAINT IF EXISTS fk_test_control_map_control;
ALTER TABLE test_control_map ADD CONSTRAINT fk_test_control_map_control FOREIGN KEY (id_control) REFERENCES controls(id_control);

-- 7. Normalización de test_all (id_tipo_prueba, id_clasificacion, id_trigger) de TEXT a UUID
-- Primero preparamos las FKs contra los códigos/legacy_id que ya existen
ALTER TABLE test_type DROP CONSTRAINT IF EXISTS uq_test_type_codigo;
ALTER TABLE test_type ADD CONSTRAINT uq_test_type_codigo UNIQUE (codigo);

ALTER TABLE test_classifier DROP CONSTRAINT IF EXISTS uq_test_classifier_legacy_id;
ALTER TABLE test_classifier ADD CONSTRAINT uq_test_classifier_legacy_id UNIQUE (legacy_id);

ALTER TABLE test_trigger DROP CONSTRAINT IF EXISTS uq_test_trigger_codigo;
ALTER TABLE test_trigger ADD CONSTRAINT uq_test_trigger_codigo UNIQUE (codigo);

-- Mapeo de códigos legacy a los nuevos códigos de las tablas catálogo en test_all
UPDATE test_all SET id_tipo_prueba = 'MANUAL' WHERE id_tipo_prueba = 'TPR-01';
UPDATE test_all SET id_tipo_prueba = 'AUTOMATIZADA' WHERE id_tipo_prueba = 'TPR-02';
UPDATE test_all SET id_tipo_prueba = 'MIXTA' WHERE id_tipo_prueba = 'TPR-03';

UPDATE test_all SET id_trigger = 'RECURRENTE' WHERE id_trigger = 'TRG-01';
UPDATE test_all SET id_trigger = 'EVENTO' WHERE id_trigger = 'TRG-02';
UPDATE test_all SET id_trigger = 'ADHOC' WHERE id_trigger = 'TRG-03';

-- Ahora agregamos las FKs (uniendo el texto actual con el unique codigo/legacy_id de las otras tablas)
ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_type;
ALTER TABLE test_all ADD CONSTRAINT fk_test_all_type FOREIGN KEY (id_tipo_prueba) REFERENCES test_type(codigo);

ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_classifier;
ALTER TABLE test_all ADD CONSTRAINT fk_test_all_classifier FOREIGN KEY (id_clasificacion) REFERENCES test_classifier(legacy_id);

ALTER TABLE test_all DROP CONSTRAINT IF EXISTS fk_test_all_trigger;
ALTER TABLE test_all ADD CONSTRAINT fk_test_all_trigger FOREIGN KEY (id_trigger) REFERENCES test_trigger(codigo);
