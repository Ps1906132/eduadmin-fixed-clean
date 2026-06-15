
import React from 'react';
import { Bell, Menu, Check, LogOut } from 'lucide-react';

interface HeaderProps {
  toggleSidebar: () => void;
  user?: any;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, user, onLogout }) => {
  return (
    <header className="h-14 bg-[#004AAD] px-4 md:px-8 flex items-center justify-between sticky top-0 z-30 text-white shadow-md">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1 text-white hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-6">
        <button className="p-1 hover:bg-white/10 rounded-full transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border border-[#004AAD]"></span>
        </button>

        <div className="flex items-center gap-3 text-xs border-r border-white/20 pr-6 mr-[-10px]">
          <div className="w-8 h-8 bg-slate-300 rounded-full border border-white/20 overflow-hidden flex items-center justify-center text-slate-600">
            {/* Use a better avatar or initial if no image */}
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="bg-white text-[#004AAD] font-bold w-full h-full flex items-center justify-center text-sm">
                {user?.nama ? user.nama.charAt(0) : 'A'}
              </div>
            )}
          </div>
          <div className="flex flex-col items-start leading-none min-w-[80px]">
            <p className="text-[10px] opacity-80 mb-0.5">{user?.role || 'Guest'}</p>
            <div className="flex items-center gap-1">
              <span className="font-semibold truncate max-w-[100px]">{user?.nama || 'Pengunjung'}</span>
              <Check size={12} className="text-emerald-300" />
            </div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/40 text-red-100 rounded-lg transition-all text-xs font-bold border border-red-500/30"
          title="Keluar Aplikasi"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
