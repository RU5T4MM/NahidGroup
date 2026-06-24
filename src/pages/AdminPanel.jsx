import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  ShieldAlert,
  Database,
  Lock,
  Unlock,
  Award,
  Download,
  Upload,
  RefreshCw,
  Search,
  Trash2
} from 'lucide-react';

const AdminPanel = () => {
  const { user, fetchWithAuth, addNotification, parseResponse } = useApp();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState(null);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Backup files tracking
  const [backupLog, setBackupLog] = useState('');
  const [restoreFilename, setRestoreFilename] = useState('');

  // User creation state
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [newBName, setNewBName] = useState('');
  const [newOName, setNewOName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPass, setNewPass] = useState('');
  const [newRole, setNewRole] = useState('user');
  const [newAddress, setNewAddress] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!newBName || !newOName || !newPhone || !newEmail || !newPass) {
      addNotification('All fields (except address) are required', 'warning');
      return;
    }
    setCreatingUser(true);
    try {
      const res = await fetchWithAuth('/api/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          businessName: newBName,
          ownerName: newOName,
          phone: newPhone,
          email: newEmail,
          password: newPass,
          role: newRole,
          address: newAddress
        })
      });
      const data = await parseResponse(res, 'Failed to create user');

      addNotification('User created successfully!', 'success');
      setShowCreateUser(false);
      setNewBName('');
      setNewOName('');
      setNewPhone('');
      setNewEmail('');
      setNewPass('');
      setNewRole('user');
      setNewAddress('');
      loadAdminData();
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const loadAdminData = async () => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }

    try {
      setLoading(true);
      // Get metrics
      const mRes = await fetchWithAuth('/api/admin/analytics');
      if (mRes.ok) {
        const mData = await parseResponse(mRes);
        setMetrics(mData.metrics);
      }

      // Get users list
      const uRes = await fetchWithAuth('/api/admin/users');
      if (uRes.ok) {
        const uData = await parseResponse(uRes);
        setUsersList(uData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, [user]);

  // Block/Unblock user
  const handleToggleBlock = async (targetId, currentBlockState) => {
    try {
      const res = await fetchWithAuth(`/api/admin/users/${targetId}/block`, {
        method: 'PUT'
      });
      const data = await parseResponse(res, 'Block action failed');

      addNotification(data.message, 'success');
      loadAdminData(); // reload
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Change user subscription manually
  const handleChangePlan = async (targetId, currentPlan) => {
    const nextPlan = currentPlan === 'premium' ? 'free' : 'premium';
    const confirmMsg = `Are you sure you want to upgrade this merchant to ${nextPlan.toUpperCase()}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetchWithAuth(`/api/admin/users/${targetId}/plan`, {
        method: 'PUT',
        body: JSON.stringify({ plan: nextPlan, durationDays: 30 })
      });
      const data = await parseResponse(res, 'Plan update failed');

      addNotification(data.message, 'success');
      loadAdminData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete user and all their data
  const handleDeleteUser = async (targetId, businessName) => {
    const confirmMsg = `⚠️ WARNING: This will permanently delete the merchant "${businessName}" and ALL their associated customers, invoices, expenses, and transactions. This action cannot be undone. Continue?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetchWithAuth(`/api/admin/users/${targetId}`, {
        method: 'DELETE'
      });
      const data = await parseResponse(res, 'Delete failed');

      addNotification(`Merchant "${businessName}" has been permanently deleted.`, 'success');
      loadAdminData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Trigger manual JSON export backup
  const handleTriggerBackup = async () => {
    try {
      const res = await fetchWithAuth('/api/admin/backup', { method: 'POST' });
      const data = await parseResponse(res, 'Backup failed');

      setBackupLog(`Saved backup: ${data.filename} (${data.filepath})`);
      setRestoreFilename(data.filename);
      addNotification('System JSON database backup completed!', 'success');
      loadAdminData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Trigger JSON restore
  const handleTriggerRestore = async (e) => {
    e.preventDefault();
    if (!restoreFilename) return;

    const confirmMsg = `WARNING: Restoring will overwrite existing data. Proceed with backup file ${restoreFilename}?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const res = await fetchWithAuth('/api/admin/restore', {
        method: 'POST',
        body: JSON.stringify({ filename: restoreFilename })
      });
      const data = await parseResponse(res, 'Database restore failed');

      addNotification('Database restored successfully!', 'success');
      setRestoreFilename('');
      loadAdminData();
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="text-xs font-black text-rose-500 uppercase">Unauthorized Admin access</span>
      </div>
    );
  }

  // Filter users list based on search
  const filteredUsers = usersList.filter(u =>
    u.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.ownerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone?.includes(searchQuery) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-dark-50">Admin Control Center</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase">Review database registers and merchant plans</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={() => setShowCreateUser(true)}
            className="btn-primary py-2 px-4 flex items-center justify-center gap-1.5 text-xs font-bold w-full sm:w-auto"
          >
            <Users className="w-4 h-4" />
            Create Store User
          </button>
          <button
            onClick={loadAdminData}
            className="btn-secondary py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-bold w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 text-slate-500" />
            Refresh Stats
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="glass-card p-5 bg-slate-50/40">
              <span className="text-[9px] font-black text-slate-400 block uppercase">Total Merchants</span>
              <strong className="text-xl font-black text-slate-800 dark:text-dark-50">{metrics?.totalUsers || 0}</strong>
            </div>
            <div className="glass-card p-5 bg-slate-50/40">
              <span className="text-[9px] font-black text-slate-400 block uppercase">Premium Accounts</span>
              <strong className="text-xl font-black text-emerald-600 dark:text-emerald-500">{metrics?.premiumUsers || 0}</strong>
            </div>
            <div className="glass-card p-5 bg-slate-50/40">
              <span className="text-[9px] font-black text-slate-400 block uppercase">Blocked Accounts</span>
              <strong className="text-xl font-black text-rose-500">{metrics?.blockedUsers || 0}</strong>
            </div>
            <div className="glass-card p-5 bg-slate-50/40">
              <span className="text-[9px] font-black text-slate-400 block uppercase">Total Invoices</span>
              <strong className="text-xl font-black text-slate-800 dark:text-dark-50">{metrics?.totalInvoices || 0}</strong>
            </div>
          </div>

          {/* Database Backup & Restore actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Backup Box */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600"><Database className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-100">Database Storage Export</h4>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Write collection backups to local server storage</p>
                </div>
              </div>
              
              <button
                onClick={handleTriggerBackup}
                className="btn-primary py-2 text-xs font-bold w-full"
              >
                <Download className="w-4 h-4" />
                Backup Collections Now
              </button>

              {backupLog && (
                <p className="text-[10px] bg-slate-50 dark:bg-dark-850 p-2.5 rounded-xl border border-slate-100 dark:border-dark-800 text-slate-500 truncate">{backupLog}</p>
              )}
            </div>

            {/* Restore Box */}
            <div className="glass-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-500"><ShieldAlert className="w-5 h-5" /></div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-100">Database State Restoration</h4>
                  <p className="text-[9px] text-slate-400 uppercase font-semibold">Overwrite tables from a saved backup filename</p>
                </div>
              </div>

              <form onSubmit={handleTriggerRestore} className="flex gap-2">
                <input
                  type="text"
                  placeholder="backup_123456789.json"
                  value={restoreFilename}
                  onChange={(e) => setRestoreFilename(e.target.value)}
                  className="input-field text-xs py-2 flex-1"
                  required
                />
                <button
                  type="submit"
                  className="btn-secondary py-2 text-xs font-bold flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/10 dark:border-amber-950/20 dark:text-amber-500"
                >
                  <Upload className="w-4 h-4" />
                  Restore
                </button>
              </form>
            </div>

          </div>

          {/* User grid table directory */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Registered Merchants Directory</h3>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 py-1.5 text-xs w-full"
                  placeholder="Search user email / owner / phone..."
                />
              </div>
            </div>

            {/* Desktop Table View (Hidden on mobile/tablet) */}
            <div className="hidden md:block glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b bg-slate-50/50 dark:bg-dark-850/20 text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                      <th className="p-4">Business Details</th>
                      <th className="p-4">Owner Email</th>
                      <th className="p-4">Mobile</th>
                      <th className="p-4 text-center">Plan Tier</th>
                      <th className="p-4 text-center">Status</th>
                      <th className="p-4 text-center">Action Controls</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-dark-850 text-xs">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-slate-400 font-semibold uppercase">
                          No users registered in directory
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map(u => (
                        <tr key={u._id} className="text-slate-700 dark:text-dark-200">
                          <td className="p-4">
                            <h5 className="font-bold text-slate-800 dark:text-dark-50">{u.businessName}</h5>
                            <span className="text-[9px] text-slate-400 uppercase font-semibold">Owner: {u.ownerName}</span>
                          </td>
                          <td className="p-4 font-medium">{u.email}</td>
                          <td className="p-4 font-semibold">{u.phone}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.subscription?.plan === 'premium'
                                ? 'bg-emerald-50 border border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                                : 'bg-slate-100 border border-slate-200 text-slate-500 dark:bg-dark-850 dark:border-dark-800'
                            }`}>
                              {u.subscription?.plan === 'premium' ? 'PREMIUM PRO' : 'FREE BASIC'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.isBlocked
                                ? 'bg-rose-50 border border-rose-200/50 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                                : 'bg-emerald-50 border border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                            }`}>
                              {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {/* Override plans */}
                              <button
                                onClick={() => handleChangePlan(u._id, u.subscription?.plan)}
                                className="btn-secondary py-1 px-2.5 text-[9px] font-bold flex items-center gap-1"
                                title="Toggle manual upgrade"
                              >
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                Plan Toggle
                              </button>

                              {/* Block Toggle */}
                              <button
                                onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                                className={`p-1.5 rounded-xl border transition-colors ${
                                  u.isBlocked
                                    ? 'border-emerald-100 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-950/20 dark:hover:bg-emerald-950/30'
                                    : 'border-rose-100 hover:bg-rose-50 text-rose-500 dark:border-rose-950/20 dark:hover:bg-rose-950/30'
                                }`}
                                title={u.isBlocked ? 'Unblock User' : 'Block User'}
                              >
                                {u.isBlocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteUser(u._id, u.businessName)}
                                className="p-1.5 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-colors dark:border-red-950/20 dark:hover:bg-red-950/30"
                                title="Permanently delete merchant"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="md:hidden grid grid-cols-1 gap-4">
              {filteredUsers.length === 0 ? (
                <div className="glass-card p-8 text-center text-slate-400 font-semibold uppercase">
                  No users registered in directory
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div key={u._id} className="glass-card p-5 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-800 dark:text-dark-50">{u.businessName}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Owner: {u.ownerName}</span>
                      </div>
                      <div className="flex flex-col gap-1.5 items-end">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.subscription?.plan === 'premium'
                            ? 'bg-emerald-50 border border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                            : 'bg-slate-100 border border-slate-200 text-slate-500 dark:bg-dark-850 dark:border-dark-800'
                        }`}>
                          {u.subscription?.plan === 'premium' ? 'PREMIUM PRO' : 'FREE BASIC'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.isBlocked
                            ? 'bg-rose-50 border border-rose-200/50 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                            : 'bg-emerald-50 border border-emerald-200/50 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                        }`}>
                          {u.isBlocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs border-t border-b border-slate-50 dark:border-dark-850 py-3">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Email</span>
                        <span className="font-medium text-slate-700 dark:text-dark-200 break-all">{u.email}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-semibold block">Mobile</span>
                        <span className="font-semibold text-slate-700 dark:text-dark-200">{u.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleChangePlan(u._id, u.subscription?.plan)}
                        className="btn-secondary py-2 text-xs font-bold flex-1 flex items-center justify-center gap-1.5"
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        Plan Toggle
                      </button>

                      <button
                        onClick={() => handleToggleBlock(u._id, u.isBlocked)}
                        className={`py-2 px-3 rounded-xl border transition-colors flex items-center justify-center ${
                          u.isBlocked
                            ? 'border-emerald-100 hover:bg-emerald-50 text-emerald-600 dark:border-emerald-950/20 dark:hover:bg-emerald-950/30 bg-emerald-50/20'
                            : 'border-rose-100 hover:bg-rose-50 text-rose-500 dark:border-rose-950/20 dark:hover:bg-rose-950/30 bg-rose-50/20'
                        }`}
                      >
                        {u.isBlocked ? (
                          <>
                            <Unlock className="w-4 h-4 mr-1" />
                            <span className="text-xs font-bold">Unblock</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-4 h-4 mr-1" />
                            <span className="text-xs font-bold">Block</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleDeleteUser(u._id, u.businessName)}
                        className="py-2 px-3 rounded-xl border border-red-100 hover:bg-red-50 text-red-500 transition-colors flex items-center justify-center dark:border-red-950/20 dark:hover:bg-red-950/30 bg-red-50/20"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="text-xs font-bold">Delete</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
      {/* ==================== CREATE USER MODAL ==================== */}
      {showCreateUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">Create Store User</h3>
              <button onClick={() => setShowCreateUser(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Business Name</label>
                  <input
                    type="text"
                    value={newBName}
                    onChange={(e) => setNewBName(e.target.value)}
                    className="input-field text-xs py-2"
                    placeholder="E.g. Verma General Store"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Owner Name</label>
                  <input
                    type="text"
                    value={newOName}
                    onChange={(e) => setNewOName(e.target.value)}
                    className="input-field text-xs py-2"
                    placeholder="E.g. Ramesh Verma"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Phone/Mobile</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="input-field text-xs py-2"
                    placeholder="9876543210"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Role</label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="input-field text-xs py-2 bg-transparent"
                  >
                    <option value="user">User / Merchant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="input-field text-xs py-2"
                  placeholder="ramesh@vermastores.com"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="input-field text-xs py-2"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Complete Address</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  className="input-field text-xs py-2"
                  placeholder="Merchant's business location address"
                />
              </div>

              <button type="submit" disabled={creatingUser} className="w-full btn-primary py-2.5 text-xs font-bold">
                {creatingUser ? 'Creating user...' : 'Create Account'}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminPanel;
