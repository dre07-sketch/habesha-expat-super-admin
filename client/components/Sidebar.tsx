import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, FileVideo, Settings, LogOut, Megaphone, Calendar, Moon, Sun, FileText, Briefcase } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  toggleTheme: () => void;
  isDark: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, toggleTheme, isDark }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Overview' },
    { path: '/articles', icon: FileText, label: 'Articles' },
    { path: '/content', icon: FileVideo, label: 'Content & Media' },
    { path: '/jobs', icon: Briefcase, label: 'Jobs & Careers' },
    { path: '/users', icon: Users, label: 'User Management' },
    { path: '/marketing', icon: Megaphone, label: 'Marketing & Ads' },
    { path: '/events', icon: Calendar, label: 'Events' },
    { path: '/settings', icon: Settings, label: 'System Settings' },
  ];

  return (
    <div className="w-64 h-screen glass-panel border-r-0 flex flex-col fixed left-0 top-0 z-20 transition-all duration-300">
      <div className="p-6 flex items-center gap-3 border-b border-slate-200/50 dark:border-white/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-xl font-bold text-white">H</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-800 dark:text-white leading-tight">Habesha</h1>
          <span className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wider font-bold">Super Admin</span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <div className="text-xs font-bold text-slate-400 dark:text-slate-500 px-4 mb-2 uppercase tracking-wider">Menu</div>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${
              isActive(item.path)
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                : 'text-slate-600 dark:text-slate-400 hover:bg-white/50 dark:hover:bg-white/5 hover:text-blue-600 dark:hover:text-white'
            }`}
          >
            <item.icon size={20} className={isActive(item.path) ? 'text-white' : 'text-slate-500 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-white transition-colors'} />
            <span className="font-medium relative z-10">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200/50 dark:border-white/10 space-y-3">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-white/40 dark:bg-white/5 border border-white/20 dark:border-white/5 text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/10 transition-all"
        >
          <div className="flex items-center gap-3">
             {isDark ? <Moon size={18} /> : <Sun size={18} />}
             <span className="text-sm font-medium">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
          </div>
          <div className={`w-8 h-4 rounded-full relative transition-colors ${isDark ? 'bg-blue-600' : 'bg-slate-300'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${isDark ? 'left-4.5' : 'left-0.5'}`}></div>
          </div>
        </button>
        
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;