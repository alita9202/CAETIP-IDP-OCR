import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/seleccionar-rol');
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - visual */}
      <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center">
        <img src="/login-bg.jpg" alt="Fondo" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gray-950/70" />
        <div className="relative z-10 px-12 max-w-lg">
          <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mb-8">
            <span className="text-2xl font-bold text-gray-900">C</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">CAETIP</h1>
          <p className="text-lg text-gray-200 leading-relaxed">
            Plataforma de gestión documental e inscripciones con procesamiento inteligente de documentos.
          </p>
          <div className="mt-12 pt-8 border-t border-gray-600/50">
            <p className="text-gray-300 text-sm italic">
              “Automatizando la prevalidación documental para que el equipo pueda enfocarse en lo que realmente importa.”
            </p>
            <p className="text-gray-400 text-sm mt-2">— CAETIP S.R.L.</p>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gray-950 flex items-center justify-center">
              <span className="text-lg font-bold text-white">C</span>
            </div>
            <span className="text-xl font-bold text-gray-900">CAETIP</span>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-1">Iniciar sesión</h2>
            <p className="text-gray-500 text-sm mb-8">Ingresa tus credenciales para acceder al sistema.</p>

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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
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
                    className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button type="button" className="text-sm text-gray-600 hover:text-gray-900">
                  Recuperar contraseña
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
              >
                Iniciar sesión
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
