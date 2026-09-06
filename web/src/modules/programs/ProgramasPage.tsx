import { useState } from 'react';
import { GraduationCap, Calendar, User } from 'lucide-react';
import { programasMock, usuariosMock } from '../../mocks';
import PreviewPanel from '../../components/PreviewPanel';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import type { Programa } from '../../types';

export default function ProgramasPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Programa | null>(null);
  const [showModal, setShowModal] = useState(false);

  const encargados = usuariosMock.filter((u) => u.rol === 'encargado');

  const filtered = programasMock.filter((p) => {
    const term = search.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.universidad.toLowerCase().includes(term) ||
      p.encargadoNombre.toLowerCase().includes(term)
    );
  });

  const statusColor = (estado: string) => {
    switch (estado) {
      case 'Activo':
      case 'En inscripción': return 'bg-green-50 text-green-700';
      case 'Finalizado': return 'bg-gray-100 text-gray-600';
      case 'Inactivo': return 'bg-red-50 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Programas</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Block */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">Gestión de Programas</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-64">
                <SearchBar value={search} onChange={setSearch} placeholder="Buscador..." />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Programa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Universidad</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Versión</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Inicio</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Fin</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Req.</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Encargado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prog) => (
                  <tr
                    key={prog.id}
                    onClick={() => setSelected(prog)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      selected?.id === prog.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{prog.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.universidad}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.version}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.fechaInicio}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.fechaFin}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.requisitos.length}</td>
                    <td className="px-4 py-3 text-gray-600">{prog.encargadoNombre}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(prog.estado)}`}>
                        {prog.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Panel Blocks */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Crear Programa
          </button>

          <PreviewPanel>
            {selected ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{selected.nombre}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Universidad</p>
                    <p className="text-gray-900">{selected.universidad}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Código</p>
                    <p className="text-gray-900">{selected.codigo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Versión</p>
                    <p className="text-gray-900">{selected.version}</p>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Inicio:</span>
                    <span className="text-xs text-gray-900">{selected.fechaInicio}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Finalización:</span>
                    <span className="text-xs text-gray-900">{selected.fechaFin}</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-gray-400" />
                    <span className="text-xs text-gray-500">Encargado:</span>
                    <span className="text-xs text-gray-900">{selected.encargadoNombre}</span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Estado</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor(selected.estado)}`}>
                      {selected.estado}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-500">Previsualización del Programa</p>
              </div>
            )}
          </PreviewPanel>
        </div>
      </div>

      {/* Create program modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Crear programa" size="xl">
        <div className="space-y-6">
          {/* Datos generales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Datos generales</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del programa</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Universidad / Institución</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Código del programa</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Versión / Edición / Gestión</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Modalidad</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                  <option value="">Seleccionar</option>
                  <option>Presencial</option>
                  <option>Virtual</option>
                  <option>Semipresencial</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de inicio</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de finalización</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha límite de inscripción</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha límite de documentación</label>
                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                  <option>Activo</option>
                  <option>Inactivo</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción breve</label>
                <textarea rows={2} className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
            </div>
          </div>

          {/* Responsable */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Responsable</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Encargado asignado</label>
              <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                <option value="">Seleccionar encargado</option>
                {encargados.map((e) => (
                  <option key={e.id} value={e.id}>{e.nombre} {e.apellidos}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Requisitos documentales */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Requisitos documentales</h3>
            <div className="space-y-3">
              {['Carnet de Identidad', 'Título / Diploma', 'Hoja de Vida', 'Ficha de Inscripción'].map((tipo) => (
                <div key={tipo} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                    <span className="text-sm text-gray-900">{tipo}</span>
                  </div>
                  <select className="px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white">
                    <option>Obligatorio</option>
                    <option>Opcional</option>
                  </select>
                </div>
              ))}
            </div>
          </div>

          {/* Afinidad académica */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Afinidad académica</h3>
            <p className="text-xs text-gray-500 mb-3">Configuración de afinidad académica para este programa. Esta sección será funcional en fases posteriores.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carreras aptas</label>
                <textarea rows={2} placeholder="Ej: Ciencias de la Educación, Psicología..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Áreas aptas</label>
                <textarea rows={2} placeholder="Ej: Educación, Ciencias Sociales..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Carreras relacionadas</label>
                <textarea rows={2} placeholder="Ej: Trabajo Social, Sociología..." className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Áreas relacionadas</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-gray-600 mb-1">Carreras explícitamente no aptas</label>
                <textarea rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none" />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={() => setShowModal(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Crear programa
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
