import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useActivarCuenta } from '../../features/usuarios/usuarios.hooks';

export default function ActivarCuentaPage() {
  const { session, perfil, loading, perfilLoading } = useAuth();
  const activarCuenta = useActivarCuenta();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mError, setMError] = useState('');
  const [mLoading, setMLoading] = useState(false);

  if (loading || perfilLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Si no hay sesión, o no está pendiente, lo mandamos al login o dashboard
  if (!session) {
    return <Navigate to="/login" replace />;
  }
  
  if (perfil && perfil.estado !== 'PENDIENTE') {
    return <Navigate to="/login" replace />; // El guard lo enviará a su dashboard
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMError('');
    if (password.length < 6) {
      setMError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setMError('Las contraseñas no coinciden.');
      return;
    }

    setMLoading(true);
    try {
      // 1. Establecer la contraseña en auth
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;

      // 2. Cambiar estado a ACTIVO validando consistencia interna (Edge cases mitigados aquí)
      if (!perfil?.id_usuario) throw new Error('Perfil incompleto.');
      await activarCuenta.mutateAsync(perfil.id_usuario);

      // 3. Forzar refresco recargando la aplicación
      window.location.href = '/';
      
    } catch (err: any) {
      setMError(err.message || 'Error al activar la cuenta.');
      setMLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="flex justify-center mb-6">
            <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Activa tu cuenta</h1>
            <p className="text-sm text-gray-500">
              Establece una contraseña segura para acceder al sistema CAETIP.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {mError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0"/>
                <span>{mError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50/50"
                placeholder="Mínimo 6 caracteres"
              />
            </div>
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-gray-700">Confirmar contraseña</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 bg-gray-50/50"
                placeholder="Repite tu contraseña"
              />
            </div>

            <button
              type="submit"
              disabled={mLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-950 hover:bg-gray-800 text-white text-sm font-medium rounded-xl transition-all disabled:opacity-70"
            >
              {mLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mLoading ? 'Activando...' : 'Activar Cuenta'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
