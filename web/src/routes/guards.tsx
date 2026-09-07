import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ROLE_HOME: Record<string, string> = {
  PARTICIPANTE: '/participante',
  ENCARGADO: '/encargado',
  SECRETARIA: '/admin',
  ADMINISTRADOR: '/admin',
};

/**
 * Requires an authenticated session. Redirects to /login otherwise.
 * Shows a loading spinner while session/perfil are resolving.
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading, perfil, perfilLoading, perfilError } = useAuth();

  if (loading || perfilLoading) {
    return <LoadingScreen />;
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  if (perfilError || !perfil) {
    return <ErrorScreen message={perfilError || 'No se pudo cargar el perfil del usuario.'} />;
  }

  if (perfil.estado !== 'ACTIVO') {
    return <InactiveScreen estado={perfil.estado} />;
  }

  return <>{children}</>;
}

/**
 * Requires the user to have one of the allowed roles.
 * Must be used inside RequireAuth.
 */
export function RequireRole({ allowed, children }: { allowed: string[]; children: React.ReactNode }) {
  const { perfil } = useAuth();

  if (!perfil || !allowed.includes(perfil.rol_codigo)) {
    const home = perfil ? ROLE_HOME[perfil.rol_codigo] || '/login' : '/login';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

/**
 * If the user is already authenticated and has a perfil, redirect to their home.
 * Used to wrap /login so authenticated users skip the login form.
 */
export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { session, loading, perfil, perfilLoading } = useAuth();

  if (loading || perfilLoading) {
    return <LoadingScreen />;
  }

  if (session && perfil && perfil.estado === 'ACTIVO') {
    const home = ROLE_HOME[perfil.rol_codigo] || '/login';
    return <Navigate to={home} replace />;
  }

  return <>{children}</>;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        <p className="text-sm text-gray-500">Cargando…</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  const { signOut } = useAuth();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Acceso no disponible</h2>
        <p className="text-sm text-gray-600">{message}</p>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}

function InactiveScreen({ estado }: { estado: string }) {
  const { signOut } = useAuth();
  const messages: Record<string, string> = {
    PENDIENTE: 'Tu cuenta está pendiente de activación. Contacta al administrador.',
    INACTIVO: 'Tu cuenta ha sido desactivada. Contacta al administrador.',
    BLOQUEADO: 'Tu cuenta ha sido bloqueada. Contacta al administrador.',
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Cuenta {estado.toLowerCase()}</h2>
        <p className="text-sm text-gray-600">{messages[estado] || 'No se permite el acceso con este estado de cuenta.'}</p>
        <button
          onClick={signOut}
          className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
