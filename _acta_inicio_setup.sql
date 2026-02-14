
-- 1. Catálogo de Alcances
CREATE TABLE IF NOT EXISTS public.cat_alcance_auditoria (
    id_alcance SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT true
);

INSERT INTO public.cat_alcance_auditoria (nombre) VALUES 
('GOBIERNO CORPORATIVO'), 
('GESTION DE RIESGOS'), 
('DEBIDA DILIGENCIA (KYC/CDD)'), 
('MONITOREO DE TRANSACCIONES'), 
('FILTRADO DE LISTAS (SCREENING)'), 
('REPORTES DE OPERACIONES (ROS/STR)'), 
('CONSERVACION DE DOCUMENTOS'), 
('CAPACITACION'), 
('OTRO')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Tabla Principal de Acta de Inicio
CREATE TABLE IF NOT EXISTS public.acta_auditoria (
    id_acta UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_auditoria UUID NOT NULL REFERENCES public.auditoria(id) ON DELETE CASCADE,
    numero_acta TEXT NOT NULL UNIQUE,
    id_empresa BIGINT REFERENCES public.empresa(id),
    unidades_incluidas TEXT,
    periodo_inicio DATE,
    periodo_fin DATE,
    fecha_inicio_auditoria DATE,
    tipo_auditoria TEXT CHECK (tipo_auditoria IN ('INTERNA', 'EXTERNA', 'INDEPENDIENTE', 'BASADA_EN_RIESGO', 'OTRA')),
    tipo_auditoria_otro TEXT,
    objetivo TEXT,
    alcance_excluye TEXT,
    alcance_otro_detalle TEXT,
    enfoque TEXT CHECK (enfoque IN ('BASADO_EN_RIESGO', 'CUMPLIMIENTO_INTEGRAL', 'MIXTO')),
    tecnicas JSONB, -- Almacena array de técnicas seleccionadas
    criterios_criticidad TEXT,
    lider_auditor_id UUID REFERENCES public.usuarios(id_usuario),
    especialistas TEXT,
    cronograma JSONB, -- Almacena hitos y fechas
    punto_contacto_nombre TEXT,
    punto_contacto_cargo TEXT,
    frecuencia_reuniones TEXT CHECK (frecuencia_reuniones IN ('SEMANAL', 'QUINCENAL', 'MENSUAL', 'AD_HOC')),
    notas_comunicacion TEXT,
    declaracion_inicio TEXT,
    representante_entidad_nombre TEXT,
    representante_entidad_cargo TEXT,
    fecha_firma DATE,
    estado TEXT DEFAULT 'BORRADOR' CHECK (estado IN ('BORRADOR', 'EMITIDA', 'ANULADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by_id UUID REFERENCES public.usuarios(id_usuario)
);

-- 3. Relación Muchos a Muchos: Acta <-> Auditores (Equipo)
CREATE TABLE IF NOT EXISTS public.acta_auditores_link (
    id_acta UUID REFERENCES public.acta_auditoria(id_acta) ON DELETE CASCADE,
    id_usuario UUID REFERENCES public.usuarios(id_usuario) ON DELETE CASCADE,
    PRIMARY KEY (id_acta, id_usuario)
);

-- 4. Relación Muchos a Muchos: Acta <-> Alcances Seleccionados
CREATE TABLE IF NOT EXISTS public.acta_alcances_link (
    id_acta UUID REFERENCES public.acta_auditoria(id_acta) ON DELETE CASCADE,
    id_alcance INTEGER REFERENCES public.cat_alcance_auditoria(id_alcance) ON DELETE CASCADE,
    PRIMARY KEY (id_acta, id_alcance)
);

-- Indexación
CREATE INDEX IF NOT EXISTS idx_acta_auditoria_ref ON public.acta_auditoria(id_auditoria);
CREATE INDEX IF NOT EXISTS idx_acta_empresa ON public.acta_auditoria(id_empresa);
