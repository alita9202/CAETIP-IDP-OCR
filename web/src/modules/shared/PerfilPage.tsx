import { User, Mail, Phone, Shield } from 'lucide-react';

interface PerfilPageProps {
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  rol: string;
}

export default function PerfilPage({ nombre, apellidos, correo, telefono, rol }: PerfilPageProps) {
  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Mi perfil</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
          <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <User className="h-7 w-7 text-gray-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{nombre} {apellidos}</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 capitalize">
              {rol}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="h-4.5 w-4.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Correo electrónico</p>
              <p className="text-sm text-gray-900">{correo}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4.5 w-4.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="text-sm text-gray-900">{telefono}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-4.5 w-4.5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Rol en el sistema</p>
              <p className="text-sm text-gray-900 capitalize">{rol}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
