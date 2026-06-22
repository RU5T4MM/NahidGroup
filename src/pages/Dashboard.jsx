import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSync } from '../context/SyncContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  IndianRupee,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  Plus,
  Receipt,
  FileText,
  TrendingUp,
  PhoneCall,
  Contact,
  Coins,
  BookOpen,
  QrCode,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

const Dashboard = () => {
  const { fetchWithAuth, t, language, addNotification, user } = useApp();
  const { isOnline, getCachedCustomers, cacheCustomersOffline } = useSync();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    youWillGet: 0,
    youWillGive: 0,
    netBalance: 0,
    totalCustomers: 0
  });
  const [recentTx, setRecentTx] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);

  // Modal visibility states
  const [showQrModal, setShowQrModal] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [showEarnModal, setShowEarnModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);

  // Fetch dashboard summary
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        if (isOnline) {
          const res = await fetchWithAuth('/api/dashboard/summary');
          if (res.ok) {
            const data = await res.json();
            setStats({
              youWillGet: data.totalCredit,
              youWillGive: data.totalDebit,
              netBalance: data.netBalance,
              totalCustomers: data.totalCustomers
            });
            setRecentTx(data.recentTransactions || []);
            setRecentCustomers(data.recentCustomers || []);
            setChartData(data.chartData || []);
            
            // Cache locally
            localStorage.setItem('kb_dashboard_cache', JSON.stringify(data));
          }
        } else {
          // Read cached
          const cached = localStorage.getItem('kb_dashboard_cache');
          if (cached) {
            const data = JSON.parse(cached);
            setStats({
              youWillGet: data.totalCredit,
              youWillGive: data.totalDebit,
              netBalance: data.netBalance,
              totalCustomers: data.totalCustomers
            });
            setRecentTx(data.recentTransactions || []);
            setRecentCustomers(data.recentCustomers || []);
            setChartData(data.chartData || []);
          }
        }
      } catch (err) {
        console.error('Dashboard loading error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [isOnline]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8 animate-fade-in">
      
      {/* Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-dark-50">{t.dashboard}</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
            {user?.businessName} • Welcome back, {user?.ownerName}
          </p>
        </div>

        {/* Action Button Links */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/customers')}
            className="btn-primary py-2 px-4 text-xs font-bold"
          >
            <Plus className="w-4 h-4" />
            {t.addCustomer}
          </button>
          <button
            onClick={() => navigate('/invoices')}
            className="btn-secondary py-2 px-4 text-xs font-bold"
          >
            <FileText className="w-4 h-4 text-slate-500 dark:text-dark-400" />
            New Invoice
          </button>
        </div>
      </div>

      {/* Quick Actions Row */}
      <div className="glass-card-premium p-6 space-y-4">
        <div>
          <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Quick Utilities & Operations</h3>
          <p className="text-[10px] text-slate-400 font-semibold uppercase">Quick shortcuts to manage, collect and grow your business</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {/* Call Reminders */}
          <button 
            onClick={() => setShowReminderModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:shadow-md hover:-translate-y-1 transition-all group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-dark-100 block">Call Reminders</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Collect credit balances</span>
            </div>
          </button>

          {/* Business Card */}
          <button 
            onClick={() => setShowCardModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:shadow-md hover:-translate-y-1 transition-all group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Contact className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-dark-100 block">Business Card</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Generate digital card</span>
            </div>
          </button>

          {/* Earn Money */}
          <button 
            onClick={() => setShowEarnModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:shadow-md hover:-translate-y-1 transition-all group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-dark-100 block">Earn Money</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Refer merchant store</span>
            </div>
          </button>

          {/* Cash Book */}
          <button 
            onClick={() => navigate('/expenses')}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:shadow-md hover:-translate-y-1 transition-all group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-dark-100 block">Cash Book</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Track store cashflows</span>
            </div>
          </button>

          {/* Order QR */}
          <button 
            onClick={() => setShowQrModal(true)}
            className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 hover:shadow-md hover:-translate-y-1 transition-all group text-center space-y-2"
          >
            <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-500 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-xs text-slate-800 dark:text-dark-100 block">Order QR</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Receive UPI payments</span>
            </div>
          </button>
        </div>
      </div>

      {/* Grid Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Total Customers Card */}
        <div className="glass-card-premium p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Customers</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-550 shadow-inner">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-slate-800 dark:text-dark-50">
              {stats.totalCustomers || 0}
            </h3>
            <p className="text-[10px] text-slate-405 font-semibold uppercase">Registered business clients</p>
          </div>
        </div>

        {/* Net Balance Card */}
        <div className="glass-card-premium p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/[0.02] rounded-full blur-xl pointer-events-none"></div>
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.totalBalance}</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500 shadow-inner">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className={`text-3xl font-black ${
              stats.netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'
            }`}>
              ₹{stats.netBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-405 font-semibold uppercase">Net outstanding balance</p>
          </div>
        </div>

        {/* You Will Get Card */}
        <div className="glass-card-premium p-6 border-l-4 border-l-emerald-500 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{t.youWillGet}</span>
            <div className="p-2.5 rounded-xl bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-550 shadow-inner">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-emerald-600 dark:text-emerald-500">
              ₹{stats.youWillGet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-405 font-semibold uppercase">Udhaar amount to collect</p>
          </div>
        </div>

        {/* You Will Give Card */}
        <div className="glass-card-premium p-6 border-l-4 border-l-rose-550 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[140px]">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-widest">{t.youWillGive}</span>
            <div className="p-2.5 rounded-xl bg-rose-100/50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-550 shadow-inner">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-1">
            <h3 className="text-3xl font-black text-rose-500 dark:text-rose-450">
              ₹{stats.youWillGive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-[10px] text-slate-405 font-semibold uppercase">Customer debit to payback</p>
          </div>
        </div>

      </div>

      {/* Main Charts & Shortcut grids */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Interactive Cash Flow Chart Card */}
        <div className="glass-card p-6 lg:col-span-2 space-y-6 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Weekly Cash Analytics</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Cash In vs Cash Out trends</p>
            </div>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-dark-800" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Area type="monotone" dataKey="CashIn" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="CashOut" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Shortcuts / Quick Actions List */}
        <div className="glass-card p-6 space-y-5 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Business Shortcuts</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Manage other records</p>
          </div>

          <div className="space-y-3 flex-1 flex flex-col justify-center">
            <Link
              to="/expenses"
              className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all dark:border-dark-850 dark:hover:bg-dark-850"
            >
              <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-500 rounded-xl">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-dark-100 text-sm">Expenses Management</h4>
                <p className="text-[10px] text-slate-400">Track operations and rent payments</p>
              </div>
            </Link>

            <Link
              to="/invoices"
              className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all dark:border-dark-850 dark:hover:bg-dark-850"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 text-blue-500 rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-dark-100 text-sm">GST Billing System</h4>
                <p className="text-[10px] text-slate-400">Generate, Print, and share invoices</p>
              </div>
            </Link>

            <Link
              to="/reports"
              className="flex items-center gap-4 p-4 border border-slate-100 rounded-2xl hover:bg-slate-50 transition-all dark:border-dark-850 dark:hover:bg-dark-850"
            >
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-500 rounded-xl">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h4 className="font-bold text-slate-800 dark:text-dark-100 text-sm">Business Statements</h4>
                <p className="text-[10px] text-slate-400">Export PDF/Excel ledger reports</p>
              </div>
            </Link>
          </div>
        </div>

      </div>

      {/* SECTION 2: Recent Transactions Activity & Recent Customers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Transactions Table */}
        <div className="glass-card p-6 lg:col-span-2 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Recent Ledger Activity</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Latest recorded client entries</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-dark-850 bg-slate-50/30 dark:bg-dark-850/10 text-slate-400 font-black uppercase tracking-wider">
                  <th className="p-3">Date</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Description</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-dark-850">
                {recentTx.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-6 text-slate-400 font-semibold uppercase">No recent entries</td>
                  </tr>
                ) : (
                  recentTx.map(tx => {
                    const isGive = tx.type === 'give';
                    return (
                      <tr key={tx._id} className="text-slate-700 dark:text-dark-200">
                        <td className="p-3 font-medium">{new Date(tx.date).toLocaleDateString()}</td>
                        <td className="p-3 font-bold text-slate-800 dark:text-dark-50">{tx.customerId?.name || 'Deleted Client'}</td>
                        <td className="p-3 italic text-slate-400">{tx.description || 'Ledger Log'}</td>
                        <td className={`p-3 text-right font-black ${isGive ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                          {isGive ? '-' : '+'}₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Customers List */}
        <div className="glass-card p-6 space-y-4">
          <div>
            <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Newly Added Clients</h3>
            <p className="text-[10px] text-slate-400 font-semibold uppercase">Latest customers in directory</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-dark-850 max-h-[260px] overflow-y-auto">
            {recentCustomers.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-semibold uppercase text-xs">No customer registers</div>
            ) : (
              recentCustomers.map(cust => {
                const bal = cust.totalBalance;
                return (
                  <Link
                    key={cust._id}
                    to="/customers"
                    className="flex items-center justify-between py-2.5 hover:bg-slate-50/50 dark:hover:bg-dark-850/30 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 flex items-center justify-center font-bold text-xs">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-dark-50 text-xs">{cust.name}</h4>
                        <p className="text-[9px] text-slate-450 dark:text-dark-400 font-semibold">{cust.phone}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-black ${bal === 0 ? 'text-slate-400' : bal > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
                      ₹{Math.abs(bal).toLocaleString('en-IN')}
                    </span>
                  </Link>
                );
              })
            )}
          </div>
        </div>

      </div>

    </div>

      {/* ==================== MODAL: UPI QR PAYMENT ==================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-5 shadow-2xl relative">
            <button 
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-1 pt-2">
              <div className="w-10 h-10 rounded-full bg-teal-50 dark:bg-teal-950/20 text-teal-605 flex items-center justify-center text-lg font-bold mx-auto shadow-inner">₹</div>
              <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base mt-2">{user?.businessName || "Nahid Group Store"}</h3>
              <p className="text-[10px] text-slate-405 font-bold uppercase tracking-wider">Direct UPI Payment QR</p>
            </div>
            
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl flex flex-col items-center border border-dashed border-slate-200 dark:border-dark-800">
              <div className="bg-white p-2 rounded-xl shadow-md relative border border-slate-100 max-w-[220px]">
                <img 
                  src="/paymentScanner.jpeg" 
                  alt="UPI Payment QR Code"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-3.5 font-bold uppercase tracking-wide">Scan via PhonePe, GPay, Paytm or UPI Apps</span>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="btn-primary w-full text-xs font-bold py-2.5"
              >
                Print QR Code Poster
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: DIGITAL BUSINESS CARD ==================== */}
      {showCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl relative no-print">
            <button 
              onClick={() => setShowCardModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="space-y-1">
              <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Digital Business Card</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ready-to-print merchant card profile</p>
            </div>

            <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6 rounded-2xl border border-emerald-500/20 text-white relative overflow-hidden shadow-xl min-h-[190px] flex flex-col justify-between select-none">
              <div className="absolute -top-10 -right-10 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl"></div>
              
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <h4 className="text-base font-extrabold tracking-wide">{user?.businessName || "Nahid Group Merchant"}</h4>
                  <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-widest block">Digital Khata Member</span>
                </div>
                <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-extrabold flex items-center justify-center text-sm shadow-md">
                  N
                </div>
              </div>

              <div className="space-y-1 pt-5">
                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Owner & Proprietor</span>
                <span className="text-sm font-extrabold block text-slate-100">{user?.ownerName || "Merchant Partner"}</span>
              </div>

              <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-4 text-[9px] text-slate-400 font-semibold">
                <div className="space-y-0.5">
                  <span>📞 +91 {user?.phone || "9999999999"}</span>
                  <span className="block">✉️ {user?.email || "merchant@nahidgroup.com"}</span>
                </div>
                <span className="text-[8px] font-bold text-slate-500">AES-256 Cloud Sync</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => window.print()}
                className="btn-primary flex-1 text-xs font-bold py-2.5"
              >
                Print Card
              </button>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`Business Name: ${user?.businessName || "Nahid Group Store"}\nOwner: ${user?.ownerName}\nPhone: ${user?.phone}\nEmail: ${user?.email}`);
                  addNotification("Merchant profile details copied!", "success");
                }}
                className="btn-secondary flex-1 text-xs font-bold py-2.5"
              >
                Copy Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REFER & EARN ==================== */}
      {showEarnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowEarnModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-3 pt-2">
              <div className="w-14 h-14 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-500 flex items-center justify-center text-2xl mx-auto shadow-inner">💰</div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Earn Referral Cashbacks</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Invite merchant stores to Nahid Group</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-300 leading-relaxed px-2">
                Earn up to <strong>₹150 cashback</strong> for every shop owner who signs up using your link and uploads their first credit customer transaction.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-dark-850 rounded-2xl border border-dashed border-slate-200 dark:border-dark-800 flex items-center justify-between text-xs font-bold gap-3">
              <span className="text-slate-500 dark:text-dark-300 truncate">https://ledger.nahidgroup.com/ref?code=NH983</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText("https://ledger.nahidgroup.com/ref?code=NH983");
                  addNotification("Referral link copied!", "success");
                }}
                className="px-3.5 py-1.5 bg-emerald-500 text-white rounded-xl text-[10px] shrink-0 hover:bg-emerald-600 active:scale-95 transition-all shadow-md shadow-emerald-500/10"
              >
                Copy Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: REMINDERS GUIDE ==================== */}
      {showReminderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in no-print">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <button 
              onClick={() => setShowReminderModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center space-y-3 pt-2">
              <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-500 flex items-center justify-center text-2xl mx-auto shadow-inner">📞</div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Call & WhatsApp Reminders</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Collect credit balances from customers</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-dark-300 leading-relaxed px-2">
                Go to the <strong>Customer Ledger</strong> section, select a customer with pending outstanding balances, and click the **WhatsApp Reminder icon** to instantly send prefilled payment reminders.
              </p>
            </div>
            
            <button 
              onClick={() => {
                setShowReminderModal(false);
                navigate('/customers');
              }}
              className="w-full btn-primary py-2.5 text-xs font-bold mt-2"
            >
              Go to Customers List
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashboard;
