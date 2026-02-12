-- Add extended fields to usuarios table
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS direccion TEXT,
ADD COLUMN IF NOT EXISTS telefono TEXT,
ADD COLUMN IF NOT EXISTS puesto TEXT;

-- Ensure email is unique (already should be, but just in case)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_email_key') THEN
        ALTER TABLE public.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
    END IF;
END $$;
