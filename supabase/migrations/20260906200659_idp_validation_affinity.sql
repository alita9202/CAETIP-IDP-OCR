-- ======================================================================================
-- 1. PROCESAMIENTO IDP
-- ======================================================================================
CREATE TABLE procesamiento_idp (
    id_procesamiento uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_version_documento uuid NOT NULL REFERENCES version_documento(id_version_documento) ON DELETE CASCADE,
    estado_procesamiento text NOT NULL CHECK (estado_procesamiento IN ('PROCESAMIENTO_PENDIENTE', 'EN_COLA_DE_PROCESAMIENTO', 'PROCESANDO_DOCUMENTO', 'REVISION_AUTOMATICA_COMPLETADA', 'PROCESAMIENTO_FALLIDO', 'REINTENTO_PENDIENTE')),
    etapa text,
    motor text,
    version_motor text,
    fecha_inicio timestamptz,
    fecha_fin timestamptz,
    duracion_ms integer,
    numero_intento integer NOT NULL DEFAULT 1,
    mensaje_error text,
    resultado_tecnico jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE procesamiento_idp ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_procesamiento_version ON procesamiento_idp(id_version_documento);
CREATE INDEX idx_procesamiento_estado ON procesamiento_idp(estado_procesamiento);

-- ======================================================================================
-- 2. DATOS EXTRAÍDOS
-- ======================================================================================
CREATE TABLE dato_extraido (
    id_dato_extraido uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_procesamiento uuid NOT NULL REFERENCES procesamiento_idp(id_procesamiento) ON DELETE CASCADE,
    campo text NOT NULL,
    valor_original text,
    valor_normalizado text,
    nivel_confianza text NOT NULL CHECK (nivel_confianza IN ('ALTA', 'MEDIA', 'BAJA', 'NO_EVALUABLE')),
    importancia text NOT NULL CHECK (importancia IN ('CRITICO', 'RELEVANTE', 'INFORMATIVO')),
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE dato_extraido ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_dato_extraido_procesamiento ON dato_extraido(id_procesamiento);

-- ======================================================================================
-- 3. PRIMER FILTRO — PREVALIDACIÓN DOCUMENTAL
-- ======================================================================================
CREATE TABLE prevalidacion_documental (
    id_prevalidacion_documental uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_version_documento uuid NOT NULL REFERENCES version_documento(id_version_documento) ON DELETE CASCADE,
    id_procesamiento uuid REFERENCES procesamiento_idp(id_procesamiento) ON DELETE SET NULL,
    resultado text NOT NULL CHECK (resultado IN ('DOCUMENTO_PREVALIDADO', 'REQUIERE_REVISION_HUMANA', 'REQUIERE_REEMPLAZO', 'ERROR_DE_PROCESAMIENTO', 'NO_EVALUABLE')),
    nivel_confianza text NOT NULL CHECK (nivel_confianza IN ('ALTA', 'MEDIA', 'BAJA', 'NO_EVALUABLE')),
    origen text NOT NULL DEFAULT 'AUTOMATICA' CHECK (origen IN ('AUTOMATICA', 'REPROCESAMIENTO')),
    fecha_evaluacion timestamptz NOT NULL DEFAULT now(),
    resumen text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE prevalidacion_documental ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prevalidacion_doc_version ON prevalidacion_documental(id_version_documento);

-- ======================================================================================
-- 4. COMPARACIONES DEL PRIMER FILTRO
-- ======================================================================================
CREATE TABLE comparacion_documental (
    id_comparacion_documental uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_prevalidacion_documental uuid NOT NULL REFERENCES prevalidacion_documental(id_prevalidacion_documental) ON DELETE CASCADE,
    campo text NOT NULL,
    fuente_referencia text NOT NULL,
    valor_detectado text,
    valor_referencia text,
    resultado text NOT NULL CHECK (resultado IN ('COINCIDE', 'COINCIDE_TRAS_NORMALIZACION', 'DIFERENCIA_MENOR', 'NO_COINCIDE', 'NO_DISPONIBLE', 'NO_EVALUABLE')),
    importancia text NOT NULL CHECK (importancia IN ('CRITICO', 'RELEVANTE', 'INFORMATIVO')),
    detalle text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE comparacion_documental ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 5. CATÁLOGO DE CARRERAS
-- ======================================================================================
CREATE TABLE carrera (
    id_carrera uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_canonico text UNIQUE NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE carrera ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_carrera_updated_at BEFORE UPDATE ON carrera FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE alias_carrera (
    id_alias_carrera uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_carrera uuid NOT NULL REFERENCES carrera(id_carrera) ON DELETE CASCADE,
    alias text NOT NULL,
    activo boolean NOT NULL DEFAULT true,
    UNIQUE(id_carrera, alias)
);
ALTER TABLE alias_carrera ENABLE ROW LEVEL SECURITY;

CREATE TABLE area_profesional (
    id_area uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text UNIQUE NOT NULL,
    descripcion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE area_profesional ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_area_profesional_updated_at BEFORE UPDATE ON area_profesional FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE carrera_area (
    id_carrera uuid NOT NULL REFERENCES carrera(id_carrera) ON DELETE CASCADE,
    id_area uuid NOT NULL REFERENCES area_profesional(id_area) ON DELETE CASCADE,
    PRIMARY KEY(id_carrera, id_area)
);
ALTER TABLE carrera_area ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 6. REGLAS DE AFINIDAD
-- ======================================================================================
CREATE TABLE regla_afinidad_carrera (
    id_regla_carrera uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_oferta uuid NOT NULL REFERENCES oferta_programa(id_oferta) ON DELETE CASCADE,
    id_carrera uuid NOT NULL REFERENCES carrera(id_carrera) ON DELETE CASCADE,
    tipo_afinidad text NOT NULL CHECK (tipo_afinidad IN ('DIRECTA', 'RELACIONADA', 'NO_APTA')),
    prioridad integer NOT NULL DEFAULT 100,
    observacion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(id_oferta, id_carrera)
);
ALTER TABLE regla_afinidad_carrera ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_regla_afinidad_carrera_updated_at BEFORE UPDATE ON regla_afinidad_carrera FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE regla_afinidad_area (
    id_regla_area uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_oferta uuid NOT NULL REFERENCES oferta_programa(id_oferta) ON DELETE CASCADE,
    id_area uuid NOT NULL REFERENCES area_profesional(id_area) ON DELETE CASCADE,
    tipo_afinidad text NOT NULL CHECK (tipo_afinidad IN ('DIRECTA', 'RELACIONADA', 'NO_APTA')),
    prioridad integer NOT NULL DEFAULT 100,
    observacion text,
    activo boolean NOT NULL DEFAULT true,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(id_oferta, id_area)
);
ALTER TABLE regla_afinidad_area ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER set_regla_afinidad_area_updated_at BEFORE UPDATE ON regla_afinidad_area FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ======================================================================================
-- 7. SEGUNDO FILTRO — PREVALIDACIÓN DEL EXPEDIENTE
-- ======================================================================================
CREATE TABLE prevalidacion_expediente (
    id_prevalidacion_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_asignacion uuid NOT NULL REFERENCES asignacion_documento_requisito(id_asignacion) ON DELETE CASCADE,
    resultado text NOT NULL CHECK (resultado IN ('PREVALIDADO', 'REQUIERE_REVISION_HUMANA', 'REQUIERE_REEMPLAZO', 'NO_EVALUABLE')),
    nivel_confianza text NOT NULL CHECK (nivel_confianza IN ('ALTA', 'MEDIA', 'BAJA', 'NO_EVALUABLE')),
    resultado_afinidad text CHECK (resultado_afinidad IN ('AFINIDAD_DIRECTA', 'AFINIDAD_POR_AREA', 'AFINIDAD_RELACIONADA', 'AFINIDAD_NO_DETERMINADA', 'POSIBLE_NO_CUMPLIMIENTO')),
    requiere_revision boolean NOT NULL DEFAULT false,
    fecha_evaluacion timestamptz NOT NULL DEFAULT now(),
    resumen text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE prevalidacion_expediente ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_prevalidacion_exp_asignacion ON prevalidacion_expediente(id_asignacion);

-- ======================================================================================
-- 8. COMPARACIONES DEL SEGUNDO FILTRO
-- ======================================================================================
CREATE TABLE comparacion_expediente (
    id_comparacion_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_prevalidacion_expediente uuid NOT NULL REFERENCES prevalidacion_expediente(id_prevalidacion_expediente) ON DELETE CASCADE,
    campo text NOT NULL,
    fuente_1 text NOT NULL,
    fuente_2 text NOT NULL,
    valor_fuente_1 text,
    valor_fuente_2 text,
    resultado text NOT NULL CHECK (resultado IN ('COINCIDE', 'COINCIDE_TRAS_NORMALIZACION', 'DIFERENCIA_MENOR', 'NO_COINCIDE', 'NO_DISPONIBLE', 'NO_EVALUABLE')),
    importancia text NOT NULL CHECK (importancia IN ('CRITICO', 'RELEVANTE', 'INFORMATIVO')),
    detalle text,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE comparacion_expediente ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 9. CATÁLOGO DE MOTIVOS
-- ======================================================================================
CREATE TABLE motivo_observacion (
    id_motivo uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo text UNIQUE NOT NULL,
    categoria text NOT NULL,
    descripcion text NOT NULL,
    activo boolean NOT NULL DEFAULT true
);
ALTER TABLE motivo_observacion ENABLE ROW LEVEL SECURITY;

INSERT INTO motivo_observacion (codigo, categoria, descripcion) VALUES
    ('ARCHIVO_ILEGIBLE', 'GENERAL', 'Archivo ilegible'),
    ('ARCHIVO_INCOMPLETO', 'GENERAL', 'Archivo incompleto'),
    ('TIPO_DOCUMENTO_INCORRECTO', 'GENERAL', 'Tipo de documento incorrecto'),
    ('FORMATO_NO_RECONOCIDO', 'GENERAL', 'Formato no reconocido'),
    ('BAJA_CONFIANZA_DE_LECTURA', 'GENERAL', 'Baja confianza de lectura'),
    ('CAMPO_OBLIGATORIO_NO_DETECTADO', 'GENERAL', 'Campo obligatorio no detectado'),
    ('NOMBRE_NO_COINCIDE', 'IDENTIDAD', 'El nombre no coincide'),
    ('CI_NO_COINCIDE', 'IDENTIDAD', 'El CI no coincide'),
    ('FECHA_NACIMIENTO_NO_COINCIDE', 'IDENTIDAD', 'La fecha de nacimiento no coincide'),
    ('CARRERA_NO_CATALOGADA', 'ACADEMICO', 'Carrera no catalogada'),
    ('AFINIDAD_ACADEMICA_INCIERTA', 'ACADEMICO', 'Afinidad académica incierta'),
    ('POSIBLE_INCOMPATIBILIDAD_ACADEMICA', 'ACADEMICO', 'Posible incompatibilidad académica'),
    ('INFORMACION_ACADEMICA_NO_COINCIDE', 'ACADEMICO', 'Información académica no coincide'),
    ('FICHA_NO_CORRESPONDE_AL_PROGRAMA', 'FORMULARIO_CV', 'Ficha no corresponde al programa'),
    ('FICHA_INCOMPLETA', 'FORMULARIO_CV', 'Ficha incompleta'),
    ('FORMATO_HOJA_VIDA_INCORRECTO', 'FORMULARIO_CV', 'Formato de hoja de vida incorrecto'),
    ('SECCIONES_REQUERIDAS_INCOMPLETAS', 'FORMULARIO_CV', 'Secciones requeridas incompletas'),
    ('ARCHIVO_CORRUPTO', 'TECNICO', 'Archivo corrupto'),
    ('TIPO_ARCHIVO_NO_ADMITIDO', 'TECNICO', 'Tipo de archivo no admitido'),
    ('ERROR_INTERNO_IDP', 'TECNICO', 'Error interno de IDP');

-- ======================================================================================
-- 10. REVISIÓN HUMANA DEL PRIMER FILTRO
-- ======================================================================================
CREATE TABLE revision_documental (
    id_revision_documental uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_prevalidacion_documental uuid NOT NULL REFERENCES prevalidacion_documental(id_prevalidacion_documental) ON DELETE CASCADE,
    id_usuario_revisor uuid NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    nivel_revision text NOT NULL CHECK (nivel_revision IN ('ENCARGADO', 'SECRETARIA', 'ADMINISTRADOR')),
    decision text NOT NULL CHECK (decision IN ('ACEPTADO_MANUALMENTE', 'DOCUMENTO_OBSERVADO', 'REQUIERE_REEMPLAZO', 'ESCALADO')),
    detalle text,
    fecha_revision timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE revision_documental ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 11. OBSERVACIONES DOCUMENTALES
-- ======================================================================================
CREATE TABLE observacion_documental (
    id_observacion_documental uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_revision_documental uuid NOT NULL REFERENCES revision_documental(id_revision_documental) ON DELETE CASCADE,
    id_motivo uuid NOT NULL REFERENCES motivo_observacion(id_motivo) ON DELETE RESTRICT,
    detalle text,
    estado_resolucion text NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_resolucion IN ('PENDIENTE', 'RESUELTA', 'ANULADA')),
    fecha_creacion timestamptz NOT NULL DEFAULT now(),
    fecha_resolucion timestamptz
);
ALTER TABLE observacion_documental ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 12. REVISIÓN HUMANA DEL SEGUNDO FILTRO
-- ======================================================================================
CREATE TABLE revision_expediente (
    id_revision_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_prevalidacion_expediente uuid NOT NULL REFERENCES prevalidacion_expediente(id_prevalidacion_expediente) ON DELETE CASCADE,
    id_usuario_revisor uuid NOT NULL REFERENCES usuario(id_usuario) ON DELETE RESTRICT,
    nivel_revision text NOT NULL CHECK (nivel_revision IN ('ENCARGADO', 'SECRETARIA', 'ADMINISTRADOR')),
    decision text NOT NULL CHECK (decision IN ('ACEPTADO_MANUALMENTE', 'OBSERVADO', 'REQUIERE_REEMPLAZO', 'ESCALADO', 'NO_CUMPLE_AFINIDAD')),
    detalle text,
    fecha_revision timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE revision_expediente ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 13. OBSERVACIONES DE EXPEDIENTE
-- ======================================================================================
CREATE TABLE observacion_expediente (
    id_observacion_expediente uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_revision_expediente uuid NOT NULL REFERENCES revision_expediente(id_revision_expediente) ON DELETE CASCADE,
    id_motivo uuid NOT NULL REFERENCES motivo_observacion(id_motivo) ON DELETE RESTRICT,
    detalle text,
    estado_resolucion text NOT NULL DEFAULT 'PENDIENTE' CHECK (estado_resolucion IN ('PENDIENTE', 'RESUELTA', 'ANULADA')),
    fecha_creacion timestamptz NOT NULL DEFAULT now(),
    fecha_resolucion timestamptz
);
ALTER TABLE observacion_expediente ENABLE ROW LEVEL SECURITY;

-- ======================================================================================
-- 14. AUDITORÍA
-- ======================================================================================
CREATE TABLE auditoria (
    id_auditoria uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario uuid REFERENCES usuario(id_usuario) ON DELETE SET NULL,
    accion text NOT NULL,
    tipo_recurso text NOT NULL,
    id_recurso uuid,
    detalle text,
    metadata jsonb,
    fecha_evento timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE auditoria ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_auditoria_usuario ON auditoria(id_usuario);
CREATE INDEX idx_auditoria_recurso ON auditoria(tipo_recurso, id_recurso);
CREATE INDEX idx_auditoria_fecha ON auditoria(fecha_evento);

-- ======================================================================================
-- 15. REGLA CRÍTICA DE SELECCIÓN DE DOCUMENTOS
-- ======================================================================================
CREATE OR REPLACE FUNCTION check_documento_prevalidado_antes_de_asignar()
RETURNS TRIGGER AS $$
DECLARE
    v_ultimo_resultado text;
    v_ultima_decision_humana text;
    v_id_prevalidacion uuid;
BEGIN
    -- Si la asignación se está desactivando, permitir (vigente = false)
    IF NEW.vigente = false THEN
        RETURN NEW;
    END IF;

    -- Obtener la prevalidación automática más reciente para esta version de documento
    SELECT id_prevalidacion_documental, resultado
    INTO v_id_prevalidacion, v_ultimo_resultado
    FROM prevalidacion_documental
    WHERE id_version_documento = NEW.id_version_documento
    ORDER BY fecha_evaluacion DESC
    LIMIT 1;

    -- Si no hay ninguna prevalidación, entonces no ha sido evaluado
    IF v_id_prevalidacion IS NULL THEN
        RAISE EXCEPTION 'No se puede asignar el documento. Aún no ha pasado por la prevalidación documental inicial.';
    END IF;

    -- Si la automática dice DOCUMENTO_PREVALIDADO, está OK.
    IF v_ultimo_resultado = 'DOCUMENTO_PREVALIDADO' THEN
        RETURN NEW;
    END IF;

    -- Si no, verificar si hay una revisión humana ACEPTADO_MANUALMENTE ligada a esa prevalidación
    SELECT decision
    INTO v_ultima_decision_humana
    FROM revision_documental
    WHERE id_prevalidacion_documental = v_id_prevalidacion
    ORDER BY fecha_revision DESC
    LIMIT 1;

    IF v_ultima_decision_humana = 'ACEPTADO_MANUALMENTE' THEN
        RETURN NEW;
    END IF;

    -- En cualquier otro caso se rechaza la inserción/actualización.
    RAISE EXCEPTION 'No se puede asignar el documento. El documento debe estar prevalidado o aceptado manualmente.';

END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_check_documento_prevalidado
BEFORE INSERT OR UPDATE ON asignacion_documento_requisito
FOR EACH ROW EXECUTE FUNCTION check_documento_prevalidado_antes_de_asignar();
