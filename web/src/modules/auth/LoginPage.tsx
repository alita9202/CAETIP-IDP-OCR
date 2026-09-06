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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
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
              <button type="button" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
                Recuperar contraseña
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-md mt-2"
            >
              Iniciar sesión
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
