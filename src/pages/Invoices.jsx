import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Trash2,
  Printer,
  Download,
  IndianRupee,
  Lock,
  ChevronRight,
  Sparkles,
  ArrowLeft
} from 'lucide-react';

const Invoices = () => {
  const { user, fetchWithAuth, t, addNotification, language, parseResponse } = useApp();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingInvoice, setViewingInvoice] = useState(null);

  // Form States (Invoice Editor)
  const [isCreating, setIsCreating] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerGSTIN, setCustomerGSTIN] = useState('');
  const [businessGSTIN, setBusinessGSTIN] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [items, setItems] = useState([{ name: '', quantity: 1, rate: 0, taxRate: 18 }]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');

  // Fetch past invoices
  const loadInvoices = async () => {
    try {
      const res = await fetchWithAuth('/api/invoices');
      if (res.ok) {
        const data = await parseResponse(res);
        setInvoices(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [user]);

  // No premium locks for Invoices

  // Row item actions
  const handleAddItemRow = () => {
    setItems(prev => [...prev, { name: '', quantity: 1, rate: 0, taxRate: 18 }]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Computations
  const subTotal = items.reduce((acc, item) => acc + (parseFloat(item.quantity || 0) * parseFloat(item.rate || 0)), 0);
  const totalTax = items.reduce((acc, item) => {
    const amt = parseFloat(item.quantity || 0) * parseFloat(item.rate || 0);
    return acc + (amt * ((parseFloat(item.taxRate || 0)) / 100));
  }, 0);
  const totalAmount = subTotal + totalTax - parseFloat(discount || 0);

  // Submit invoice
  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    if (!customerName) return;

    try {
      const res = await fetchWithAuth('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerGSTIN,
          businessGSTIN,
          businessAddress,
          items,
          discount,
          notes
        })
      });
      const data = await parseResponse(res, 'Invoice save failed');

      setInvoices(prev => [data, ...prev]);
      addNotification(`Invoice ${data.invoiceNumber} saved!`, 'success');
      
      // Reset
      setIsCreating(false);
      setCustomerName('');
      setCustomerPhone('');
      setCustomerGSTIN('');
      setItems([{ name: '', quantity: 1, rate: 0, taxRate: 18 }]);
      setDiscount(0);
      setNotes('');
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handleDeleteInvoice = async (id) => {
    if (!window.confirm('Delete this invoice permanently?')) return;
    try {
      const res = await fetchWithAuth(`/api/invoices/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setInvoices(prev => prev.filter(inv => inv._id !== id));
        addNotification('Invoice deleted successfully', 'success');
        if (viewingInvoice?._id === id) setViewingInvoice(null);
      }
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Printable Invoice layout */}
      {viewingInvoice ? (
        <div className="space-y-6 print-area">
          {/* Header Actions */}
          <div className="flex justify-between items-center gap-4 no-print border-b pb-4 border-slate-100 dark:border-dark-850">
            <button
              onClick={() => setViewingInvoice(null)}
              className="btn-secondary py-2 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to List
            </button>
            <button
              onClick={handlePrint}
              className="btn-primary py-2 px-5 text-xs font-bold flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              {t.printInvoice}
            </button>
          </div>

          {/* Actual Bill Sheet (renders beautifully to standard A4 printing) */}
          <div className="p-8 border rounded-3xl bg-white text-slate-800 shadow-md max-w-3xl mx-auto space-y-8">
            {/* Bill Header */}
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-900">{user?.businessName || 'Business Invoice'}</h2>
                <p className="text-xs text-slate-500 font-semibold">{businessAddress || 'Business Address, India'}</p>
                <p className="text-xs text-slate-500 font-semibold mt-1">GSTIN: <strong className="text-slate-800">{viewingInvoice.businessGSTIN || 'N/A'}</strong></p>
              </div>
              <div className="text-right">
                <h3 className="text-lg font-black text-emerald-600">TAX INVOICE</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Invoice Number</p>
                <p className="text-sm font-black text-slate-900">{viewingInvoice.invoiceNumber}</p>
                <p className="text-[10px] text-slate-400 font-medium">Date: {new Date(viewingInvoice.date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Bill Client Details */}
            <div className="grid grid-cols-2 gap-4 p-4 border rounded-2xl bg-slate-50/50">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Billed To</span>
                <h4 className="font-extrabold text-sm text-slate-800">{viewingInvoice.customerName}</h4>
                <p className="text-xs text-slate-500 font-semibold">{viewingInvoice.customerPhone}</p>
              </div>
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Customer GSTIN</span>
                <span className="text-xs font-bold text-slate-700">{viewingInvoice.customerGSTIN || 'N/A'}</span>
              </div>
            </div>

            {/* Bill Items Roster */}
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b text-left text-xs font-black text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 flex-1">Item Description</th>
                  <th className="pb-3 text-right">Qty</th>
                  <th className="pb-3 text-right">Rate</th>
                  <th className="pb-3 text-right">GST %</th>
                  <th className="pb-3 text-right">Total Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {viewingInvoice.items.map((item, idx) => (
                  <tr key={idx} className="text-slate-700">
                    <td className="py-3 font-bold text-slate-800">{item.name}</td>
                    <td className="py-3 text-right">{item.quantity}</td>
                    <td className="py-3 text-right">₹{item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="py-3 text-right">{item.taxRate}%</td>
                    <td className="py-3 text-right font-bold">₹{item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Bill Summary totals */}
            <div className="flex justify-between items-start gap-4 pt-6 border-t">
              <div className="text-xs text-slate-500 max-w-xs font-medium">
                <strong>Notes / Terms:</strong>
                <p>{viewingInvoice.notes || 'Thanks for doing business with us! Interest will be charged at standard rates on delay payments.'}</p>
              </div>
              <div className="w-64 space-y-2 text-sm text-slate-600 font-medium">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{viewingInvoice.subTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>CGST</span>
                  <span>₹{viewingInvoice.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>SGST</span>
                  <span>₹{viewingInvoice.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                {viewingInvoice.discount > 0 && (
                  <div className="flex justify-between text-rose-500">
                    <span>Discount</span>
                    <span>-₹{viewingInvoice.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-slate-900 border-t pt-2">
                  <span>Grand Total</span>
                  <span>₹{viewingInvoice.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : isCreating ? (
        // ==================== GST INVOICE EDITOR ====================
        <form onSubmit={handleSaveInvoice} className="glass-card p-6 space-y-6 max-w-3xl mx-auto">
          <div className="flex justify-between items-center pb-4 border-b">
            <div>
              <h3 className="font-extrabold text-slate-800 dark:text-dark-50 text-base">Generate New Tax Bill</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Enter client goods rates and tax ratios</p>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="btn-secondary py-1.5 px-3 text-xs"
            >
              Cancel
            </button>
          </div>

          {/* Form Roster */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider">Business Details</h4>
              <input
                type="text"
                placeholder="Merchant Address"
                value={businessAddress}
                onChange={(e) => setBusinessAddress(e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="text"
                placeholder="Merchant GSTIN (15-Char)"
                value={businessGSTIN}
                onChange={(e) => setBusinessGSTIN(e.target.value)}
                className="input-field text-sm uppercase"
                maxLength={15}
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider">Customer Details</h4>
              <input
                type="text"
                placeholder="Customer Name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="input-field text-sm"
                required
              />
              <input
                type="tel"
                placeholder="Customer Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="input-field text-sm"
              />
              <input
                type="text"
                placeholder="Customer GSTIN (If registered)"
                value={customerGSTIN}
                onChange={(e) => setCustomerGSTIN(e.target.value)}
                className="input-field text-sm uppercase"
                maxLength={15}
              />
            </div>
          </div>

          {/* Itemized list fields */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-emerald-600 uppercase tracking-wider">Bill Items list</h4>
              <button
                type="button"
                onClick={handleAddItemRow}
                className="btn-secondary py-1 px-3 text-[10px] font-bold flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3.5">
              {items.map((item, idx) => (
                <div key={idx} className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
                  <div className="flex-1 w-full">
                    <input
                      type="text"
                      placeholder="Item Description name"
                      value={item.name}
                      onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                      className="input-field text-xs py-2"
                      required
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      placeholder="Qty"
                      min={1}
                      value={item.quantity}
                      onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                      className="input-field text-xs py-2 text-center"
                      required
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      placeholder="Rate (₹)"
                      min={0}
                      value={item.rate}
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                      className="input-field text-xs py-2"
                      required
                    />
                  </div>
                  <div className="w-24">
                    <select
                      value={item.taxRate}
                      onChange={(e) => handleItemChange(idx, 'taxRate', e.target.value)}
                      className="input-field text-xs py-2"
                    >
                      <option value={0}>0% GST</option>
                      <option value={5}>5% GST</option>
                      <option value={12}>12% GST</option>
                      <option value={18}>18% GST</option>
                      <option value={28}>28% GST</option>
                    </select>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItemRow(idx)}
                    className="p-2 border rounded-xl hover:text-rose-500 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Subtotals summaries editor */}
          <div className="pt-6 border-t flex flex-col md:flex-row justify-between items-start gap-6 bg-slate-50/50 dark:bg-dark-850/10 p-4 rounded-2xl">
            <div className="flex-1 w-full space-y-3">
              <input
                type="text"
                placeholder="Bill Notes or bank instructions..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input-field text-xs py-2"
              />
              <div className="w-36">
                <input
                  type="number"
                  placeholder="Discount (₹)"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="input-field text-xs py-2"
                />
              </div>
            </div>

            <div className="w-full md:w-64 text-sm text-slate-600 dark:text-dark-350 font-bold space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>₹{subTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Estimated CGST/SGST Tax:</span>
                <span>₹{totalTax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-rose-500">
                  <span>Discount:</span>
                  <span>-₹{parseFloat(discount).toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black text-slate-800 dark:text-dark-50 border-t pt-2">
                <span>Grand Total:</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <button type="submit" className="w-full btn-primary py-3">
            Save Invoice to system
          </button>
        </form>
      ) : (
        // ==================== INVOICES DIRECTORY GRID ====================
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-black text-slate-800 dark:text-dark-50">{t.invoices}</h2>
              <p className="text-xs text-slate-400 font-semibold uppercase">Manage and print tax bills</p>
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="btn-primary py-2 px-4 text-xs font-bold"
            >
              <Plus className="w-4 h-4" />
              New Invoice
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="glass-card-premium p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-28 h-28 mx-auto animate-float-medium">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {/* Printer base */}
                  <rect x="15" y="45" width="70" height="30" rx="8" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="1.5" />
                  <rect x="25" y="30" width="50" height="20" rx="4" fill="#94a3b8" />
                  {/* Paper sheet printing out */}
                  <rect x="30" y="40" width="40" height="40" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
                  <line x1="38" y1="52" x2="62" y2="52" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
                  <line x1="38" y1="62" x2="56" y2="62" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
                  <line x1="38" y1="70" x2="50" y2="70" stroke="#cbd5e1" strokeWidth="2" strokeLinecap="round" />
                  {/* Glowing light indicator */}
                  <circle cx="25" cy="60" r="3" fill="#10b981" className="animate-pulse" />
                </svg>
              </div>
              <h4 className="font-extrabold text-slate-800 dark:text-dark-100 text-sm">No Invoice Records Saved</h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">Spawn your first professional tax document via the new invoice editor. Download PDFs or print directly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {invoices.map(inv => (
                <div key={inv._id} className="glass-card p-5 space-y-4 flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="flex justify-between items-start border-b pb-3">
                    <div>
                      <h4 className="font-black text-slate-800 dark:text-dark-50 text-sm">{inv.invoiceNumber}</h4>
                      <span className="text-[10px] font-bold text-slate-400">{new Date(inv.date).toLocaleDateString()}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-500 text-[10px] font-bold uppercase">Paid</span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase">Customer</span>
                    <h5 className="font-bold text-slate-700 dark:text-dark-200 text-xs">{inv.customerName}</h5>
                    <p className="text-[10px] text-slate-400">{inv.customerPhone || 'No Phone'}</p>
                  </div>

                  <div className="flex justify-between items-end pt-2 border-t">
                    <div>
                      <span className="text-[9px] font-black text-slate-400 uppercase block">Total Bill</span>
                      <strong className="text-slate-800 dark:text-dark-50 text-sm">₹{inv.totalAmount.toLocaleString('en-IN')}</strong>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="btn-secondary py-1.5 px-3 text-[10px] font-bold"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeleteInvoice(inv._id)}
                        className="p-1.5 border border-slate-100 hover:text-rose-500 rounded-xl transition-all"
                        title="Delete Invoice"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Invoices;
