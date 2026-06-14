import React, { useState } from "react";
import { useAuth } from "./context/AuthContext";
import LandingPage from "./components/LandingPage";
import Gateway from "./components/Gateway";
import Onboarding from "./components/Onboarding";
import CustomerDashboard from "./dashboards/CustomerDashboard";
import DashboardLayout from "./dashboards/DashboardLayout";
import TechnicianDashboard from "./dashboards/TechnicianDashboard";
import AdminDashboard from "./dashboards/AdminDashboard";

/**
 * Premium loading screen with animated brand identity.
 * Shown during initial JWT validation and profile hydration.
 */
const SplashLoader = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-6 relative overflow-hidden">
    {/* Ambient light sources */}
    <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[140px] pointer-events-none" />
    <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

    {/* Brand mark */}
    <div className="relative flex flex-col items-center gap-5">
      {/* Animated logo ring */}
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-2xl bg-indigo-500/10 border border-indigo-500/20" />
        <div
          className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-500 border-r-indigo-500/40 animate-spin"
          style={{ animationDuration: "1.2s" }}
        />
        <div className="absolute inset-2 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <span className="text-indigo-400 font-black text-xl tracking-tight">
            S
          </span>
        </div>
      </div>

      {/* Brand text */}
      <div className="text-center">
        <h1 className="text-2xl font-extrabold tracking-tight text-white">
          Shramik <span className="text-indigo-400">Profile</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1 font-medium tracking-wide">
          Hyperlocal Skill Marketplace
        </p>
      </div>

      {/* Loading indicator */}
      <div className="flex items-center gap-2">
        <div
          className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce"
          style={{ animationDelay: "0ms" }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce"
          style={{ animationDelay: "150ms" }}
        />
        <div
          className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce"
          style={{ animationDelay: "300ms" }}
        />
      </div>

      <p className="text-[11px] text-slate-600 font-medium tracking-wider uppercase">
        Syncing your workspace...
      </p>
    </div>
  </div>
);

/**
 * Root application router.
 * Handles 5 distinct application states:
 * 1. Loading — JWT validation in progress
 * 2. Unauthenticated + Landing — Public marketing landing page
 * 3. Unauthenticated + Auth — Gmail + Password + OTP auth screen
 * 4. Profile Incomplete — Onboarding form
 * 5. Authenticated — Role-specific dashboard
 */
function App() {
  const { token, role, userProfile, loading } = useAuth();

  // Controls whether we show the landing page or auth gateway
  const [showAuth, setShowAuth] = useState(false);

  // 1. Loading state — JWT validation / profile hydration
  if (loading) {
    return <SplashLoader />;
  }

  // 2. Unauthenticated — Landing page first, then auth
  if (!token) {
    if (!showAuth) {
      return <LandingPage onGetStarted={() => setShowAuth(true)} />;
    }
    return <Gateway onBackToLanding={() => setShowAuth(false)} />;
  }

  // 3. Incomplete profile — show onboarding form to complete name/phone/location
  const isProfileIncomplete =
    !userProfile || !userProfile.name || !userProfile.phone;
  if (isProfileIncomplete) {
    return <Onboarding />;
  }

  // 4. Authenticated — Route by role
  switch (role) {
    case "ADMIN":
      return <AdminDashboard />;
    case "TECHNICIAN":
      return <TechnicianDashboard />;
    case "USER":
    default:
      return <DashboardLayout />;
  }
}

export default App;
