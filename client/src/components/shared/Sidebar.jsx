import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Wrench, 
  Hammer, 
  PackageCheck, 
  User, 
  Tags,
  ExternalLink 
} from 'lucide-react';

const BORROWING_EXTERNAL_URL = 'https://script.google.com/a/macros/nir.doh.gov.ph/s/AKfycbySBB6eGpqb__cL3TyUT1QYk3x26iWEHZ41AGxbyhCg_tCFyAvAk9KYZaysH5bpZ3miQw/exec'; // Replace with actual configured URL

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Technical Assistance', path: '/technical-assistance', icon: Wrench },
    { name: 'Repair Assistance', path: '/repair-assistance', icon: Hammer },
    { name: 'Manage Subjects', path: '/manage-subjects', icon: Tags },
    { name: 'My Account', path: '/my-account', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen flex flex-col border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-lg font-bold tracking-tight text-white">ICTU System</h1>
        <p className="text-xs text-slate-400 mt-1">Technical & Repair Management</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}

        {/* Equipment Borrowing Sidebar Link (External Redirect) */}
        <a
          href={BORROWING_EXTERNAL_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors mt-4"
        >
          <div className="flex items-center gap-3">
            <PackageCheck className="w-4 h-4" />
            <span>Equipment Borrowing</span>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </a>
      </nav>
    </aside>
  );
}