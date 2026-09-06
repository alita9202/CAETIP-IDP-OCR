import { useState } from 'react';
import { Plus, Eye, RefreshCw, FileText, AlertCircle } from 'lucide-react';
import { documentosMock } from '../../mocks';
import { estadoDocumentoLabel, estadoDocumentoColor } from '../../utils/estadoLabels';
import EstadoChip from '../../components/EstadoChip';
import PreviewPanel from '../../components/PreviewPanel';
import Modal from '../../components/Modal';
import type { Documento } from '../../types';

export default function DocumentosPage() {
  const [selectedDoc, setSelectedDoc] = useState<Documento | null>(documentosMock[0] ?? null);
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Documentos</h1>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Subir documento
        </button>
      </div>

      {/* Main Blocks */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left Block: Table */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Documentos Cargados</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Documento</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Última actualización</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Acción</th>
                </tr>
              </thead>
              <tbody>
                {documentosMock.map((doc) => (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${
                      selectedDoc?.id === doc.id ? 'bg-gray-50' : 'hover:bg-gray-50/50'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-400" />
                        <span className="font-medium text-gray-900">{doc.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{doc.tipo}</td>
                    <td className="px-4 py-3 text-gray-600">{doc.fechaActualizacion}</td>
                    <td className="px-4 py-3">
                      <EstadoChip label={estadoDocumentoLabel[doc.estado]} colorClass={estadoDocumentoColor[doc.estado]} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Ver">
                          <Eye className="h-4 w-4" />
                        </button>
                        {(doc.estado === 'REQUIERE_REEMPLAZO' || doc.estado === 'DOCUMENTO_OBSERVADO') && (
                          <button className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 hover:text-gray-700" title="Reemplazar">
                            <RefreshCw className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Block: Preview */}
        <div className="w-full lg:w-80 shrink-0">
          <PreviewPanel>
            {selectedDoc ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{selectedDoc.nombre}</h3>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Tipo</p>
                    <p className="text-gray-900">{selectedDoc.tipo}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Estado</p>
                    <EstadoChip label={estadoDocumentoLabel[selectedDoc.estado]} colorClass={estadoDocumentoColor[selectedDoc.estado]} />
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Última actualización</p>
                    <p className="text-gray-900">{selectedDoc.fechaActualizacion}</p>
                  </div>

                  {selectedDoc.observacion && (
                    <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center gap-1.5 mb-1">
                        <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                        <p className="text-xs font-medium text-orange-700">Observación</p>
                      </div>
                      <p className="text-xs text-orange-700">{selectedDoc.observacion}</p>
                    </div>
                  )}

                  {selectedDoc.datosExtraidos && Object.keys(selectedDoc.datosExtraidos).length > 0 && (
                    <div>
                      <p className="text-gray-500 text-xs mb-2">Datos extraídos</p>
                      <div className="space-y-1.5">
                        {Object.entries(selectedDoc.datosExtraidos).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-500">{key}</span>
                            <span className="text-gray-900 font-medium">{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

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
              <p className="text-sm text-gray-500">Selecciona un documento para ver su detalle.</p>
            )}
          </PreviewPanel>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={showUpload} onClose={() => setShowUpload(false)} title="Subir documento">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del documento</label>
            <input
              type="text"
              placeholder="Ej: Carnet de Identidad"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Tipo de documento</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white">
              <option value="">Seleccionar tipo</option>
              <option value="ci">Carnet de Identidad</option>
              <option value="titulo">Título / Diploma</option>
              <option value="cv">Hoja de Vida</option>
              <option value="ficha">Ficha de Inscripción</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Archivo</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <FileText className="h-8 w-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-600">Haz clic o arrastra un archivo aquí</p>
              <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (máx. 10 MB)</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nota (opcional)</label>
            <textarea
              rows={2}
              placeholder="Nota adicional sobre el documento..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => setShowUpload(false)}
              className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
              Subir
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
