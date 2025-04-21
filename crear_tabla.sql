-- Crear tabla para licencias de Microsoft (ejecución directa en Supabase)

-- Habilitar uuid-ossp para generar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Crear la tabla de licencias
CREATE TABLE IF NOT EXISTS public.ms_licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  license_type TEXT NOT NULL,
  username TEXT,
  assignee TEXT,
  renewal_date DATE,
  monthly_cost NUMERIC(10, 2) DEFAULT 0,
  status TEXT DEFAULT 'Pendiente',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Añadir comentario a la tabla
COMMENT ON TABLE public.ms_licenses IS 'Tabla para almacenar información de licencias de Microsoft';

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_ms_licenses_license_type ON public.ms_licenses(license_type);
CREATE INDEX IF NOT EXISTS idx_ms_licenses_status ON public.ms_licenses(status);
CREATE INDEX IF NOT EXISTS idx_ms_licenses_username ON public.ms_licenses(username);
CREATE INDEX IF NOT EXISTS idx_ms_licenses_assignee ON public.ms_licenses(assignee);

-- Crear trigger para actualizar el timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ms_licenses_timestamp
BEFORE UPDATE ON public.ms_licenses
FOR EACH ROW
EXECUTE FUNCTION update_timestamp();

-- Habilitar Row Level Security
ALTER TABLE public.ms_licenses ENABLE ROW LEVEL SECURITY;

-- Crear políticas de acceso
CREATE POLICY "Permitir acceso a todos los usuarios"
ON public.ms_licenses
FOR ALL
USING (true);

-- Habilitar realtime para esta tabla
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ms_licenses;

-- Insertar datos de ejemplo
INSERT INTO public.ms_licenses (license_type, username, assignee, renewal_date, monthly_cost, status, notes)
VALUES 
  ('Office 365 Business Standard', 'usuario1@empresa.com', 'Juan Pérez', CURRENT_DATE + INTERVAL '8 months', 12.50, 'Activa', 'Licencia para departamento de ventas'),
  ('Microsoft 365 E3', 'usuario2@empresa.com', 'Ana Gómez', CURRENT_DATE + INTERVAL '5 months', 32.00, 'Activa', 'Gerencia de operaciones'),
  ('Office 365 Business Basic', 'usuario3@empresa.com', 'Carlos Rodríguez', CURRENT_DATE + INTERVAL '10 months', 6.00, 'Activa', 'Departamento de soporte'),
  ('Office 365 Business Premium', 'usuario4@empresa.com', 'María García', CURRENT_DATE + INTERVAL '7 months', 22.00, 'Inactiva', 'Departamento de marketing'),
  ('Microsoft 365 E5', NULL, NULL, CURRENT_DATE + INTERVAL '3 months', 57.00, 'Pendiente', 'Licencia disponible para asignación');
