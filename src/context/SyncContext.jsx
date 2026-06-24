import React, { createContext, useState, useEffect, useContext } from 'react';
import { useApp } from './AppContext';
import { getQueue, addToQueue, removeFromQueue, setItem, getItems, clearStore } from '../services/db';

const SyncContext = createContext();

export const SyncProvider = ({ children }) => {
  const { fetchWithAuth, addNotification, token, setCustomers, customers, parseResponse } = useApp();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncing, setSyncing] = useState(false);

  // Monitor network connection status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      addNotification('Back online! Syncing offline entries...', 'success');
      syncOfflineQueue();
    };

    const handleOffline = () => {
      setIsOnline(false);
      addNotification('You are offline. Transactions will save locally.', 'warning');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check on load
    if (navigator.onLine && token) {
      syncOfflineQueue();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [token]);

  // Sync Offline Queue with Database
  const syncOfflineQueue = async () => {
    if (!token || syncing) return;
    try {
      const queue = await getQueue();
      if (queue.length === 0) return;

      setSyncing(true);
      console.log(`[SYNC] Sending ${queue.length} offline transactions to server...`);

      // Call bulk sync endpoint
      const res = await fetchWithAuth('/api/ledger/sync', {
        method: 'POST',
        body: JSON.stringify({ transactions: queue })
      });

      if (res.ok) {
        // Successfully synced. Clear queue.
        for (const item of queue) {
          await removeFromQueue(item.id);
        }
        addNotification(`Synced ${queue.length} transactions successfully!`, 'success');
        
        // Refresh customer list
        const custRes = await fetchWithAuth('/api/customers');
        if (custRes.ok) {
          const updatedCusts = await parseResponse(custRes);
          setCustomers(updatedCusts);
          // Cache customers in IndexedDB
          await clearStore('customers');
          for (const c of updatedCusts) {
            await setItem('customers', c);
          }
        }
      }
    } catch (error) {
      console.error('[SYNC] Sync failed:', error.message);
    } finally {
      setSyncing(false);
    }
  };

  // Perform a transaction: Online vs Offline routing
  const saveTransaction = async (formData, customerId, customerPhone, customerName) => {
    const amountVal = parseFloat(formData.get('amount'));
    const typeVal = formData.get('type'); // give or got
    const descVal = formData.get('description');
    const dateVal = formData.get('date') || new Date().toISOString();

    if (isOnline) {
      // Normal online operation
      const res = await fetchWithAuth('/api/ledger', {
        method: 'POST',
        body: formData // Form data handles file uploads
      });
      const data = await parseResponse(res, 'Failed to save transaction');
      return data;
    } else {
      // Offline operation - queue transaction details
      const offlineTx = {
        customerId,
        customerPhone,
        customerName,
        type: typeVal,
        amount: amountVal,
        description: descVal,
        date: dateVal
      };

      await addToQueue(offlineTx);

      // Speculatively update in-memory customer balance
      const factor = typeVal === 'give' ? 1 : -1;
      const updatedCustomers = customers.map(c => {
        if (c._id === customerId) {
          const newBal = c.totalBalance + factor * amountVal;
          // Update cached customer in IndexedDB
          setItem('customers', { ...c, totalBalance: newBal });
          return { ...c, totalBalance: newBal };
        }
        return c;
      });
      setCustomers(updatedCustomers);

      addNotification('Transaction logged offline (Saved locally)', 'info');
      return { offline: true, customerBalance: updatedCustomers.find(c => c._id === customerId)?.totalBalance || 0 };
    }
  };

  // Local caching utilities
  const cacheCustomersOffline = async (custsList) => {
    try {
      await clearStore('customers');
      for (const c of custsList) {
        await setItem('customers', c);
      }
    } catch (e) {
      console.error('Failed to cache customers:', e);
    }
  };

  const getCachedCustomers = async () => {
    try {
      return await getItems('customers');
    } catch (e) {
      console.error('Failed to read cached customers:', e);
      return [];
    }
  };

  return (
    <SyncContext.Provider value={{
      isOnline,
      syncing,
      syncOfflineQueue,
      saveTransaction,
      cacheCustomersOffline,
      getCachedCustomers
    }}>
      {children}
    </SyncContext.Provider>
  );
};

export const useSync = () => useContext(SyncContext);
