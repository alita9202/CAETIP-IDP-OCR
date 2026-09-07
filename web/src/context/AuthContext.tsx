import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export interface UsuarioPerfil {
  id_usuario: string;
  id_persona: string;
  estado: string;
  rol_codigo: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  perfil: UsuarioPerfil | null;
  loading: boolean;
  perfilLoading: boolean;
  perfilError: string | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<UsuarioPerfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [perfilLoading, setPerfilLoading] = useState(false);
  const [perfilError, setPerfilError] = useState<string | null>(null);

  // Fetch usuario + rol from public tables
  async function fetchPerfil(userId: string) {
    setPerfilLoading(true);
    setPerfilError(null);
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('id_usuario, id_persona, estado, rol:rol(codigo)')
        .eq('id_usuario', userId)
        .single();

      if (error || !data) {
        setPerfilError('No se encontró un perfil de usuario asociado a esta cuenta.');
        setPerfil(null);
        return;
      }

      // data.rol comes as { codigo: string } from the join
      const rolObj = data.rol as unknown as { codigo: string } | null;
      if (!rolObj) {
        setPerfilError('El usuario no tiene un rol asignado.');
        setPerfil(null);
        return;
      }

      setPerfil({
        id_usuario: data.id_usuario,
        id_persona: data.id_persona,
        estado: data.estado,
        rol_codigo: rolObj.codigo,
      });
    } catch {
      setPerfilError('Error al obtener el perfil del usuario.');
      setPerfil(null);
    } finally {
      setPerfilLoading(false);
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchPerfil(s.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchPerfil(s.user.id);
      } else {
        setPerfil(null);
        setPerfilError(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
    setPerfil(null);
    setPerfilError(null);
  };

  return (
    <AuthContext.Provider value={{ session, user, perfil, loading, perfilLoading, perfilError, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  return ctx;
}
