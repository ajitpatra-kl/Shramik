import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api, { API_BASE_URL } from '../services/api';
import { 
  ShieldCheck, Trash2, Eye, LogOut, Check, X, 
  MapPin, Loader2, Sparkles, ClipboardList, BarChart3,
  CheckCircle2, AlertCircle, IndianRupee, ShieldAlert,
  ChevronRight, FileText, Menu, Search, RefreshCw
} from 'lucide-react';

// ─── Toast Notification ──────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const cfg = {
    success: { cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300", Icon: CheckCircle2 },
    error: { cls: "bg-red-500/10 border-red-500/30 text-red-300", Icon: AlertCircle },
    info: { cls: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300", Icon: Sparkles },
  };
  const { cls, Icon } = cfg[type] || cfg.info;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-start gap-3 border shadow-2xl rounded-2xl p-4 w-80 animate-[slideIn_0.3s_ease] backdrop-blur-xl ${cls}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="leading-relaxed text-sm font-medium flex-1">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// ─── Main Admin Dashboard Component ──────────────────────────────────────────
const AdminDashboard = () => {
  const { userProfile, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('audits'); // 'audits' | 'prices'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const [audits, setAudits] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState(null);

  const showToast = useCallback((type, message) => { 
    setToast({ type, message }); 
    setTimeout(() => setToast(null), 6000); 
  }, []);

  useEffect(() => {
    loadTabDetails();
  }, [activeTab]);

  const loadTabDetails = async () => {
    setLoading(true);
    setSelectedAudit(null);
    try {
      if (activeTab === 'audits') {
        const res = await api.get('/api/admin/pending-audits');
        setAudits(res.data || []);
      } else {
        const res = await api.get('/api/admin/price-reports');
        setPrices(res.data || []);
      }
    } catch (err) {
      console.error("Failed to load admin ledger details", err);
      showToast('error', 'Failed to synchronize with backend ledgers.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (techId) => {
    try {
      await api.post(`/api/admin/approve/${techId}`);
      showToast('success', 'Technician approved. Profile is now live.');
      loadTabDetails();
    } catch (err) {
      showToast('error', 'Approval transaction failed.');
    }
  };

  const handleReject = async (techId) => {
    try {
      await api.post(`/api/admin/reject/${techId}`);
      showToast('success', 'Technician application rejected.');
      loadTabDetails();
    } catch (err) {
      showToast('error', 'Rejection transaction failed.');
    }
  };

  const handleDeletePrice = async (priceId) => {
    if (!window.confirm("Purge this price transaction from the global index?")) return;
    try {
      await api.delete(`/api/admin/price-reports/${priceId}`);
      showToast('success', 'Price index entry purged successfully.');
      loadTabDetails();
    } catch (err) {
      showToast('error', 'Failed to delete price entry.');
    }
  };

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-full h-full flex bg-[#0a0f1c] text-slate-100 font-sans overflow-hidden">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-rose-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ── SIDEBAR ── */}
      <aside className={`absolute md:relative z-40 w-64 h-full bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col shrink-0 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Header h-24 */}
        <div className="h-24 px-6 border-b border-slate-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-black text-xl tracking-tight text-white block leading-none mb-1">Admin</span>
              <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest leading-none">Security Center</span>
            </div>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5"/></button>
        </div>

        {/* Admin ID Card */}
        <div className="p-4 mx-4 mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3 shadow-inner shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-rose-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-base">
              {userProfile?.email?.substring(0, 2).toUpperCase() || "AD"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">System Admin</p>
              <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
            </div>
          </div>
          <div className="h-px w-full bg-slate-800" />
          <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Global Access
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-0">
          {[
            { id: 'audits', icon: ClipboardList, label: 'Document Audits', badge: audits.length > 0 ? audits.length : null },
            { id: 'prices', icon: BarChart3, label: 'Price Index Ledgers' }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}>
              <div className="flex items-center gap-3"><item.icon className="w-4 h-4" />{item.label}</div>
              {item.badge && <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition border border-red-500/20">
            <LogOut className="w-4 h-4" /> Terminate Session
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header h-24 */}
        <header className="shrink-0 h-24 px-6 md:px-10 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white capitalize">
                {activeTab === 'audits' ? 'Identity Verification Queue' : 'Global Price Ledger'}
              </h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden sm:block">
                {activeTab === 'audits' ? 'Audit and approve technician government IDs.' : 'Monitor and purge corrupt price transactions.'}
              </p>
            </div>
          </div>
          
          <button onClick={loadTabDetails} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-bold rounded-xl transition border border-slate-700">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 w-full flex flex-col h-full min-h-0 p-4 md:p-6 overflow-hidden">
          <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 h-full">

            {/* ╔════════════ TAB: DOCUMENT AUDITS (Master-Detail) ════════════╗ */}
            {activeTab === 'audits' && (
              <div className="flex-1 flex flex-col lg:flex-row min-h-0 h-full w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease]">
                
                {/* Master: Audit List */}
                <div className={`w-full lg:w-96 border-r border-slate-800 flex flex-col min-h-0 h-full bg-slate-950/50 shrink-0 ${selectedAudit ? 'hidden lg:flex' : 'flex'}`}>
                  <div className="p-5 border-b border-slate-800 shrink-0 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">Pending Applications</h2>
                    <span className="bg-indigo-500/20 text-indigo-400 text-[10px] font-bold px-2.5 py-1 rounded-full">{audits.length} pending</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 no-scrollbar">
                    {loading && audits.length === 0 ? (
                      <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                    ) : audits.length === 0 ? (
                      <div className="text-center py-16 px-4">
                        <ShieldCheck className="w-12 h-12 text-emerald-500/50 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-300">All Caught Up</p>
                        <p className="text-xs text-slate-500 mt-1">No pending verifications in the queue.</p>
                      </div>
                    ) : (
                      audits.map(({ technician, user }) => (
                        <button key={technician.id} onClick={() => setSelectedAudit({ technician, user })}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${selectedAudit?.technician?.id === technician.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}`}>
                          <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-400 text-base shrink-0">
                            {user.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <p className="text-sm font-bold text-white truncate">{user.name}</p>
                            </div>
                            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider truncate">{technician.skills[0] || 'Unspecified'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 shrink-0" />
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Detail: Active Audit Review */}
                <div className={`flex-1 flex flex-col min-h-0 h-full bg-slate-900/20 relative ${!selectedAudit ? 'hidden lg:flex items-center justify-center' : 'flex'}`}>
                  {!selectedAudit ? (
                    <div className="text-center opacity-50 p-6">
                      <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-400">Select an application to review</p>
                    </div>
                  ) : (
                    <>
                      {/* Header */}
                      <div className="shrink-0 p-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <button className="lg:hidden p-2 bg-slate-800 rounded-lg text-slate-300 shrink-0" onClick={() => setSelectedAudit(null)}>
                            <ChevronRight className="w-5 h-5 rotate-180"/>
                          </button>
                          <div>
                            <h3 className="text-base font-bold text-white truncate">{selectedAudit.user.name}</h3>
                            <p className="text-xs text-slate-400 truncate">{selectedAudit.user.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Document Viewer Area */}
                      <div className="flex-1 overflow-hidden min-h-0 p-6 flex flex-col">
                        <div className="flex items-center gap-2 mb-4">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Submitted Identity Document</span>
                        </div>
                        
                        <div className="flex-1 min-h-0 bg-black/50 border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col justify-center">
                          {(() => {
                            const docUrl = selectedAudit.technician.idDocumentUrl;
                            const fullUrl = docUrl ? `${API_BASE_URL}${docUrl}` : null;
                            const isPdf = fullUrl && (docUrl.toLowerCase().endsWith('.pdf') || docUrl.toLowerCase().includes('pdf'));

                            if (!fullUrl) {
                              return <div className="text-center text-slate-500 font-semibold text-sm">No document file attached to this profile.</div>;
                            }

                            if (isPdf) {
                              return (
                                <iframe
                                  src={`${fullUrl}#toolbar=1&view=FitH`}
                                  title="Govt ID Document (PDF)"
                                  className="w-full h-full border-none"
                                />
                              );
                            }

                            return (
                              <img
                                src={fullUrl}
                                alt="Govt ID Scan"
                                className="w-full h-full object-contain"
                              />
                            );
                          })()}
                        </div>
                      </div>

                      {/* Action Bar */}
                      <div className="shrink-0 p-5 bg-slate-950/80 backdrop-blur border-t border-slate-800 grid grid-cols-2 gap-4">
                        <button
                          onClick={() => handleReject(selectedAudit.technician.id)}
                          className="py-3.5 bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/20 font-bold rounded-xl transition flex items-center justify-center gap-2"
                        >
                          <X className="w-5 h-5" /> Reject ID
                        </button>
                        <button
                          onClick={() => handleApprove(selectedAudit.technician.id)}
                          className="py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                          <Check className="w-5 h-5" /> Approve Profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ╔════════════ TAB: PRICE LEDGER ════════════╗ */}
            {activeTab === 'prices' && (
              <div className="flex-1 bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-xl flex flex-col min-h-0 overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease]">
                <div className="p-6 border-b border-slate-800 shrink-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-5 h-5 text-indigo-400" />
                    <h2 className="text-lg font-bold text-white">Global Price Transactions</h2>
                  </div>
                  <span className="text-[10px] font-bold px-3 py-1 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                    {prices.length} Records
                  </span>
                </div>

                <div className="flex-1 overflow-auto min-h-0 no-scrollbar p-6">
                  {loading && prices.length === 0 ? (
                    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin" /></div>
                  ) : prices.length === 0 ? (
                    <div className="text-center py-20 text-slate-500 font-semibold text-sm">
                      No price indices logged in the system.
                    </div>
                  ) : (
                    <table className="w-full text-left">
                      <thead className="sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10">
                        <tr className="border-b border-slate-700 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                          <th className="pb-3 pt-2 pl-4">Service Class</th>
                          <th className="pb-3 pt-2">Amount Paid</th>
                          <th className="pb-3 pt-2">Reporter UID</th>
                          <th className="pb-3 pt-2">Geo-Coordinates</th>
                          <th className="pb-3 pt-2 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {prices.map((report) => (
                          <tr key={report.id} className="hover:bg-slate-800/30 transition group">
                            <td className="py-4 pl-4 font-bold text-white text-sm">{report.serviceType}</td>
                            <td className="py-4 text-emerald-400 font-black flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" />{report.pricePaid}
                            </td>
                            <td className="py-4 text-xs font-mono text-slate-500">{report.userId}</td>
                            <td className="py-4 text-xs text-slate-400 flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-600" />
                              {report.location ? `${report.location.y.toFixed(4)}, ${report.location.x.toFixed(4)}` : 'Unknown'}
                            </td>
                            <td className="py-4 pr-4 text-right">
                              <button
                                onClick={() => handleDeletePrice(report.id)}
                                className="p-2 bg-red-950/30 hover:bg-red-900/50 text-red-400 rounded-lg transition border border-transparent hover:border-red-500/30 opacity-0 group-hover:opacity-100"
                                title="Purge Record"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

    </div>
  );
};

export default AdminDashboard;