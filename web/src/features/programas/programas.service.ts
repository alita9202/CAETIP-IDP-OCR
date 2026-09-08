import { supabase } from '../../lib/supabase';

// ─── Types ────────────────────────────────────────────────────────────────

export interface Programa {
  id_programa: string;
  nombre: string;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  ofertas?: OfertaPrograma[];
}

export interface Universidad {
  id_universidad: string;
  nombre: string;
  sigla: string | null;
  activo: boolean;
}

export interface TipoDocumento {
  id_tipo_documento: string;
  codigo: string;
  nombre: string;
  soporta_idp: boolean;
  activo: boolean;
}

export interface OfertaPrograma {
  id_oferta: string;
  id_programa: string;
  id_universidad: string;
  codigo: string | null;
  version: string;
  gestion: string;
  modalidad: string | null;
  fecha_inicio: string | null;
  fecha_fin: string | null;
  fecha_limite_inscripcion: string | null;
  fecha_limite_documentacion: string | null;
  estado: string;
  universidad?: Universidad;
  requisitos?: RequisitoOferta[];
  asignaciones_encargado?: AsignacionEncargado[];
}

export interface RequisitoOferta {
  id_requisito_oferta: string;
  id_oferta: string;
  id_tipo_documento: string;
  obligatorio: boolean;
  descripcion: string | null;
  orden: number | null;
  tipo_documento?: TipoDocumento;
}

export interface AsignacionEncargado {
  id_asignacion_encargado: string;
  id_oferta: string;
  id_usuario: string;
  tipo_responsable: string;
  activo: boolean;
  usuario?: { id_usuario: string; persona?: { nombres: string; apellidos: string } };
}

export interface EncargadoDisponible {
  id_usuario: string;
  persona: { nombres: string; apellidos: string } | null;
}

// ─── Programas ─────────────────────────────────────────────────────────

export async function fetchProgramas() {
  const { data, error } = await supabase
    .from('programa')
    .select('*')
    .order('nombre');
  if (error) throw error;
  return data as Programa[];
}

export async function createPrograma(payload: { nombre: string; descripcion?: string; activo?: boolean }) {
  const { data, error } = await supabase
    .from('programa')
    .insert({ nombre: payload.nombre, descripcion: payload.descripcion || null, activo: payload.activo ?? true })
    .select()
    .single();
  if (error) throw error;
  return data as Programa;
}

export async function updatePrograma(id: string, payload: { nombre?: string; descripcion?: string; activo?: boolean }) {
  const { data, error } = await supabase
    .from('programa')
    .update(payload)
    .eq('id_programa', id)
    .select()
    .single();
  if (error) throw error;
  return data as Programa;
}

// ─── Universidades ─────────────────────────────────────────────────────

export async function fetchUniversidades() {
  const { data, error } = await supabase.from('universidad').select('*').order('nombre');
  if (error) throw error;
  return data as Universidad[];
}

export async function createUniversidad(payload: { nombre: string; sigla?: string }) {
  const { data, error } = await supabase
    .from('universidad')
    .insert({ nombre: payload.nombre, sigla: payload.sigla || null })
    .select()
    .single();
  if (error) throw error;
  return data as Universidad;
}

// ─── Ofertas ────────────────────────────────────────────────────────────

export async function fetchOfertasByPrograma(idPrograma: string) {
  const { data, error } = await supabase
    .from('oferta_programa')
    .select(`
      *,
      universidad:universidad(*),
      requisitos:requisito_oferta(*, tipo_documento:tipo_documento(*)),
      asignaciones_encargado:asignacion_encargado(*, usuario:usuario(id_usuario, persona:persona(nombres, apellidos)))
    `)
    .eq('id_programa', idPrograma)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as OfertaPrograma[];
}

export async function createOferta(payload: {
  id_programa: string;
  id_universidad: string;
  codigo?: string;
  version: string;
  gestion: string;
  modalidad?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fecha_limite_inscripcion?: string;
  fecha_limite_documentacion?: string;
  estado: string;
}) {
  const { data, error } = await supabase
    .from('oferta_programa')
    .insert({
      id_programa: payload.id_programa,
      id_universidad: payload.id_universidad,
      codigo: payload.codigo || null,
      version: payload.version,
      gestion: payload.gestion,
      modalidad: payload.modalidad || null,
      fecha_inicio: payload.fecha_inicio || null,
      fecha_fin: payload.fecha_fin || null,
      fecha_limite_inscripcion: payload.fecha_limite_inscripcion || null,
      fecha_limite_documentacion: payload.fecha_limite_documentacion || null,
      estado: payload.estado,
    })
    .select()
    .single();
  if (error) throw error;
  return data as OfertaPrograma;
}

export async function updateOferta(id: string, payload: Partial<{
  id_universidad: string;
  codigo: string;
  version: string;
  gestion: string;
  modalidad: string;
  fecha_inicio: string;
  fecha_fin: string;
  fecha_limite_inscripcion: string;
  fecha_limite_documentacion: string;
  estado: string;
}>) {
  const { data, error } = await supabase
    .from('oferta_programa')
    .update(payload)
    .eq('id_oferta', id)
    .select()
    .single();
  if (error) throw error;
  return data as OfertaPrograma;
}

// ─── Tipos de Documento ─────────────────────────────────────────────────

export async function fetchTiposDocumento() {
  const { data, error } = await supabase.from('tipo_documento').select('*').eq('activo', true).order('nombre');
  if (error) throw error;
  return data as TipoDocumento[];
}

// ─── Requisitos de Oferta ───────────────────────────────────────────────

export async function upsertRequisitosOferta(idOferta: string, requisitos: { id_tipo_documento: string; obligatorio: boolean; descripcion?: string; orden?: number }[]) {
  // Delete existing requisitos for this oferta, then insert new ones
  const { error: delError } = await supabase.from('requisito_oferta').delete().eq('id_oferta', idOferta);
  if (delError) throw delError;

  if (requisitos.length === 0) return [];

  const rows = requisitos.map((r) => ({
    id_oferta: idOferta,
    id_tipo_documento: r.id_tipo_documento,
    obligatorio: r.obligatorio,
    descripcion: r.descripcion || null,
    orden: r.orden ?? null,
  }));

  const { data, error } = await supabase.from('requisito_oferta').insert(rows).select();
  if (error) throw error;
  return data as RequisitoOferta[];
}

// ─── Encargados ─────────────────────────────────────────────────────────

export async function fetchEncargadosDisponibles() {
  // First get the ENCARGADO role id
  const { data: rolData } = await supabase.from('rol').select('id_rol').eq('codigo', 'ENCARGADO').single();
  if (!rolData) return [];

  const { data, error } = await supabase
    .from('usuario')
    .select('id_usuario, persona:persona(nombres, apellidos)')
    .eq('estado', 'ACTIVO')
    .eq('id_rol', rolData.id_rol);
  if (error) throw error;
  // Supabase returns the joined persona as an object (single relation)
  return (data ?? []) as unknown as EncargadoDisponible[];
}

export async function asignarEncargado(idOferta: string, idUsuario: string) {
  // Deactivate existing active assignments for this oferta
  await supabase.from('asignacion_encargado').update({ activo: false }).eq('id_oferta', idOferta).eq('activo', true);

  const { data, error } = await supabase
    .from('asignacion_encargado')
    .insert({ id_oferta: idOferta, id_usuario: idUsuario, activo: true, tipo_responsable: 'PRINCIPAL' })
    .select()
    .single();
  if (error) throw error;
  return data;
}
