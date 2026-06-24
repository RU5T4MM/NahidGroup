import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Check, ShieldCheck, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const { user, fetchWithAuth, updateSubscriptionLocal, addNotification, parseResponse } = useApp();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Helper to dynamically load external scripts (Razorpay Checkout)
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      // 1. Load Razorpay library
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Are you connected to the internet?');
      }

      // 2. Request order creation from server (₹499 amount)
      const res = await fetchWithAuth('/api/payments/order', {
        method: 'POST',
        body: JSON.stringify({ amount: 499 })
      });
      const order = await parseResponse(res, 'Order creation failed');

      // 3. Initiate payment screen
      const options = {
        key: order.mock ? 'rzp_test_MockKey123' : 'rzp_live_realKeyIfConfigured', // Razorpay Key ID
        amount: order.amount,
        currency: order.currency,
        name: 'Nahid Group Premium Pro',
        description: '30 Days Merchant Subscription Plan',
        image: '/pwa-192x192.png',
        order_id: order.id,
        handler: async (response) => {
          // 4. Verify payment with backend
          try {
            const verifyRes = await fetchWithAuth('/api/payments/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id || order.id,
                razorpay_payment_id: response.razorpay_payment_id || 'mock_payment_123',
                razorpay_signature: response.razorpay_signature || 'mock_signature_123',
                amount: 499
              })
            });

            const verifyData = await parseResponse(verifyRes, 'Payment verification failed');

            // 5. Update user state locally
            updateSubscriptionLocal(verifyData.user);
            addNotification('Congratulations! Account upgraded to Premium Pro.', 'success');
            navigate('/dashboard');
          } catch (verifyErr) {
            addNotification(verifyErr.message, 'error');
          }
        },
        prefill: {
          name: user?.ownerName || '',
          email: user?.email || '',
          contact: user?.phone || ''
        },
        theme: {
          color: '#16a34a' // Nahid Group emerald green brand color
        }
      };

      if (order.mock) {
        // Simulation mode: skip Razorpay modal, trigger callback directly with simulation logs
        addNotification('Simulation Mode: Auto-redirecting mock checkout...', 'info');
        setTimeout(() => {
          options.handler({
            razorpay_order_id: order.id,
            razorpay_payment_id: `mock_pay_${Math.random().toString(36).substring(2, 10)}`,
            razorpay_signature: `mock_sig_${Math.random().toString(36).substring(2, 10)}`
          });
        }, 1500);
      } else {
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-800 dark:text-dark-50">Premium Pricing Plan</h2>
        <p className="text-slate-500 dark:text-dark-400 max-w-md mx-auto">
          Unlock business-grade ledger automation, expense analytics, custom logos, and sitemap downloads.
        </p>
      </div>

      {user?.subscription?.plan === 'premium' ? (
        <div className="glass-card p-6 border-emerald-500/30 bg-emerald-500/5 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="flex-1 text-center md:text-left space-y-1">
            <h3 className="font-extrabold text-emerald-800 dark:text-emerald-50 text-lg">You are a Premium Pro Merchant!</h3>
            <p className="text-sm text-slate-600 dark:text-dark-350">
              Your subscription is active and expires on:{' '}
              <strong className="text-slate-800 dark:text-dark-50">
                {new Date(user.subscription.expiresAt).toLocaleDateString()}
              </strong>
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
          {/* Free Tier Details */}
          <div className="glass-card p-8 flex flex-col space-y-6">
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-dark-50">Basic Free Tier</h3>
              <p className="text-xs text-slate-400 font-medium">Standard entry ledger registers</p>
            </div>
            
            <div className="text-3xl font-black text-slate-900 dark:text-dark-50">₹0 <span className="text-sm text-slate-400 font-semibold">/ forever</span></div>

            <ul className="space-y-4 text-sm text-slate-600 dark:text-dark-350 flex-grow">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Unlimited Customers</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Ledger Book (Give/Got logs)</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Cloud Backup Sync</li>
              <li className="flex items-center gap-3 text-slate-350 dark:text-dark-600"><Check className="w-4 h-4 text-slate-200 dark:text-dark-800 shrink-0" /> GST Billing / Printing</li>
              <li className="flex items-center gap-3 text-slate-350 dark:text-dark-600"><Check className="w-4 h-4 text-slate-200 dark:text-dark-800 shrink-0" /> Categorized expense tracker</li>
            </ul>

            <button disabled className="btn-secondary w-full text-center cursor-not-allowed">
              Currently Selected
            </button>
          </div>

          {/* Premium Tier Details */}
          <div className="glass-card p-8 border-emerald-500/40 dark:border-emerald-500/30 bg-gradient-to-b from-white to-emerald-50/10 dark:from-dark-900 dark:to-emerald-950/5 flex flex-col space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[9px] font-extrabold px-2 py-0.5 rounded-full tracking-wider uppercase">Pro Upgrade</div>
            
            <div className="space-y-1">
              <h3 className="font-extrabold text-xl text-slate-800 dark:text-dark-50">Premium Pro Plan</h3>
              <p className="text-xs text-slate-400 font-medium">Full business automation utility</p>
            </div>
            
            <div className="text-3xl font-black text-slate-900 dark:text-dark-50">₹499 <span className="text-sm text-slate-400 font-semibold">/ month</span></div>

            <ul className="space-y-4 text-sm text-slate-600 dark:text-dark-350 flex-grow">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> <strong>Everything</strong> in Free</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> GST Invoicing (PDF & Print)</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Operations Expense Tracker</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Expense Recharts Analytics</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-emerald-500 shrink-0" /> Priority WhatsApp & SMS links</li>
            </ul>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn-primary w-full text-center"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Zap className="w-4 h-4 fill-white" />
                  Upgrade Now
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Additional payment guarantees */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-xs text-slate-500 dark:text-dark-400 font-medium">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Razorpay SECURE Payments</span>
        </div>
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-500" />
          <span>Instant upgrade activation</span>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
