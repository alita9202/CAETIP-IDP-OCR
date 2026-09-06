import { Home, FolderSearch, FileText, Users, GraduationCap, UserCircle } from 'lucide-react';
import AppLayout from './AppLayout';
import type { NavItem } from '../components/Sidebar';

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/admin', icon: Home },
  { label: 'Expedientes', path: '/admin/expedientes', icon: FolderSearch },
  { label: 'Inscripciones', path: '/admin/inscripciones', icon: FileText },
  { label: 'Usuarios', path: '/admin/usuarios', icon: Users },
  { label: 'Programas', path: '/admin/programas', icon: GraduationCap },
  { label: 'Mi perfil', path: '/admin/perfil', icon: UserCircle },
];

export default function AdminLayout() {
  return <AppLayout navItems={navItems} rolLabel="Administrador" />;
}
