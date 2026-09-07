import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const ROLE_HOME: Record<string, string> = {
  PARTICIPANTE: '/participante',
  ENCARGADO: '/encargado',
  SECRETARIA: '/admin',
  ADMINISTRADOR: '/admin',
};

export default function LoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password recovery
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: correo,
        password: contrasena,
      });

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          setError('Correo o contraseña incorrectos.');
        } else if (authError.message.includes('Email not confirmed')) {
          setError('Tu cuenta de correo no ha sido confirmada.');
        } else {
          setError('Error al iniciar sesión. Intenta de nuevo.');
        }
        setLoading(false);
        return;
      }

      // Auth succeeded; fetch the user's role from public.usuario
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setError('Error al obtener la sesión.');
        setLoading(false);
        return;
      }

      const { data: perfil, error: perfilError } = await supabase
        .from('usuario')
        .select('estado, rol:rol(codigo)')
        .eq('id_usuario', user.id)
        .single();

      if (perfilError || !perfil) {
        setError('No se encontró un perfil de usuario asociado a esta cuenta. Contacta al administrador.');
        setLoading(false);
        return;
      }

      if (perfil.estado !== 'ACTIVO') {
        const msgs: Record<string, string> = {
          PENDIENTE: 'Tu cuenta está pendiente de activación.',
          INACTIVO: 'Tu cuenta ha sido desactivada.',
          BLOQUEADO: 'Tu cuenta ha sido bloqueada.',
        };
        setError(msgs[perfil.estado] || 'Tu cuenta no está activa.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const rolObj = perfil.rol as unknown as { codigo: string } | null;
      const rolCodigo = rolObj?.codigo;
      if (!rolCodigo) {
        setError('Tu usuario no tiene un rol asignado. Contacta al administrador.');
        await supabase.auth.signOut();
        setLoading(false);
        return;
      }

      const home = ROLE_HOME[rolCodigo] || '/login';
      navigate(home, { replace: true });
    } catch {
      setError('Error de conexión. Verifica tu conexión a internet.');
      setLoading(false);
    }
  };

  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (recoveryLoading) return;
    setRecoveryLoading(true);

    await supabase.auth.resetPasswordForEmail(recoveryEmail);
    // Always show success to avoid revealing whether the email exists
    setRecoverySent(true);
    setRecoveryLoading(false);
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center lg:justify-end lg:pr-32 overflow-hidden">
      {/* Background Image - Dominant */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/login-bg.jpg" 
          alt="Fondo Institucional" 
          className="w-full h-full object-cover object-center" 
        />
        <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[2px]" />
      </div>

      {/* Very subtle elegant text on the left */}
      <div className="absolute left-16 top-1/2 -translate-y-1/2 z-10 hidden lg:block max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-6 shadow-2xl">
          <span className="text-3xl font-bold text-gray-900">C</span>
        </div>
        <h1 className="text-5xl font-bold text-white mb-3">CAETIP</h1>
        <p className="text-xl text-gray-200 font-light tracking-wide">
          Plataforma de Gestión Documental
        </p>
      </div>

      {/* Floating Form Card */}
      <div className="relative z-10 w-full max-w-md px-4 lg:px-0">
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-10">
          
          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gray-950 flex items-center justify-center mb-3 shadow-lg">
              <span className="text-2xl font-bold text-white">C</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">CAETIP</h2>
          </div>

          {!showRecovery ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
              <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para acceder al sistema.</p>

              {error && (
                <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Correo electrónico
                  </label>
                  <input
                    id="correo"
                    type="email"
                    placeholder="correo@ejemplo.com"
                    value={correo}
                    onChange={(e) => setCorreo(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label htmlFor="contrasena" className="block text-sm font-medium text-gray-700 mb-1.5">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      id="contrasena"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••"
                      value={contrasena}
                      onChange={(e) => setContrasena(e.target.value)}
                      required
                      disabled={loading}
                      className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-60"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowRecovery(true); setRecoveryEmail(correo); setRecoverySent(false); }}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Recuperar contraseña
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loading ? 'Iniciando sesión…' : 'Iniciar sesión'}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-900 mb-1">Recuperar contraseña</h2>
              <p className="text-gray-500 text-sm mb-6">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</p>

              {recoverySent ? (
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">Si el correo está registrado, recibirás instrucciones para restablecer tu contraseña.</p>
                  </div>
                  <button
                    onClick={() => { setShowRecovery(false); setRecoverySent(false); }}
                    className="w-full py-3 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRecovery} className="space-y-5">
                  <div>
                    <label htmlFor="recovery-email" className="block text-sm font-medium text-gray-700 mb-1.5">
                      Correo electrónico
                    </label>
                    <input
                      id="recovery-email"
                      type="email"
                      placeholder="correo@ejemplo.com"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      required
                      disabled={recoveryLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all disabled:opacity-60"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={recoveryLoading}
                    className="w-full py-3 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {recoveryLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {recoveryLoading ? 'Enviando…' : 'Enviar enlace'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRecovery(false)}
                    className="w-full py-2.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Volver al inicio de sesión
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
