import { useNavigate } from 'react-router-dom';
import { User, UserCheck, Shield } from 'lucide-react';

const roles = [
  {
    label: 'Participante',
    description: 'Consultar inscripciones, documentos y avance.',
    path: '/participante',
    icon: User,
  },
  {
    label: 'Encargado',
    description: 'Gestionar inscripciones y expedientes de programas asignados.',
    path: '/encargado',
    icon: UserCheck,
  },
  {
    label: 'Administrador',
    description: 'Administrar programas, usuarios e inscripciones.',
    path: '/admin',
    icon: Shield,
  },
];

export default function RoleSelectPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-gray-950 flex items-center justify-center mx-auto mb-4">
            <span className="text-lg font-bold text-white">C</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900">Seleccionar vista</h1>
          <p className="text-sm text-gray-500 mt-1">Vista de demostración — selecciona un rol para explorar.</p>
        </div>

        <div className="space-y-3">
          {roles.map((role) => (
            <button
              key={role.path}
              onClick={() => navigate(role.path)}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-400 hover:shadow-sm transition-all text-left"
            >
              <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                <role.icon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{role.label}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
