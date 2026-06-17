import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone, KeyRound, Building, User, HelpCircle, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { login, signup, sendOtp, verifyOtp, forgotPassword, addNotification } = useApp();
  const navigate = useNavigate();

  // Mode state: 'login' | 'signup' | 'otp' | 'forgot'
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [ownerName, setOwnerName] = useState('');

  // OTP login state
  const [otpSent, setOtpSent] = useState(false);
  const [otpMockCode, setOtpMockCode] = useState('');
  const [isNewOtpUser, setIsNewOtpUser] = useState(false);

  // Reset password state
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      await login(email, password);
      addNotification('Logged in successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !businessName || !ownerName || !phone) {
      addNotification('All fields are required', 'warning');
      return;
    }
    setLoading(true);
    try {
      await signup({ businessName, ownerName, phone, email, password });
      addNotification('Account created successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!phone) return;
    setLoading(true);
    try {
      const data = await sendOtp(phone);
      setOtpSent(true);
      setOtpMockCode(data.otpCode);
      addNotification(`OTP sent! Developer Simulated Code: ${data.otpCode}`, 'success');
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!phone || !otp) return;
    setLoading(true);
    try {
      const payload = { phone, otp };
      if (isNewOtpUser) {
        payload.businessName = businessName;
        payload.ownerName = ownerName;
        payload.email = email;
      }

      const res = await verifyOtp(payload);
      
      if (res.newUser) {
        addNotification('Registration is disabled. Only existing accounts can login.', 'error');
        setOtpSent(false);
        setOtp('');
      } else {
        addNotification('Logged in successfully via OTP!', 'success');
        navigate('/dashboard');
      }
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      addNotification(`Reset code sent to email! Code: ${res.resetCode}`, 'success');
      setResetCodeInput(res.resetCode);
      setMode('reset');
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email || !resetCodeInput || !newPassword) return;
    setLoading(true);
    try {
      await resetPassword(email, resetCodeInput, newPassword);
      addNotification('Password reset successfully! Log in with your new password.', 'success');
      setMode('login');
      setPassword('');
      setNewPassword('');
      setResetCodeInput('');
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-dark-950 text-slate-800 dark:text-dark-50 selection:bg-emerald-500 selection:text-white">
      
      {/* Left Column: Showcase details (Visible on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-16 flex-col justify-between relative overflow-hidden border-r border-slate-900/50">
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 -z-10"></div>
        {/* Soft emerald glowing orbs */}
        <div className="absolute top-1/4 -right-10 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-3xl -z-10 animate-pulse-subtle"></div>
        <div className="absolute bottom-1/4 -left-10 w-[250px] h-[250px] bg-emerald-600/5 rounded-full blur-3xl -z-10"></div>

        {/* Logo/Header */}
        <div className="flex items-center gap-3">
          <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-10 h-10 object-contain rounded-xl" />
          <span className="font-bold text-lg tracking-tight">Nahid Group Ledger</span>
        </div>

        {/* Features list presentation */}
        <div className="space-y-10 my-auto max-w-lg">
          <div className="space-y-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Pro Level Bookkeeping
            </span>
            <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white lg:text-5xl">
              Take complete control of your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300">business accounts.</span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Experience seamless credit ledger entries, instant digital receipts, automated WhatsApp updates, and simplified GST billing natively built into one platform.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">✓</div>
              <div>
                <h4 className="font-bold text-sm text-white">Native Offline Storage</h4>
                <p className="text-xs text-slate-400">Continue log entries offline when network is weak. Auto-syncs securely once reconnected.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">✓</div>
              <div>
                <h4 className="font-bold text-sm text-white">WhatsApp & SMS Billing</h4>
                <p className="text-xs text-slate-400">Speed up customer payments with automated PDF bills shared directly to customers.</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4.5 rounded-2xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] transition-all duration-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 font-bold">✓</div>
              <div>
                <h4 className="font-bold text-sm text-white">Compliant GST Invoice Generator</h4>
                <p className="text-xs text-slate-400">Calculate CGST, SGST, customize rates, and print standard PDF layouts instantly.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-white/[0.05] pt-6 text-xs text-slate-550">
          <span>© 2026 Nahid Group Inc.</span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            AES-256 cloud encryption standards
          </span>
        </div>
      </div>

      {/* Right Column: Portal forms (Centered on mobile, right pane on desktop) */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden bg-slate-50 dark:bg-dark-950">
        
        {/* Dotted Grid Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:20px_20px] opacity-40 -z-10 lg:hidden"></div>
        {/* Soft light orb background for mobile */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-500/[0.03] rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="max-w-md w-full glass-card-premium p-8 border border-slate-100 dark:border-dark-850 shadow-xl space-y-6">
          
          {/* Brand Logo and Title */}
          <div className="text-center space-y-2">
            <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-12 h-12 object-contain rounded-2xl" />
            <h2 className="text-2xl font-black text-slate-800 dark:text-dark-50">
              {mode === 'login' && 'Welcome Back'}
              {mode === 'signup' && 'Create Your Store'}
              {mode === 'otp' && 'OTP Phone Login'}
              {mode === 'forgot' && 'Reset Password'}
              {mode === 'reset' && 'Enter Reset Code'}
            </h2>
            <p className="text-xs text-slate-405 font-bold uppercase tracking-wider">
              {mode === 'login' && 'Sign in to access your ledger'}
              {mode === 'signup' && 'Get started with digital khata'}
              {mode === 'otp' && 'Instant passcode authentication'}
              {mode === 'forgot' && 'We will send a temporary key'}
              {mode === 'reset' && 'Create a new password key'}
            </p>
          </div>

          {/* ==================== 1. EMAIL LOGIN MODE ==================== */}
          {mode === 'login' && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 dark:text-dark-400">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 text-sm"
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-slate-500 dark:text-dark-400">Password</label>
                  <button
                    type="button"
                    onClick={() => setMode('forgot')}
                    className="text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-500 transition-colors"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-11 pr-10 text-sm"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary mt-6 hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Sign In'}
              </button>
            </form>
          )}

          {/* ==================== 2. EMAIL SIGNUP MODE ==================== */}
          {mode === 'signup' && (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Business Name</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="input-field pl-9 text-xs"
                      placeholder="E.g., Verma Stores"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Owner Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="input-field pl-9 text-xs"
                      placeholder="Your Name"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Mobile Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field pl-10 text-sm"
                    placeholder="9876543210"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10 text-sm"
                    placeholder="sharma@stores.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-9 text-sm"
                    placeholder="Create password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={loading} className="w-full btn-primary mt-4 hover:scale-[1.02] active:scale-95 transition-all">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Register Business'}
              </button>
            </form>
          )}

          {/* ==================== 3. OTP AUTHENTICATION MODE ==================== */}
          {mode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">Mobile Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="input-field pl-11 text-sm"
                        placeholder="Enter 10-digit number"
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full btn-primary hover:scale-[1.02] active:scale-95 transition-all">
                    {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Send OTP verification'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  {/* Simulated OTP Helper Display Box */}
                  {otpMockCode && (
                    <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-550 flex flex-col gap-1 shadow-sm">
                      <span>📱 OTP SIMULATOR ALERT:</span>
                      <span>Verification code: <strong className="text-sm tracking-widest text-emerald-600 font-bold">{otpMockCode}</strong> (Pre-fills on click)</span>
                      <button
                        type="button"
                        onClick={() => setOtp(otpMockCode)}
                        className="text-left underline mt-1 text-emerald-600 font-bold hover:text-emerald-700 transition-colors"
                      >
                        Fill OTP code automatically
                      </button>
                    </div>
                  )}

                  {/* Additional Register inputs if new OTP account */}
                  {isNewOtpUser && (
                    <div className="space-y-3 p-4 border border-slate-100 dark:border-dark-800 rounded-2xl bg-slate-50/50 dark:bg-dark-900/55">
                      <h4 className="text-xs font-bold text-slate-650 dark:text-dark-300">Register New Account</h4>
                      <input
                        type="text"
                        placeholder="Business Name"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="input-field text-xs py-2"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Owner Name"
                        value={ownerName}
                        onChange={(e) => setOwnerName(e.target.value)}
                        className="input-field text-xs py-2"
                        required
                      />
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="input-field text-xs py-2"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">6-Digit Passcode OTP</label>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="input-field pl-11 tracking-widest text-center text-lg font-black text-slate-900 dark:text-dark-50"
                        placeholder="123456"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp('');
                        setIsNewOtpUser(false);
                      }}
                      className="btn-secondary flex-1 py-2"
                    >
                      Edit Phone
                    </button>
                    <button type="submit" disabled={loading} className="btn-primary flex-[2] py-2 hover:scale-[1.02] active:scale-95 transition-all">
                      {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm & Login'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ==================== 4. FORGOT PASSWORD MODE ==================== */}
          {mode === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Register Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-11 text-sm"
                    placeholder="name@business.com"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Back to Login
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 text-xs py-2.5 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Get Reset Code'}
                </button>
              </div>
            </form>
          )}

          {/* ==================== 5. RESET PASSWORD CONFIRM MODE ==================== */}
          {mode === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetCodeInput && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 rounded-xl text-xs font-semibold text-emerald-800 dark:text-emerald-500 flex flex-col gap-1 shadow-sm">
                  <span>🔑 PASSWORD RESET SIMULATOR:</span>
                  <span>Verification code: <strong className="text-sm tracking-widest text-emerald-600 font-bold">{resetCodeInput}</strong></span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">6-Digit Reset Code</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value)}
                    className="input-field pl-11 tracking-wider text-center text-lg font-black"
                    placeholder="123456"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="input-field pl-11 text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="btn-secondary flex-1 text-xs py-2.5"
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 text-xs py-2.5 hover:scale-[1.02] active:scale-95 transition-all">
                  {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Set New Password'}
                </button>
              </div>
            </form>
          )}

          {/* Panel Switcher footer */}
          <div className="pt-6 border-t border-slate-100 dark:border-dark-850 flex flex-col gap-3 text-center text-xs font-semibold text-slate-500 dark:text-dark-400">
            {mode === 'login' && (
              <>
                <div>
                  Prefer instant login?{' '}
                  <button onClick={() => setMode('otp')} className="text-emerald-600 font-bold hover:underline transition-all">
                    Login via OTP Code
                  </button>
                </div>
              </>
            )}

            {mode === 'otp' && (
              <div>
                Back to{' '}
                <button onClick={() => setMode('login')} className="text-emerald-600 font-bold hover:underline transition-all">
                  Password Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
