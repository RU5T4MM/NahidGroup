import React, { useEffect, useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useSync } from '../context/SyncContext';
import {
  Users,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  FileImage,
  Trash2,
  Send,
  MessageCircle,
  X,
  UserPlus,
  FileDown,
  QrCode,
  Edit2
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const CustomerLedger = () => {
  const { fetchWithAuth, t, addNotification, customers, setCustomers, language, user } = useApp();
  const { isOnline, saveTransaction, getCachedCustomers, cacheCustomersOffline } = useSync();

  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [logoDataUrl, setLogoDataUrl] = useState(null);

  // Modals Toggles
  const [showAddCust, setShowAddCust] = useState(false);
  const [showAddTx, setShowAddTx] = useState(false);
  const [txType, setTxType] = useState('give'); // 'give' | 'got'
  const [previewBillUrl, setPreviewBillUrl] = useState('');

  // Form Fields
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custEmail, setCustEmail] = useState('');

  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch('/nahid-logo.png');
        if (!response.ok) return;
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => setLogoDataUrl(reader.result);
        reader.readAsDataURL(blob);
      } catch (err) {
        console.warn('Failed to load logo for PDF export', err);
      }
    };

    loadLogo();
  }, []);
  const [custAddress, setCustAddress] = useState('');
  const [custCity, setCustCity] = useState('');
  const [custState, setCustState] = useState('');
  const [custCountry, setCustCountry] = useState('India');
  const [custPincode, setCustPincode] = useState('');
  const [custNotes, setCustNotes] = useState('');

  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');
  const [txDate, setTxDate] = useState('');
  const [txFile, setTxFile] = useState(null);
  const fileInputRef = useRef(null);

  // Edit Modals and Fields
  const [showQrModal, setShowQrModal] = useState(false);
  const [showEditCust, setShowEditCust] = useState(false);
  const [showEditTx, setShowEditTx] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Edit Form Fields for Transaction
  const [editTxAmount, setEditTxAmount] = useState('');
  const [editTxDesc, setEditTxDesc] = useState('');
  const [editTxDate, setEditTxDate] = useState('');
  const [editTxType, setEditTxType] = useState('give');
  const [editTxFile, setEditTxFile] = useState(null);
  const editFileInputRef = useRef(null);

  // Fetch customer records
  const loadCustomers = async () => {
    try {
      if (isOnline) {
        const res = await fetchWithAuth('/api/customers');
        if (res.ok) {
          const list = await res.json();
          setCustomers(list);
          cacheCustomersOffline(list);
        }
      } else {
        const cached = await getCachedCustomers();
        setCustomers(cached);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [isOnline]);

  // Load Transactions when customer selection changes
  useEffect(() => {
    const loadTxHistory = async () => {
      if (!selectedCust) return;
      try {
        if (isOnline) {
          const res = await fetchWithAuth(`/api/ledger/customer/${selectedCust._id}`);
          if (res.ok) {
            const data = await res.json();
            setTransactions(data);
          }
        } else {
          // Mock offline transaction view (could read from indexedDB if cached)
          setTransactions([]);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadTxHistory();
  }, [selectedCust, isOnline]);

  // Add customer handler
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    try {
      const res = await fetchWithAuth('/api/customers', {
        method: 'POST',
        body: JSON.stringify({ 
          name: custName, 
          phone: custPhone, 
          email: custEmail,
          address: custAddress,
          city: custCity,
          state: custState,
          country: custCountry,
          pincode: custPincode,
          notes: custNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to add customer');

      setCustomers(prev => [data, ...prev].sort((a, b) => a.name.localeCompare(b.name)));
      addNotification('Customer added successfully!', 'success');
      
      // Reset forms
      setCustName('');
      setCustPhone('');
      setCustEmail('');
      setCustAddress('');
      setCustCity('');
      setCustState('');
      setCustCountry('India');
      setCustPincode('');
      setCustNotes('');
      setShowAddCust(false);
      setSelectedCust(data);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Edit customer open form
  const openEditCustomer = () => {
    if (!selectedCust) return;
    setCustName(selectedCust.name || '');
    setCustPhone(selectedCust.phone || '');
    setCustEmail(selectedCust.email || '');
    setCustAddress(selectedCust.address || '');
    setCustCity(selectedCust.city || '');
    setCustState(selectedCust.state || '');
    setCustCountry(selectedCust.country || 'India');
    setCustPincode(selectedCust.pincode || '');
    setCustNotes(selectedCust.notes || '');
    setShowEditCust(true);
  };

  // Edit customer handler
  const handleEditCustomer = async (e) => {
    e.preventDefault();
    if (!custName || !custPhone) return;

    try {
      const res = await fetchWithAuth(`/api/customers/${selectedCust._id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          name: custName, 
          phone: custPhone, 
          email: custEmail,
          address: custAddress,
          city: custCity,
          state: custState,
          country: custCountry,
          pincode: custPincode,
          notes: custNotes
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update customer');

      // Update customers array and selectedCust
      setCustomers(prev => prev.map(c => c._id === selectedCust._id ? data : c).sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedCust(data);
      addNotification('Customer updated successfully!', 'success');
      setShowEditCust(false);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Edit transaction open form
  const openEditTransaction = (tx) => {
    setEditingTx(tx);
    setEditTxAmount(tx.amount.toString());
    setEditTxDesc(tx.description || '');
    // Format date as YYYY-MM-DD
    const d = new Date(tx.date);
    const dateStr = d.toISOString().split('T')[0];
    setEditTxDate(dateStr);
    setEditTxType(tx.type || 'give');
    setEditTxFile(null); // Clear any pending uploaded file
    setShowEditTx(true);
  };

  // Edit transaction handler
  const handleEditTransaction = async (e) => {
    e.preventDefault();
    if (!editTxAmount || isNaN(editTxAmount)) {
      addNotification('Please enter a valid amount', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('amount', editTxAmount);
      formData.append('description', editTxDesc);
      formData.append('date', editTxDate);
      formData.append('type', editTxType);
      if (editTxFile) formData.append('billImage', editTxFile);

      const res = await fetchWithAuth(`/api/ledger/${editingTx._id}`, {
        method: 'PUT',
        body: formData
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update transaction');

      // Update local transactions list
      setTransactions(prev => prev.map(t => t._id === editingTx._id ? data.transaction : t));

      // Update customer balance on local view
      setSelectedCust(prev => ({
        ...prev,
        totalBalance: data.customerBalance
      }));

      // Update customer list balances
      setCustomers(prev => prev.map(c => c._id === selectedCust._id ? { ...c, totalBalance: data.customerBalance } : c));

      addNotification('Transaction updated successfully!', 'success');
      setShowEditTx(false);
      setEditingTx(null);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Generate PDF handler
  const handleGeneratePDF = () => {
    if (!selectedCust) return;

    try {
      const doc = new jsPDF();

      // Set document properties
      doc.setProperties({
        title: `${selectedCust.name} Account Statement`,
        subject: 'Nahid Group Ledger Statement',
        author: user?.businessName || 'Nahid Group',
      });

      // 1. Business Profile Header (Left-aligned)
      let imageType = null;
      if (logoDataUrl) {
        imageType = logoDataUrl.includes('image/png')
          ? 'PNG'
          : logoDataUrl.includes('image/jpeg') || logoDataUrl.includes('image/jpg')
          ? 'JPEG'
          : 'PNG';
      }

      // Top Help Strip
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(11, 60, 122); // Khatabook dark blue
      doc.text('Start Using Nahid Group Ledger App', 14, 11);
      
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Help: +91-7860799398', 160, 11);

      // Dark Blue Header Bar
      doc.setFillColor(11, 60, 122);
      doc.rect(14, 15, 182, 16, 'F');

      // Logo inside header bar
      if (logoDataUrl && imageType) {
        try {
          doc.setFillColor(255, 255, 255);
          doc.roundedRect(18, 17.5, 11, 11, 2, 2, 'F');
          doc.addImage(logoDataUrl, imageType, 19, 18.5, 9, 9);
        } catch (imgError) {
          console.warn('Failed to add logo inside PDF header bar:', imgError);
        }
      }

      // Brand Text inside Header Bar
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text('Nahid Group', 32, 25.5);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(9.5);
      doc.text('Business Ledger', 165, 25);

      // Reset text color for standard content
      doc.setTextColor(30, 41, 59); // slate-800

      // Business Info Box
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(user?.businessName || 'Nahid Group', 14, 42);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text(`Proprietor: ${user?.ownerName || 'Nahid'}`, 14, 47);
      doc.text(`Phone: +91 ${user?.phone || '7860799398'}`, 14, 51);
      doc.text('Email: groupnahid@gmail.com', 14, 55);
      doc.text('Nahidgroupmanpower@gmail.com', 14, 59);
      
      const bAddress = user?.address || '1st GF 105/211/3, opp. Hotel Deep, beside Navrang Hotel, Husainganj, Lucknow, Uttar Pradesh 226001';
      const splitAddress = doc.splitTextToSize(`Address: ${bAddress}`, 90);
      doc.text(splitAddress, 14, 63);

      // Statement Metadata (Right-aligned)
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(30, 41, 59);
      doc.setFontSize(10);
      doc.text('CUSTOMER ACCOUNT STATEMENT', 120, 42);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, 120, 47);
      doc.text(`Status: Active Record`, 120, 51);

      // Add a horizontal rule
      doc.setDrawColor(226, 232, 240); // Slate-200
      doc.setLineWidth(0.5);
      doc.line(14, 73, 196, 73);

      // 2. Customer Info block (Two-column layout)
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text('CUSTOMER INFORMATION', 14, 80);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(`Full Name: ${selectedCust.name}`, 14, 86);
      doc.text(`Mobile Number: +91 ${selectedCust.phone}`, 14, 91);
      doc.text(`Email Address: ${selectedCust.email || 'N/A'}`, 14, 96);

      // Client Address (Right side column)
      const cAddr = [
        selectedCust.address,
        selectedCust.city,
        selectedCust.state,
        selectedCust.pincode,
        selectedCust.country
      ].filter(Boolean).join(', ');
      
      const splitCAddr = doc.splitTextToSize(`Address: ${cAddr || 'N/A'}`, 80);
      doc.text(splitCAddr, 115, 86);
      
      if (selectedCust.notes) {
        doc.text(`Notes: ${selectedCust.notes}`, 115, 96);
      }

      // Add another divider
      doc.line(14, 103, 196, 103);

      // 3. Outstanding Balances Summary
      let totalCredit = 0; // got
      let totalDebit = 0;  // give
      
      transactions.forEach(t => {
        if (t.type === 'got') totalCredit += t.amount;
        else if (t.type === 'give') totalDebit += t.amount;
      });

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 41, 59);
      doc.text('STATEMENT FINANCIAL SUMMARY', 14, 109);

      doc.setFontSize(8);
      doc.setFont('Helvetica', 'normal');
      doc.setTextColor(100, 116, 139);
      doc.text('Total Debit (You Gave)', 14, 115);
      doc.text('Total Credit (You Got)', 75, 115);
      doc.text('Current Balance', 135, 115);

      doc.setFontSize(10.5);
      doc.setFont('Helvetica', 'bold');
      doc.setTextColor(239, 68, 68); // Red-500
      doc.text(`Rs ${totalDebit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 14, 122);
      
      doc.setTextColor(16, 185, 129); // Emerald-600
      doc.text(`Rs ${totalCredit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`, 75, 122);

      const bal = Number(selectedCust.totalBalance || 0);
      if (bal >= 0) {
        doc.setTextColor(16, 185, 129);
        doc.text(`Rs ${bal.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Cr`, 135, 122);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text(`Rs ${Math.abs(bal).toLocaleString('en-IN', { minimumFractionDigits: 2 })} Dr`, 135, 122);
      }

      // Add another divider
      doc.line(14, 128, 196, 128);

      // 4. Process Transactions & Month Grouping
      const sortedTx = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
      
      const txWithBalance = [];
      let currentBalance = 0;
      sortedTx.forEach(t => {
        if (t.type === 'give') {
          currentBalance += t.amount;
        } else {
          currentBalance -= t.amount;
        }
        txWithBalance.push({
          ...t,
          runningBalance: currentBalance
        });
      });

      const getMonthYearKey = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      };

      const grouped = {};
      txWithBalance.forEach(t => {
        const key = getMonthYearKey(t.date);
        if (!grouped[key]) {
          grouped[key] = [];
        }
        grouped[key].push(t);
      });

      const tableRows = [];
      let lastRunningBalance = 0;
      const uniqueMonths = [];
      
      txWithBalance.forEach(t => {
        const key = getMonthYearKey(t.date);
        if (!uniqueMonths.includes(key)) {
          uniqueMonths.push(key);
        }
      });

      uniqueMonths.forEach(monthKey => {
        const monthGroup = grouped[monthKey];
        const openingBal = lastRunningBalance;

        // Add Month Header Row
        tableRows.push({
          type: 'monthHeader',
          date: monthKey,
          details: `(Opening Balance: Rs ${openingBal.toLocaleString('en-IN', { minimumFractionDigits: 2 })})`,
          debit: '',
          credit: '',
          balance: ''
        });

        // Add transactions of this month
        monthGroup.forEach(t => {
          const txDateObj = new Date(t.date);
          const formattedDate = txDateObj.toLocaleString('en-US', { day: '2-digit', month: 'short' });
          
          tableRows.push({
            type: 'transaction',
            date: formattedDate,
            details: t.description || 'Ledger entry log',
            debit: t.type === 'give' ? t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
            credit: t.type === 'got' ? t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '',
            balance: `Rs ${Math.abs(t.runningBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })} ${t.runningBalance >= 0 ? 'Dr' : 'Cr'}`
          });
        });

        // Calculate monthly totals
        let monthDebits = 0;
        let monthCredits = 0;
        monthGroup.forEach(t => {
          if (t.type === 'give') monthDebits += t.amount;
          else monthCredits += t.amount;
        });

        // Add Month Total Row
        const monthNameOnly = monthKey.split(' ')[0]; // e.g. "April"
        tableRows.push({
          type: 'monthTotal',
          date: `${monthNameOnly} Total`,
          details: '',
          debit: `Rs ${monthDebits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          credit: `Rs ${monthCredits.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
          balance: ''
        });

        // Set last running balance for next month's opening balance
        lastRunningBalance = monthGroup[monthGroup.length - 1].runningBalance;
      });

      // 5. Generate Table in jsPDF
      autoTable(doc, {
        columns: [
          { header: 'Date', dataKey: 'date' },
          { header: 'Details', dataKey: 'details' },
          { header: 'Debit(-)', dataKey: 'debit' },
          { header: 'Credit(+)', dataKey: 'credit' },
          { header: 'Balance', dataKey: 'balance' }
        ],
        body: tableRows,
        startY: 134,
        theme: 'plain',
        headStyles: {
          fillColor: [248, 250, 252], // slate-50
          textColor: [15, 23, 42], // slate-900
          fontStyle: 'bold',
          lineColor: [148, 163, 184], // slate-400
          lineWidth: { bottom: 1 }
        },
        columnStyles: {
          date: { cellWidth: 25 },
          details: { cellWidth: 'auto' },
          debit: { cellWidth: 32, halign: 'right' },
          credit: { cellWidth: 32, halign: 'right' },
          balance: { cellWidth: 32, halign: 'right' }
        },
        styles: {
          fontSize: 8.5,
          cellPadding: 3,
          lineColor: [241, 245, 249], // slate-100
          lineWidth: { bottom: 0.5 }
        },
        didParseCell: (data) => {
          const rowRaw = data.row.raw;
          if (rowRaw) {
            const rowType = rowRaw.type;
            if (rowType === 'monthHeader') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [241, 245, 249]; // slate-100
              data.cell.styles.textColor = [30, 41, 59]; // slate-800
              data.cell.styles.lineColor = [226, 232, 240];
              data.cell.styles.lineWidth = { top: 0.5, bottom: 0.5 };
              if (data.column.dataKey === 'balance') {
                data.cell.styles.textColor = [100, 116, 139]; // slate-500
              }
            } else if (rowType === 'monthTotal') {
              data.cell.styles.fontStyle = 'bold';
              data.cell.styles.fillColor = [255, 255, 255];
              data.cell.styles.textColor = [30, 41, 59];
              data.cell.styles.lineColor = [203, 213, 225]; // slate-300
              data.cell.styles.lineWidth = { top: 1, bottom: 1 };
              if (data.column.dataKey === 'debit') {
                data.cell.styles.textColor = [239, 68, 68]; // Red for total debit
              } else if (data.column.dataKey === 'credit') {
                data.cell.styles.textColor = [16, 185, 129]; // Green for total credit
              }
            } else if (rowType === 'transaction') {
              if (data.column.dataKey === 'debit' && data.cell.text[0]) {
                data.cell.styles.fillColor = [254, 242, 242]; // red-50
                data.cell.styles.textColor = [239, 68, 68]; // red-500
              } else if (data.column.dataKey === 'credit' && data.cell.text[0]) {
                data.cell.styles.fillColor = [240, 253, 250]; // emerald-50
                data.cell.styles.textColor = [16, 185, 129]; // emerald-600
              } else if (data.column.dataKey === 'balance') {
                const balText = data.cell.text[0] || '';
                if (balText.includes('Dr')) {
                  data.cell.styles.textColor = [239, 68, 68];
                } else if (balText.includes('Cr')) {
                  data.cell.styles.textColor = [16, 185, 129];
                }
              }
            }
          }
        }
      });

      // Footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('Helvetica', 'normal');
        doc.setTextColor(148, 163, 184); // slate-400
        doc.text(`Page ${i} of ${pageCount}`, 14, 287);
        doc.text('Generated via Nahid Group Business Ledger', 130, 287);
      }

      doc.save(`${selectedCust.name}_statement.pdf`);
      addNotification('Statement PDF generated successfully!', 'success');
    } catch (e) {
      console.error(e);
      addNotification('Failed to generate PDF statement', 'error');
    }
  };

  // Add Transaction Entry (Give / Got)
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!txAmount || isNaN(txAmount)) {
      addNotification('Please enter a valid amount', 'warning');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('customerId', selectedCust._id);
      formData.append('type', txType);
      formData.append('amount', txAmount);
      formData.append('description', txDesc);
      if (txDate) formData.append('date', txDate);
      if (txFile) formData.append('billImage', txFile);

      const result = await saveTransaction(formData, selectedCust._id, selectedCust.phone, selectedCust.name);

      // Update customer balance on local view
      setSelectedCust(prev => ({
        ...prev,
        totalBalance: result.customerBalance
      }));

      // Update customer list balances
      setCustomers(prev => prev.map(c => c._id === selectedCust._id ? { ...c, totalBalance: result.customerBalance } : c));

      // Append transaction list (if online)
      if (!result.offline) {
        setTransactions(prev => [result.transaction, ...prev]);
        addNotification('Transaction recorded successfully!', 'success');
      }

      // Open WhatsApp notification
      const txTypeLabel = txType === 'give' ? 'Debited (Gave/Udhaar)' : 'Credited (Got/Payment)';
      const msg = `Hello ${selectedCust.name},\n\nA new transaction has been logged for you at *${user?.businessName || "Nahid Group"}*:\n- Date: ${new Date().toLocaleDateString()}\n- Amount: *₹${parseFloat(txAmount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*\n- Status: *${txTypeLabel}*\n- Updated Balance: *₹${Math.abs(result.customerBalance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}*\n\nThank you!`;
      window.open(`https://wa.me/91${selectedCust.phone}?text=${encodeURIComponent(msg)}`, '_blank');

      // Reset fields
      setTxAmount('');
      setTxDesc('');
      setTxDate('');
      setTxFile(null);
      setShowAddTx(false);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete transaction
  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm('Are you sure you want to delete this ledger entry?')) return;
    try {
      const res = await fetchWithAuth(`/api/ledger/${txId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete transaction');

      // Filter local lists
      setTransactions(prev => prev.filter(t => t._id !== txId));
      setSelectedCust(prev => ({ ...prev, totalBalance: data.customerBalance }));
      setCustomers(prev => prev.map(c => c._id === selectedCust._id ? { ...c, totalBalance: data.customerBalance } : c));
      addNotification('Ledger entry deleted, balance updated.', 'success');
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Delete Customer
  const handleDeleteCustomer = async (custId) => {
    if (!window.confirm('Are you sure you want to delete this customer and all their ledger history? This action cannot be undone.')) return;
    try {
      const res = await fetchWithAuth(`/api/customers/${custId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete customer');

      addNotification('Customer and all ledger history deleted.', 'success');
      
      // Update local state: remove customer from list and reset selected customer
      setCustomers(prev => prev.filter(c => c._id !== custId));
      setSelectedCust(null);
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  // Generate WhatsApp Reminder Link
  const getWhatsAppReminderUrl = (customer) => {
    if (!customer) return '';
    const balance = customer.totalBalance;
    if (balance <= 0) return '#';
    
    const message = `Hello ${customer.name}, this is a friendly reminder that you have a pending balance of ₹${balance.toLocaleString('en-IN')} with our business. Please settle it soon. Thank you!`;
    return `https://wa.me/91${customer.phone}?text=${encodeURIComponent(message)}`;
  };

  // Filter customers based on search query
  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.phone.includes(searchQuery)
  );

  return (
    <div className="h-[calc(100vh-7.5rem)] lg:h-[calc(100vh-5rem)] flex gap-6 animate-fade-in relative">
      
      {/* ==================== LEFT Roster PANE: Customers list ==================== */}
      <div className={`w-full lg:w-80 flex flex-col bg-white border border-slate-100 dark:bg-dark-900 dark:border-dark-800 rounded-3xl overflow-hidden ${
        selectedCust ? 'hidden lg:flex' : 'flex'
      }`}>
        {/* Search header */}
        <div className="p-4 border-b border-slate-50 dark:border-dark-850 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-9 py-2 text-xs"
              placeholder={t.searchCustomer}
            />
          </div>
          <button
            onClick={() => setShowAddCust(true)}
            className="w-full btn-primary py-2 text-xs font-bold"
          >
            <UserPlus className="w-4 h-4" />
            {t.addCustomer}
          </button>
        </div>

        {/* Customer item lists */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-50 dark:divide-dark-850">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 font-semibold uppercase">No customers found</div>
          ) : (
            filteredCustomers.map(c => {
              const owesMoney = c.totalBalance > 0;
              return (
                <button
                  key={c._id}
                  onClick={() => setSelectedCust(c)}
                  className={`w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-dark-850 transition-colors ${
                    selectedCust?._id === c._id ? 'bg-slate-50 dark:bg-dark-850/50' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl premium-gradient text-white flex items-center justify-center font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-dark-100 text-sm">{c.name}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">{c.phone}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className={`text-xs font-black block ${
                      c.totalBalance === 0 ? 'text-slate-400' : owesMoney ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'
                    }`}>
                      ₹{Math.abs(c.totalBalance).toLocaleString('en-IN')}
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block">
                      {c.totalBalance === 0 ? 'Settle' : owesMoney ? 'Get' : 'Give'}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ==================== RIGHT DETAIL PANE: Selected Ledger ==================== */}
      <div className={`flex-1 flex flex-col bg-white border border-slate-100 dark:bg-dark-900 dark:border-dark-800 rounded-3xl overflow-hidden ${
        selectedCust ? 'flex' : 'hidden lg:flex items-center justify-center bg-slate-50/30'
      }`}>
        {selectedCust ? (
          <>
            {/* Ledger Header */}
            <div className="p-6 border-b border-slate-50 dark:border-dark-850 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50 dark:bg-dark-850/20">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCust(null)}
                  className="p-1 rounded-lg hover:bg-slate-100 lg:hidden text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 flex items-center justify-center font-bold text-lg">
                  {selectedCust.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">{selectedCust.name}</h3>
                    <button
                      onClick={openEditCustomer}
                      className="p-1 text-slate-400 hover:text-emerald-650 hover:bg-slate-100 dark:hover:bg-dark-800 rounded-lg transition-colors"
                      title="Edit Customer Profile"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-semibold">{selectedCust.phone} • {selectedCust.email || 'No email'}</p>
                </div>
              </div>

              {/* Balances and WhatsApp Reminders */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Outstanding Balance</span>
                  <span className={`text-lg font-black ${
                    selectedCust.totalBalance >= 0 ? 'text-emerald-600 dark:text-emerald-500' : 'text-rose-500'
                  }`}>
                    ₹{selectedCust.totalBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                  <button
                    onClick={handleGeneratePDF}
                    className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all dark:bg-blue-950/30 dark:text-blue-500"
                    title="Generate Account PDF Statement"
                  >
                    <FileDown className="w-5 h-5" />
                  </button>

                  <button
                    onClick={() => setShowQrModal(true)}
                    className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-teal-50 text-teal-600 hover:bg-teal-100 transition-all dark:bg-teal-950/30 dark:text-teal-500"
                    title="Show Payment QR Code"
                  >
                    <QrCode className="w-5 h-5" />
                  </button>

                  {selectedCust.totalBalance > 0 && (
                    <a
                      href={getWhatsAppReminderUrl(selectedCust)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-all dark:bg-emerald-950/30 dark:text-emerald-500"
                      title="Send WhatsApp Payment Reminder"
                    >
                      <MessageCircle className="w-5 h-5 fill-current" />
                    </a>
                  )}

                  {isOnline && (
                    <button
                      onClick={() => handleDeleteCustomer(selectedCust._id)}
                      className="flex items-center justify-center p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition-all dark:bg-rose-950/30 dark:text-rose-500"
                      title="Delete Customer Account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Customer Details info strip */}
            {(selectedCust.address || selectedCust.city || selectedCust.notes) && (
              <div className="px-6 py-2.5 bg-slate-50/60 dark:bg-dark-850/20 border-b border-slate-100 dark:border-dark-800/80 flex flex-wrap gap-x-6 gap-y-1.5 text-xs text-slate-500 dark:text-dark-300">
                {selectedCust.address && (
                  <div>
                    <span className="font-bold text-slate-400">Address:</span> {selectedCust.address}
                    {selectedCust.city && `, ${selectedCust.city}`}
                    {selectedCust.state && `, ${selectedCust.state}`}
                    {selectedCust.pincode && ` - ${selectedCust.pincode}`}
                  </div>
                )}
                {selectedCust.notes && (
                  <div>
                    <span className="font-bold text-slate-400">Notes:</span> {selectedCust.notes}
                  </div>
                )}
              </div>
            )}

            {/* Transactions items list */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {transactions.length === 0 ? (
                <div className="text-center py-20 text-xs text-slate-400 font-semibold uppercase">No transaction logs listed</div>
              ) : (
                transactions.map(t => {
                  const isGive = t.type === 'give'; // gave debit, got credit
                  return (
                    <div
                      key={t._id}
                      className={`p-4 border rounded-2xl flex items-center justify-between transition-all ${
                        isGive
                          ? 'border-rose-100 bg-rose-500/[0.01] dark:border-rose-950/20'
                          : 'border-emerald-100 bg-emerald-500/[0.01] dark:border-emerald-950/20'
                      }`}
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(t.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-800 dark:text-dark-100">{t.description || 'Ledger Entry'}</p>
                        
                        {/* Bill Thumbnail link */}
                        {t.billImage && (
                          <button
                            onClick={() => setPreviewBillUrl(t.billImage)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold rounded-lg border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-dark-800 dark:bg-dark-850 dark:text-dark-350"
                          >
                            <FileImage className="w-3.5 h-3.5" />
                            View Receipt
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <span className={`text-base font-black block ${isGive ? 'text-rose-500' : 'text-emerald-600 dark:text-emerald-500'}`}>
                            ₹{t.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-[9px] text-slate-400 font-semibold uppercase block">
                            {isGive ? 'You Gave' : 'You Got'}
                          </span>
                        </div>

                        {isOnline && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditTransaction(t)}
                              className="p-2 text-slate-350 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-all"
                              title="Edit Ledger Log"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteTransaction(t._id)}
                              className="p-2 text-slate-350 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-all"
                              title="Delete Ledger Log"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Sticky red/green actions footer */}
            <div className="p-4 border-t border-slate-50 dark:border-dark-850 grid grid-cols-2 gap-4 bg-slate-50/30">
              <button
                onClick={() => {
                  setTxType('give');
                  setShowAddTx(true);
                }}
                className="py-3 px-5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:scale-95 transition-all text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-500/10"
              >
                <ArrowDownLeft className="w-5 h-5" />
                YOU GAVE (DEBIT)
              </button>

              <button
                onClick={() => {
                  setTxType('got');
                  setShowAddTx(true);
                }}
                className="py-3 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/10"
              >
                <ArrowUpRight className="w-5 h-5" />
                YOU GOT (CREDIT)
              </button>
            </div>
          </>
        ) : (
          <div className="text-center space-y-4 max-w-sm px-6">
            <div className="w-36 h-36 mx-auto animate-float-slow">
              <svg viewBox="0 0 120 120" className="w-full h-full">
                <rect x="20" y="34" width="80" height="64" rx="14" fill="url(#folderGrad)" stroke="#e2e8f0" strokeWidth="1.5"/>
                <rect x="36" y="24" width="48" height="14" rx="6" fill="#10b981" />
                {/* Floating graphic elements */}
                <circle cx="20" cy="24" r="5" fill="#fbbf24" className="animate-float-medium" />
                <circle cx="98" cy="42" r="6" fill="#34d399" />
                <circle cx="94" cy="94" r="4.5" fill="#f87171" />
                {/* Document lines */}
                <line x1="38" y1="52" x2="82" y2="52" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round"/>
                <line x1="38" y1="66" x2="72" y2="66" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
                <line x1="38" y1="80" x2="60" y2="80" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="folderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff"/>
                    <stop offset="100%" stopColor="#f8fafc"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <h4 className="font-extrabold text-slate-800 dark:text-dark-100 text-sm">{t.noCustomerSelected || "No Customer Selected"}</h4>
            <p className="text-xs text-slate-400 leading-relaxed">Select a merchant client on the left grid list to review dates, balances, attachments, and payment reminder links.</p>
          </div>
        )}
      </div>

      {/* ==================== 1. MODAL: ADD CUSTOMER ==================== */}
      {showAddCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">{t.addCustomer}</h3>
              <button onClick={() => setShowAddCust(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddCustomer} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="input-field text-xs py-1.5"
                  placeholder="Enter Full Name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Mobile Number</label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Mobile Number"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Email Address"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Complete Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="input-field text-xs py-1.5"
                  placeholder="Enter Complete Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter City"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">State</label>
                  <input
                    type="text"
                    value={custState}
                    onChange={(e) => setCustState(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Pincode</label>
                  <input
                    type="text"
                    value={custPincode}
                    onChange={(e) => setCustPincode(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Pincode"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Country</label>
                  <input
                    type="text"
                    value={custCountry}
                    onChange={(e) => setCustCountry(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Country"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Notes / Remarks</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="input-field text-xs py-1.5 min-h-[60px]"
                  placeholder="Enter Notes / Remarks"
                />
              </div>

              <button type="submit" className="w-full btn-primary mt-2">
                Add to ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 2. MODAL: ADD TRANSACTION ==================== */}
      {showAddTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">
                {txType === 'give' ? 'Record Debited Udhaar' : 'Record Received Payment'}
              </h3>
              <button onClick={() => setShowAddTx(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleAddTransaction} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.amount} (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={txAmount}
                  onChange={(e) => setTxAmount(e.target.value)}
                  className="input-field text-lg font-black text-slate-900 dark:text-dark-50"
                  placeholder="0.00"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.description}</label>
                <input
                  type="text"
                  value={txDesc}
                  onChange={(e) => setTxDesc(e.target.value)}
                  className="input-field text-sm"
                  placeholder="E.g., 2kg Sugar box, cash payment..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Transaction Date</label>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="input-field text-sm text-slate-500"
                />
              </div>

              {/* Bill Attachment field */}
              {txType === 'give' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.attachBill}</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => setTxFile(e.target.files[0])}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current.click()}
                      className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {txFile ? txFile.name.substring(0, 15) : 'Select File'}
                    </button>
                    {txFile && (
                      <button
                        type="button"
                        onClick={() => setTxFile(null)}
                        className="p-2 border rounded-xl hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg ${
                  txType === 'give' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                }`}
              >
                Log to Ledger
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 3. MODAL: RECEIPT IMAGE PREVIEW ==================== */}
      {previewBillUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 cursor-zoom-out"
          onClick={() => setPreviewBillUrl('')}
        >
          <div className="relative max-w-lg w-full bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl">
            <img src={previewBillUrl} alt="Bill receipt scan" className="w-full h-auto max-h-[80vh] object-contain" />
            <button
              onClick={() => setPreviewBillUrl('')}
              className="absolute top-4 right-4 p-2 bg-black/60 rounded-full text-white hover:bg-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== 4. MODAL: QR SCANNER PREVIEW ==================== */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-in relative">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">Payment QR Code</h3>
              <button onClick={() => setShowQrModal(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>
            <div className="bg-slate-50 dark:bg-dark-850 p-4 rounded-2xl flex flex-col items-center border border-dashed border-slate-200 dark:border-dark-800">
              <div className="bg-white p-2 rounded-xl shadow-md border border-slate-100 max-w-[220px]">
                <img 
                  src="/paymentScanner.jpeg" 
                  alt="UPI Payment QR Code"
                  className="w-full h-auto object-contain rounded-lg"
                />
              </div>
              <span className="text-[9px] text-slate-400 mt-3.5 font-bold uppercase tracking-wide">Scan via PhonePe, GPay, Paytm or UPI Apps</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. MODAL: EDIT CUSTOMER ==================== */}
      {showEditCust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-md w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">Edit Customer Profile</h3>
              <button onClick={() => setShowEditCust(false)} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditCustomer} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Full Name</label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className="input-field text-xs py-1.5"
                  placeholder="Enter Full Name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Mobile Number</label>
                  <input
                    type="tel"
                    value={custPhone}
                    onChange={(e) => setCustPhone(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Mobile Number"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Email Address</label>
                  <input
                    type="email"
                    value={custEmail}
                    onChange={(e) => setCustEmail(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Email Address"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Complete Address</label>
                <input
                  type="text"
                  value={custAddress}
                  onChange={(e) => setCustAddress(e.target.value)}
                  className="input-field text-xs py-1.5"
                  placeholder="Enter Complete Address"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">City</label>
                  <input
                    type="text"
                    value={custCity}
                    onChange={(e) => setCustCity(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter City"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">State</label>
                  <input
                    type="text"
                    value={custState}
                    onChange={(e) => setCustState(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter State"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Pincode</label>
                  <input
                    type="text"
                    value={custPincode}
                    onChange={(e) => setCustPincode(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Pincode"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Country</label>
                  <input
                    type="text"
                    value={custCountry}
                    onChange={(e) => setCustCountry(e.target.value)}
                    className="input-field text-xs py-1.5"
                    placeholder="Enter Country"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Notes / Remarks</label>
                <textarea
                  value={custNotes}
                  onChange={(e) => setCustNotes(e.target.value)}
                  className="input-field text-xs py-1.5 min-h-[60px]"
                  placeholder="Enter Notes / Remarks"
                />
              </div>

              <button type="submit" className="w-full btn-primary mt-2">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== 6. MODAL: EDIT TRANSACTION ==================== */}
      {showEditTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-900 border border-slate-100 dark:border-dark-800 rounded-3xl p-6 max-w-sm w-full space-y-4 animate-scale-in">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-800 dark:text-dark-50 text-base">
                Edit Ledger Entry
              </h3>
              <button onClick={() => { setShowEditTx(false); setEditingTx(null); }} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleEditTransaction} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500">Transaction Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTxType('give')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                      editTxType === 'give'
                        ? 'bg-rose-550 border-rose-200 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900'
                        : 'border-slate-100 dark:border-dark-800 text-slate-500 dark:text-dark-400'
                    }`}
                  >
                    You Gave (Debit)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTxType('got')}
                    className={`py-2 px-3 rounded-xl font-bold text-xs transition-all border ${
                      editTxType === 'got'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900'
                        : 'border-slate-100 dark:border-dark-800 text-slate-500 dark:text-dark-400'
                    }`}
                  >
                    You Got (Credit)
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.amount} (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={editTxAmount}
                  onChange={(e) => setEditTxAmount(e.target.value)}
                  className="input-field text-lg font-black text-slate-900 dark:text-dark-50"
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">{t.description}</label>
                <input
                  type="text"
                  value={editTxDesc}
                  onChange={(e) => setEditTxDesc(e.target.value)}
                  className="input-field text-sm"
                  placeholder="E.g., 2kg Sugar box, cash payment..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Transaction Date</label>
                <input
                  type="date"
                  value={editTxDate}
                  onChange={(e) => setEditTxDate(e.target.value)}
                  className="input-field text-sm text-slate-500"
                />
              </div>

              {/* Bill Attachment field */}
              {editTxType === 'give' && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">{t.attachBill} (Replaces existing)</label>
                  <div className="flex gap-2">
                    <input
                      type="file"
                      ref={editFileInputRef}
                      onChange={(e) => setEditTxFile(e.target.files[0])}
                      className="hidden"
                      accept="image/*,application/pdf"
                    />
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current.click()}
                      className="flex-1 btn-secondary text-xs py-2 flex items-center justify-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      {editTxFile ? editTxFile.name.substring(0, 15) : 'Select New File'}
                    </button>
                    {editTxFile && (
                      <button
                        type="button"
                        onClick={() => setEditTxFile(null)}
                        className="p-2 border rounded-xl hover:text-rose-550"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl font-bold text-white shadow-lg ${
                  editTxType === 'give' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10'
                }`}
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default CustomerLedger;
