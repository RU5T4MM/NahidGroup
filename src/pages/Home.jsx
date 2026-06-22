import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  ShieldCheck,
  RefreshCw,
  MessageSquare,
  Download,
  Check,
  Phone,
  Mail,
  MapPin,
  Globe,
  ArrowLeft,
  ArrowRight,
  Laptop,
  Smartphone,
  Database,
  FileSpreadsheet,
  Facebook,
  Instagram
} from 'lucide-react';

const Home = () => {
  // States for interactive forms
  const [heroPhone, setHeroPhone] = useState('');
  const [footerPhone, setFooterPhone] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [linkSentFooter, setLinkSentFooter] = useState(false);

  const handleSendLinkHero = (e) => {
    e.preventDefault();
    if (!heroPhone || heroPhone.length < 10) return;
    setLinkSent(true);
    setTimeout(() => setLinkSent(false), 4000);
  };

  const handleSendLinkFooter = (e) => {
    e.preventDefault();
    if (!footerPhone || footerPhone.length < 10) return;
    setLinkSentFooter(true);
    setTimeout(() => setLinkSentFooter(false), 4000);
  };

  // Blog Carousel slider state
  const blogPosts = [
    {
      id: 1,
      tag: "GST Amendment",
      title: "Understanding the GST Amendment of 2026 and its Impact",
      desc: "Learn about the latest updates to GST slabs, compliance rules, and how it impacts small-to-medium retail business ledgers.",
      date: "June 10, 2026",
      readTime: "5 min read"
    },
    {
      id: 2,
      tag: "Digital India",
      title: "Importance and benefits of GST Network integration",
      desc: "How syncing your local digital Khata with the GSTN network simplifies filing taxes and speeds up reconciliation.",
      date: "May 28, 2026",
      readTime: "4 min read"
    },
    {
      id: 3,
      tag: "Bookkeeping",
      title: "How to digitize your small shop accounts securely",
      desc: "A step-by-step guide to migrating from traditional red-cover registers (Bahi Khata) to 100% secure cloud-synced ledger systems.",
      date: "May 15, 2026",
      readTime: "6 min read"
    },
    {
      id: 4,
      tag: "Payment recovery",
      title: "3 proven ways to reduce credit collection delay",
      desc: "Discover how automated WhatsApp alerts and professional invoice generation can reduce payment collection times by 60%.",
      date: "April 30, 2026",
      readTime: "3 min read"
    }
  ];

  const [blogStartIndex, setBlogStartIndex] = useState(0);

  const nextBlog = () => {
    if (blogStartIndex < blogPosts.length - 2) {
      setBlogStartIndex(blogStartIndex + 1);
    } else {
      setBlogStartIndex(0); // Loop back
    }
  };

  const prevBlog = () => {
    if (blogStartIndex > 0) {
      setBlogStartIndex(blogStartIndex - 1);
    } else {
      setBlogStartIndex(blogPosts.length - 2); // Loop to end
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      
      {/* ==================== 1. NAVIGATION HEADER ==================== */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3">
            <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 block leading-tight">Nahid Group</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Manpower & Ledger</span>
            </div>
          </div>
          
          {/* Right side contact & Action */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <a
                href="tel:+917860799398"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-150 transition-all cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91-7860799398</span>
              </a>
              <a
                href="tel:+919005601046"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-150 transition-all mt-1 cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>+91-9005601046</span>
              </a>
            </div>
            
            <Link to="/login" className="btn-primary text-sm shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 transition-all">
              Log In
            </Link>
          </div>
        </div>
      </header>

      {/* ==================== 2. HERO SECTION ==================== */}
      <section className="relative overflow-hidden px-6 pt-16 pb-24 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Pattern Backgrounds */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(#e2e8f0_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-60"></div>
        <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl -z-10"></div>

        {/* Hero Left Content */}
        <div className="flex-1 space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-bold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Desktop App Sync & Offline Ledgers Active
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Business hua <span className="text-emerald-600">easy</span><br />
            with <span className="text-gradient-emerald">Nahid Group</span> on Desktop
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-medium">
            Replace your old paper registers with a modern digital ledger. Keep track of customer credits (Udhaar), issue GST compliant invoices, and collect balances with 100% security and cloud backup.
          </p>

          {/* Phone form to get download link */}
          <form onSubmit={handleSendLinkHero} className="max-w-md mx-auto lg:mx-0 bg-white p-2 rounded-2xl border border-slate-200 shadow-md flex items-center gap-2 transition-all focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
            <div className="flex items-center gap-2 pl-3 flex-grow">
              <span className="text-slate-400 font-bold text-sm">+91</span>
              <input
                type="tel"
                maxLength={10}
                value={heroPhone}
                onChange={(e) => setHeroPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter Mobile Number"
                className="bg-transparent text-slate-800 placeholder-slate-400 text-sm font-semibold outline-none w-full"
                required
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm transition-all shrink-0 active:scale-95 shadow-sm"
            >
              Get App Link
            </button>
          </form>

          {linkSent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl max-w-md mx-auto lg:mx-0 text-center animate-fade-in">
              ✔ App link has been sent to +91-{heroPhone}! Check your SMS inbox.
            </div>
          )}

          {/* Quick Metrics Header */}
          <div className="grid grid-cols-2 divide-x divide-slate-200 max-w-sm mx-auto lg:mx-0 bg-white/70 backdrop-blur-sm p-4 rounded-2xl border border-slate-100 shadow-xs">
            <div className="text-center">
              <span className="text-xl font-black text-slate-900 block">50k+</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Active Stores</span>
            </div>
            <div className="text-center">
              <span className="text-xl font-black text-slate-900 block">100%</span>
              <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">Auto Cloud Backup</span>
            </div>
          </div>
        </div>

        {/* Hero Right Visual: Dashboard & App Frame Mockups */}
        <div className="flex-1 w-full max-w-xl lg:max-w-none flex items-center justify-center p-8 bg-gradient-to-br from-emerald-50/50 via-emerald-100/20 to-emerald-50/60 rounded-[48px] border border-emerald-100 shadow-inner relative overflow-hidden min-h-[480px]">
          {/* Inner Glow Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-emerald-400/10 rounded-full blur-3xl pointer-events-none -z-10"></div>
          
          {/* DESKTOP APP FRAME */}
          <div className="w-[85%] bg-white rounded-2xl border border-slate-200/80 shadow-2xl overflow-hidden flex flex-col relative z-0 translate-x-[-20px] translate-y-[-10px]">
            {/* Header Title bar */}
            <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between border-b border-slate-950 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] text-slate-400 font-bold ml-2">Nahid Group Ledger Portal</span>
              </div>
            </div>
            
            {/* Mock Dashboard Layout */}
            <div className="h-56 bg-slate-50 flex divide-x divide-slate-100 text-[9px] font-sans text-slate-700">
              {/* Sidebar list mock */}
              <div className="w-24 bg-white p-2.5 space-y-2 shrink-0">
                <div className="h-3 w-16 bg-slate-100 rounded-sm"></div>
                <div className="h-2 w-12 bg-slate-50 rounded-sm"></div>
                <div className="h-2.5 w-14 bg-emerald-50 text-emerald-700 rounded-sm font-bold pl-1 border-l-2 border-emerald-500">Customers</div>
                <div className="h-2 w-10 bg-slate-50 rounded-sm"></div>
                <div className="h-2 w-12 bg-slate-50 rounded-sm"></div>
              </div>
              
              {/* Main dashboard mock */}
              <div className="flex-1 p-3 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="h-3.5 w-20 bg-slate-200 rounded-md"></div>
                  <div className="h-4 w-12 bg-emerald-500 rounded-md"></div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-white rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[7px] text-slate-400 font-bold block uppercase">Total Got</span>
                    <span className="text-xs font-black text-emerald-600 block">₹ 14,800.00</span>
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-slate-100 space-y-1">
                    <span className="text-[7px] text-slate-400 font-bold block uppercase">Total Give</span>
                    <span className="text-xs font-black text-rose-500 block">₹ 5,300.00</span>
                  </div>
                </div>
                
                <div className="border border-slate-100 rounded-lg bg-white overflow-hidden">
                  <div className="h-4 bg-slate-100 border-b border-slate-100"></div>
                  <div className="h-14 space-y-1.5 p-1.5">
                    <div className="h-2 bg-slate-50 rounded-sm"></div>
                    <div className="h-2 bg-slate-50 rounded-sm"></div>
                    <div className="h-2 bg-slate-50 rounded-sm"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* OVERLAPPING PHONE MOCKUP */}
          <div className="absolute right-4 bottom-4 w-[160px] h-[310px] rounded-[28px] bg-slate-950 border-[5px] border-slate-900 shadow-2xl overflow-hidden flex flex-col font-sans text-slate-800 rotate-[4deg] hover:rotate-0 hover:scale-105 transition-all duration-300 z-10">
            {/* Speaker/Camera notch */}
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-12 h-3 bg-black rounded-full z-30"></div>
            {/* Status bar */}
            <div className="h-5 bg-emerald-600 text-white flex justify-between items-center px-4 text-[6px] font-bold z-20 pt-1 shrink-0">
              <span>9:41 AM</span>
              <span>🔋 100%</span>
            </div>
            
            {/* App Head */}
            <div className="bg-emerald-600 text-white py-1.5 px-3 rounded-b-xl shrink-0 z-10 shadow-xs space-y-1 text-left">
              <span className="font-extrabold text-[8px] tracking-tight block">Nahid Group Store</span>
              <div className="flex justify-between text-[7px] opacity-90 border-t border-white/10 pt-1">
                <span className="border-b-2 border-white pb-0.5">Customers</span>
                <span>Suppliers</span>
              </div>
            </div>
            
            {/* Body */}
            <div className="flex-grow bg-slate-50 p-2 space-y-2 overflow-hidden relative">
              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs text-center space-y-1">
                <span className="text-[6px] text-slate-400 font-bold block uppercase">Balance Get</span>
                <span className="text-xs font-black text-emerald-600 block">₹ 9,500</span>
              </div>
              
              <div className="space-y-1">
                <div className="p-1 bg-white rounded-md border border-slate-100 flex items-center justify-between text-[7px]">
                  <span className="font-bold text-slate-800">Amit Kumar</span>
                  <span className="font-extrabold text-emerald-600">₹ 2,500</span>
                </div>
                <div className="p-1 bg-white rounded-md border border-slate-100 flex items-center justify-between text-[7px]">
                  <span className="font-bold text-slate-800">Raju Rastogi</span>
                  <span className="font-extrabold text-rose-500">₹ 800</span>
                </div>
                <div className="p-1 bg-white rounded-md border border-slate-100 flex items-center justify-between text-[7px]">
                  <span className="font-bold text-slate-800">Verma Stores</span>
                  <span className="font-extrabold text-emerald-600">₹ 6,200</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 3. TRUST BAR & DOWNLOADS ==================== */}
      <section className="bg-white border-y border-slate-150 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">50k+ Active Merchants using our free apps</h2>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-wider">Available on Google Play Store & iOS App Store</p>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <a
              href="https://play.google.com/store"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Smartphone className="w-5 h-5 text-emerald-400" />
              <div className="text-left leading-tight">
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Get it on</span>
                <span className="text-xs font-black block">Google Play</span>
              </div>
            </a>

            <a
              href="https://www.apple.com/app-store/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-950 text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Laptop className="w-5 h-5 text-slate-300" />
              <div className="text-left leading-tight">
                <span className="text-[9px] text-slate-400 font-semibold uppercase block">Download on</span>
                <span className="text-xs font-black block">App Store</span>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* ==================== 4. TWO-COLUMN FEATURES SECTION ==================== */}
      <section id="features" className="py-24 max-w-7xl mx-auto px-6 space-y-24">
        {/* Section title header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block">Core Business Services</span>
          <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Built with features for growing businesses</h2>
          <p className="text-slate-500 font-medium">Digital bookkeeping and record tracking to optimize shop management and credit collections.</p>
        </div>

        {/* Feature Block 1 & 2 in grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          
          {/* Card 1: Business management on the go */}
          <div className="bg-white rounded-[32px] border border-slate-150 p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl transition-all shadow-md">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shadow-inner">
                <Smartphone className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 leading-tight">Business management on the go</h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>Record customer credits/payments (Udhaar) anytime, anywhere.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>Send free automated WhatsApp reminders to speed up collections.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>Generate and print standard PDF ledger accounts directly.</span>
                </li>
              </ul>
            </div>
            
            {/* Interactive inner mock graph */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500 font-bold shrink-0">📉</div>
              <div className="flex-grow">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Pending Credit</span>
                <span className="text-sm font-black text-slate-800 block">₹ 1,53,900.00</span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-lg border border-emerald-250 animate-pulse-subtle">
                3x Fast Recovery
              </span>
            </div>
          </div>

          {/* Card 2: One app for all your business needs */}
          <div className="bg-white rounded-[32px] border border-slate-150 p-8 sm:p-10 flex flex-col justify-between hover:shadow-xl transition-all shadow-md">
            <div className="space-y-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100/60 text-emerald-600 flex items-center justify-center shadow-inner">
                <Laptop className="w-6 h-6" />
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 leading-tight">One app for all your business needs</h3>
              
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>Collect online customer payments instantly via integrated UPI QR.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>Calculates automatically with zero risk of manual error logs.</span>
                </li>
                <li className="flex items-start gap-3 text-slate-650 font-medium">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5"><Check className="w-3.5 h-3.5" /></span>
                  <span>100% Secure cloud backup ensures logs are never lost.</span>
                </li>
              </ul>
            </div>
            
            {/* Interactive inner mock upi banner */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 font-bold shrink-0">UPI</div>
              <div className="flex-grow">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block">Integrated Payment QR</span>
                <span className="text-xs font-bold text-slate-650 block">UPI ID: 7860799398@pthdfc</span>
              </div>
              <span className="text-xs font-extrabold text-slate-400">Scan & Pay</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==================== 5. CORE BENEFITS GRID ==================== */}
      <section className="bg-slate-100/60 border-y border-slate-150 py-20 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">100% Reliable digital bookkeeping</h2>
            <p className="text-slate-450 text-sm font-semibold uppercase tracking-wider">Features optimized for speed and safety</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 bg-white border border-slate-200/60 rounded-3xl space-y-4 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/65 text-emerald-600 flex items-center justify-center shadow-xs"><BookOpen className="w-5 h-5" /></div>
              <h4 className="font-extrabold text-slate-900 text-lg">Multiple Book Management</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Manage different shop branches, ledgers, or personal expenses within one centralized account log.</p>
            </div>

            <div className="p-8 bg-white border border-slate-200/60 rounded-3xl space-y-4 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/65 text-emerald-600 flex items-center justify-center shadow-xs"><Database className="w-5 h-5" /></div>
              <h4 className="font-extrabold text-slate-900 text-lg">Automatic Safe Backups</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Your books automatically back up securely to the cloud ledger database, protecting against phone losses.</p>
            </div>

            <div className="p-8 bg-white border border-slate-200/60 rounded-3xl space-y-4 hover:shadow-lg transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-100/65 text-emerald-600 flex items-center justify-center shadow-xs"><FileSpreadsheet className="w-5 h-5" /></div>
              <h4 className="font-extrabold text-slate-900 text-lg">Detailed Business Reports</h4>
              <p className="text-slate-500 text-sm leading-relaxed">Download custom profit/loss logs, customer wise credit statements, and GST-compliant invoice logs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. BLOG CAROUSEL SECTION ==================== */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-widest block">Learn Bookkeeping</span>
            <h2 className="text-3xl font-black text-slate-900 sm:text-4xl">Our Blogs & Business Guides</h2>
          </div>
          
          {/* Carousel Next/Prev Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={prevBlog}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Previous Article"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextBlog}
              className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all hover:scale-105 active:scale-95 shadow-sm"
              title="Next Article"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blog Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 transition-all duration-300">
          {[blogPosts[blogStartIndex], blogPosts[blogStartIndex + 1]].map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-3xl border border-slate-150 p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between shadow-md group"
            >
              <div className="space-y-4">
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-lg border border-emerald-100 uppercase tracking-wider">
                  {post.tag}
                </span>
                
                <h4 className="text-xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors leading-tight">
                  {post.title}
                </h4>
                
                <p className="text-slate-500 text-sm leading-relaxed">
                  {post.desc}
                </p>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6 text-xs text-slate-400 font-bold">
                <span>{post.date}</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. GET STARTED SECTION (CTA) ==================== */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white rounded-[40px] border border-emerald-500/10 p-8 sm:p-12 lg:p-16 flex flex-col lg:flex-row items-center gap-12 justify-between relative overflow-hidden shadow-2xl">
          {/* Glowing element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="space-y-6 text-center lg:text-left max-w-xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight">
              Get started with<br />
              <span className="text-gradient-emerald">Nahid Group.</span>
            </h2>
            <p className="text-slate-405 text-sm sm:text-base leading-relaxed font-semibold">
              Enter your mobile number to receive a direct link to install the Nahid Group Business Ledger application on your mobile device instantly.
            </p>

            {/* Quick app buttons */}
            <div className="flex flex-wrap gap-4 items-center justify-center lg:justify-start pt-2">
              <a href="https://play.google.com/store" target="_blank" rel="noreferrer" className="w-36 hover:scale-102 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play Store" className="w-full" />
              </a>
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noreferrer" className="w-32 hover:scale-102 transition-transform">
                <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" alt="Apple App Store" className="w-full" />
              </a>
            </div>
          </div>

          {/* Form and QR code side */}
          <div className="flex flex-col sm:flex-row items-center gap-8 bg-white/[0.03] border border-white/[0.08] p-6 sm:p-8 rounded-[32px] w-full lg:max-w-lg">
            {/* Form */}
            <div className="flex-1 space-y-4 w-full">
              <form onSubmit={handleSendLinkFooter} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Mobile Number</label>
                  <div className="flex items-center gap-2 p-3 bg-white/5 border border-white/10 rounded-xl focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20">
                    <span className="text-slate-400 font-bold text-xs">+91</span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={footerPhone}
                      onChange={(e) => setFooterPhone(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter 10-digit number"
                      className="bg-transparent text-white placeholder-slate-500 text-xs font-semibold outline-none w-full"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/15 active:scale-95 cursor-pointer"
                >
                  Send App Download Link
                </button>
              </form>

              {linkSentFooter && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-900/50 text-emerald-400 text-xs font-semibold rounded-xl text-center animate-fade-in">
                  ✔ Link sent! Please check SMS.
                </div>
              )}
            </div>

            {/* QR Mockup */}
            <div className="flex flex-col items-center gap-2 text-center border-t sm:border-t-0 sm:border-l border-white/15 pt-6 sm:pt-0 sm:pl-8">
              <div className="p-2.5 bg-white rounded-2xl shadow-xl w-28 h-28 flex items-center justify-center">
                {/* Simulated QR block using CSS */}
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent('https://www.nahidgroup.in')}`}
                  alt="App Scan QR Code"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Scan to Download</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 8. DETAILED FOOTER ==================== */}
      <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-950 text-sm">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          
          {/* Col 1: About company */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <img src="/nahid-logo.png" alt="Nahid Group Logo" className="w-10 h-10 object-contain rounded-xl" />
              <div>
                <span className="text-lg font-bold text-white block leading-tight">Nahid Group</span>
                <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest block">Manpower Solutions</span>
              </div>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed">
              Nahid Group provides premium corporate manpower solutions and secure digital accounting systems. Backed by industry standard secure sync.
            </p>

            {/* Social Links */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/share/1BsRSxxku4/"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Facebook"
              >
                <Facebook className="w-4 h-4" />
              </a>
              
              <a
                href="https://www.instagram.com/nahid_group_?igsh=aXVwaWZ0dmpwd2lt"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Instagram"
              >
                <Instagram className="w-4 h-4" />
              </a>
              
              <a
                href="https://www.nahidgroup.in"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-white flex items-center justify-center transition-all cursor-pointer"
                title="Website"
              >
                <Globe className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Company links */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">Company</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing Plans</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Business Dashboard</Link></li>
              <li><a href="https://www.nahidgroup.in" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Manpower Services</a></li>
            </ul>
          </div>

          {/* Col 3: Legal links */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">Legal</h4>
            <ul className="space-y-2.5 text-xs font-semibold">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR Data Protection</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Security Standards</a></li>
            </ul>
          </div>

          {/* Col 4: Contact info (Specified by User) */}
          <div className="space-y-4">
            <h4 className="text-white font-extrabold text-xs uppercase tracking-widest">Contact Us</h4>
            <ul className="space-y-3.5 text-xs font-semibold">
              <li className="flex items-start gap-2.5">
                <Phone className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 block text-slate-300">
                  <a href="tel:+917860799398" className="hover:text-white hover:underline transition-colors block">
                    +91-7860799398
                  </a>
                  <a href="tel:+919005601046" className="hover:text-white hover:underline transition-colors block">
                    +91-9005601046
                  </a>
                </div>
              </li>
              
              <li className="flex items-start gap-2.5">
                <Mail className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 block text-slate-300">
                  <a href="mailto:groupnahid@gmail.com" className="hover:text-white hover:underline transition-colors block">
                    groupnahid@gmail.com
                  </a>
                  <a href="mailto:Nahidgroupmanpower@gmail.com" className="hover:text-white hover:underline transition-colors block">
                    Nahidgroupmanpower@gmail.com
                  </a>
                </div>
              </li>

              <li className="flex items-start gap-2.5">
                <Globe className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <a
                  href="https://www.nahidgroup.in"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline transition-colors block text-slate-300"
                >
                  www.nahidgroup.in
                </a>
              </li>

              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=1st+GF+105/211/3,+opp.+Hotel+Deep,+beside+Navrang+Hotel,+Husainganj,+Lucknow,+Uttar+Pradesh+226001"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-white hover:underline transition-colors leading-relaxed block text-slate-300"
                >
                  1st GF 105/211/3, opp. Hotel Deep, beside Navrang Hotel, Husainganj, Lucknow, Uttar Pradesh 226001
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="max-w-7xl mx-auto px-6 border-t border-slate-800/80 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
          <span>© 2026 Nahid Group. All rights reserved. Secured by AES-256 cloud sync.</span>
          <span className="flex items-center gap-1.5 font-bold text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Cloud Ledger Sync Verified
          </span>
        </div>
      </footer>
    </div>
  );
};

export default Home;
