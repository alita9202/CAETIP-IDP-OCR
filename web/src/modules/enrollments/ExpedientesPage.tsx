import { useState } from 'react';
import { Eye, ChevronDown, User, Calendar, BookOpen } from 'lucide-react';
import { expedientesMock, programasMock } from '../../mocks';
import { estadoDocumentoLabel, estadoDocumentoColor, estadoExpedienteLabel, estadoExpedienteColor, estadoInscripcionLabel, estadoInscripcionColor } from '../../utils/estadoLabels';
import EstadoChip from '../../components/EstadoChip';
import PreviewPanel from '../../components/PreviewPanel';
import SearchBar from '../../components/SearchBar';
import type { Expediente } from '../../types';

const assignedPrograms = [
  { id: 'prog-1', shortName: 'Dip. Psico', versions: ['1ra versión 2026'] },
  { id: 'prog-2', shortName: 'Dip. Form. Doc.', versions: ['1ra versión 2025'] },
  { id: 'prog-4', shortName: 'Dip. Gerencia', versions: ['1ra versión 2026', '2da versión 2026'] },
];

export default function ExpedientesPage() {
  const [activeProgram, setActiveProgram] = useState(0);
  const [selectedVersion, setSelectedVersion] = useState(0);
  const [selected, setSelected] = useState<Expediente | null>(null);
  const [search, setSearch] = useState('');
  const [showVersions, setShowVersions] = useState(false);

  const currentProgId = assignedPrograms[activeProgram].id;
  const currentProgram = programasMock.find((p) => p.id === currentProgId);

  const filtered = expedientesMock
    .filter((e) => e.programaId === currentProgId)
    .filter((e) => {
      const term = search.toLowerCase();
      return e.nombreCompleto.toLowerCase().includes(term) || e.ci.toLowerCase().includes(term);
    });

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Expedientes</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main Content Block */}
        <div className="flex-1 w-full">
          {/* Program tabs */}
          <div className="flex items-center gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
            {assignedPrograms.map((prog, idx) => (
              <button
                key={prog.id}
                onClick={() => { setActiveProgram(idx); setSelectedVersion(0); setSelected(null); }}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeProgram === idx
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {prog.shortName}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header info / version selector inside block */}
            <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-gray-900">
                {currentProgram?.nombre}
              </h2>
              {assignedPrograms[activeProgram].versions.length > 0 && (
                <div className="relative inline-block">
                  <button
                    onClick={() => setShowVersions(!showVersions)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
                  >
                    {assignedPrograms[activeProgram].versions[selectedVersion]}
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                  {showVersions && (
                    <div className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1 min-w-[180px]">
                      {assignedPrograms[activeProgram].versions.map((v, idx) => (
                        <button
                          key={v}
                          onClick={() => { setSelectedVersion(idx); setShowVersions(false); }}
                          className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                            selectedVersion === idx ? 'font-medium text-gray-900' : 'text-gray-600'
                          }`}
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Participante</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">CI</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">CI</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Título</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">H. Vida</th>
                    <th className="text-center px-3 py-3 font-medium text-gray-600">Ficha</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Expediente</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((exp) => (
                    <tr
                      key={exp.id}
                      onClick={() => setSelected(exp)}
                      className={`border-b border-gray-100 cursor-pointer transition-colors ${
                        selected?.id === exp.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                      }`}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{exp.nombreCompleto}</td>
                      <td className="px-4 py-3 text-gray-600">{exp.ci}</td>
                      <td className="px-3 py-3 text-center">
                        <EstadoChip label={estadoDocumentoLabel[exp.documentos.carnetIdentidad]} colorClass={estadoDocumentoColor[exp.documentos.carnetIdentidad]} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <EstadoChip label={estadoDocumentoLabel[exp.documentos.tituloDiploma]} colorClass={estadoDocumentoColor[exp.documentos.tituloDiploma]} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <EstadoChip label={estadoDocumentoLabel[exp.documentos.hojaVida]} colorClass={estadoDocumentoColor[exp.documentos.hojaVida]} />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <EstadoChip label={estadoDocumentoLabel[exp.documentos.fichaInscripcion]} colorClass={estadoDocumentoColor[exp.documentos.fichaInscripcion]} />
                      </td>
                      <td className="px-4 py-3">
                        <EstadoChip label={estadoExpedienteLabel[exp.estadoExpediente]} colorClass={estadoExpedienteColor[exp.estadoExpediente]} />
                      </td>
                      <td className="px-4 py-3">
                        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Ver expediente">
                          <Eye className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-gray-500">No se encontraron expedientes.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel Blocks */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <SearchBar value={search} onChange={setSearch} placeholder="Buscar participante..." />
          </div>

          <PreviewPanel>
            {selected ? (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{selected.nombreCompleto}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">CI</span>
                    <span className="text-gray-900">{selected.ci}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Correo</span>
                    <span className="text-gray-900 text-xs">{selected.correo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Teléfono</span>
                    <span className="text-gray-900">{selected.telefono}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Inscripción</span>
                    <EstadoChip label={estadoInscripcionLabel[selected.estadoInscripcion]} colorClass={estadoInscripcionColor[selected.estadoInscripcion]} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Expediente</span>
                    <EstadoChip label={estadoExpedienteLabel[selected.estadoExpediente]} colorClass={estadoExpedienteColor[selected.estadoExpediente]} />
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Previsualización General del Participante</p>
            )}
          </PreviewPanel>

          {currentProgram && (
            <PreviewPanel>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-4 w-4 text-gray-400" />
                <h4 className="font-semibold text-gray-900 text-sm">Info del Programa</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Programa</p>
                  <p className="text-gray-900">{currentProgram.nombre}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Versión</p>
                  <p className="text-gray-900">{currentProgram.version}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs text-gray-500">Límite documental:</span>
                  <span className="text-xs text-gray-900">{currentProgram.fechaLimiteDocumentacion}</span>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Requisitos</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {currentProgram.requisitos.map((r, i) => (
                      <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{r.tipo}</span>
                    ))}
                  </div>
                </div>
                <div className="mt-4 aspect-[2/1] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center p-4">
                  <p className="text-xs text-gray-400 text-center">Previsualización de fechas, carreras aptas, etc.</p>
                </div>
              </div>
            </PreviewPanel>
          )}
        </div>
      </div>
    </div>
  );
}
