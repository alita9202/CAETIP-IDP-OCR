import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { RequireAuth, RequireRole, RedirectIfAuthenticated } from './guards';
import LoginPage from '../modules/auth/LoginPage';
import ParticipantLayout from '../layouts/ParticipantLayout';
import EncargadoLayout from '../layouts/EncargadoLayout';
import AdminLayout from '../layouts/AdminLayout';
import InicioPage from '../modules/shared/InicioPage';
import PerfilPage from '../modules/shared/PerfilPage';
import DocumentosPage from '../modules/documents/DocumentosPage';
import InscripcionesParticipantePage from '../modules/participant/InscripcionesParticipantePage';
import InscripcionesEncargadoPage from '../modules/enrollments/InscripcionesEncargadoPage';
import ExpedientesPage from '../modules/enrollments/ExpedientesPage';
import ProgramasPage from '../modules/programs/ProgramasPage';
import UsuariosPage from '../modules/users/UsuariosPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={
            <RedirectIfAuthenticated>
              <LoginPage />
            </RedirectIfAuthenticated>
          } />

          {/* Participante */}
          <Route path="/participante" element={
            <RequireAuth>
              <RequireRole allowed={['PARTICIPANTE']}>
                <ParticipantLayout />
              </RequireRole>
            </RequireAuth>
          }>
            <Route index element={<InicioPage rol="participante" nombre="Participante" />} />
            <Route path="inscripciones" element={<InscripcionesParticipantePage />} />
            <Route path="documentos" element={<DocumentosPage />} />
            <Route path="perfil" element={
              <PerfilPage nombre="" apellidos="" correo="" telefono="" rol="participante" />
            } />
          </Route>

          {/* Encargado */}
          <Route path="/encargado" element={
            <RequireAuth>
              <RequireRole allowed={['ENCARGADO']}>
                <EncargadoLayout />
              </RequireRole>
            </RequireAuth>
          }>
            <Route index element={<InicioPage rol="encargado" nombre="Encargado" />} />
            <Route path="expedientes" element={<ExpedientesPage />} />
            <Route path="inscripciones" element={<InscripcionesEncargadoPage />} />
            <Route path="perfil" element={
              <PerfilPage nombre="" apellidos="" correo="" telefono="" rol="encargado" />
            } />
          </Route>

          {/* Administrador + Secretaria */}
          <Route path="/admin" element={
            <RequireAuth>
              <RequireRole allowed={['ADMINISTRADOR', 'SECRETARIA']}>
                <AdminLayout />
              </RequireRole>
            </RequireAuth>
          }>
            <Route index element={<InicioPage rol="administrador" nombre="Admin" />} />
            <Route path="expedientes" element={<ExpedientesPage />} />
            <Route path="inscripciones" element={<InscripcionesEncargadoPage />} />
            <Route path="usuarios" element={<UsuariosPage />} />
            <Route path="programas" element={<ProgramasPage />} />
            <Route path="perfil" element={
              <PerfilPage nombre="" apellidos="" correo="" telefono="" rol="administrador" />
            } />
          </Route>

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
