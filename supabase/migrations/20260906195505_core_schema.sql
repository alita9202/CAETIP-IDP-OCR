-- Función reusable para actualizar el updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION update_fecha_actualizacion_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- ======================================================================================
-- 1. IDENTIDAD Y ACCESO
-- ======================================================================================

CREATE TABLE rol (
    id_rol uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text UNIQUE NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE rol ENABLE ROW LEVEL SECURITY;

INSERT INTO rol (codigo, nombre) VALUES
    ('PARTICIPANTE', 'Participante'),
    ('ENCARGADO', 'Encargado'),
    ('SECRETARIA', 'Secretaria'),
    ('ADMINISTRADOR', 'Administrador');

CREATE TABLE persona (
    id_persona uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ci text UNIQUE NOT NULL,
    nombres text NOT NULL,
    apellidos text NOT NULL,
    fecha_nacimiento date,
    correo text,
    telefono text,
    direccion text,
    ciudad text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE persona ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_persona_updated_at
BEFORE UPDATE ON persona FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_persona_ci ON persona (ci);
CREATE INDEX idx_persona_correo ON persona (correo);

CREATE TABLE usuario (
    id_usuario uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    id_persona uuid UNIQUE REFERENCES persona(id_persona) ON DELETE RESTRICT,
    id_rol uuid REFERENCES rol(id_rol) ON DELETE RESTRICT,
    estado text NOT NULL CHECK (estado IN ('PENDIENTE', 'ACTIVO', 'INACTIVO', 'BLOQUEADO')),
    fecha_activacion timestamptz,
    ultimo_acceso timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE usuario ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_usuario_updated_at
BEFORE UPDATE ON usuario FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================================
-- 2. OFERTA ACADÉMICA
-- ======================================================================================

CREATE TABLE universidad (
    id_universidad uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    sigla text,
    activo boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE universidad ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_universidad_updated_at
BEFORE UPDATE ON universidad FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE programa (
    id_programa uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL,
    descripcion text,
    activo boolean DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE programa ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_programa_updated_at
BEFORE UPDATE ON programa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE oferta_programa (
    id_oferta uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_programa uuid NOT NULL REFERENCES programa(id_programa) ON DELETE RESTRICT,
    id_universidad uuid NOT NULL REFERENCES universidad(id_universidad) ON DELETE RESTRICT,
    codigo text,
    version text NOT NULL,
    gestion text NOT NULL,
    modalidad text,
    fecha_inicio date,
    fecha_fin date,
    fecha_limite_inscripcion date,
    fecha_limite_documentacion date,
    estado text NOT NULL CHECK (estado IN ('BORRADOR', 'HABILITADA', 'CERRADA', 'INACTIVA')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_oferta_programa_version_gestion UNIQUE (id_programa, id_universidad, version, gestion)
);

ALTER TABLE oferta_programa ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_oferta_programa_updated_at
BEFORE UPDATE ON oferta_programa FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE asignacion_encargado (
    id_asignacion_encargado uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_oferta uuid NOT NULL REFERENCES oferta_programa(id_oferta) ON DELETE CASCADE,
    id_usuario uuid NOT NULL REFERENCES usuario(id_usuario) ON DELETE CASCADE,
    tipo_responsable text NOT NULL DEFAULT 'PRINCIPAL',
    fecha_asignacion timestamptz NOT NULL DEFAULT now(),
    activo boolean NOT NULL DEFAULT true
);
CREATE UNIQUE INDEX uq_asignacion_activa ON asignacion_encargado (id_oferta, id_usuario) WHERE activo = true;

ALTER TABLE asignacion_encargado ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 3. INSCRIPCIÓN Y EXPEDIENTE
-- ======================================================================================

CREATE TABLE inscripcion (
    id_inscripcion uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_persona uuid NOT NULL REFERENCES persona(id_persona) ON DELETE RESTRICT,
    id_oferta uuid NOT NULL REFERENCES oferta_programa(id_oferta) ON DELETE RESTRICT,
    estado_inscripcion text NOT NULL CHECK (estado_inscripcion IN ('PRE_REGISTRADA', 'MATRICULA_PENDIENTE', 'ACTIVA', 'LISTA_PARA_CONTINUAR', 'RECHAZADA', 'CANCELADA', 'RETIRADA')),
    estado_matricula text NOT NULL CHECK (estado_matricula IN ('PENDIENTE', 'CONFIRMADA')),
    fecha_registro timestamptz NOT NULL DEFAULT now(),
    registrada_por uuid REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    motivo_estado text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_inscripcion_persona_oferta UNIQUE (id_persona, id_oferta)
);

ALTER TABLE inscripcion ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_inscripcion_updated_at
BEFORE UPDATE ON inscripcion FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_inscripcion_id_persona ON inscripcion (id_persona);
CREATE INDEX idx_inscripcion_id_oferta ON inscripcion (id_oferta);

CREATE TABLE expediente (
    id_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_inscripcion uuid UNIQUE NOT NULL REFERENCES inscripcion(id_inscripcion) ON DELETE CASCADE,
    estado_expediente text NOT NULL CHECK (estado_expediente IN ('DOCUMENTACION_PENDIENTE', 'EN_PROCESAMIENTO_DOCUMENTAL', 'EN_REVISION_DOCUMENTAL', 'EXPEDIENTE_OBSERVADO', 'EXPEDIENTE_PREVALIDADO')),
    fecha_creacion timestamptz NOT NULL DEFAULT now(),
    fecha_actualizacion timestamptz,
    fecha_prevalidacion timestamptz
);

ALTER TABLE expediente ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_expediente_actualizacion
BEFORE UPDATE ON expediente FOR EACH ROW EXECUTE FUNCTION update_fecha_actualizacion_column();
CREATE INDEX idx_expediente_id_inscripcion ON expediente (id_inscripcion);

-- ======================================================================================
-- 4. TIPOS Y REQUISITOS DOCUMENTALES
-- ======================================================================================

CREATE TABLE tipo_documento (
    id_tipo_documento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text UNIQUE NOT NULL,
    nombre text NOT NULL,
    descripcion text,
    soporta_idp boolean NOT NULL DEFAULT false,
    activo boolean NOT NULL DEFAULT true
);

ALTER TABLE tipo_documento ENABLE ROW LEVEL SECURITY;

INSERT INTO tipo_documento (codigo, nombre, soporta_idp) VALUES
    ('CI', 'Carnet de Identidad', true),
    ('TITULO_DIPLOMA', 'Título / Diploma', true),
    ('HOJA_VIDA', 'Hoja de Vida', true),
    ('FICHA_INSCRIPCION', 'Ficha de Inscripción', true);

CREATE TABLE requisito_oferta (
    id_requisito_oferta uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_oferta uuid NOT NULL REFERENCES oferta_programa(id_oferta) ON DELETE CASCADE,
    id_tipo_documento uuid NOT NULL REFERENCES tipo_documento(id_tipo_documento) ON DELETE RESTRICT,
    obligatorio boolean NOT NULL DEFAULT true,
    descripcion text,
    orden integer,
    CONSTRAINT uq_requisito_oferta_tipo UNIQUE (id_oferta, id_tipo_documento)
);

ALTER TABLE requisito_oferta ENABLE ROW LEVEL SECURITY;

CREATE TABLE requisito_expediente (
    id_requisito_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_expediente uuid NOT NULL REFERENCES expediente(id_expediente) ON DELETE CASCADE,
    id_requisito_oferta uuid NOT NULL REFERENCES requisito_oferta(id_requisito_oferta) ON DELETE RESTRICT,
    obligatorio boolean NOT NULL,
    fecha_cumplimiento timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_requisito_expediente_oferta UNIQUE (id_expediente, id_requisito_oferta)
);

ALTER TABLE requisito_expediente ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_requisito_expediente_updated_at
BEFORE UPDATE ON requisito_expediente FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_req_expediente_id_exp ON requisito_expediente (id_expediente);

-- ======================================================================================
-- 5. REPOSITORIO PERSONAL DE DOCUMENTOS
-- ======================================================================================

CREATE TABLE documento (
    id_documento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_persona uuid NOT NULL REFERENCES persona(id_persona) ON DELETE RESTRICT,
    id_tipo_documento uuid NOT NULL REFERENCES tipo_documento(id_tipo_documento) ON DELETE RESTRICT,
    titulo text NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE documento ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_documento_updated_at
BEFORE UPDATE ON documento FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE INDEX idx_documento_id_persona ON documento (id_persona);
CREATE INDEX idx_documento_id_tipo ON documento (id_tipo_documento);

CREATE TABLE version_documento (
    id_version_documento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_documento uuid NOT NULL REFERENCES documento(id_documento) ON DELETE CASCADE,
    numero_version integer NOT NULL,
    ruta_storage text NOT NULL,
    nombre_original text NOT NULL,
    mime_type text,
    tamano_bytes bigint,
    cargado_por uuid REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    estado_version text NOT NULL CHECK (estado_version IN ('VIGENTE', 'REEMPLAZADA')),
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT uq_version_documento_numero UNIQUE (id_documento, numero_version)
);

ALTER TABLE version_documento ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_version_doc_id_doc ON version_documento (id_documento);

-- ======================================================================================
-- 6. ASIGNACIÓN DOCUMENTO -> REQUISITO
-- ======================================================================================

CREATE TABLE asignacion_documento_requisito (
    id_asignacion uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_requisito_expediente uuid NOT NULL REFERENCES requisito_expediente(id_requisito_expediente) ON DELETE CASCADE,
    id_version_documento uuid NOT NULL REFERENCES version_documento(id_version_documento) ON DELETE RESTRICT,
    asignado_por uuid REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    fecha_asignacion timestamptz NOT NULL DEFAULT now(),
    vigente boolean NOT NULL DEFAULT true
);

ALTER TABLE asignacion_documento_requisito ENABLE ROW LEVEL SECURITY;
CREATE UNIQUE INDEX uq_asignacion_doc_req_vigente 
ON asignacion_documento_requisito (id_requisito_expediente) 
WHERE vigente = true;
CREATE INDEX idx_asig_doc_req_req ON asignacion_documento_requisito (id_requisito_expediente);
CREATE INDEX idx_asig_doc_req_ver ON asignacion_documento_requisito (id_version_documento);
