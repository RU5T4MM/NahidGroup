import React from 'react';
import { NavLink } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useSync } from '../context/SyncContext';
import {
  LayoutDashboard,
  Users,
  Receipt,
  FileText,
  BarChart3,
  Settings,
  ShieldCheck,
  LogOut,
  Sun,
  Moon,
  Globe,
  Wifi,
  WifiOff
} from 'lucide-react';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user, theme, setTheme, language, setLanguage, t, logout } = useApp();
  const { isOnline } = useSync();

  const links = [
    { to: "/dashboard", label: t.dashboard, icon: LayoutDashboard },
    { to: "/customers", label: t.customers, icon: Users },
    { to: "/expenses", label: t.expenses, icon: Receipt },
    { to: "/invoices", label: t.invoices, icon: FileText },
    { to: "/reports", label: t.reports, icon: BarChart3 },
    { to: "/settings", label: t.settings, icon: Settings },
  ];

  // If user is admin, add admin panel link
  if (user && user.role === 'admin') {
    links.push({ to: "/admin", label: t.adminPanel, icon: ShieldCheck });
  }

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 z-40 flex flex-col w-72 border-r border-slate-100 bg-white dark:bg-dark-900 dark:border-dark-800 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${language === 'ur' ? 'right-0 border-l' : 'left-0 border-r'}`}
      >
        {/* Brand Logo Header */}
        <div className="flex items-center gap-3 px-6 h-20 border-b border-slate-50 dark:border-dark-850">
          <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-10 h-10 object-contain rounded-xl" />
          <div className="flex-1">
            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-dark-50">{t.appName}</h1>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 font-medium">Business Ledger</p>
          </div>
          {/* Network indicator */}
          <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
            isOnline 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30 dark:text-emerald-500' 
              : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-500'
          }`}>
            {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {isOnline ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => {
                  if (window.innerWidth < 1024) toggleSidebar();
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3.5 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/10'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-dark-400 dark:hover:bg-dark-850 dark:hover:text-dark-100'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer Area: Utilities & Profile */}
        <div className="p-4 border-t border-slate-50 dark:border-dark-850 space-y-4">
          
          {/* Language Selector */}
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-dark-800">
            <Globe className="w-4 h-4 text-slate-500 dark:text-dark-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              className="flex-1 text-xs font-semibold bg-transparent text-slate-700 dark:text-dark-200 outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="hi">हिन्दी (Hindi)</option>
              <option value="ur">اردو (Urdu)</option>
            </select>
          </div>

          {/* Theme & Logout Actions */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center flex-1 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-950 transition-all dark:border-dark-800 dark:bg-dark-850 dark:text-dark-400 dark:hover:bg-dark-800 dark:hover:text-dark-100"
              title="Toggle Theme"
            >
              {theme === 'light' ? (
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Moon className="w-4 h-4" />
                  <span>{t.darkMode}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{t.lightMode}</span>
                </div>
              )}
            </button>

            <button
              onClick={logout}
              className="flex items-center justify-center px-4 py-2.5 rounded-xl border border-rose-200/40 bg-rose-50 text-rose-600 hover:bg-rose-100/60 active:scale-95 transition-all dark:bg-rose-950/10 dark:border-rose-950/20 dark:text-rose-500"
              title={t.logout}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

          {/* Merchant Profile Status */}
          {user && (
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-dark-850 dark:to-dark-900 border border-slate-100 dark:border-dark-800">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-500 font-bold text-sm">
                {user.ownerName ? user.ownerName.charAt(0).toUpperCase() : 'M'}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-800 dark:text-dark-100 truncate">{user.businessName}</h4>
                <p className="text-[10px] text-slate-500 dark:text-dark-400 truncate">{user.ownerName}</p>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                user.subscription?.plan === 'premium'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-500 border border-emerald-200/30 animate-pulse-subtle'
                  : 'bg-slate-200 text-slate-700 dark:bg-dark-800 dark:text-dark-400'
              }`}>
                {user.subscription?.plan === 'premium' ? 'PREMIUM' : 'FREE'}
              </span>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
