import { useState } from 'react';
import { User, Eye, Edit3, ToggleLeft, ToggleRight } from 'lucide-react';
import { usuariosMock } from '../../mocks';
import SearchBar from '../../components/SearchBar';

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const filtered = usuariosMock.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.nombre.toLowerCase().includes(term) ||
      u.apellidos.toLowerCase().includes(term) ||
      u.correo.toLowerCase().includes(term) ||
      u.rol.toLowerCase().includes(term)
    );
  });

  const rolLabel = (rol: string) => {
    switch (rol) {
      case 'administrador': return 'Administrador';
      case 'encargado': return 'Encargado';
      case 'secretaria': return 'Secretaría';
      case 'participante': return 'Participante';
      default: return rol;
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
        <div className="w-full sm:w-64">
          <SearchBar value={search} onChange={setSearch} placeholder="Buscar usuario..." />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Correo</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-3.5 w-3.5 text-gray-500" />
                      </div>
                      <span className="font-medium text-gray-900">{user.nombre} {user.apellidos}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{user.correo}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {rolLabel(user.rol)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.estado === 'activo' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {user.estado === 'activo' ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Ver">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Editar rol">
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title={user.estado === 'activo' ? 'Deshabilitar' : 'Habilitar'}>
                        {user.estado === 'activo' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
