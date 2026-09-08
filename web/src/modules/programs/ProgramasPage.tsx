import { useState } from 'react';
import { GraduationCap, Calendar, User, Plus, Pencil, Loader2 } from 'lucide-react';
import PreviewPanel from '../../components/PreviewPanel';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import {
  useProgramas, useCreatePrograma, useUpdatePrograma,
  useOfertasByPrograma, useCreateOferta, useUpdateOferta,
  useUniversidades, useCreateUniversidad,
  useTiposDocumento, useUpsertRequisitos,
  useEncargadosDisponibles, useAsignarEncargado,
} from '../../features/programas/programas.hooks';
import type { Programa, OfertaPrograma } from '../../features/programas/programas.service';

const ESTADOS_OFERTA = ['BORRADOR', 'HABILITADA', 'CERRADA', 'INACTIVA'];

const estadoColor = (e: string) => {
  switch (e) {
    case 'HABILITADA': return 'bg-green-50 text-green-700';
    case 'BORRADOR': return 'bg-yellow-50 text-yellow-700';
    case 'CERRADA': return 'bg-gray-100 text-gray-600';
    case 'INACTIVA': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';
const selectCls = `${inputCls} bg-white`;

export default function ProgramasPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Programa | null>(null);
  const [selectedOferta, setSelectedOferta] = useState<OfertaPrograma | null>(null);

  // Queries
  const { data: programas = [], isLoading, error: loadError } = useProgramas();
  const { data: ofertas = [], isLoading: ofertasLoading } = useOfertasByPrograma(selected?.id_programa ?? null);
  const { data: universidades = [] } = useUniversidades();
  const { data: tiposDoc = [] } = useTiposDocumento();
  const { data: encargados = [] } = useEncargadosDisponibles();

  // Mutations
  const createProg = useCreatePrograma();
  const updateProg = useUpdatePrograma();
  const createOfe = useCreateOferta();
  const updateOfe = useUpdateOferta(selected?.id_programa ?? '');
  const createUni = useCreateUniversidad();
  const upsertReqs = useUpsertRequisitos(selected?.id_programa ?? '');
  const asignarEnc = useAsignarEncargado(selected?.id_programa ?? '');

  const filtered = programas.filter((p) => {
    const t = search.toLowerCase();
    return p.nombre.toLowerCase().includes(t) || (p.descripcion ?? '').toLowerCase().includes(t);
  });

  // ---------------------------------------------------------------------------------
  // 1) Unified Registration Flow
  // ---------------------------------------------------------------------------------
  const [showRegistroModal, setShowRegistroModal] = useState(false);
  const [regMode, setRegMode] = useState<'SEARCH' | 'NEW_PROGRAM' | 'NEW_VERSION'>('SEARCH');
  const [regSearch, setRegSearch] = useState('');
  const [regSelectedProgram, setRegSelectedProgram] = useState<Programa | null>(null);
  
  // Separate query for the registration modal to get offers for copying
  const { data: regOfertas = [] } = useOfertasByPrograma(regSelectedProgram?.id_programa ?? null);

  // Form states for unified registration
  const [rProgNombre, setRProgNombre] = useState('');
  const [rProgDesc, setRProgDesc] = useState('');
  const [rProgActivo, setRProgActivo] = useState(true);

  const [rOfeUniv, setROfeUniv] = useState('');
  const [rOfeCodigo, setROfeCodigo] = useState('');
  const [rOfeVersion, setROfeVersion] = useState('');
  const [rOfeGestion, setROfeGestion] = useState('');
  const [rOfeModalidad, setROfeModalidad] = useState('');
  const [rOfeFechaInicio, setROfeFechaInicio] = useState('');
  const [rOfeFechaFin, setROfeFechaFin] = useState('');
  const [rOfeFechaLimIns, setROfeFechaLimIns] = useState('');
  const [rOfeFechaLimDoc, setROfeFechaLimDoc] = useState('');
  const [rOfeEstado, setROfeEstado] = useState('BORRADOR');

  const [rEncargado, setREncargado] = useState('');
  const [rReqItems, setRReqItems] = useState<{ id_tipo_documento: string; nombre: string; obligatorio: boolean; checked: boolean }[]>([]);

  const [rError, setRError] = useState('');
  const [rLoading, setRLoading] = useState(false);

  const openRegistro = (initialProgram?: Programa) => {
    setRError('');
    setRLoading(false);
    setRProgNombre(''); setRProgDesc(''); setRProgActivo(true);
    setROfeUniv(''); setROfeCodigo(''); setROfeVersion(''); setROfeGestion(''); setROfeModalidad(''); setROfeFechaInicio(''); setROfeFechaFin(''); setROfeFechaLimIns(''); setROfeFechaLimDoc(''); setROfeEstado('BORRADOR');
    setREncargado('');
    setRReqItems(tiposDoc.map(td => ({ id_tipo_documento: td.id_tipo_documento, nombre: td.nombre, obligatorio: true, checked: false })));

    if (initialProgram) {
      setRegMode('NEW_VERSION');
      setRegSearch('');
      setRegSelectedProgram(initialProgram);
    } else {
      setRegMode('SEARCH');
      setRegSearch('');
      setRegSelectedProgram(null);
    }
    setShowRegistroModal(true);
  };

  const handleCopyFrom = (idOferta: string) => {
    const ofe = regOfertas.find(o => o.id_oferta === idOferta);
    if (!ofe) return;
    setROfeUniv(ofe.id_universidad);
    setROfeModalidad(ofe.modalidad ?? '');
    setREncargado(ofe.asignaciones_encargado?.find(a => a.activo)?.id_usuario ?? '');
    const items = tiposDoc.map((td) => {
      const existing = ofe.requisitos?.find(r => r.id_tipo_documento === td.id_tipo_documento);
      return { id_tipo_documento: td.id_tipo_documento, nombre: td.nombre, obligatorio: existing?.obligatorio ?? true, checked: !!existing };
    });
    setRReqItems(items);
  };

  const handleSaveRegistro = async () => {
    setRError('');
    if (regMode === 'NEW_PROGRAM' && !rProgNombre.trim()) { setRError('El nombre del programa es obligatorio.'); return; }
    if (!rOfeUniv) { setRError('La universidad es obligatoria.'); return; }
    if (!rOfeVersion.trim()) { setRError('La versión es obligatoria.'); return; }
    if (!rOfeGestion.trim()) { setRError('La gestión es obligatoria.'); return; }
    if (rOfeFechaInicio && rOfeFechaFin && rOfeFechaFin < rOfeFechaInicio) { setRError('La fecha de finalización no puede ser anterior a la fecha de inicio.'); return; }

    setRLoading(true);
    try {
      let id_programa = '';
      if (regMode === 'NEW_PROGRAM') {
        const prog = await createProg.mutateAsync({ nombre: rProgNombre.trim(), descripcion: rProgDesc.trim() || undefined, activo: rProgActivo });
        id_programa = prog.id_programa;
      } else {
        id_programa = regSelectedProgram!.id_programa;
      }

      const payload = {
        id_programa,
        id_universidad: rOfeUniv,
        codigo: rOfeCodigo.trim() || undefined,
        version: rOfeVersion.trim(),
        gestion: rOfeGestion.trim(),
        modalidad: rOfeModalidad || undefined,
        fecha_inicio: rOfeFechaInicio || undefined,
        fecha_fin: rOfeFechaFin || undefined,
        fecha_limite_inscripcion: rOfeFechaLimIns || undefined,
        fecha_limite_documentacion: rOfeFechaLimDoc || undefined,
        estado: rOfeEstado,
      };

      const ofe = await createOfe.mutateAsync(payload);

      const reqs = rReqItems.filter(r => r.checked).map((r, i) => ({ id_tipo_documento: r.id_tipo_documento, obligatorio: r.obligatorio, orden: i + 1 }));
      if (reqs.length > 0) {
        await upsertReqs.mutateAsync({ idOferta: ofe.id_oferta, requisitos: reqs });
      }

      if (rEncargado) {
        await asignarEnc.mutateAsync({ idOferta: ofe.id_oferta, idUsuario: rEncargado });
      }

      setShowRegistroModal(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setRError(msg.includes('uq_oferta_programa_version_gestion') ? 'Ya existe una oferta con esta versión y gestión.' : 'No fue posible guardar el registro.');
    } finally {
      setRLoading(false);
    }
  };

  // ---------------------------------------------------------------------------------
  // 2) Edit Programas
  // ---------------------------------------------------------------------------------
  const [showProgramaModal, setShowProgramaModal] = useState(false);
  const [editPrograma, setEditPrograma] = useState<Programa | null>(null);
  const [pNombre, setPNombre] = useState('');
  const [pDesc, setPDesc] = useState('');
  const [pActivo, setPActivo] = useState(true);
  const [pError, setPError] = useState('');

  const openProgramaEdit = (p: Programa) => { setEditPrograma(p); setPNombre(p.nombre); setPDesc(p.descripcion ?? ''); setPActivo(p.activo); setPError(''); setShowProgramaModal(true); };

  const handleSavePrograma = async () => {
    if (!pNombre.trim()) { setPError('El nombre del programa es obligatorio.'); return; }
    setPError('');
    try {
      if (editPrograma) {
        await updateProg.mutateAsync({ id: editPrograma.id_programa, nombre: pNombre.trim(), descripcion: pDesc.trim() || undefined, activo: pActivo });
      }
      setShowProgramaModal(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setPError(msg.includes('duplicate') ? 'Ya existe un programa con estos datos.' : 'No fue posible guardar el programa.');
    }
  };

  // ---------------------------------------------------------------------------------
  // 3) Edit Ofertas
  // ---------------------------------------------------------------------------------
  const [showOfertaModal, setShowOfertaModal] = useState(false);
  const [editOferta, setEditOferta] = useState<OfertaPrograma | null>(null);
  const [oUniv, setOUniv] = useState('');
  const [oCodigo, setOCodigo] = useState('');
  const [oVersion, setOVersion] = useState('');
  const [oGestion, setOGestion] = useState('');
  const [oModalidad, setOModalidad] = useState('');
  const [oFechaInicio, setOFechaInicio] = useState('');
  const [oFechaFin, setOFechaFin] = useState('');
  const [oFechaLimIns, setOFechaLimIns] = useState('');
  const [oFechaLimDoc, setOFechaLimDoc] = useState('');
  const [oEstado, setOEstado] = useState('BORRADOR');
  const [oError, setOError] = useState('');

  const openOfertaEdit = (o: OfertaPrograma) => {
    setEditOferta(o); setOUniv(o.id_universidad); setOCodigo(o.codigo ?? ''); setOVersion(o.version); setOGestion(o.gestion); setOModalidad(o.modalidad ?? '');
    setOFechaInicio(o.fecha_inicio ?? ''); setOFechaFin(o.fecha_fin ?? ''); setOFechaLimIns(o.fecha_limite_inscripcion ?? ''); setOFechaLimDoc(o.fecha_limite_documentacion ?? '');
    setOEstado(o.estado); setOError('');
    setShowOfertaModal(true);
  };

  const handleSaveOferta = async () => {
    if (!oUniv) { setOError('La universidad es obligatoria.'); return; }
    if (!oVersion.trim()) { setOError('La versión es obligatoria.'); return; }
    if (!oGestion.trim()) { setOError('La gestión es obligatoria.'); return; }
    if (oFechaInicio && oFechaFin && oFechaFin < oFechaInicio) { setOError('La fecha de finalización no puede ser anterior a la fecha de inicio.'); return; }
    setOError('');
    try {
      const payload = { id_programa: selected!.id_programa, id_universidad: oUniv, codigo: oCodigo.trim() || undefined, version: oVersion.trim(), gestion: oGestion.trim(), modalidad: oModalidad || undefined, fecha_inicio: oFechaInicio || undefined, fecha_fin: oFechaFin || undefined, fecha_limite_inscripcion: oFechaLimIns || undefined, fecha_limite_documentacion: oFechaLimDoc || undefined, estado: oEstado };
      if (editOferta) {
        const { id_programa: _ip, ...rest } = payload;
        await updateOfe.mutateAsync({ id: editOferta.id_oferta, ...rest });
      }
      setShowOfertaModal(false);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : '';
      setOError(msg.includes('uq_oferta_programa_version_gestion') ? 'Ya existe una oferta con estos datos.' : 'No fue posible guardar la oferta.');
    }
  };

  // ---------------------------------------------------------------------------------
  // 4) Edit Requisitos
  // ---------------------------------------------------------------------------------
  const [showRequisitosModal, setShowRequisitosModal] = useState(false);
  const [reqOferta, setReqOferta] = useState<OfertaPrograma | null>(null);
  const [reqItems, setReqItems] = useState<{ id_tipo_documento: string; nombre: string; obligatorio: boolean; checked: boolean }[]>([]);
  const [reqError, setReqError] = useState('');

  const openRequisitos = (o: OfertaPrograma) => {
    setReqOferta(o);
    const items = tiposDoc.map((td) => {
      const existing = o.requisitos?.find(r => r.id_tipo_documento === td.id_tipo_documento);
      return { id_tipo_documento: td.id_tipo_documento, nombre: td.nombre, obligatorio: existing?.obligatorio ?? true, checked: !!existing };
    });
    setReqItems(items);
    setReqError('');
    setShowRequisitosModal(true);
  };

  const handleSaveRequisitos = async () => {
    if (!reqOferta) return;
    setReqError('');
    const reqs = reqItems.filter(r => r.checked).map((r, i) => ({ id_tipo_documento: r.id_tipo_documento, obligatorio: r.obligatorio, orden: i + 1 }));
    try {
      await upsertReqs.mutateAsync({ idOferta: reqOferta.id_oferta, requisitos: reqs });
      setShowRequisitosModal(false);
    } catch {
      setReqError('No fue posible guardar los requisitos.');
    }
  };

  // ---------------------------------------------------------------------------------
  // 5) Common: Universidad & Encargado
  // ---------------------------------------------------------------------------------
  const [showUniversidadModal, setShowUniversidadModal] = useState(false);
  const [uNombre, setUNombre] = useState('');
  const [uSigla, setUSigla] = useState('');
  const [uError, setUError] = useState('');

  const handleSaveUniversidad = async () => {
    if (!uNombre.trim()) { setUError('El nombre es obligatorio.'); return; }
    setUError('');
    try {
      const newUni = await createUni.mutateAsync({ nombre: uNombre.trim(), sigla: uSigla.trim() || undefined });
      if (showRegistroModal) setROfeUniv(newUni.id_universidad);
      if (showOfertaModal) setOUniv(newUni.id_universidad);
      setShowUniversidadModal(false); setUNombre(''); setUSigla('');
    } catch {
      setUError('No fue posible crear la universidad.');
    }
  };

  const handleAsignarEncargado = async (oferta: OfertaPrograma, idUsuario: string) => {
    try {
      await asignarEnc.mutateAsync({ idOferta: oferta.id_oferta, idUsuario });
    } catch { /* silently fail */ }
  };

  const encargadoNombre = (o: OfertaPrograma) => {
    const a = o.asignaciones_encargado?.find(ae => ae.activo);
    if (!a?.usuario?.persona) return 'Sin encargado';
    return `${a.usuario.persona.nombres} ${a.usuario.persona.apellidos}`;
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Programas</h1>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Programas</h1>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">Error al cargar los programas. Intenta recargar la página.</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Programas</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Main */}
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">Gestión de Programas</h2>
            <div className="flex-1 sm:w-64 sm:max-w-xs">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscador..." />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Programa</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Ofertas</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((prog) => (
                  <tr
                    key={prog.id_programa}
                    onClick={() => { setSelected(prog); setSelectedOferta(null); }}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selected?.id_programa === prog.id_programa ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3 font-medium text-gray-900">{prog.nombre}</td>
                    <td className="px-4 py-3 text-gray-600">—</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${prog.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                        {prog.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={(e) => { e.stopPropagation(); openProgramaEdit(prog); }} className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-700" title="Editar">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-500">{programas.length === 0 ? 'No hay programas registrados.' : 'Sin resultados para la búsqueda.'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <button onClick={() => openRegistro()} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
            <Plus className="h-4 w-4" /> Registrar programa
          </button>

          <PreviewPanel>
            {selected ? (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <GraduationCap className="h-5 w-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-900">{selected.nombre}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {selected.descripcion && <p className="text-gray-600 text-xs">{selected.descripcion}</p>}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 text-xs">Estado</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${selected.activo ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {selected.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-medium">Ofertas / Versiones</span>
                    <button onClick={() => openRegistro(selected)} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1" title="Nueva oferta">
                      <Plus className="h-3 w-3" /> Nueva
                    </button>
                  </div>
                  {ofertasLoading ? (
                    <div className="py-3 text-center"><Loader2 className="h-4 w-4 animate-spin text-gray-400 mx-auto" /></div>
                  ) : ofertas.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">Sin ofertas registradas.</p>
                  ) : (
                    <ul className="space-y-1.5">
                      {ofertas.map((o) => (
                        <li key={o.id_oferta}>
                          <button
                            onClick={() => setSelectedOferta(selectedOferta?.id_oferta === o.id_oferta ? null : o)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-colors ${selectedOferta?.id_oferta === o.id_oferta ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-gray-900">{o.version}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${estadoColor(o.estado)}`}>{o.estado}</span>
                            </div>
                            <span className="text-gray-500">{o.gestion} · {o.universidad?.sigla || o.universidad?.nombre || '—'}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center"><p className="text-sm text-gray-500">Selecciona un programa</p></div>
            )}
          </PreviewPanel>

          {/* Selected oferta detail */}
          {selectedOferta && (
            <PreviewPanel>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900 text-xs">Detalle de Oferta</h4>
                  <button onClick={() => openOfertaEdit(selectedOferta)} className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Pencil className="h-3 w-3" /></button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div><p className="text-gray-500">Versión</p><p className="text-gray-900">{selectedOferta.version}</p></div>
                  <div><p className="text-gray-500">Gestión</p><p className="text-gray-900">{selectedOferta.gestion}</p></div>
                  <div><p className="text-gray-500">Universidad</p><p className="text-gray-900">{selectedOferta.universidad?.nombre || '—'}</p></div>
                  {selectedOferta.codigo && <div><p className="text-gray-500">Código</p><p className="text-gray-900">{selectedOferta.codigo}</p></div>}
                  {selectedOferta.modalidad && <div><p className="text-gray-500">Modalidad</p><p className="text-gray-900">{selectedOferta.modalidad}</p></div>}
                  <div><p className="text-gray-500">Estado</p><span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium ${estadoColor(selectedOferta.estado)}`}>{selectedOferta.estado}</span></div>
                </div>
                {(selectedOferta.fecha_inicio || selectedOferta.fecha_fin) && (
                  <div className="space-y-1">
                    {selectedOferta.fecha_inicio && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-500">Inicio:</span><span className="text-xs text-gray-900">{selectedOferta.fecha_inicio}</span></div>}
                    {selectedOferta.fecha_fin && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-500">Fin:</span><span className="text-xs text-gray-900">{selectedOferta.fecha_fin}</span></div>}
                    {selectedOferta.fecha_limite_inscripcion && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-500">Lím. inscripción:</span><span className="text-xs text-gray-900">{selectedOferta.fecha_limite_inscripcion}</span></div>}
                    {selectedOferta.fecha_limite_documentacion && <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-500">Lím. documentación:</span><span className="text-xs text-gray-900">{selectedOferta.fecha_limite_documentacion}</span></div>}
                  </div>
                )}
                <hr className="border-gray-200" />
                <div className="flex items-center gap-1.5"><User className="h-3 w-3 text-gray-400" /><span className="text-xs text-gray-500">Encargado:</span><span className="text-xs text-gray-900">{encargadoNombre(selectedOferta)}</span></div>
                {encargados.length > 0 && (
                  <select value={selectedOferta.asignaciones_encargado?.find(a => a.activo)?.id_usuario ?? ''} onChange={(e) => { if (e.target.value) handleAsignarEncargado(selectedOferta, e.target.value); }} className="w-full px-2 py-1.5 border border-gray-200 rounded text-xs bg-white">
                    <option value="">Asignar encargado...</option>
                    {encargados.map(enc => <option key={enc.id_usuario} value={enc.id_usuario}>{enc.persona?.nombres} {enc.persona?.apellidos}</option>)}
                  </select>
                )}
                <hr className="border-gray-200" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 font-medium">Requisitos documentales</span>
                  <button onClick={() => openRequisitos(selectedOferta)} className="text-xs text-gray-600 hover:text-gray-900 flex items-center gap-1"><Pencil className="h-3 w-3" /> Configurar</button>
                </div>
                {(selectedOferta.requisitos?.length ?? 0) === 0 ? (
                  <p className="text-xs text-gray-400">Sin requisitos configurados.</p>
                ) : (
                  <ul className="space-y-1">
                    {selectedOferta.requisitos?.map(r => (
                      <li key={r.id_requisito_oferta} className="flex items-center justify-between text-xs px-2 py-1.5 bg-gray-50 rounded">
                        <span className="text-gray-900">{r.tipo_documento?.nombre || '—'}</span>
                        <span className={r.obligatorio ? 'text-red-600 font-medium' : 'text-gray-500'}>{r.obligatorio ? 'Obligatorio' : 'Opcional'}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </PreviewPanel>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1) MODAL UNIFICADO: REGISTRO DE PROGRAMA / OFERTA */}
      {/* ========================================================================= */}
      <Modal isOpen={showRegistroModal} onClose={() => setShowRegistroModal(false)} title="Registrar programa / nueva versión" size="xl">
        <div className="space-y-6">
          {rError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{rError}</div>}

          {/* SECTION: SEARCH */}
          {regMode === 'SEARCH' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Buscar programa por nombre</label>
                <input type="text" value={regSearch} onChange={e => setRegSearch(e.target.value)} className={inputCls} placeholder="Ej: Diplomado en..." autoFocus />
              </div>
              <div className="border border-gray-200 rounded-lg max-h-60 overflow-y-auto bg-gray-50 p-2 space-y-1">
                {programas.filter(p => p.nombre.toLowerCase().includes(regSearch.toLowerCase())).map(p => (
                  <button key={p.id_programa} onClick={() => { setRegSelectedProgram(p); setRegMode('NEW_VERSION'); }} className="w-full text-left px-3 py-2 rounded bg-white hover:bg-gray-100 border border-gray-200 text-sm flex items-center justify-between transition-colors">
                    <span className="font-medium text-gray-900">{p.nombre}</span>
                    <span className="text-gray-500 text-xs">Seleccionar &rarr;</span>
                  </button>
                ))}
                {regSearch && programas.filter(p => p.nombre.toLowerCase().includes(regSearch.toLowerCase())).length === 0 && (
                  <div className="p-4 text-center text-sm text-gray-500">No se encontró este programa</div>
                )}
                {programas.length === 0 && !regSearch && (
                  <div className="p-4 text-center text-sm text-gray-500">No hay programas registrados</div>
                )}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-500">¿No encuentras el programa?</span>
                <button onClick={() => { setRegMode('NEW_PROGRAM'); setRProgNombre(regSearch); }} className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors">
                  Registrar nuevo programa
                </button>
              </div>
            </div>
          )}

          {/* SECTION: FORM (NEW PROGRAM OR NEW VERSION) */}
          {regMode !== 'SEARCH' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200">
                <div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{regMode === 'NEW_PROGRAM' ? 'NUEVO PROGRAMA' : 'PROGRAMA EXISTENTE'}</span>
                  <h4 className="text-sm font-semibold text-gray-900">{regMode === 'NEW_PROGRAM' ? (rProgNombre || 'Sin nombre') : regSelectedProgram?.nombre}</h4>
                </div>
                <button onClick={() => setRegMode('SEARCH')} className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 bg-blue-50 rounded">Cambiar</button>
              </div>

              {regMode === 'NEW_PROGRAM' && (
                <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-900">Datos del Programa</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
                    <input type="text" value={rProgNombre} onChange={e => setRProgNombre(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
                    <textarea rows={2} value={rProgDesc} onChange={e => setRProgDesc(e.target.value)} className={`${inputCls} resize-none`} />
                  </div>
                </div>
              )}

              <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900">Datos de la Versión</h4>
                  {regMode === 'NEW_VERSION' && regOfertas.length > 0 && (
                    <select className="text-xs border border-gray-300 rounded py-1 pl-2 pr-2 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" onChange={(e) => { if(e.target.value) handleCopyFrom(e.target.value); }}>
                      <option value="">Copiar configuración de...</option>
                      {regOfertas.map(o => <option key={o.id_oferta} value={o.id_oferta}>{o.version} ({o.gestion})</option>)}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Versión *</label>
                    <input type="text" value={rOfeVersion} onChange={e => setROfeVersion(e.target.value)} className={inputCls} placeholder="Ej: 1ra versión" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Gestión *</label>
                    <input type="text" value={rOfeGestion} onChange={e => setROfeGestion(e.target.value)} className={inputCls} placeholder="Ej: 2026-1" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Universidad *</label>
                    <div className="flex gap-2">
                      <select value={rOfeUniv} onChange={e => setROfeUniv(e.target.value)} className={`flex-1 ${selectCls}`}>
                        <option value="">Seleccionar</option>
                        {universidades.map(u => <option key={u.id_universidad} value={u.id_universidad}>{u.nombre}</option>)}
                      </select>
                      <button onClick={() => setShowUniversidadModal(true)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Modalidad</label>
                    <select value={rOfeModalidad} onChange={e => setROfeModalidad(e.target.value)} className={selectCls}>
                      <option value="">Seleccionar</option>
                      <option>Presencial</option>
                      <option>Virtual</option>
                      <option>Semipresencial</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado *</label>
                    <select value={rOfeEstado} onChange={e => setROfeEstado(e.target.value)} className={selectCls}>
                      {ESTADOS_OFERTA.map(e => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha inicio</label>
                    <input type="date" value={rOfeFechaInicio} onChange={e => setROfeFechaInicio(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha fin</label>
                    <input type="date" value={rOfeFechaFin} onChange={e => setROfeFechaFin(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Límite inscripción</label>
                    <input type="date" value={rOfeFechaLimIns} onChange={e => setROfeFechaLimIns(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Límite documentación</label>
                    <input type="date" value={rOfeFechaLimDoc} onChange={e => setROfeFechaLimDoc(e.target.value)} className={inputCls} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">Encargado</h4>
                  <select value={rEncargado} onChange={e => setREncargado(e.target.value)} className={selectCls}>
                    <option value="">Sin encargado asignado</option>
                    {encargados.map(enc => <option key={enc.id_usuario} value={enc.id_usuario}>{enc.persona?.nombres} {enc.persona?.apellidos}</option>)}
                  </select>
                  {encargados.length === 0 && <p className="text-xs text-yellow-600">No hay encargados disponibles.</p>}
                </div>

                <div className="p-4 border border-gray-200 rounded-lg flex flex-col gap-3">
                  <h4 className="text-sm font-semibold text-gray-900">Requisitos Documentales</h4>
                  <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                    {rReqItems.map((item, idx) => (
                      <div key={item.id_tipo_documento} className="flex flex-col gap-1 p-2 bg-gray-50 rounded border border-gray-100">
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={item.checked} onChange={e => { const copy = [...rReqItems]; copy[idx] = { ...item, checked: e.target.checked }; setRReqItems(copy); }} className="rounded border-gray-300" />
                          <span className="text-xs font-medium text-gray-900 truncate" title={item.nombre}>{item.nombre}</span>
                        </div>
                        {item.checked && (
                          <select value={item.obligatorio ? 'true' : 'false'} onChange={e => { const copy = [...rReqItems]; copy[idx] = { ...item, obligatorio: e.target.value === 'true' }; setRReqItems(copy); }} className="text-xs py-1 px-2 border border-gray-300 rounded bg-white w-28 ml-5 focus:outline-none focus:ring-1 focus:ring-gray-900">
                            <option value="true">Obligatorio</option>
                            <option value="false">Opcional</option>
                          </select>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
                <button onClick={() => setShowRegistroModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onClick={handleSaveRegistro} disabled={rLoading} className="px-5 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
                  {rLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Confirmar y registrar
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* 2) MODALES PARA EDICIÓN DE EXISTENTES */}
      {/* ========================================================================= */}

      {/* Editar Programa */}
      <Modal isOpen={showProgramaModal} onClose={() => setShowProgramaModal(false)} title="Editar programa">
        <div className="space-y-4">
          {pError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{pError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre del programa *</label>
            <input type="text" value={pNombre} onChange={(e) => setPNombre(e.target.value)} className={inputCls} placeholder="Ej: Diplomado en Psicopedagogía" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Descripción</label>
            <textarea rows={2} value={pDesc} onChange={(e) => setPDesc(e.target.value)} className={`${inputCls} resize-none`} />
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={pActivo} onChange={(e) => setPActivo(e.target.checked)} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" id="prog-activo" />
            <label htmlFor="prog-activo" className="text-sm text-gray-700">Activo</label>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setShowProgramaModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSavePrograma} disabled={updateProg.isPending} className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
              {updateProg.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </div>
      </Modal>

      {/* Editar Oferta */}
      <Modal isOpen={showOfertaModal} onClose={() => setShowOfertaModal(false)} title="Editar oferta" size="xl">
        <div className="space-y-5">
          {oError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{oError}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Universidad *</label>
              <div className="flex gap-2">
                <select value={oUniv} onChange={(e) => setOUniv(e.target.value)} className={`flex-1 ${selectCls}`}>
                  <option value="">Seleccionar</option>
                  {universidades.map(u => <option key={u.id_universidad} value={u.id_universidad}>{u.nombre}{u.sigla ? ` (${u.sigla})` : ''}</option>)}
                </select>
                <button type="button" onClick={() => { setUNombre(''); setUSigla(''); setUError(''); setShowUniversidadModal(true); }} className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50" title="Nueva universidad">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Código</label>
              <input type="text" value={oCodigo} onChange={(e) => setOCodigo(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Versión *</label>
              <input type="text" value={oVersion} onChange={(e) => setOVersion(e.target.value)} className={inputCls} placeholder="Ej: 1ra versión" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gestión *</label>
              <input type="text" value={oGestion} onChange={(e) => setOGestion(e.target.value)} className={inputCls} placeholder="Ej: 2026-1" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Modalidad</label>
              <select value={oModalidad} onChange={(e) => setOModalidad(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option>Presencial</option>
                <option>Virtual</option>
                <option>Semipresencial</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Estado *</label>
              <select value={oEstado} onChange={(e) => setOEstado(e.target.value)} className={selectCls}>
                {ESTADOS_OFERTA.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de inicio</label>
              <input type="date" value={oFechaInicio} onChange={(e) => setOFechaInicio(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha de finalización</label>
              <input type="date" value={oFechaFin} onChange={(e) => setOFechaFin(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha límite inscripción</label>
              <input type="date" value={oFechaLimIns} onChange={(e) => setOFechaLimIns(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Fecha límite documentación</label>
              <input type="date" value={oFechaLimDoc} onChange={(e) => setOFechaLimDoc(e.target.value)} className={inputCls} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setShowOfertaModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSaveOferta} disabled={updateOfe.isPending} className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
              {updateOfe.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar cambios
            </button>
          </div>
        </div>
      </Modal>

      {/* Editar Requisitos */}
      <Modal isOpen={showRequisitosModal} onClose={() => setShowRequisitosModal(false)} title="Requisitos documentales">
        <div className="space-y-4">
          {reqError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{reqError}</div>}
          <p className="text-xs text-gray-500">Selecciona los documentos requeridos para esta oferta.</p>
          <div className="space-y-3">
            {reqItems.map((item, idx) => (
              <div key={item.id_tipo_documento} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={item.checked} onChange={(e) => { const copy = [...reqItems]; copy[idx] = { ...item, checked: e.target.checked }; setReqItems(copy); }} className="rounded border-gray-300 text-gray-900 focus:ring-gray-900" />
                  <span className="text-sm text-gray-900">{item.nombre}</span>
                </div>
                {item.checked && (
                  <select value={item.obligatorio ? 'true' : 'false'} onChange={(e) => { const copy = [...reqItems]; copy[idx] = { ...item, obligatorio: e.target.value === 'true' }; setReqItems(copy); }} className="px-3 py-1.5 text-xs border border-gray-300 rounded-md bg-white">
                    <option value="true">Obligatorio</option>
                    <option value="false">Opcional</option>
                  </select>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setShowRequisitosModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSaveRequisitos} disabled={upsertReqs.isPending} className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
              {upsertReqs.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Guardar requisitos
            </button>
          </div>
        </div>
      </Modal>

      {/* Nueva Universidad (compartido) */}
      <Modal isOpen={showUniversidadModal} onClose={() => setShowUniversidadModal(false)} title="Nueva universidad" size="md">
        <div className="space-y-4">
          {uError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{uError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre *</label>
            <input type="text" value={uNombre} onChange={(e) => setUNombre(e.target.value)} className={inputCls} placeholder="Ej: Universidad Mayor de San Simón" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Sigla</label>
            <input type="text" value={uSigla} onChange={(e) => setUSigla(e.target.value)} className={inputCls} placeholder="Ej: UMSS" />
          </div>
          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setShowUniversidadModal(false)} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleSaveUniversidad} disabled={createUni.isPending} className="px-4 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
              {createUni.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Crear universidad
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
