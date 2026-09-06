import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import type { NavItem } from '../components/Sidebar';

interface AppLayoutProps {
  navItems: NavItem[];
  rolLabel: string;
}

export default function AppLayout({ navItems, rolLabel }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar items={navItems} rolLabel={rolLabel} />
      <main className="flex-1 lg:ml-20 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
