import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
}

interface SidebarProps {
  items: NavItem[];
  rolLabel: string;
}

export default function Sidebar({ items, rolLabel }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3 left-3 z-50 p-2 rounded-md bg-gray-950 text-white lg:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <nav
        className={`
          fixed top-0 left-0 h-full z-50 bg-gray-950 flex flex-col items-center py-4
          transition-transform duration-200
          w-56 lg:w-20
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="self-end mr-3 mb-2 p-1 rounded-md text-gray-400 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo placeholder */}
        <div className="mb-5 flex flex-col items-center gap-0.5">
          <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
            <span className="text-xs font-bold text-gray-900">C</span>
          </div>
          <span className="text-[9px] text-gray-400 tracking-wider">CAETIP</span>
        </div>

        {/* Nav items */}
        <ul className="flex-1 flex flex-col gap-0.5 w-full px-1.5">
          {items.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                end={item.path.split('/').filter(Boolean).length === 1}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors
                   lg:flex-col lg:items-center lg:gap-0.5 lg:px-1 lg:py-2
                   ${isActive
                     ? 'bg-white/15 text-white'
                     : 'text-gray-400 hover:text-white hover:bg-white/5'
                   }`
                }
              >
                <item.icon className="h-5 w-5 lg:h-[18px] lg:w-[18px] shrink-0" />
                <span className="text-sm lg:text-[10px] lg:leading-tight lg:text-center">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Role label on mobile */}
        <div className="px-3 mb-2 lg:hidden">
          <span className="text-xs text-gray-500">{rolLabel}</span>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 text-gray-400 hover:text-red-400 transition-colors
                     lg:flex-col lg:items-center lg:gap-0.5 lg:px-1 lg:py-2 w-full rounded-lg"
        >
          <LogOut className="h-5 w-5 lg:h-[18px] lg:w-[18px] shrink-0" />
          <span className="text-sm lg:text-[10px] lg:leading-tight lg:text-center">Cerrar sesión</span>
        </button>
      </nav>
    </>
  );
}
