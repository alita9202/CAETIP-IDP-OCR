import { useState } from 'react';
import { User, ToggleLeft, ToggleRight, Plus, Loader2, Mail, ShieldAlert } from 'lucide-react';
import SearchBar from '../../components/SearchBar';
import Modal from '../../components/Modal';
import PreviewPanel from '../../components/PreviewPanel';
import { useUsuarios, useRolesAllowed, useCreatePersona, useInviteUser, useUpdateUsuario } from '../../features/usuarios/usuarios.hooks';
import { UsuariosService } from '../../features/usuarios/usuarios.service';
import type { UsuarioCompleto } from '../../features/usuarios/usuarios.service';

const inputCls = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent';
const selectCls = `${inputCls} bg-white`;

export default function UsuariosPage() {
  const [search, setSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UsuarioCompleto | null>(null);
  
  const { data: usuarios = [], isLoading, error } = useUsuarios();
  const { data: roles = [] } = useRolesAllowed();
  const updateUsuario = useUpdateUsuario();

  const filtered = usuarios.filter((u) => {
    const term = search.toLowerCase();
    return (
      u.persona.nombres.toLowerCase().includes(term) ||
      u.persona.apellidos.toLowerCase().includes(term) ||
      u.persona.ci.toLowerCase().includes(term) ||
      u.persona.correo.toLowerCase().includes(term) ||
      u.rol.nombre.toLowerCase().includes(term)
    );
  });

  // Modal Crear Usuario
  const [showCrearModal, setShowCrearModal] = useState(false);
  
  // Forms states
  const [fCI, setFCI] = useState('');
  const [fNombres, setFNombres] = useState('');
  const [fApellidos, setFApellidos] = useState('');
  const [fCorreo, setFCorreo] = useState('');
  const [fTelefono, setFTelefono] = useState('');
  const [fNacimiento, setFNacimiento] = useState('');
  const [fRol, setFRol] = useState('');
  
  const [mError, setMError] = useState('');
  const [mWarning, setMWarning] = useState('');
  const [mLoading, setMLoading] = useState(false);

  const createPersona = useCreatePersona();
  const inviteUser = useInviteUser();

  const handleCrearUsuario = async () => {
    setMError('');
    setMWarning('');
    if (!fNombres.trim() || !fApellidos.trim() || !fCorreo.trim() || !fRol) {
      setMError('Completa todos los campos obligatorios (*).');
      return;
    }

    setMLoading(true);
    try {
      // 1. Buscar Persona por Correo (prioridad para personal CAETIP)
      const existingPersona = await UsuariosService.getPersonaByCorreo(fCorreo.trim());
      let idPersona = existingPersona?.id_persona;
      
      // Validar si la persona ya tiene un usuario asignado en la lista actual
      if (idPersona) {
        const hasUser = usuarios.find(u => u.persona.id_persona === idPersona);
        if (hasUser) {
          throw new Error(`Esta persona ya tiene un usuario asignado con rol ${hasUser.rol.nombre}. No se crearán duplicados.`);
        }
      }

      // 2. Si no existe, crear persona
      if (!idPersona) {
        const newP = await createPersona.mutateAsync({
          ci: fCI.trim() || `INT-${Date.now().toString().slice(-6)}`,
          nombres: fNombres.trim(),
          apellidos: fApellidos.trim(),
          correo: fCorreo.trim(),
          telefono: fTelefono.trim() || undefined,
          fecha_nacimiento: fNacimiento || undefined,
        });
        idPersona = newP.id_persona;
      }

      // 3. Crear usuario e invitar
      const result = await inviteUser.mutateAsync({
        correo: fCorreo.trim(),
        id_persona: idPersona,
        id_rol: fRol
      });

      // Si hubo warning (ej. rate limit de correo), mostrarlo sin cerrar modal
      if (result.warning) {
        setMWarning(result.warning);
      } else {
        setShowCrearModal(false);
        resetForm();
      }
    } catch (e: any) {
      setMError(e.message || 'Error al invitar al usuario.');
    } finally {
      setMLoading(false);
    }
  };

  const resetForm = () => {
    setFCI('');
    setFNombres('');
    setFApellidos('');
    setFCorreo('');
    setFTelefono('');
    setFNacimiento('');
    setFRol('');
    setMError('');
    setMWarning('');
  };

  const openCrear = () => {
    resetForm();
    setShowCrearModal(true);
  };

  const handleToggleEstado = async (u: UsuarioCompleto) => {
    if (u.estado === 'PENDIENTE') return; // PENDIENTE no se debe tocar desde aquí manualmente
    const newState = u.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    if (!window.confirm(`¿Seguro que deseas cambiar el estado a ${newState}?`)) return;
    try {
      await updateUsuario.mutateAsync({ id_usuario: u.id_usuario, payload: { estado: newState } });
    } catch (e: any) {
      alert('Error: ' + e.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6">Usuarios</h1>
        <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-400" /></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg text-red-700">Error al cargar usuarios.</div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Usuarios</h1>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        <div className="flex-1 w-full bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-gray-900">Gestión de Usuarios</h2>
            <div className="flex-1 sm:w-64 sm:max-w-xs">
              <SearchBar value={search} onChange={setSearch} placeholder="Buscar por CI, nombre, correo..." />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Nombre</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">CI</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Rol</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Estado</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600 w-16">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr 
                    key={user.id_usuario} 
                    onClick={() => setSelectedUser(user)}
                    className={`border-b border-gray-100 cursor-pointer transition-colors ${selectedUser?.id_usuario === user.id_usuario ? 'bg-gray-50' : 'hover:bg-gray-50/50'}`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
                          <User className="h-3.5 w-3.5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{user.persona.nombres} {user.persona.apellidos}</p>
                          <p className="text-xs text-gray-500">{user.persona.correo}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{user.persona.ci}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {user.rol.nombre}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.estado === 'ACTIVO' ? 'bg-green-50 text-green-700 border border-green-200' : 
                        user.estado === 'PENDIENTE' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' : 
                        'bg-red-50 text-red-700 border border-red-200'
                      }`}>
                        {user.estado}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button 
                          onClick={() => handleToggleEstado(user)}
                          disabled={user.estado === 'PENDIENTE' || updateUsuario.isPending}
                          className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 disabled:opacity-50" 
                          title={user.estado === 'ACTIVO' ? 'Deshabilitar' : user.estado === 'PENDIENTE' ? 'En espera' : 'Habilitar'}
                        >
                          {user.estado === 'ACTIVO' ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-500">No se encontraron usuarios.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="w-full lg:w-80 shrink-0 space-y-6">
          <button onClick={openCrear} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-950 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors">
            <Plus className="h-4 w-4" /> Crear / Invitar Usuario
          </button>

          <PreviewPanel>
            {selectedUser ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">{selectedUser.persona.nombres} {selectedUser.persona.apellidos}</h3>
                    <p className="text-xs text-gray-500">{selectedUser.rol.nombre}</p>
                  </div>
                </div>
                
                <div className="space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-gray-500">CI</p><p className="font-medium text-gray-900">{selectedUser.persona.ci}</p></div>
                    <div><p className="text-gray-500">Teléfono</p><p className="font-medium text-gray-900">{selectedUser.persona.telefono || '—'}</p></div>
                    <div className="col-span-2"><p className="text-gray-500">Correo</p><p className="font-medium text-gray-900">{selectedUser.persona.correo}</p></div>
                  </div>
                  
                  <hr className="border-gray-100" />
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div><p className="text-gray-500">Estado</p><p className={`font-medium ${selectedUser.estado === 'ACTIVO' ? 'text-green-600' : selectedUser.estado === 'PENDIENTE' ? 'text-yellow-600' : 'text-red-600'}`}>{selectedUser.estado}</p></div>
                    <div><p className="text-gray-500">Creado</p><p className="text-gray-900">{new Date(selectedUser.fecha_creacion).toLocaleDateString()}</p></div>
                    {selectedUser.fecha_activacion && (
                      <div className="col-span-2"><p className="text-gray-500">Activado</p><p className="text-gray-900">{new Date(selectedUser.fecha_activacion).toLocaleDateString()}</p></div>
                    )}
                  </div>

                  {selectedUser.rol.codigo === 'ENCARGADO' && selectedUser.asignaciones_encargado && selectedUser.asignaciones_encargado.length > 0 && (
                    <>
                      <hr className="border-gray-100" />
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Ofertas Asignadas ({selectedUser.asignaciones_encargado.filter(a => a.activo).length})</p>
                        <ul className="space-y-1.5">
                          {selectedUser.asignaciones_encargado.filter(a => a.activo).map(a => (
                            <li key={a.id_asignacion_encargado} className="text-xs p-2 bg-gray-50 rounded border border-gray-100">
                              <span className="font-medium text-gray-900">{a.oferta_programa.programa?.nombre}</span>
                              <br /><span className="text-gray-500">{a.oferta_programa.version} ({a.oferta_programa.gestion})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div className="py-10 text-center"><p className="text-sm text-gray-500">Selecciona un usuario</p></div>
            )}
          </PreviewPanel>
        </div>
      </div>

      <Modal isOpen={showCrearModal} onClose={() => !mLoading && setShowCrearModal(false)} title="Crear Usuario Administrativo" size="lg">
        <div className="space-y-6">
          {mError && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-start gap-2"><ShieldAlert className="h-4 w-4 mt-0.5 shrink-0"/><span>{mError}</span></div>}
          {mWarning && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 space-y-2">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-yellow-600"/>
                <span>{mWarning}</span>
              </div>
              <button onClick={() => { setShowCrearModal(false); resetForm(); }} className="text-xs font-medium text-yellow-700 underline hover:text-yellow-900">Cerrar y continuar</button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <h4 className="sm:col-span-2 text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2">Datos Personales</h4>
            <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico *</label><input type="email" value={fCorreo} onChange={e => setFCorreo(e.target.value)} disabled={mLoading} className={inputCls} placeholder="correo@institucion.edu" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Nombres *</label><input type="text" value={fNombres} onChange={e => setFNombres(e.target.value)} disabled={mLoading} className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Apellidos *</label><input type="text" value={fApellidos} onChange={e => setFApellidos(e.target.value)} disabled={mLoading} className={inputCls} /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">CI (Opcional)</label><input type="text" value={fCI} onChange={e => setFCI(e.target.value)} disabled={mLoading} className={inputCls} placeholder="Ej. 1234567" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label><input type="text" value={fTelefono} onChange={e => setFTelefono(e.target.value)} disabled={mLoading} className={inputCls} /></div>
          </div>

          <div className="space-y-4 border-t border-gray-100 pt-4">
            <h4 className="text-sm font-semibold text-gray-900">Datos de Acceso</h4>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rol del Sistema *</label>
              <select value={fRol} onChange={e => setFRol(e.target.value)} disabled={mLoading} className={selectCls}>
                <option value="">Seleccione un rol...</option>
                {roles.filter(r => r.codigo !== 'PARTICIPANTE').map(r => <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>)}
              </select>
            </div>
            <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded border border-blue-100 flex items-start gap-2">
              <Mail className="h-4 w-4 text-blue-500 shrink-0" />
              Se enviará un correo electrónico de invitación a la dirección proporcionada. 
              El usuario deberá establecer su contraseña mediante el enlace seguro incluido.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-200">
            <button onClick={() => setShowCrearModal(false)} disabled={mLoading} className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg">Cancelar</button>
            <button onClick={handleCrearUsuario} disabled={mLoading} className="px-5 py-2 bg-gray-950 text-white text-sm font-medium rounded-lg hover:bg-gray-800 disabled:opacity-70 flex items-center gap-2">
              {mLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Enviar Invitación
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
