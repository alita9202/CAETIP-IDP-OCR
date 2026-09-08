import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as svc from './programas.service';

// ─── Query Keys ─────────────────────────────────────────────────────────

export const programasKeys = {
  all: ['programas'] as const,
  ofertas: (idPrograma: string) => ['ofertas', idPrograma] as const,
  universidades: ['universidades'] as const,
  tiposDocumento: ['tipos-documento'] as const,
  encargados: ['encargados-disponibles'] as const,
};

// ─── Programas ──────────────────────────────────────────────────────────

export function useProgramas() {
  return useQuery({ queryKey: programasKeys.all, queryFn: svc.fetchProgramas });
}

export function useCreatePrograma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createPrograma,
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.all }),
  });
}

export function useUpdatePrograma() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: { id: string; nombre?: string; descripcion?: string; activo?: boolean }) =>
      svc.updatePrograma(id, rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.all }),
  });
}

// ─── Ofertas ────────────────────────────────────────────────────────────

export function useOfertasByPrograma(idPrograma: string | null) {
  return useQuery({
    queryKey: programasKeys.ofertas(idPrograma ?? ''),
    queryFn: () => svc.fetchOfertasByPrograma(idPrograma!),
    enabled: !!idPrograma,
  });
}

export function useCreateOferta() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createOferta,
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: programasKeys.ofertas(vars.id_programa) });
    },
  });
}

export function useUpdateOferta(idPrograma: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: Parameters<typeof svc.updateOferta>[1] & { id: string }) =>
      svc.updateOferta(id, rest),
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.ofertas(idPrograma) }),
  });
}

// ─── Universidades ──────────────────────────────────────────────────────

export function useUniversidades() {
  return useQuery({ queryKey: programasKeys.universidades, queryFn: svc.fetchUniversidades });
}

export function useCreateUniversidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createUniversidad,
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.universidades }),
  });
}

// ─── Tipos Documento ────────────────────────────────────────────────────

export function useTiposDocumento() {
  return useQuery({ queryKey: programasKeys.tiposDocumento, queryFn: svc.fetchTiposDocumento });
}

// ─── Requisitos ─────────────────────────────────────────────────────────

export function useUpsertRequisitos(idPrograma: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idOferta, requisitos }: { idOferta: string; requisitos: Parameters<typeof svc.upsertRequisitosOferta>[1] }) =>
      svc.upsertRequisitosOferta(idOferta, requisitos),
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.ofertas(idPrograma) }),
  });
}

// ─── Encargados ─────────────────────────────────────────────────────────

export function useEncargadosDisponibles() {
  return useQuery({ queryKey: programasKeys.encargados, queryFn: svc.fetchEncargadosDisponibles });
}

export function useAsignarEncargado(idPrograma: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ idOferta, idUsuario }: { idOferta: string; idUsuario: string }) =>
      svc.asignarEncargado(idOferta, idUsuario),
    onSuccess: () => qc.invalidateQueries({ queryKey: programasKeys.ofertas(idPrograma) }),
  });
}
