-- Create Roles table
CREATE TABLE IF NOT EXISTS public.roles (
    id_rol SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default roles
INSERT INTO public.roles (nombre, descripcion) VALUES 
('Administrador', 'Acceso total al sistema y gestión de usuarios'),
('Auditor Senior', 'Capacidad de realizar auditorías y revisar reportes'),
('Auditor Junior', 'Acceso a evaluación de controles y requerimientos'),
('Operador', 'Acceso de solo lectura para seguimiento')
ON CONFLICT (nombre) DO NOTHING;

-- Create Users table
CREATE TABLE IF NOT EXISTS public.usuarios (
    id_usuario UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    id_rol INTEGER REFERENCES public.roles(id_rol),
    id_empresa BIGINT REFERENCES public.empresa(id),
    password_hash TEXT, -- Preparado para auth futura
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_login TIMESTAMP WITH TIME ZONE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON public.usuarios(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_empresa ON public.usuarios(id_empresa);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);
