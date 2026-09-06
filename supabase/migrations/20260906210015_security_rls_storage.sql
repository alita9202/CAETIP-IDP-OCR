-- ======================================================================================
-- 1. FUNCIONES AUXILIARES DE AUTORIZACIÓN
-- ======================================================================================

CREATE OR REPLACE FUNCTION current_persona_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id_persona FROM usuario WHERE id_usuario = auth.uid();
$$;

CREATE OR REPLACE FUNCTION current_role_code()
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT r.codigo FROM usuario u JOIN rol r ON u.id_rol = r.id_rol WHERE u.id_usuario = auth.uid();
$$;

CREATE OR REPLACE FUNCTION is_admin() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_role_code() = 'ADMINISTRADOR'; $$;
CREATE OR REPLACE FUNCTION is_secretaria() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_role_code() = 'SECRETARIA'; $$;
CREATE OR REPLACE FUNCTION is_encargado() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_role_code() = 'ENCARGADO'; $$;
CREATE OR REPLACE FUNCTION is_participante() RETURNS boolean LANGUAGE sql STABLE AS $$ SELECT current_role_code() = 'PARTICIPANTE'; $$;

CREATE OR REPLACE FUNCTION encargado_gestiona_oferta(p_id_oferta uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM asignacion_encargado
    WHERE id_oferta = p_id_oferta AND id_usuario = auth.uid() AND activo = true
  );
$$;

CREATE OR REPLACE FUNCTION usuario_gestiona_persona(p_id_persona uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM inscripcion i
    JOIN asignacion_encargado a ON i.id_oferta = a.id_oferta
    WHERE i.id_persona = p_id_persona AND a.id_usuario = auth.uid() AND a.activo = true
  );
$$;

