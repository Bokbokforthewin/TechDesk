import React from 'react';
import { LogOut, UserCircle } from 'lucide-react';

export default function Header({ user, onLogout }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm">
      <div className="text-sm font-medium text-slate-600">
        Welcome back, <span className="font-semibold text-slate-900">{user?.name || 'User'}</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right hidden sm:block">
          <p className="text-xs font-semibold text-slate-800">{user?.designation || 'Staff'}</p>
          <p className="text-xs text-slate-500">{user?.unit || user?.division || 'ICTU'}</p>
        </div>

        <div className="h-8 w-px bg-slate-200" />

        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors border border-red-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}