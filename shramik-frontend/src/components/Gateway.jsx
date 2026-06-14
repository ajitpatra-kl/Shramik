import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Shield, User, ArrowRight, RefreshCw, CheckCircle2,
  AlertCircle, Eye, EyeOff, Lock, ArrowLeft, KeyRound, 
  Sparkles, Zap, MapPin, TrendingUp
} from 'lucide-react';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ type, message }) => {
  if (!message) return null;
  const styles = {
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    error:   'bg-red-500/10 border-red-500/30 text-red-300',
    info:    'bg-indigo-500/10 border-indigo-500/30 text-indigo-300',
  };
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 shrink-0" />,
    error:   <AlertCircle className="w-5 h-5 shrink-0" />,
    info:    <Mail className="w-5 h-5 shrink-0 animate-pulse" />,
  };
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-start gap-3 border shadow-2xl rounded-2xl p-4 w-80 animate-[slideIn_0.3s_ease] backdrop-blur-xl ${styles[type]}`}>
      <div className="mt-0.5">{icons[type]}</div>
      <span className="leading-relaxed text-sm font-medium flex-1">{message}</span>
    </div>
  );
};

// ─── Step indicator ───────────────────────────────────────────────────────────
const StepBar = ({ step, total = 2 }) => (
  <div className="flex gap-2 mb-8">
    {Array.from({ length: total }).map((_, i) => (
      <div
        key={i}
        className={`h-1.5 rounded-full flex-1 transition-all duration-700 ${
          i < step ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-800'
        }`}
      />
    ))}
  </div>
);

// ─── Main Gateway Component ───────────────────────────────────────────────────
const Gateway = ({ onBackToLanding }) => {
  const { login, gpsCoordinates } = useAuth();

  const [step, setStep] = useState(1);
  const [isNewUser, setIsNewUser] = useState(false);

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [role, setRole]         = useState('USER');

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const [toast, setToast]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(60);

  // Countdown timer for OTP resend
  useEffect(() => {
    let t;
    if (step === 2 && countdown > 0) {
      t = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(t);
  }, [step, countdown]);

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 6000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type, message) => setToast({ type, message });

  // ── Step 1: Submit email + password ───────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return showToast('error', 'Please enter your email address.');
    if (!password || password.length < 6) return showToast('error', 'Password must be at least 6 characters.');

    setToast(null);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/login-request', {
        email,
        password,
        role,
        latitude:  gpsCoordinates?.lat  || null,
        longitude: gpsCoordinates?.lng  || null,
      });

      const data = res.data;

      if (data.requiresOtp) {
        setIsNewUser(true);
        setStep(2);
        setCountdown(60);
        setOtp(['', '', '', '', '', '']);
        showToast('info', data.message || `A 6-digit verification code was sent to ${email}.`);
        setTimeout(() => otpRefs[0].current?.focus(), 200);
      } else {
        showToast('success', 'Authentication successful. Connecting to workspace...');
        setTimeout(() => login(data), 800);
      }

    } catch (err) {
      const msg = err.response?.data?.error
        || err.response?.data?.message
        || err.message
        || 'Server unreachable. Please check your connection.';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ── OTP input helpers ─────────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (isNaN(Number(value))) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs[index - 1].current?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs[5].current?.focus();
    }
  };

  // ── Step 2: Verify OTP (sign-up completion) ───────────────────────────────
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return showToast('error', 'Please enter all 6 digits.');

    setToast(null);
    setLoading(true);

    try {
      const res = await api.post('/api/auth/otp/verify', {
        email,
        otpCode: code,
        role,
        latitude:  gpsCoordinates?.lat  || null,
        longitude: gpsCoordinates?.lng  || null,
      });
      showToast('success', 'Email verified successfully! Welcome to Shramik.');
      setTimeout(() => login(res.data), 800);
    } catch (err) {
      const msg = err.response?.data?.error || 'Incorrect or expired code. Please try again.';
      showToast('error', msg);
      setOtp(['', '', '', '', '', '']);
      setTimeout(() => otpRefs[0].current?.focus(), 100);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (countdown > 0) return;
    setLoading(true);
    try {
      await api.post('/api/auth/login-request', { email, password, role });
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      showToast('info', 'A new verification code has been dispatched.');
      otpRefs[0].current?.focus();
    } catch {
      showToast('error', 'Resend failed. Please check your network connection.');
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex bg-[#0a0f1c] font-sans text-slate-100 overflow-hidden relative">
      <Toast type={toast?.type} message={toast?.message} />

      {/* ── LEFT PANEL (Branding) ── Hidden on Mobile ── */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 relative bg-slate-950 border-r border-slate-800/80 p-12 flex-col justify-between overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />
        
        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">Shramik</span>
        </div>

        {/* Center Content */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] tracking-tight mb-6">
            Your Hyperlocal <br/>
            <span className="text-indigo-400">Skill Marketplace.</span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-10">
            Connect instantly with verified professionals in your neighborhood, or grow your independent service business with total transparency.
          </p>

          <div className="space-y-6">
            {[
              { icon: Shield, title: 'Bank-Grade Security', desc: 'Every professional is strictly vetted and ID-verified.' },
              { icon: MapPin, title: 'Precision Geospatial Match', desc: 'Instantly route to the closest available talent.' },
              { icon: TrendingUp, title: 'Transparent Index Pricing', desc: 'No hidden fees. Market-driven fair rates.' }
            ].map((f, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0">
                  <f.icon className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white mb-0.5">{f.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="relative z-10 flex items-center gap-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          <span>Secure</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Verified</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full" />
          <span>Fast</span>
        </div>
      </div>

      {/* ── RIGHT PANEL (Auth Form) ── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 relative z-10">
        
        {/* Mobile-only logo */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="font-black text-2xl tracking-tight text-white">Shramik</span>
        </div>

        <div className="w-full max-w-[440px]">
          
          {onBackToLanding && (
            <button
              onClick={onBackToLanding}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-300 transition-colors mb-8 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Return to Website
            </button>
          )}

          {/* Form Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
              {step === 1 ? 'Access Gateway' : 'Verify Identity'}
            </h2>
            <p className="text-sm text-slate-400">
              {step === 1 
                ? 'Sign in or automatically register a new account.' 
                : `A secure 6-digit code was sent to ${email}`}
            </p>
          </div>

          {/* Step Progress (Sign Up only) */}
          {isNewUser && <StepBar step={step} total={2} />}

          {/* ╔══════════ STEP 1: EMAIL + PASSWORD ══════════╗ */}
          {step === 1 && (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Premium Segmented Role Control */}
              <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80 mb-8">
                {[
                  { value: 'USER', Icon: User, label: 'Client' },
                  { value: 'TECHNICIAN', Icon: Zap, label: 'Professional' },
                ].map(({ value, Icon, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRole(value)}
                    className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2.5 ${
                      role === value 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              {/* Input Group */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      required
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Secure Password
                  </label>
                  <div className="relative group">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      minLength={6}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-12 pr-12 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4 group"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Continue Access
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ╔══════════ STEP 2: OTP VERIFICATION ═══════════╗ */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-8 animate-[fadeIn_0.3s_ease]">
              
              <div className="flex justify-between gap-3" onPaste={handlePaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={otpRefs[i]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    className={`w-full aspect-square text-center text-2xl font-black rounded-xl border-2 bg-slate-900 text-white focus:outline-none transition-all duration-300 ${
                      digit
                        ? 'border-indigo-500 bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.2)]'
                        : 'border-slate-800 focus:border-indigo-500'
                    }`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length < 6}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all duration-300 shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Verify & Authenticate
                  </>
                )}
              </button>

              <div className="flex items-center justify-between text-sm font-semibold border-t border-slate-800 pt-6">
                <button
                  type="button"
                  onClick={() => { setStep(1); setIsNewUser(false); setToast(null); }}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Modify Email
                </button>

                {countdown > 0 ? (
                  <p className="text-slate-500">
                    Resend available in <span className="text-white tabular-nums">{countdown}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Resend Code
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Gateway;