-- Seguridad funciones
REVOKE EXECUTE ON FUNCTION current_persona_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION current_role_code() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_admin() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_secretaria() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_encargado() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION is_participante() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION encargado_gestiona_oferta(uuid) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION usuario_gestiona_persona(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION current_persona_id() TO authenticated;
GRANT EXECUTE ON FUNCTION current_role_code() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_secretaria() TO authenticated;
GRANT EXECUTE ON FUNCTION is_encargado() TO authenticated;
GRANT EXECUTE ON FUNCTION is_participante() TO authenticated;
GRANT EXECUTE ON FUNCTION encargado_gestiona_oferta(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION usuario_gestiona_persona(uuid) TO authenticated;

-- ======================================================================================
-- 2. PRIVILEGIOS SQL (GRANTS)
-- ======================================================================================

-- Denegar acceso a anon para todo
REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM anon;

-- Solo asignar los SELECT, INSERT, UPDATE, DELETE a authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO authenticated;

GRANT INSERT, UPDATE, DELETE ON persona TO authenticated;
GRANT INSERT, UPDATE, DELETE ON usuario TO authenticated;
GRANT INSERT, UPDATE, DELETE ON inscripcion TO authenticated;
GRANT INSERT, UPDATE, DELETE ON expediente TO authenticated;
GRANT INSERT, UPDATE, DELETE ON requisito_expediente TO authenticated;
GRANT INSERT, UPDATE, DELETE ON documento TO authenticated;
GRANT INSERT, UPDATE, DELETE ON version_documento TO authenticated;
GRANT INSERT, UPDATE, DELETE ON asignacion_documento_requisito TO authenticated;
GRANT INSERT, UPDATE, DELETE ON revision_documental TO authenticated;
GRANT INSERT, UPDATE, DELETE ON observacion_documental TO authenticated;
GRANT INSERT, UPDATE, DELETE ON revision_expediente TO authenticated;
GRANT INSERT, UPDATE, DELETE ON observacion_expediente TO authenticated;

-- Catálogos administrables por Admin (INSERT/UPDATE/DELETE)
GRANT INSERT, UPDATE, DELETE ON rol TO authenticated;
GRANT INSERT, UPDATE, DELETE ON tipo_documento TO authenticated;
GRANT INSERT, UPDATE, DELETE ON universidad TO authenticated;
GRANT INSERT, UPDATE, DELETE ON programa TO authenticated;
GRANT INSERT, UPDATE, DELETE ON oferta_programa TO authenticated;
GRANT INSERT, UPDATE, DELETE ON requisito_oferta TO authenticated;
GRANT INSERT, UPDATE, DELETE ON carrera TO authenticated;
GRANT INSERT, UPDATE, DELETE ON alias_carrera TO authenticated;
GRANT INSERT, UPDATE, DELETE ON area_profesional TO authenticated;
GRANT INSERT, UPDATE, DELETE ON carrera_area TO authenticated;
GRANT INSERT, UPDATE, DELETE ON regla_afinidad_carrera TO authenticated;
GRANT INSERT, UPDATE, DELETE ON regla_afinidad_area TO authenticated;
GRANT INSERT, UPDATE, DELETE ON motivo_observacion TO authenticated;

-- ======================================================================================
-- 3. POLÍTICAS RLS (CATÁLOGOS)
-- ======================================================================================
-- Todos los catalogos: Lectura autenticada, Modificacion admin
CREATE POLICY "Catálogos lectura" ON rol FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON rol AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON tipo_documento FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON tipo_documento AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON universidad FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON universidad AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON programa FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON programa AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON oferta_programa FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON oferta_programa AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON requisito_oferta FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON requisito_oferta AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON carrera FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON carrera AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON alias_carrera FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON alias_carrera AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON area_profesional FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON area_profesional AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON carrera_area FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON carrera_area AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON regla_afinidad_carrera FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON regla_afinidad_carrera AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON regla_afinidad_area FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON regla_afinidad_area AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Catálogos lectura" ON motivo_observacion FOR SELECT USING (true);
CREATE POLICY "Catálogos admin" ON motivo_observacion AS PERMISSIVE FOR ALL USING (is_admin());

-- ======================================================================================
-- 4. POLÍTICAS RLS (NEGOCIO)
-- ======================================================================================

-- PERSONA
CREATE POLICY "Participante puede ver su persona" ON persona FOR SELECT USING (id_persona = current_persona_id());
CREATE POLICY "Encargado ve personas de sus ofertas" ON persona FOR SELECT USING (is_encargado() AND usuario_gestiona_persona(id_persona));
CREATE POLICY "Secretaria ve todas las personas" ON persona FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona personas" ON persona AS PERMISSIVE FOR ALL USING (is_admin());
-- NO UPDATE completo para participante implementado omitiendo GRANT UPDATE o mediante política restrictiva
-- Como tienen grant update, dejemos política nula de update para participante, o vacía. Admin sí.

-- USUARIO
CREATE POLICY "Usuario ve su propio registro" ON usuario FOR SELECT USING (id_usuario = auth.uid());
CREATE POLICY "Secretaria ve todos" ON usuario FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona todos" ON usuario AS PERMISSIVE FOR ALL USING (is_admin());

-- INSCRIPCION
CREATE POLICY "Participante ve sus inscripciones" ON inscripcion FOR SELECT USING (id_persona = current_persona_id());
CREATE POLICY "Encargado ve inscripciones de su oferta" ON inscripcion FOR SELECT USING (is_encargado() AND encargado_gestiona_oferta(id_oferta));
CREATE POLICY "Secretaria ve inscripciones" ON inscripcion FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona inscripciones" ON inscripcion AS PERMISSIVE FOR ALL USING (is_admin());

-- EXPEDIENTE
CREATE POLICY "Participante ve su expediente" ON expediente FOR SELECT USING (id_inscripcion IN (SELECT id_inscripcion FROM inscripcion WHERE id_persona = current_persona_id()));
CREATE POLICY "Encargado ve expedientes de su oferta" ON expediente FOR SELECT USING (is_encargado() AND id_inscripcion IN (SELECT id_inscripcion FROM inscripcion WHERE encargado_gestiona_oferta(id_oferta)));
CREATE POLICY "Secretaria ve expedientes" ON expediente FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona expedientes" ON expediente AS PERMISSIVE FOR ALL USING (is_admin());

-- REQUISITO_EXPEDIENTE
CREATE POLICY "Participante ve sus requisitos" ON requisito_expediente FOR SELECT USING (id_expediente IN (SELECT id_expediente FROM expediente e JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve requisitos" ON requisito_expediente FOR SELECT USING (is_encargado() AND id_expediente IN (SELECT id_expediente FROM expediente e JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE encargado_gestiona_oferta(i.id_oferta)));
CREATE POLICY "Secretaria ve requisitos" ON requisito_expediente FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona requisitos" ON requisito_expediente AS PERMISSIVE FOR ALL USING (is_admin());

-- DOCUMENTO
CREATE POLICY "Participante ve sus documentos" ON documento FOR SELECT USING (id_persona = current_persona_id());
CREATE POLICY "Participante inserta sus documentos" ON documento FOR INSERT WITH CHECK (id_persona = current_persona_id());
CREATE POLICY "Encargado ve documentos gestionados" ON documento FOR SELECT USING (is_encargado() AND usuario_gestiona_persona(id_persona));
CREATE POLICY "Encargado inserta documentos" ON documento FOR INSERT WITH CHECK (is_encargado() AND usuario_gestiona_persona(id_persona));
CREATE POLICY "Secretaria ve documentos" ON documento FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona documentos" ON documento AS PERMISSIVE FOR ALL USING (is_admin());

-- VERSION_DOCUMENTO
CREATE POLICY "Participante ve sus versiones" ON version_documento FOR SELECT USING (id_documento IN (SELECT id_documento FROM documento WHERE id_persona = current_persona_id()));
CREATE POLICY "Participante inserta versiones" ON version_documento FOR INSERT WITH CHECK (id_documento IN (SELECT id_documento FROM documento WHERE id_persona = current_persona_id()));
CREATE POLICY "Encargado ve versiones gestionadas" ON version_documento FOR SELECT USING (is_encargado() AND id_documento IN (SELECT id_documento FROM documento WHERE usuario_gestiona_persona(id_persona)));
CREATE POLICY "Encargado inserta versiones" ON version_documento FOR INSERT WITH CHECK (is_encargado() AND id_documento IN (SELECT id_documento FROM documento WHERE usuario_gestiona_persona(id_persona)));
CREATE POLICY "Secretaria ve versiones" ON version_documento FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona versiones" ON version_documento AS PERMISSIVE FOR ALL USING (is_admin());

-- ASIGNACION_DOCUMENTO_REQUISITO
CREATE POLICY "Participante ve sus asignaciones" ON asignacion_documento_requisito FOR SELECT USING (id_requisito_expediente IN (SELECT re.id_requisito_expediente FROM requisito_expediente re JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Participante inserta asignaciones" ON asignacion_documento_requisito FOR INSERT WITH CHECK (id_requisito_expediente IN (SELECT re.id_requisito_expediente FROM requisito_expediente re JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()) AND id_version_documento IN (SELECT vd.id_version_documento FROM version_documento vd JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve asignaciones" ON asignacion_documento_requisito FOR SELECT USING (is_encargado() AND id_requisito_expediente IN (SELECT re.id_requisito_expediente FROM requisito_expediente re JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE encargado_gestiona_oferta(i.id_oferta)));
CREATE POLICY "Encargado inserta asignaciones" ON asignacion_documento_requisito FOR INSERT WITH CHECK (is_encargado() AND id_requisito_expediente IN (SELECT re.id_requisito_expediente FROM requisito_expediente re JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE encargado_gestiona_oferta(i.id_oferta)));
CREATE POLICY "Secretaria ve asignaciones" ON asignacion_documento_requisito FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona asignaciones" ON asignacion_documento_requisito AS PERMISSIVE FOR ALL USING (is_admin());

-- IDP Y PREVALIDACIONES (LECTURA SOLAMENTE PARA USUARIOS REGULARES, INSERT/UPDATE RESERVADO PARA BACKEND/ADMIN)
CREATE POLICY "Participante ve procesamiento" ON procesamiento_idp FOR SELECT USING (id_version_documento IN (SELECT vd.id_version_documento FROM version_documento vd JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve procesamiento" ON procesamiento_idp FOR SELECT USING (is_encargado() AND id_version_documento IN (SELECT vd.id_version_documento FROM version_documento vd JOIN documento d ON vd.id_documento = d.id_documento WHERE usuario_gestiona_persona(d.id_persona)));
CREATE POLICY "Secretaria ve procesamiento" ON procesamiento_idp FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve procesamiento" ON procesamiento_idp AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve dato_extraido" ON dato_extraido FOR SELECT USING (id_procesamiento IN (SELECT p.id_procesamiento FROM procesamiento_idp p JOIN version_documento vd ON p.id_version_documento = vd.id_version_documento JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve dato_extraido" ON dato_extraido FOR SELECT USING (is_encargado() AND id_procesamiento IN (SELECT p.id_procesamiento FROM procesamiento_idp p JOIN version_documento vd ON p.id_version_documento = vd.id_version_documento JOIN documento d ON vd.id_documento = d.id_documento WHERE usuario_gestiona_persona(d.id_persona)));
CREATE POLICY "Secretaria ve dato_extraido" ON dato_extraido FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve dato_extraido" ON dato_extraido AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve prevalidacion_documental" ON prevalidacion_documental FOR SELECT USING (id_version_documento IN (SELECT vd.id_version_documento FROM version_documento vd JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve prevalidacion_documental" ON prevalidacion_documental FOR SELECT USING (is_encargado() AND id_version_documento IN (SELECT vd.id_version_documento FROM version_documento vd JOIN documento d ON vd.id_documento = d.id_documento WHERE usuario_gestiona_persona(d.id_persona)));
CREATE POLICY "Secretaria ve prevalidacion_documental" ON prevalidacion_documental FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve prevalidacion_documental" ON prevalidacion_documental AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve comparacion_documental" ON comparacion_documental FOR SELECT USING (id_prevalidacion_documental IN (SELECT pd.id_prevalidacion_documental FROM prevalidacion_documental pd JOIN version_documento vd ON pd.id_version_documento = vd.id_version_documento JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve comparacion_documental" ON comparacion_documental FOR SELECT USING (is_encargado());
CREATE POLICY "Secretaria ve comparacion_documental" ON comparacion_documental FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve comparacion_documental" ON comparacion_documental AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve prevalidacion_expediente" ON prevalidacion_expediente FOR SELECT USING (id_asignacion IN (SELECT a.id_asignacion FROM asignacion_documento_requisito a JOIN requisito_expediente re ON a.id_requisito_expediente = re.id_requisito_expediente JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve prevalidacion_expediente" ON prevalidacion_expediente FOR SELECT USING (is_encargado());
CREATE POLICY "Secretaria ve prevalidacion_expediente" ON prevalidacion_expediente FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve prevalidacion_expediente" ON prevalidacion_expediente AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve comparacion_expediente" ON comparacion_expediente FOR SELECT USING (id_prevalidacion_expediente IN (SELECT pe.id_prevalidacion_expediente FROM prevalidacion_expediente pe JOIN asignacion_documento_requisito a ON pe.id_asignacion = a.id_asignacion JOIN requisito_expediente re ON a.id_requisito_expediente = re.id_requisito_expediente JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Encargado ve comparacion_expediente" ON comparacion_expediente FOR SELECT USING (is_encargado());
CREATE POLICY "Secretaria ve comparacion_expediente" ON comparacion_expediente FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin ve comparacion_expediente" ON comparacion_expediente AS PERMISSIVE FOR ALL USING (is_admin());

-- REVISIONES Y OBSERVACIONES
CREATE POLICY "Participante ve revision_documental" ON revision_documental FOR SELECT USING (id_prevalidacion_documental IN (SELECT pd.id_prevalidacion_documental FROM prevalidacion_documental pd JOIN version_documento vd ON pd.id_version_documento = vd.id_version_documento JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado revisa documentos" ON revision_documental FOR ALL USING (is_encargado());
CREATE POLICY "Secretaria revisa documentos" ON revision_documental FOR ALL USING (is_secretaria());
CREATE POLICY "Admin revisa documentos" ON revision_documental AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve observacion_documental" ON observacion_documental FOR SELECT USING (id_revision_documental IN (SELECT rd.id_revision_documental FROM revision_documental rd JOIN prevalidacion_documental pd ON rd.id_prevalidacion_documental = pd.id_prevalidacion_documental JOIN version_documento vd ON pd.id_version_documento = vd.id_version_documento JOIN documento d ON vd.id_documento = d.id_documento WHERE d.id_persona = current_persona_id()));
CREATE POLICY "Encargado inserta observacion_documental" ON observacion_documental FOR ALL USING (is_encargado());
CREATE POLICY "Secretaria inserta observacion_documental" ON observacion_documental FOR ALL USING (is_secretaria());
CREATE POLICY "Admin inserta observacion_documental" ON observacion_documental AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve revision_expediente" ON revision_expediente FOR SELECT USING (id_prevalidacion_expediente IN (SELECT pe.id_prevalidacion_expediente FROM prevalidacion_expediente pe JOIN asignacion_documento_requisito a ON pe.id_asignacion = a.id_asignacion JOIN requisito_expediente re ON a.id_requisito_expediente = re.id_requisito_expediente JOIN expediente e ON re.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Encargado revisa expedientes" ON revision_expediente FOR ALL USING (is_encargado());
CREATE POLICY "Secretaria revisa expedientes" ON revision_expediente FOR ALL USING (is_secretaria());
CREATE POLICY "Admin revisa expedientes" ON revision_expediente AS PERMISSIVE FOR ALL USING (is_admin());

CREATE POLICY "Participante ve observacion_expediente" ON observacion_expediente FOR SELECT USING (id_revision_expediente IN (SELECT re.id_revision_expediente FROM revision_expediente re JOIN prevalidacion_expediente pe ON re.id_prevalidacion_expediente = pe.id_prevalidacion_expediente JOIN asignacion_documento_requisito a ON pe.id_asignacion = a.id_asignacion JOIN requisito_expediente req ON a.id_requisito_expediente = req.id_requisito_expediente JOIN expediente e ON req.id_expediente = e.id_expediente JOIN inscripcion i ON e.id_inscripcion = i.id_inscripcion WHERE i.id_persona = current_persona_id()));
CREATE POLICY "Encargado inserta observacion_expediente" ON observacion_expediente FOR ALL USING (is_encargado());
CREATE POLICY "Secretaria inserta observacion_expediente" ON observacion_expediente FOR ALL USING (is_secretaria());
CREATE POLICY "Admin inserta observacion_expediente" ON observacion_expediente AS PERMISSIVE FOR ALL USING (is_admin());

-- AUDITORIA
CREATE POLICY "Secretaria ve auditoria" ON auditoria FOR SELECT USING (is_secretaria());
CREATE POLICY "Admin gestiona auditoria" ON auditoria AS PERMISSIVE FOR ALL USING (is_admin());

-- ======================================================================================
-- 5. STORAGE BUCKET Y POLÍTICAS
-- ======================================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('documentos-participantes', 'documentos-participantes', false, 20971520, '{application/pdf,image/jpeg,image/png}');

-- Policy para Participante SELECT (su propio prefijo de ID Persona)
CREATE POLICY "Participante SELECT documentos" ON storage.objects FOR SELECT USING (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = current_persona_id()::text
);

-- Policy para Participante INSERT (su propio prefijo de ID Persona)
CREATE POLICY "Participante INSERT documentos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = current_persona_id()::text
);

-- Policy para Encargado SELECT
CREATE POLICY "Encargado SELECT documentos" ON storage.objects FOR SELECT USING (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND is_encargado()
  AND usuario_gestiona_persona(NULLIF((storage.foldername(name))[1], '')::uuid)
);

-- Policy para Encargado INSERT
CREATE POLICY "Encargado INSERT documentos" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND is_encargado()
  AND usuario_gestiona_persona(NULLIF((storage.foldername(name))[1], '')::uuid)
);

-- Policy para Secretaria SELECT
CREATE POLICY "Secretaria SELECT documentos" ON storage.objects FOR SELECT USING (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND is_secretaria()
);

-- Policy para Admin ALL
CREATE POLICY "Admin gestiona documentos storage" ON storage.objects FOR ALL USING (
  bucket_id = 'documentos-participantes' 
  AND auth.role() = 'authenticated'
  AND is_admin()
);
