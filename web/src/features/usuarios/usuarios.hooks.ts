import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UsuariosService } from './usuarios.service';
import type { Persona, UsuarioCompleto, Rol } from './usuarios.service';

export function useUsuarios() {
  return useQuery<UsuarioCompleto[], Error>({
    queryKey: ['usuarios'],
    queryFn: UsuariosService.getUsuarios,
  });
}

export function useRolesAllowed() {
  return useQuery<Rol[], Error>({
    queryKey: ['roles'],
    queryFn: UsuariosService.getRoles,
  });
}

export function usePersonaByCI(ci: string) {
  return useQuery<Persona | null, Error>({
    queryKey: ['persona', ci],
    queryFn: () => UsuariosService.getPersonaByCI(ci),
    enabled: !!ci && ci.length >= 5,
    retry: false
  });
}

export function useCreatePersona() {
  return useMutation<Persona, Error, Omit<Persona, 'id_persona'>>({
    mutationFn: UsuariosService.createPersona,
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  return useMutation<{ userId: string; warning?: string }, Error, { correo: string; id_persona: string; id_rol: string }>({
    mutationFn: UsuariosService.inviteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useUpdateUsuario() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { id_usuario: string; payload: { estado?: string; id_rol?: string } }>({
    mutationFn: ({ id_usuario, payload }) => UsuariosService.updateUsuario(id_usuario, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
  });
}

export function useActivarCuenta() {
  return useMutation<void, Error, string>({
    mutationFn: UsuariosService.activarCuenta,
  });
}
