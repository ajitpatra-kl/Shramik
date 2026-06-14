import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import api, { API_BASE_URL } from "../services/api";
import {
  ShieldAlert, ShieldCheck, Upload, Video, Camera, Sparkles, LogOut,
  MessageSquare, User, BarChart3, Check, RefreshCw, Send, X, Star,
  Briefcase, FolderOpen, Clock, Award, Wifi, WifiOff,
  ChevronRight, CheckCircle2, AlertCircle, IndianRupee, TrendingUp,
  Play, StopCircle, RotateCcw, Shield, Menu,
  // Professional Skill Icons
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Flame, BrickWall, LayoutGrid, Wrench
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & MOCKS
// ─────────────────────────────────────────────────────────────────────────────
const SKILLS_LIST = [
  "Electrician", "Plumber", "Carpenter", "Painter", 
  "AC Technician", "Welder", "Mason", "Tiler"
];

// Professional vector icon mapping
const SKILL_ICONS = {
  Electrician: Zap, 
  Plumber: Droplets, 
  Carpenter: Hammer, 
  Painter: Paintbrush,
  "AC Technician": Snowflake, 
  Welder: Flame, 
  Mason: BrickWall, 
  Tiler: LayoutGrid,
};

const MOCK_JOB_LOGS = [
  { id: "JOB#2083", skill: "Plumber", amount: 450, date: "June 12, 2026", status: "Paid" },
  { id: "JOB#2071", skill: "Electrician", amount: 1200, date: "June 08, 2026", status: "Paid" },
  { id: "JOB#2058", skill: "Plumber", amount: 380, date: "June 02, 2026", status: "Paid" },
  { id: "JOB#2041", skill: "AC Technician", amount: 900, date: "May 28, 2026", status: "Paid" },
];

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const Toast = ({ type, message, onClose }) => {
  if (!message) return null;
  const cfg = {
    success: { cls: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300", Icon: CheckCircle2 },
    error: { cls: "bg-red-500/10 border-red-500/30 text-red-300", Icon: AlertCircle },
    info: { cls: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300", Icon: Sparkles },
    warning: { cls: "bg-amber-500/10 border-amber-500/30 text-amber-300", Icon: AlertCircle },
  };
  const { cls, Icon } = cfg[type] || cfg.info;
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-start gap-3 border shadow-2xl rounded-xl p-4 w-80 animate-[slideIn_0.3s_ease] backdrop-blur-md ${cls}`}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="leading-relaxed text-sm flex-1">{message}</span>
      <button onClick={onClose} className="opacity-50 hover:opacity-100 transition shrink-0">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

const CountdownRing = ({ value, max = 15 }) => {
  const r = 28;
  const circ = 2 * Math.PI * r;
  const progress = (value / max) * circ;
  return (
    <svg width="72" height="72" className="-rotate-90">
      <circle cx="36" cy="36" r={r} stroke="#1e293b" strokeWidth="5" fill="none" />
      <circle cx="36" cy="36" r={r} stroke={value <= 5 ? "#ef4444" : "#6366f1"} strokeWidth="5" fill="none" strokeDasharray={circ} strokeDashoffset={circ - progress} strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }} />
      <text x="36" y="36" textAnchor="middle" dominantBaseline="central" className="rotate-90 origin-center" style={{ transform: "rotate(90deg)", transformOrigin: "36px 36px" }} fill={value <= 5 ? "#f87171" : "#818cf8"} fontSize="16" fontWeight="900">
        {value}
      </text>
    </svg>
  );
};

const VerificationBanner = ({ status }) => {
  const configs = {
    NOT_SUBMITTED: { bg: "bg-red-500/10 border-red-500/30", icon: "text-red-400 bg-red-500/20", title: "Identity Verification Required", body: "Upload your government ID to appear in local customer searches." },
    PENDING: { bg: "bg-amber-500/10 border-amber-500/30", icon: "text-amber-400 bg-amber-500/20", title: "Manual Audit In Progress", body: "Your documents are undergoing a manual review audit by our security team." },
    APPROVED: { bg: "bg-emerald-500/10 border-emerald-500/30", icon: "text-emerald-400 bg-emerald-500/20", title: "Account Fully Validated", body: "All verification checks are complete. You are visible in hyperlocal searches." },
    REJECTED: { bg: "bg-rose-500/10 border-rose-500/30", icon: "text-rose-400 bg-rose-500/20", title: "Verification Failed", body: "The uploaded document was invalid. Please re-submit a clear, valid ID." },
  };
  const c = configs[status] || configs.NOT_SUBMITTED;
  return (
    <div className={`rounded-2xl p-5 border backdrop-blur-sm flex gap-4 shrink-0 ${c.bg}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${c.icon}`}>
        {status === "APPROVED" ? <ShieldCheck className="w-6 h-6" /> : status === "PENDING" ? <Clock className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
      </div>
      <div>
        <h4 className="text-sm font-bold text-white mb-1">{c.title}</h4>
        <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">{c.body}</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const TechnicianDashboard = () => {
  const { userProfile, techProfile, fetchProfile, logout } = useAuth();
  const { sendMessage, stompClient, connected } = useSocket();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("chat");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [updatingOnline, setUpdatingOnline] = useState(false);
  const [toast, setToast] = useState(null);

  // Profile Tab State
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [docDragOver, setDocDragOver] = useState(false);

  // Video Recorder State
  const [videoStage, setVideoStage] = useState("idle");
  const [recording, setRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState(null);
  const [countdown, setCountdown] = useState(15);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const countdownRef = useRef(null);
  const liveVideoRef = useRef(null);
  const uploadFileRef = useRef(null);

  // Chat Tab State
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [avgPriceForSkill, setAvgPriceForSkill] = useState(null);
  
  // Safely scroll container Reference
  const chatScrollRef = useRef(null);

  // Metrics
  const [jobLogs] = useState(MOCK_JOB_LOGS);

  // ── Initialization & Sync ──────────────────────────────────────────────────
  useEffect(() => {
    if (techProfile) {
      setIsOnline(techProfile.isOnline ?? techProfile.online ?? false);
      setSelectedSkills(techProfile.skills || []);
    }
  }, [techProfile]);

  useEffect(() => {
    if (!connected || !isOnline || activeTab !== "chat") return;
    let cancelled = false;
    const loadRooms = async () => {
      try {
        const res = await api.get("/api/chat/rooms");
        if (!cancelled) setChatRooms(res.data || []);
      } catch {
        if (!cancelled) setChatRooms([]);
      }
    };
    loadRooms();
    const intervalId = setInterval(loadRooms, 5000);
    return () => { cancelled = true; clearInterval(intervalId); };
  }, [connected, isOnline, activeTab]);

  useEffect(() => {
    let sub;
    if (activeChatId && stompClient && connected) {
      api.get(`/api/chat/messages/${activeChatId}`).then(r => setChatMessages(r.data)).catch(console.error);
      sub = stompClient.subscribe(`/topic/chat/${activeChatId}`, (frame) => {
        const b = JSON.parse(frame.body);
        setChatMessages(p => [...p, b]);
        setChatRooms(prev => {
          if (prev.some(room => room.id === b.chatId)) return prev;
          return [{ id: b.chatId, name: b.senderName || "Customer", user: { id: b.senderId, name: b.senderName }, lastMessage: b.message, timestamp: b.timestamp }, ...prev];
        });
      });
    }
    return () => sub?.unsubscribe();
  }, [activeChatId, stompClient, connected]);

  // SAFELY scroll to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTo({
        top: chatScrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [chatMessages]);

  useEffect(() => {
    if (activeChatId && selectedSkills.length > 0 && techProfile?.location) {
      const loc = techProfile.location;
      api.get("/api/price-reports/average", { params: { serviceType: selectedSkills[0], lng: loc.coordinates?.[0] || 77.5946, lat: loc.coordinates?.[1] || 12.9716, radiusKm: 10 } })
        .then(r => setAvgPriceForSkill(r.data.avgPrice)).catch(() => {});
    }
  }, [activeChatId, selectedSkills]);

  const showToast = useCallback((type, message) => { setToast({ type, message }); setTimeout(() => setToast(null), 6000); }, []);
  const isVerified = techProfile?.verificationStatus === "APPROVED";

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleToggleOnline = async () => {
    if (!isVerified) return;
    setUpdatingOnline(true);
    try {
      const res = await api.put("/api/technicians/status", { isOnline: !isOnline });
      const nextOnline = res.data.isOnline ?? res.data.online ?? !isOnline;
      setIsOnline(nextOnline);
      showToast("success", nextOnline ? "🟢 You are now Online — receiving customer requests!" : "⚫ You are now Offline.");
      await fetchProfile();
    } catch { showToast("error", "Failed to update status. Please try again."); } 
    finally { setUpdatingOnline(false); }
  };

  const handleSkillToggle = async (skill) => {
    const updated = selectedSkills.includes(skill) ? selectedSkills.filter(s => s !== skill) : [...selectedSkills, skill];
    setSelectedSkills(updated);
    try { await api.put("/api/technicians/skills", updated); } 
    catch { showToast("error", "Failed to update skill."); }
  };

  const doUploadDocument = async (file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["jpg", "jpeg", "png"].includes(ext)) return showToast("error", "Only JPG/PNG images accepted.");
    if (file.size > 5 * 1024 * 1024) return showToast("error", "File must be under 5 MB.");
    
    setUploadingDoc(true);
    const form = new FormData();
    form.append("file", file);
    try {
      await api.post("/api/technicians/upload-document", form, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("success", "✅ ID uploaded successfully. Account pending review.");
      await fetchProfile();
    } catch { showToast("error", "Upload failed. Try a clearer image."); } 
    finally { setUploadingDoc(false); }
  };

  const startRecording = async () => {
    setRecordedBlob(null); setVideoPreviewUrl(null); setCountdown(15);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (liveVideoRef.current) { liveVideoRef.current.srcObject = stream; await liveVideoRef.current.play().catch(()=>{}); }

      const recorder = new MediaRecorder(stream, { mimeType: "video/webm;codecs=vp8,opus" });
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setRecordedBlob(blob); setVideoPreviewUrl(URL.createObjectURL(blob)); setVideoStage("preview");
        if (liveVideoRef.current) liveVideoRef.current.srcObject = null;
        streamRef.current?.getTracks().forEach(t => t.stop());
      };

      recorder.start(100); setRecording(true); setVideoStage("recording");
      let t = 15;
      countdownRef.current = setInterval(() => { t -= 1; setCountdown(t); if (t <= 0) stopRecording(); }, 1000);
    } catch {
      showToast("warning", 'Camera access denied. Use "Upload File" instead.');
      setVideoStage("select");
    }
  };

  const stopRecording = () => {
    clearInterval(countdownRef.current);
    if (mediaRecorderRef.current?.state !== "inactive") mediaRecorderRef.current?.stop();
    streamRef.current?.getTracks().forEach(t => t.stop());
    setRecording(false);
  };

  const resetVideo = () => { stopRecording(); setRecordedBlob(null); setVideoPreviewUrl(null); setVideoStage("idle"); setCountdown(15); };

  const submitVideo = async () => {
    if (!recordedBlob) return;
    setVideoStage("uploading"); setUploadingVideo(true);
    const form = new FormData();
    form.append("file", new File([recordedBlob], "intro_video.mp4", { type: "video/mp4" }));
    try {
      await api.post("/api/technicians/upload-video", form, { headers: { "Content-Type": "multipart/form-data" } });
      showToast("success", "🎥 Video profile saved! Customers can now watch your intro.");
      setVideoStage("idle"); setRecordedBlob(null); setVideoPreviewUrl(null); await fetchProfile();
    } catch {
      showToast("error", "Video upload failed."); setVideoStage("preview");
    } finally { setUploadingVideo(false); }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;
    sendMessage(activeChatId, userProfile.id, "TECHNICIAN", typedMessage);
    setTypedMessage("");
  };

  const verStatus = techProfile?.verificationStatus || "NOT_SUBMITTED";
  const totalEarnings = jobLogs.reduce((s, j) => s + j.amount, 0);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-full h-full flex bg-[#0a0f1c] text-slate-100 font-sans overflow-hidden">
      {/* Toast */}
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
      
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ── SIDEBAR ── */}
      <aside className={`absolute md:relative z-40 w-64 h-full bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col shrink-0 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* FIX: Set fixed height h-24 for exact alignment */}
        <div className="h-24 px-6 border-b border-slate-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">Shramik Pro</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5"/></button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3 shadow-inner shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg">
              {userProfile?.name?.substring(0, 2).toUpperCase() || "WK"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{userProfile?.name || "Worker"}</p>
              <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
            </div>
          </div>
          <div className="h-px w-full bg-slate-800" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Status</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-400 border-slate-700'}`}>
              {isOnline ? "ONLINE" : "OFFLINE"}
            </span>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-0">
          {[
            { id: 'profile', icon: User, label: 'Profile & Trust' },
            { id: 'chat', icon: MessageSquare, label: 'Client Workspace', badge: chatRooms.length > 0 },
            { id: 'metrics', icon: BarChart3, label: 'Performance Ledger' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id 
                  ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm" 
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="w-4 h-4" />
                {item.label}
              </div>
              {item.badge && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-xl transition border border-red-500/20">
            <LogOut className="w-4 h-4" /> Secure Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative z-10">
        
        {/* FIX: Set fixed height h-24 for exact alignment with the left sidebar */}
        <header className="shrink-0 h-24 px-6 md:px-10 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white capitalize">{activeTab.replace('-', ' ')}</h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden sm:block">Manage your professional pipeline and trust signals.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 p-1.5 pl-5 rounded-full shadow-inner">
            <span className={`text-xs font-black uppercase tracking-wider hidden sm:block ${isOnline ? "text-emerald-400" : "text-slate-500"}`}>
              {isOnline ? "Discoverable" : "Hidden"}
            </span>
            <button
              onClick={handleToggleOnline}
              disabled={updatingOnline || !isVerified}
              title={!isVerified ? "Verify ID first" : ""}
              className={`relative w-14 h-8 rounded-full transition-all duration-300 outline-none shadow-inner border ${
                isOnline ? "bg-emerald-500/20 border-emerald-500/50" : "bg-slate-950 border-slate-800"
              }`}
            >
              <span className={`absolute top-1 w-6 h-6 rounded-full flex items-center justify-center transition-all duration-400 ${
                isOnline ? "left-[calc(100%-1.75rem)] bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.6)]" : "left-1 bg-slate-600"
              }`}>
                {updatingOnline ? <RefreshCw className="w-3 h-3 text-white animate-spin" /> : isOnline ? <Wifi className="w-3 h-3 text-white" /> : <WifiOff className="w-3 h-3 text-slate-300" />}
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className={`flex-1 w-full flex flex-col h-full min-h-0 ${activeTab === 'chat' ? 'p-4 md:p-6 overflow-hidden' : 'p-6 md:p-10 overflow-y-auto no-scrollbar'}`}>
          <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 h-full">

            {/* ╔════════════ TAB: PROFILE & TRUST ════════════╗ */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease] pb-10">
                <VerificationBanner status={verStatus} />

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  {/* Left Column: ID & Skills */}
                  <div className="space-y-6">
                    {/* ID Upload Bento */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl hover:border-slate-700 transition-colors shrink-0">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center"><Shield className="w-5 h-5 text-indigo-400"/></div>
                          <div><h3 className="text-base font-bold text-white">Identity Document</h3><p className="text-xs text-slate-500">Aadhaar, PAN, Passport</p></div>
                        </div>
                        {techProfile?.idDocumentUrl && <span className="text-xs font-bold px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg flex items-center gap-1"><Check className="w-3 h-3" /> Uploaded</span>}
                      </div>
                      
                      <label onDragOver={e => { e.preventDefault(); setDocDragOver(true); }} onDragLeave={() => setDocDragOver(false)} onDrop={e => { e.preventDefault(); setDocDragOver(false); doUploadDocument(e.dataTransfer.files[0]); }}
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-300 ${docDragOver ? "border-indigo-500 bg-indigo-500/10 scale-[0.98]" : "border-slate-700 bg-slate-950/50 hover:border-indigo-500/50 hover:bg-slate-900"}`}>
                        <input type="file" accept="image/jpeg,image/png" onChange={e => doUploadDocument(e.target.files[0])} className="hidden" disabled={uploadingDoc} />
                        {uploadingDoc ? (
                          <div className="flex flex-col items-center gap-4 py-4">
                            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                            <p className="text-sm text-indigo-400 font-bold">Uploading Securely...</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4"><Upload className="w-6 h-6 text-slate-400"/></div>
                            <p className="text-sm font-bold text-slate-300">Drag & drop ID photo</p>
                            <p className="text-xs text-slate-500 mt-2 text-center max-w-[200px]">JPG or PNG • Max 5MB</p>
                            <div className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition shadow-lg w-full text-center">Browse Files</div>
                          </>
                        )}
                      </label>
                    </div>

                    {/* Skills Bento */}
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shrink-0">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center"><Briefcase className="w-5 h-5 text-amber-400"/></div>
                          <h3 className="text-base font-bold text-white">Service Skills</h3>
                        </div>
                        <span className="text-xs font-bold px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg">{selectedSkills.length} Active</span>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-2 gap-3">
                        {SKILLS_LIST.map(skill => {
                          const active = selectedSkills.includes(skill);
                          const IconComponent = SKILL_ICONS[skill] || Wrench;
                          return (
                            <button key={skill} onClick={() => handleSkillToggle(skill)}
                              className={`flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all duration-200 ${active ? "bg-indigo-600/15 border-indigo-500/50 shadow-md" : "bg-slate-950/50 border-slate-800 hover:border-slate-600"}`}>
                              <IconComponent className={`w-5 h-5 ${active ? "text-indigo-400" : "text-slate-400"}`} />
                              <span className={`text-sm font-bold flex-1 ${active ? 'text-indigo-300' : 'text-slate-400'}`}>{skill}</span>
                              {active && <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Video Pitch Studio */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col min-h-[500px]">
                    <div className="flex items-center justify-between mb-6 shrink-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center"><Video className="w-5 h-5 text-purple-400"/></div>
                        <div><h3 className="text-base font-bold text-white">Video Studio</h3><p className="text-xs text-slate-500">15-Second Intro Pitch</p></div>
                      </div>
                      {techProfile?.videoIntroUrl && videoStage === 'idle' && <span className="text-xs font-bold px-3 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-lg flex items-center gap-1"><Play className="w-3 h-3" /> Live</span>}
                    </div>

                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center p-6 min-h-0">
                      
                      {videoStage === 'idle' && (
                        techProfile?.videoIntroUrl ? (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-6 min-h-0">
                             <div className="w-full flex-1 min-h-0 bg-black rounded-xl border border-slate-700 overflow-hidden relative group">
                               <video src={`${API_BASE_URL}${techProfile.videoIntroUrl}`} className="w-full h-full object-contain opacity-60 group-hover:opacity-100 transition-opacity" controls />
                             </div>
                             <button onClick={() => setVideoStage('select')} className="shrink-0 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700 w-full md:w-auto flex items-center justify-center gap-2">
                               <RotateCcw className="w-4 h-4" /> Replace Pitch
                             </button>
                          </div>
                        ) : (
                          <div className="text-center overflow-y-auto no-scrollbar">
                            <div className="w-20 h-20 rounded-3xl bg-slate-900 border border-slate-700 flex items-center justify-center mx-auto mb-6 shadow-inner"><Camera className="w-10 h-10 text-slate-500"/></div>
                            <h4 className="text-lg font-bold text-white mb-2">No Pitch Uploaded</h4>
                            <p className="text-sm text-slate-400 max-w-sm mx-auto mb-8 leading-relaxed">Customers are 3x more likely to initiate negotiation when they can see a verified video introduction.</p>
                            <button onClick={() => setVideoStage('select')} className="px-8 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2 mx-auto">
                              <Video className="w-5 h-5" /> Open Studio
                            </button>
                          </div>
                        )
                      )}

                      {videoStage === 'select' && (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-8 overflow-y-auto no-scrollbar">
                          <h4 className="text-lg font-bold text-white">Choose Input Method</h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
                            <button onClick={startRecording} className="p-8 rounded-2xl border border-slate-700 bg-slate-900 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all flex flex-col items-center gap-4 group">
                              <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-indigo-500/20 flex items-center justify-center"><Camera className="w-6 h-6 text-slate-400 group-hover:text-indigo-400"/></div>
                              <div><p className="font-bold text-white">Webcam</p><p className="text-xs text-slate-500 mt-1">Record 15s live</p></div>
                            </button>
                            <button onClick={() => uploadFileRef.current?.click()} className="p-8 rounded-2xl border border-slate-700 bg-slate-900 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all flex flex-col items-center gap-4 group">
                              <div className="w-14 h-14 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 flex items-center justify-center"><FolderOpen className="w-6 h-6 text-slate-400 group-hover:text-emerald-400"/></div>
                              <div><p className="font-bold text-white">Upload File</p><p className="text-xs text-slate-500 mt-1">MP4 or WebM</p></div>
                            </button>
                            <input type="file" ref={uploadFileRef} accept="video/*" onChange={e => { setRecordedBlob(e.target.files[0]); setVideoPreviewUrl(URL.createObjectURL(e.target.files[0])); setVideoStage('preview'); }} className="hidden" />
                          </div>
                          <button onClick={() => setVideoStage('idle')} className="text-sm font-bold text-slate-500 hover:text-white transition">Cancel</button>
                        </div>
                      )}

                      {videoStage === 'recording' && (
                        <div className="w-full h-full flex flex-col gap-4 min-h-0">
                          <div className="flex-1 min-h-0 w-full relative rounded-2xl overflow-hidden border border-slate-700 bg-black">
                            <video ref={liveVideoRef} muted playsInline className="w-full h-full object-cover" />
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="bg-slate-950/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl flex flex-col items-center gap-3 border border-slate-800">
                                <CountdownRing value={countdown} max={15} />
                                <span className="text-xs font-bold tracking-widest uppercase text-slate-400">Recording</span>
                              </div>
                            </div>
                            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg text-xs font-bold text-white shadow-lg"><span className="w-2 h-2 bg-white rounded-full animate-pulse" /> LIVE</div>
                          </div>
                          <button onClick={stopRecording} className="shrink-0 w-full py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 text-lg">
                            <StopCircle className="w-6 h-6" /> Stop Recording
                          </button>
                        </div>
                      )}

                      {videoStage === 'preview' && (
                         <div className="w-full h-full flex flex-col gap-4 min-h-0">
                           <div className="flex-1 min-h-0 w-full bg-black rounded-2xl overflow-hidden border border-slate-700">
                             <video src={videoPreviewUrl} controls className="w-full h-full object-contain" />
                           </div>
                           <div className="shrink-0 grid grid-cols-2 gap-4">
                             <button onClick={resetVideo} className="py-4 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2">
                               <RotateCcw className="w-5 h-5" /> Retake
                             </button>
                             <button onClick={submitVideo} className="py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                               <Upload className="w-5 h-5" /> Submit Pitch
                             </button>
                           </div>
                         </div>
                      )}

                      {videoStage === 'uploading' && (
                        <div className="text-center overflow-y-auto no-scrollbar">
                          <RefreshCw className="w-12 h-12 text-indigo-400 animate-spin mx-auto mb-6" />
                          <h4 className="text-xl font-bold text-white">Uploading Securely...</h4>
                          <p className="text-slate-500 mt-2">Encoding video profile for client streaming.</p>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ╔════════════ TAB: CHAT WORKSPACE (Master-Detail) ════════════╗ */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease]">
                
                {/* Master: Chat List */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col min-h-0 h-full bg-slate-950/50 shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
                  
                  {/* ALIGNMENT FIX: Forced height (h-24) to match the right side perfectly */}
                  <div className="h-24 p-5 border-b border-slate-800 shrink-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-white">Active Inquiries</h2>
                    </div>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border w-fit ${connected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                      {connected ? "Secure WebSocket Active" : "Connecting..."}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 no-scrollbar">
                    {chatRooms.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-300">Inbox Empty</p>
                        <p className="text-xs text-slate-500 mt-1">Go Online to receive requests.</p>
                      </div>
                    ) : (
                      chatRooms.map(room => (
                        <button key={room.id} onClick={() => { setActiveChatUser({ id: room.userId, name: room.name }); setActiveChatId(room.id); }}
                          className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${activeChatId === room.id ? 'bg-indigo-600/10 border-indigo-500/50' : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'}`}>
                          <div className="w-12 h-12 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-base shrink-0">
                            {room.name.substring(0,2).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-baseline mb-1">
                              <p className="text-sm font-bold text-white truncate">{room.name}</p>
                              <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0">Active</span>
                            </div>
                            <p className="text-xs text-slate-400 truncate">{room.lastMessage || "Start negotiation..."}</p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Detail: Active Chat */}
                <div className={`flex-1 flex flex-col min-h-0 h-full bg-slate-900/20 relative ${!activeChatId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
                  {!activeChatId ? (
                    <div className="text-center opacity-50 p-6">
                      <MessageSquare className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-lg font-bold text-slate-400">Select an inquiry to view details</p>
                    </div>
                  ) : (
                    <>
                      {/* ALIGNMENT FIX: Forced height (h-24) to match the left side perfectly */}
                      <div className="h-24 px-5 border-b border-slate-800 bg-slate-950/80 backdrop-blur flex items-center justify-between shrink-0">
                        <div className="flex items-center gap-4">
                          <button className="md:hidden p-2 bg-slate-800 rounded-lg text-slate-300 shrink-0" onClick={() => setActiveChatId(null)}>
                            <ChevronRight className="w-5 h-5 rotate-180"/>
                          </button>
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 shrink-0">
                            {activeChatUser?.name?.substring(0,2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <h3 className="text-base font-bold text-white truncate">{activeChatUser?.name}</h3>
                            <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified Client</p>
                          </div>
                        </div>
                      </div>

                      {/* Safety Banner */}
                      {avgPriceForSkill && (
                        <div className="shrink-0 px-5 py-3 bg-indigo-950/40 border-b border-indigo-900/50 flex items-start gap-3 backdrop-blur">
                          <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-indigo-300 leading-relaxed">
                            Market intelligence: Average rate for <strong>{selectedSkills[0] || 'service'}</strong> nearby is <strong className="text-indigo-200">₹{avgPriceForSkill}</strong>. Fair negotiations build better ratings.
                          </p>
                        </div>
                      )}

                      {/* Messages Flow */}
                      <div ref={chatScrollRef} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 no-scrollbar">
                        {chatMessages.length === 0 ? (
                           <div className="text-center text-slate-500 py-10 text-sm font-semibold">Secure connection established. Initiate conversation.</div>
                        ) : (
                          chatMessages.map((msg, idx) => {
                            const isMe = msg.senderId === userProfile?.id;
                            return (
                              <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm"}`}>
                                  <p>{msg.message}</p>
                                  <span className="text-[10px] block text-right mt-2 opacity-60 uppercase font-bold tracking-wider">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Input Area */}
                      <form onSubmit={handleSendMessage} className="shrink-0 p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800 flex gap-3">
                        <input type="text" value={typedMessage} onChange={e => setTypedMessage(e.target.value)} placeholder="Type a message to the client..." className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                        <button type="submit" disabled={!typedMessage.trim()} className="shrink-0 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center shadow-lg">
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ╔════════════ TAB: METRICS & LEDGER ════════════╗ */}
            {activeTab === 'metrics' && (
              <div className="space-y-6 animate-[fadeIn_0.3s_ease] pb-10">
                
                {/* 4 Bento Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: "Lifetime Rating", val: techProfile?.avgRating?.toFixed(2) || "5.00", icon: Star, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20" },
                    { label: "Total Jobs", val: techProfile?.totalJobs || 0, icon: Briefcase, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
                    { label: "Gross Ledger", val: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20" },
                    { label: "Account Status", val: isVerified ? "Verified" : "Pending", icon: Award, color: isVerified ? "text-purple-400" : "text-amber-400", bg: "bg-purple-500/10 border-purple-500/20" }
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col justify-between h-40 hover:border-slate-700 transition">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${stat.bg}`}>
                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-3xl font-black text-white">{stat.val}</p>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Two Col Split */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  {/* Ledger Table */}
                  <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl flex flex-col min-h-[400px]">
                    <div className="flex items-center gap-3 mb-6 shrink-0">
                      <Clock className="w-5 h-5 text-indigo-400" />
                      <h3 className="text-lg font-bold text-white">System Job Ledger</h3>
                    </div>
                    {jobLogs.length === 0 ? (
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-slate-500 font-semibold">Ledger populates post-invoice submission.</p>
                      </div>
                    ) : (
                      <div className="flex-1 overflow-auto no-scrollbar min-h-0">
                        <table className="w-full text-left">
                          <thead className="sticky top-0 bg-slate-900/90 backdrop-blur z-10">
                            <tr className="border-b border-slate-800 text-xs font-bold uppercase tracking-widest text-slate-500">
                              <th className="pb-3 pt-1">Service ID</th>
                              <th className="pb-3 pt-1">Date</th>
                              <th className="pb-3 pt-1 text-right">Amount</th>
                              <th className="pb-3 pt-1 text-right">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/50">
                            {jobLogs.map(job => {
                               const IconCmp = SKILL_ICONS[job.skill] || Wrench;
                               return (
                                <tr key={job.id} className="hover:bg-slate-800/30 transition">
                                  <td className="py-4">
                                    <div className="flex items-center gap-3">
                                      <IconCmp className="w-5 h-5 text-indigo-400" />
                                      <div><p className="font-bold text-white text-sm">{job.skill}</p><p className="text-[10px] text-slate-500">{job.id}</p></div>
                                    </div>
                                  </td>
                                  <td className="py-4 text-xs font-semibold text-slate-400">{job.date}</td>
                                  <td className="py-4 text-right text-sm font-black text-emerald-400">₹{job.amount}</td>
                                  <td className="py-4 text-right"><span className="text-[10px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md uppercase tracking-wide">{job.status}</span></td>
                                </tr>
                               );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Checklist */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl shrink-0 h-fit">
                    <h3 className="text-base font-bold text-white mb-6">Onboarding Trajectory</h3>
                    <div className="space-y-4">
                      {[
                        { label: "Account Registered", done: true },
                        { label: "Identity Verified", done: isVerified },
                        { label: "Video Pitch Configured", done: !!techProfile?.videoIntroUrl },
                        { label: "Service Skills Mapped", done: selectedSkills.length > 0 },
                        { label: "First Invoice Cleared", done: (techProfile?.totalJobs || 0) > 0 }
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-slate-950/50 border border-slate-800/80 rounded-xl">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border shrink-0 ${task.done ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-slate-900 border-slate-700'}`}>
                            {task.done ? <Check className="w-4 h-4" /> : <span className="w-1.5 h-1.5 bg-slate-600 rounded-full" />}
                          </div>
                          <span className={`text-sm font-semibold flex-1 ${task.done ? 'text-slate-300' : 'text-slate-500'}`}>{task.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};

export default TechnicianDashboard;