import { supabase } from '../../lib/supabase';

export interface Rol {
  id_rol: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
}

export interface Persona {
  id_persona: string;
  nombres: string;
  apellidos: string;
  ci: string;
  correo: string;
  telefono?: string;
  fecha_nacimiento?: string;
}

export interface UsuarioCompleto {
  id_usuario: string;
  estado: string;
  fecha_creacion: string;
  fecha_activacion?: string;
  persona: Persona;
  rol: Rol;
  asignaciones_encargado?: any[];
}

export const UsuariosService = {
  // 1. Obtener Roles permitidos para crear usuarios
  async getRoles(): Promise<Rol[]> {
    const { data, error } = await supabase
      .from('rol')
      .select('*')
      .in('codigo', ['ADMINISTRADOR', 'SECRETARIA', 'ENCARGADO']);

    if (error) throw new Error(error.message);
    return data || [];
  },

  // 2. Buscar Persona por CI
  async getPersonaByCI(ci: string): Promise<Persona | null> {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .eq('ci', ci)
      .maybeSingle();
      
    if (error) throw new Error(error.message);
    return data;
  },

  // 2.1 Buscar Persona por Correo
  async getPersonaByCorreo(correo: string): Promise<Persona | null> {
    const { data, error } = await supabase
      .from('persona')
      .select('*')
      .eq('correo', correo)
      .limit(1)
      .maybeSingle();
      
    if (error) throw new Error(error.message);
    return data;
  },

  // 3. Crear Persona
  async createPersona(payload: Omit<Persona, 'id_persona'>): Promise<Persona> {
    const { data, error } = await supabase
      .from('persona')
      .insert(payload)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  // 4. Obtener todos los usuarios con sus detalles
async getUsuarios(): Promise<UsuarioCompleto[]> {
  const { data, error } = await supabase
    .from('usuario')
    .select(`
      id_usuario,
      estado,
      fecha_creacion:created_at,
      fecha_activacion,
      persona:id_persona (
        id_persona,
        nombres,
        apellidos,
        ci,
        correo,
        telefono,
        fecha_nacimiento
      ),
      rol:id_rol (
        id_rol,
        codigo,
        nombre
      ),
      asignaciones_encargado:asignacion_encargado (
        id_asignacion_encargado,
        activo,
        oferta_programa (
          version,
          gestion,
          programa (nombre)
        )
      )
    `);

  if (error) throw new Error(error.message);

  return (data || []).map(row => ({
    ...row,
    persona: Array.isArray(row.persona) ? row.persona[0] : row.persona,
    rol: Array.isArray(row.rol) ? row.rol[0] : row.rol,
  })) as UsuarioCompleto[];
},

  // 5. Actualizar Usuario (Estado o Rol)
  async updateUsuario(id_usuario: string, payload: { estado?: string; id_rol?: string }): Promise<void> {
    const { error } = await supabase
      .from('usuario')
      .update(payload)
      .eq('id_usuario', id_usuario);

    if (error) throw new Error(error.message);
  },

  // 6. Invocar Edge Function para crear usuario e invitar
  async inviteUser(payload: { correo: string; id_persona: string; id_rol: string }): Promise<{ userId: string; warning?: string }> {
    const { data, error } = await supabase.functions.invoke('admin-users', {
      body: payload
    });

    // supabase.functions.invoke pone el body parseado en data incluso en non-2xx
    if (error) {
      const msg = data?.error || error.message || 'Error al invocar la función de invitación.';
      throw new Error(msg);
    }
    if (data?.error) throw new Error(data.error);

    return data;
  },
  
  // 7. Activar cuenta tras establecer contraseña (llamado por el propio usuario)
  async activarCuenta(id_usuario: string): Promise<void> {
    // Validar que exista la relacion id_usuario -> persona -> rol, 
    // Aunque esto es en general ya validado por el perfil del AuthContext, 
    // verificamos localmente
    const { data, error } = await supabase
      .from('usuario')
      .select('id_persona, id_rol')
      .eq('id_usuario', id_usuario)
      .single();
      
    if (error || !data?.id_persona || !data?.id_rol) {
      throw new Error('Integridad de usuario fallida. No se puede activar la cuenta.');
    }

    const { error: updateError } = await supabase
      .from('usuario')
      .update({ estado: 'ACTIVO', fecha_activacion: new Date().toISOString() })
      .eq('id_usuario', id_usuario);
      
    if (updateError) throw new Error(updateError.message);
  }
};
