import { FileText, FolderOpen, Users, Clock } from 'lucide-react';

interface InicioPageProps {
  rol: 'participante' | 'encargado' | 'administrador';
  nombre: string;
}

export default function InicioPage({ rol, nombre }: InicioPageProps) {
  const saludo = () => {
    const hora = new Date().getHours();
    if (hora < 12) return 'Buenos días';
    if (hora < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const resumen = {
    participante: [
      { icon: FileText, label: 'Inscripciones activas', valor: '2' },
      { icon: FolderOpen, label: 'Documentos cargados', valor: '5' },
      { icon: Clock, label: 'Documentos en proceso', valor: '1' },
    ],
    encargado: [
      { icon: Users, label: 'Participantes asignados', valor: '15' },
      { icon: FolderOpen, label: 'Expedientes pendientes', valor: '4' },
      { icon: Clock, label: 'Revisiones pendientes', valor: '3' },
    ],
    administrador: [
      { icon: FileText, label: 'Programas activos', valor: '3' },
      { icon: Users, label: 'Usuarios registrados', valor: '7' },
      { icon: FolderOpen, label: 'Inscripciones totales', valor: '28' },
    ],
  };

  return (
    <div className="p-6 lg:p-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          {saludo()}, {nombre}
        </h1>
        <p className="text-gray-500 mt-1">Bienvenido al sistema CAETIP.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {resumen[rol].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center">
                <item.icon className="h-4.5 w-4.5 text-gray-600" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{item.valor}</p>
            <p className="text-sm text-gray-500 mt-1">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
