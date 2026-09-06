import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../modules/auth/LoginPage';
import RoleSelectPage from '../modules/auth/RoleSelectPage';
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
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/seleccionar-rol" element={<RoleSelectPage />} />

        {/* Participante */}
        <Route path="/participante" element={<ParticipantLayout />}>
          <Route index element={<InicioPage rol="participante" nombre="María Elena" />} />
          <Route path="inscripciones" element={<InscripcionesParticipantePage />} />
          <Route path="documentos" element={<DocumentosPage />} />
          <Route path="perfil" element={
            <PerfilPage nombre="María Elena" apellidos="Quispe Mamani" correo="maria.quispe@correo.com" telefono="71234567" rol="participante" />
          } />
        </Route>

        {/* Encargado */}
        <Route path="/encargado" element={<EncargadoLayout />}>
          <Route index element={<InicioPage rol="encargado" nombre="Alejandra" />} />
          <Route path="expedientes" element={<ExpedientesPage />} />
          <Route path="inscripciones" element={<InscripcionesEncargadoPage />} />
          <Route path="perfil" element={
            <PerfilPage nombre="Alejandra" apellidos="Terceros Suárez" correo="alejandra.terceros@caetip.edu.bo" telefono="72233445" rol="encargado" />
          } />
        </Route>

        {/* Administrador */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<InicioPage rol="administrador" nombre="Fernando" />} />
          <Route path="expedientes" element={<ExpedientesPage />} />
          <Route path="inscripciones" element={<InscripcionesEncargadoPage />} />
          <Route path="usuarios" element={<UsuariosPage />} />
          <Route path="programas" element={<ProgramasPage />} />
          <Route path="perfil" element={
            <PerfilPage nombre="Fernando" apellidos="Rojas Gutierrez" correo="fernando.rojas@caetip.edu.bo" telefono="71122334" rol="administrador" />
          } />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
