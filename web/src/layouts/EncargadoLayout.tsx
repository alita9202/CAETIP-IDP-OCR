import { Home, FolderSearch, FileText, UserCircle } from 'lucide-react';
import AppLayout from './AppLayout';
import type { NavItem } from '../components/Sidebar';

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/encargado', icon: Home },
  { label: 'Expedientes', path: '/encargado/expedientes', icon: FolderSearch },
  { label: 'Inscripciones', path: '/encargado/inscripciones', icon: FileText },
  { label: 'Mi perfil', path: '/encargado/perfil', icon: UserCircle },
];

export default function EncargadoLayout() {
  return <AppLayout navItems={navItems} rolLabel="Encargado" />;
}
