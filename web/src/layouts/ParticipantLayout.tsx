import { Home, FileText, FolderOpen, UserCircle } from 'lucide-react';
import AppLayout from './AppLayout';
import type { NavItem } from '../components/Sidebar';

const navItems: NavItem[] = [
  { label: 'Inicio', path: '/participante', icon: Home },
  { label: 'Inscripciones', path: '/participante/inscripciones', icon: FileText },
  { label: 'Documentos', path: '/participante/documentos', icon: FolderOpen },
  { label: 'Mi perfil', path: '/participante/perfil', icon: UserCircle },
];

export default function ParticipantLayout() {
  return <AppLayout navItems={navItems} rolLabel="Participante" />;
}
