import { useState } from 'react';
import { FileText, AlertCircle, Check } from 'lucide-react';
import { inscripcionesParticipanteMock, documentosMock } from '../../mocks';
import { estadoDocumentoLabel, estadoDocumentoColor, estadoInscripcionLabel, estadoInscripcionColor } from '../../utils/estadoLabels';
import EstadoChip from '../../components/EstadoChip';
import PreviewPanel from '../../components/PreviewPanel';
import type { Inscripcion, Requisito } from '../../types';

export default function InscripcionesParticipantePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedReq, setSelectedReq] = useState<Requisito | null>(null);
  const [showDocSelect, setShowDocSelect] = useState<string | null>(null);

  const inscripciones = inscripcionesParticipanteMock;
  const currentInsc: Inscripcion = inscripciones[activeTab];

  const getAssociatedDoc = (docId?: string) => {
    if (!docId) return null;
    return documentosMock.find((d) => d.id === docId) ?? null;
  };

  const getCompatibleDocs = (tipo: string) => {
    return documentosMock.filter((d) => d.tipo === tipo);
  };

  const reqStatusColor = (status: string) => {
    switch (status) {
      case 'Cumplido': return 'bg-green-50 text-green-700';
      case 'Observado': return 'bg-red-50 text-red-700';
      case 'En revisión': return 'bg-yellow-50 text-yellow-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Inscripciones</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Main Content Block */}
        <div className="flex-1 w-full">
          {/* Tabs - detached style or integrated into top */}
          <div className="flex gap-1 mb-4 border-b border-gray-200 overflow-x-auto">
            {inscripciones.map((insc, idx) => (
              <button
                key={insc.id}
                onClick={() => { setActiveTab(idx); setSelectedReq(null); }}
                className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                  activeTab === idx
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {insc.programaNombre.replace('Diplomado en ', 'Dip. ')}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Header info inside the block */}
            <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-medium text-gray-900">Estado de su inscripción por documento</h2>
              </div>
              <div className="flex gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Versión:</span> <span className="font-medium text-gray-900">{currentInsc.version}</span>
                </div>
                <div>
                  <EstadoChip label={estadoInscripcionLabel[currentInsc.estado]} colorClass={estadoInscripcionColor[currentInsc.estado]} />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Documento</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {currentInsc.requisitos.map((req) => {
                    const associatedDoc = getAssociatedDoc(req.documentoAsociadoId);
                    const compatibleDocs = getCompatibleDocs(req.tipo);

                    return (
                      <tr
                        key={req.id}
                        onClick={() => setSelectedReq(req)}
                        className={`border-b border-gray-100 cursor-pointer transition-colors ${
                          selectedReq?.id === req.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                        }`}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{req.nombre}</span>
                            {req.obligatorio && (
                              <span className="text-xs text-red-500">*</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <EstadoChip label={req.estadoRequisito} colorClass={reqStatusColor(req.estadoRequisito)} />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowDocSelect(showDocSelect === req.id ? null : req.id);
                              }}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                              {associatedDoc ? 'Elegir Documento' : 'Elegir Documento'}
                            </button>

                            {showDocSelect === req.id && (
                              <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10 py-1">
                                <p className="px-3 py-1.5 text-xs text-gray-500">Documentos disponibles:</p>
                                {compatibleDocs.map((doc) => (
                                  <button
                                    key={doc.id}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowDocSelect(null);
                                    }}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between"
                                  >
                                    <span className="text-gray-900">{doc.nombre}</span>
                                    {doc.id === req.documentoAsociadoId && (
                                      <Check className="h-4 w-4 text-green-600" />
                                    )}
                                  </button>
                                ))}
                                {compatibleDocs.length === 0 && (
                                  <p className="px-3 py-2 text-sm text-gray-400">No hay documentos compatibles.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Panel Block */}
        <div className="w-full lg:w-80 shrink-0">
          <PreviewPanel>
            {selectedReq ? (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">{selectedReq.nombre}</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Tipo</p>
                    <p className="text-gray-900">{selectedReq.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Obligatorio</p>
                    <p className="text-gray-900">{selectedReq.obligatorio ? 'Sí' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Estado del requisito</p>
                    <EstadoChip label={selectedReq.estadoRequisito} colorClass={reqStatusColor(selectedReq.estadoRequisito)} />
                  </div>

                  {selectedReq.documentoAsociadoId && (() => {
                    const doc = getAssociatedDoc(selectedReq.documentoAsociadoId);
                    if (!doc) return null;
                    return (
                      <>
                        <hr className="border-gray-200" />
                        <div>
                          <p className="text-gray-500 text-xs">Documento asociado</p>
                          <p className="font-medium text-gray-900">{doc.nombre}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs">Estado del documento</p>
                          <EstadoChip label={estadoDocumentoLabel[doc.estado]} colorClass={estadoDocumentoColor[doc.estado]} />
                        </div>
                        {doc.observacion && (
                          <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 mt-2">
                            <div className="flex items-center gap-1.5 mb-1">
                              <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                              <p className="text-xs font-medium text-orange-700">Observación</p>
                            </div>
                            <p className="text-xs text-orange-700">{doc.observacion}</p>
                          </div>
                        )}
                      </>
                    );
                  })()}

                  {/* Placeholder miniature */}
                  <div className="mt-4 aspect-[3/4] bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Previsualización de documento</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">Selecciona un requisito para ver detalles o estado.</p>
            )}
          </PreviewPanel>
        </div>
      </div>
    </div>
  );
}
