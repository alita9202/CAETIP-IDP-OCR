import { useState } from 'react';
import { Search, User } from 'lucide-react';
import { inscripcionesEncargadoMock, programasMock } from '../../mocks';
import { estadoInscripcionLabel, estadoInscripcionColor } from '../../utils/estadoLabels';
import EstadoChip from '../../components/EstadoChip';
import PreviewPanel from '../../components/PreviewPanel';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import type { Inscripcion } from '../../types';

export default function InscripcionesEncargadoPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Inscripcion | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [ciSearch, setCiSearch] = useState('');
  const [personFound, setPersonFound] = useState<boolean | null>(null);

  const filtered = inscripcionesEncargadoMock.filter((insc) => {
    const term = search.toLowerCase();
    return (
      insc.nombreCompleto.toLowerCase().includes(term) ||
      insc.ci.toLowerCase().includes(term) ||
      insc.correo.toLowerCase().includes(term)
    );
  });

  const handleCiSearch = () => {
    const found = inscripcionesEncargadoMock.some((i) => i.ci === ciSearch);
    setPersonFound(found);
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inscripciones</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Block */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">Registro de Inscritos</h2>
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
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre Completo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Correo E</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Numero Ref</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((insc) => (
                  <tr
                    key={insc.id}
                    onClick={() => setSelected(insc)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      selected?.id === insc.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{insc.nombreCompleto}</td>
                    <td className="px-4 py-3 text-gray-600">{insc.ci}</td>
                    <td className="px-4 py-3 text-gray-600">{insc.correo}</td>
                    <td className="px-4 py-3 text-gray-600">{insc.telefono}</td>
                    <td className="px-4 py-3">
                      <EstadoChip label={estadoInscripcionLabel[insc.estado]} colorClass={estadoInscripcionColor[insc.estado]} />
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
            onClick={() => { setShowModal(true); setCiSearch(''); setPersonFound(null); }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            Inscribir Participante
          </button>

          <PreviewPanel>
            {selected ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{selected.nombreCompleto}</h3>
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">CI</p>
                    <p className="text-gray-900">{selected.ci}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Correo</p>
                    <p className="text-gray-900">{selected.correo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Teléfono / WhatsApp</p>
                    <p className="text-gray-900">{selected.telefono}</p>
                  </div>
                  <hr className="border-gray-200" />
                  <div>
                    <p className="text-gray-500 text-xs">Programa</p>
                    <p className="text-gray-900">{selected.programaNombre}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Versión / Gestión</p>
                    <p className="text-gray-900">{selected.version}</p>
                  </div>
                  <div className="mt-4 aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <p className="text-xs text-gray-400 text-center px-4">Previsualización de Inscripción</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-10">Previsualización de Inscripción</p>
            )}
          </PreviewPanel>
        </div>
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Inscribir participante" size="xl">
        <div className="space-y-6">
          {/* Step 1: Search by CI */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar persona por CI</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Número de CI"
                value={ciSearch}
                onChange={(e) => { setCiSearch(e.target.value); setPersonFound(null); }}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={handleCiSearch}
                className="px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </div>
            {personFound === true && (
              <p className="mt-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg">Persona encontrada. Se reutilizarán los datos existentes.</p>
            )}
            {personFound === false && (
              <p className="mt-2 text-sm text-blue-700 bg-blue-50 px-3 py-2 rounded-lg">Persona no encontrada. Completa los datos para registrar.</p>
            )}
          </div>

          {/* Registration fields (shown when person not found) */}
          {personFound === false && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombres</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellidos</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">CI</label>
                <input type="text" value={ciSearch} readOnly className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Correo electrónico</label>
                <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teléfono / WhatsApp</label>
                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent" />
              </div>
            </div>
          )}

          {/* Program selection */}
          {personFound !== null && (
            <>
              <hr className="border-gray-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Programa</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                    <option value="">Seleccionar programa</option>
                    {programasMock.map((p) => (
                      <option key={p.id} value={p.id}>{p.nombre}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Oferta / Versión</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                    <option value="">Seleccionar versión</option>
                    {programasMock.map((p) => (
                      <option key={p.id} value={p.version}>{p.version}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado de matrícula</label>
                  <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Confirmada">Confirmada</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Crear inscripción
                </button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
