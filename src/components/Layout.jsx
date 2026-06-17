import React, { useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import { Menu } from 'lucide-react';

const Layout = () => {
  const { token, loading, language } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-dark-950">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Auth Guard
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-dark-100 transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 min-h-screen transition-all duration-300 ${
        language === 'ur' ? 'lg:pr-72 lg:pl-0' : 'lg:pl-72 lg:pr-0'
      }`}>
        
        {/* Mobile Navbar Header */}
        <header className="h-16 border-b border-slate-100 dark:border-dark-850 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md flex items-center justify-between px-6 lg:hidden no-print">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-xl bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-dark-850 dark:text-dark-350 dark:hover:bg-dark-800"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2">
            <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-8 h-8 object-contain rounded-lg" />
            <span className="font-bold text-slate-800 dark:text-dark-100">Nahid Group</span>
          </div>

          <div className="w-10"></div> {/* spacer */}
        </header>

        {/* Page Content Outlet */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
