import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSync } from '../context/SyncContext';
import { FileSpreadsheet, Printer, Download, Search, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const Reports = () => {
  const { customers, setCustomers, fetchWithAuth, t, language, addNotification, parseResponse } = useApp();
  const { isOnline, getCachedCustomers } = useSync();

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'get' | 'give'

  const loadData = async () => {
    try {
      if (isOnline) {
        const res = await fetchWithAuth('/api/customers');
        if (res.ok) {
          const list = await parseResponse(res);
          setCustomers(list);
        }
      } else {
        const cached = await getCachedCustomers();
        setCustomers(cached);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isOnline]);

  // Aggregate outstanding sums
  let totalWillGet = 0;
  let totalWillGive = 0;

  customers.forEach(c => {
    if (c.totalBalance > 0) totalWillGet += c.totalBalance;
    else if (c.totalBalance < 0) totalWillGive += Math.abs(c.totalBalance);
  });

  const netBalance = totalWillGet - totalWillGive;

  // Filter customers list
  const filteredList = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase()) || c.phone.includes(searchQuery);
    if (!matchesSearch) return false;

    if (filterType === 'get') return c.totalBalance > 0;
    if (filterType === 'give') return c.totalBalance < 0;
    return true;
  });

  // Client-side CSV generator utility
  const handleExportCSV = () => {
    if (customers.length === 0) return;

    try {
      // 1. Build CSV headers and content rows
      const headers = ['S.No', 'Customer Name', 'Phone Number', 'Email Address', 'Balance (INR)', 'Type'];
      const rows = customers.map((c, idx) => [
        idx + 1,
        c.name,
        c.phone,
        c.email || 'N/A',
        Math.abs(c.totalBalance),
        c.totalBalance === 0 ? 'Settle' : c.totalBalance > 0 ? 'You Will Get' : 'You Will Give'
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(val => `"${val}"`).join(','))
      ].join('\n');

      // 2. Spawn browser download trigger
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `NahidGroup_LedgerReport_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addNotification('Statement exported as Excel CSV successfully!', 'success');
    } catch (err) {
      addNotification('CSV compilation failed', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in print-area">
      
      {/* Header controls (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-dark-50">{t.reports}</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase">Export audit summaries and cash sheets</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            disabled={customers.length === 0}
            className="btn-secondary py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            Export CSV / Excel
          </button>
          <button
            onClick={handlePrint}
            disabled={customers.length === 0}
            className="btn-primary py-2 px-4 text-xs font-bold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Ledger Statement
          </button>
        </div>
      </div>

      {/* Grid: Cash flow summaries */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 flex items-center gap-4 border border-slate-100 bg-slate-50/20">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 rounded-2xl">
            <ArrowUpRight className="w-6 h-6 animate-pulse-subtle" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total You Will Get</span>
            <strong className="text-lg font-black text-emerald-600 dark:text-emerald-500">₹{totalWillGet.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 border border-slate-100 bg-slate-50/20">
          <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 rounded-2xl">
            <ArrowDownLeft className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total You Will Give</span>
            <strong className="text-lg font-black text-rose-500">₹{totalWillGive.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        <div className="glass-card p-5 flex items-center gap-4 border border-slate-100 bg-slate-50/20">
          <div className="p-3 bg-slate-100 dark:bg-dark-800 text-slate-600 rounded-2xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Net Balance Summary</span>
            <strong className={`text-lg font-black ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'}`}>
              ₹{netBalance.toLocaleString('en-IN')}
            </strong>
          </div>
        </div>
      </div>

      {/* Roster Controls (Hidden during print) */}
      <div className="glass-card p-4 flex flex-wrap gap-4 items-center justify-between no-print">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 py-1.5 text-xs"
            placeholder="Filter by customer name..."
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'all' ? 'bg-slate-800 text-white dark:bg-dark-50 dark:text-dark-900' : 'bg-slate-100 text-slate-600 dark:bg-dark-850 dark:text-dark-400'
            }`}
          >
            All Ledger
          </button>
          <button
            onClick={() => setFilterType('get')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'get' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 dark:bg-dark-850 dark:text-dark-400'
            }`}
          >
            You Will Get
          </button>
          <button
            onClick={() => setFilterType('give')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${
              filterType === 'give' ? 'bg-rose-500 text-white' : 'bg-slate-100 text-slate-600 dark:bg-dark-850 dark:text-dark-400'
            }`}
          >
            You Will Give
          </button>
        </div>
      </div>

      {/* Table grid displaying customers ledger balance audits */}
      <div className="glass-card overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b bg-slate-50/50 dark:bg-dark-850/20 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
              <th className="p-4">Customer Name</th>
              <th className="p-4">Phone Number</th>
              <th className="p-4">Email</th>
              <th className="p-4 text-right">Balance</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-dark-850 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8">
                  <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : filteredList.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400 font-semibold uppercase">
                  No records to display
                </td>
              </tr>
            ) : (
              filteredList.map(c => {
                const bal = c.totalBalance;
                return (
                  <tr key={c._id} className="text-slate-700 dark:text-dark-200">
                    <td className="p-4 font-bold text-slate-800 dark:text-dark-50">{c.name}</td>
                    <td className="p-4 font-semibold">{c.phone}</td>
                    <td className="p-4 text-slate-400">{c.email || 'N/A'}</td>
                    <td className={`p-4 text-right font-black ${
                      bal === 0 ? 'text-slate-400' : bal > 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'
                    }`}>
                      ₹{Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        bal === 0
                          ? 'bg-slate-50 border-slate-200 text-slate-500 dark:bg-dark-800 dark:border-dark-750'
                          : bal > 0
                            ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                            : 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                      }`}>
                        {bal === 0 ? 'Settled' : bal > 0 ? 'Pending' : 'Advance'}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default Reports;
