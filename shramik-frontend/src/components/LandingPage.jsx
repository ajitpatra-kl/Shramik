import React, { useState, useEffect } from 'react';
import Logo from './Logo';
import { 
  Zap, MapPin, MessageSquare, Video, Shield, Star, ArrowRight, 
  Users, CheckCircle2, Sparkles, Wrench, Clock, TrendingUp,
  Play, ShieldCheck, Banknote, Globe, Search // <--- Added Search here
} from 'lucide-react';

// ─── Animated counter hook ──────────────────────────────────────────────────
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

// ─── Modern Stat Badge ──────────────────────────────────────────────────────
const StatBadge = ({ value, suffix, label, started, delay }) => {
  const count = useCounter(value, 2000, started);
  return (
    <div 
      className="flex flex-col items-center justify-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-md animate-[slideUp_0.6s_ease-out_both]"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight mb-2">
        {count.toLocaleString()}<span className="text-indigo-500">{suffix}</span>
      </div>
      <div className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">{label}</div>
    </div>
  );
};

// ─── Main Landing Page ────────────────────────────────────────────────────────
const LandingPage = ({ onGetStarted }) => {
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setStatsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 overflow-x-hidden font-sans selection:bg-indigo-500/30">
      
      {/* ── Cinematic Background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-600/10 rounded-full blur-[120px] animate-[pulse_8s_ease-in-out_infinite]" />
        <div className="absolute top-[20%] right-[-10%] w-[40vw] h-[40vw] bg-emerald-500/5 rounded-full blur-[120px] animate-[pulse_10s_ease-in-out_infinite_reverse]" />
        <div className="absolute bottom-[-20%] left-[20%] w-[60vw] h-[60vw] bg-purple-600/5 rounded-full blur-[150px]" />
        
        {/* Subtle Grid Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAyKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
      </div>

      {/* ── Navigation ── */}
      <nav className="fixed w-full z-50 top-0 border-b border-white/5 bg-slate-950/50 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-4 flex items-center justify-between">
         <Logo className="w-10 h-10" textClass="text-xl" />
          
          <div className="flex items-center gap-4">
            <button onClick={onGetStarted} className="hidden sm:block text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </button>
            <button onClick={onGetStarted} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-200 text-slate-900 font-bold text-sm rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:scale-105">
              Get Started <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative z-10 pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        <div className="max-w-[1400px] mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-8">
          
          {/* Hero Text */}
          <div className="flex-1 text-center lg:text-left animate-[slideUp_0.8s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-bold text-slate-300 mb-8 shadow-inner backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              India's #1 Hyperlocal Skill Network
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] mb-6 text-white">
              Hire Verified Talent. <br className="hidden lg:block" />
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_auto]">
                Zero Middlemen.
              </span>
            </h1>
            
            <p className="text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 mb-10 leading-relaxed font-medium">
              The modern marketplace connecting you directly with nearby, background-checked professionals. Transparent market pricing, live video pitches, and secure real-time negotiation.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <button onClick={onGetStarted} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_40px_rgba(99,102,241,0.5)] hover:-translate-y-1">
                <Search className="w-5 h-5" /> Find a Professional
              </button>
              <button onClick={onGetStarted} className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-slate-900/50 hover:bg-slate-800 border border-slate-700/50 text-white font-bold text-base rounded-2xl transition-all duration-300 backdrop-blur-md hover:-translate-y-1">
                <Wrench className="w-5 h-5 text-emerald-400" /> Join as a Worker
              </button>
            </div>
          </div>

          {/* Hero Visual Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none relative animate-[slideUp_1s_ease-out]">
            {/* Decorative elements */}
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 blur-2xl rounded-[3rem] -z-10" />
            
            {/* Glass Mockup Container */}
            <div className="glass-card border border-slate-700/50 rounded-[2.5rem] p-6 shadow-2xl bg-slate-900/60 backdrop-blur-2xl transform rotate-[-2deg] hover:rotate-0 transition-transform duration-500">
              
              <div className="flex items-center justify-between mb-6 border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                </div>
                <div className="text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Live Radar
                </div>
              </div>

              <div className="space-y-4">
                {/* Tech Card 1 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400 font-black border border-blue-500/30">RK</div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1">Rajesh Kumar <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/></h4>
                    <p className="text-xs text-slate-400">Master Electrician · <span className="text-indigo-400 font-semibold">1.2 km away</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white flex items-center gap-1 justify-end"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.9</div>
                    <div className="text-xs font-bold text-emerald-400 mt-1">₹450/hr</div>
                  </div>
                </div>

                {/* Tech Card 2 */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 hover:border-indigo-500/50 transition-colors cursor-pointer">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-black border border-purple-500/30">SP</div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-white flex items-center gap-1">Suresh Patil <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/></h4>
                    <p className="text-xs text-slate-400">Expert Plumber · <span className="text-indigo-400 font-semibold">2.5 km away</span></p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-white flex items-center gap-1 justify-end"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> 4.8</div>
                    <div className="text-xs font-bold text-emerald-400 mt-1">₹380/hr</div>
                  </div>
                </div>

                {/* Active Chat Mock */}
                <div className="mt-6 pt-6 border-t border-slate-800/80">
                  <div className="bg-indigo-600 rounded-2xl rounded-tr-sm p-4 w-4/5 ml-auto shadow-lg shadow-indigo-600/20 mb-3">
                    <p className="text-sm text-white font-medium">I can arrive in 15 minutes. Does ₹450 work for the wiring repair?</p>
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 w-4/5 border border-slate-700">
                    <p className="text-sm text-white font-medium">Yes, that is exactly the market rate shown here. See you soon!</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── Stats Banner ── */}
      <section className="relative z-10 border-y border-white/5 bg-slate-900/20 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-8">
          <StatBadge value={12500} suffix="+" label="Verified Pros" started={statsVisible} delay={0} />
          <StatBadge value={45} suffix="k" label="Jobs Completed" started={statsVisible} delay={100} />
          <StatBadge value={100} suffix="%" label="Secure Chats" started={statsVisible} delay={200} />
          <StatBadge value={4.9} suffix="★" label="Avg Rating" started={statsVisible} delay={300} />
        </div>
      </section>

      {/* ── Modern Bento Box Features ── */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
              A Platform Engineered for <span className="text-indigo-400">Total Trust.</span>
            </h2>
            <p className="text-lg text-slate-400 leading-relaxed font-medium">
              We stripped away the noise and built a transparent ecosystem. Know who you are hiring, what they look like, and exactly what the market pays.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(280px,auto)]">
            
            {/* Big Feature 1 */}
            <div className="md:col-span-2 glass-card rounded-3xl p-8 lg:p-12 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:border-indigo-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] group-hover:bg-indigo-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-8">
                  <MapPin className="w-7 h-7 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Precision Geospatial Routing</h3>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                    Our intelligent grid maps your exact coordinates to find available, top-rated professionals within a 10km radius. No more waiting hours for someone to travel across the city.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="glass-card rounded-3xl p-8 lg:p-10 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:border-emerald-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute bottom-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-[60px] group-hover:bg-emerald-500/20 transition-all" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-6">
                  <Banknote className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3">Index Pricing</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Live market intelligence shows you the exact average hourly rate paid by other customers in your area.
                  </p>
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="glass-card rounded-3xl p-8 lg:p-10 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:border-purple-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute top-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-[60px] group-hover:bg-purple-500/20 transition-all" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center mb-6">
                  <Video className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white mb-3">Live Video Pitches</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    Watch a 15-second intro video of the professional before you book. Build trust instantly.
                  </p>
                </div>
              </div>
            </div>

            {/* Big Feature 4 */}
            <div className="md:col-span-2 glass-card rounded-3xl p-8 lg:p-12 border border-slate-800/80 bg-gradient-to-br from-slate-900/80 to-slate-900/40 hover:border-blue-500/50 transition-all duration-500 group overflow-hidden relative">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] group-hover:bg-blue-500/20 transition-all duration-500" />
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-8">
                  <MessageSquare className="w-7 h-7 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-4">Secure WebSocket Chat</h3>
                  <p className="text-slate-400 text-lg leading-relaxed max-w-lg">
                    Negotiate terms, share photos of the issue, and agree on pricing safely within our encrypted chat platform before confirming the booking.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Ultimate CTA Section ── */}
      <section className="relative z-10 py-32 px-6 border-t border-slate-800/60 bg-slate-950/50">
        <div className="max-w-[1000px] mx-auto text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-[0_0_40px_rgba(99,102,241,0.4)] mb-8">
            <Globe className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-white tracking-tight mb-8">
            Ready to upgrade your <br className="hidden md:block"/> service experience?
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
            Join the fastest growing network of verified professionals and smart customers in India.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <button onClick={onGetStarted} className="px-10 py-5 bg-white hover:bg-slate-200 text-slate-900 font-black text-lg rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Enter Platform
            </button>
          </div>
        </div>
      </section>

      {/* ── Minimalist Footer ── */}
      <footer className="relative z-10 border-t border-slate-800/60 bg-[#030712]">
        <div className="max-w-[1400px] mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <span className="font-black text-lg text-white">Shramik<span className="text-indigo-400">Pro</span></span>
          </div>
          <p className="text-sm font-medium text-slate-500">
            © {new Date().getFullYear()} Shramik Profile Network. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-slate-500">
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">Security</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;