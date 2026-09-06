-- ======================================================================================
-- FIX: Agregar GRANTS y políticas RLS faltantes para asignacion_encargado
-- ======================================================================================
-- La tabla asignacion_encargado fue omitida en la migración de seguridad.
-- El Administrador necesita poder asignar encargados a ofertas académicas.
-- El Encargado necesita poder consultar sus propias asignaciones.

-- 1. GRANTS
GRANT INSERT, UPDATE, DELETE ON asignacion_encargado TO authenticated;

-- 2. POLÍTICAS RLS
CREATE POLICY "Encargado ve sus asignaciones" ON asignacion_encargado FOR SELECT USING (id_usuario = auth.uid());
CREATE POLICY "Admin gestiona asignaciones_encargado" ON asignacion_encargado AS PERMISSIVE FOR ALL USING (is_admin());
CREATE POLICY "Secretaria ve asignaciones" ON asignacion_encargado FOR SELECT USING (is_secretaria());
