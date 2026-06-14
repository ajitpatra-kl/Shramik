import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api, { API_BASE_URL } from '../services/api';
import {
  Search, MessageSquare, Calendar, MapPin, LogOut, Loader2, Sparkles, X,
  CheckSquare, Star, Play, Pause, Volume2, VolumeX, Send, IndianRupee,
  ChevronRight, SlidersHorizontal, Shield, CheckCircle2, TrendingUp, Clock,
  RotateCcw, User as UserIcon, Menu, AlertCircle, FileText,
  // Professional Vector Icons
  Zap, Droplets, Hammer, Paintbrush, Snowflake, Flame, BrickWall, LayoutGrid, Wrench
} from 'lucide-react';

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS & CONFIG
// ─────────────────────────────────────────────────────────────────────────────
const SERVICES = [
  { id: 'Electrician',   icon: Zap,         label: 'Electrician',   color: 'yellow' },
  { id: 'Plumber',       icon: Droplets,    label: 'Plumber',       color: 'blue'   },
  { id: 'Carpenter',     icon: Hammer,      label: 'Carpenter',     color: 'amber'  },
  { id: 'Painter',       icon: Paintbrush,  label: 'Painter',       color: 'purple' },
  { id: 'AC Technician', icon: Snowflake,   label: 'AC Technician', color: 'cyan'   },
  { id: 'Welder',        icon: Flame,       label: 'Welder',        color: 'orange' },
  { id: 'Mason',         icon: BrickWall,   label: 'Mason',         color: 'stone'  },
  { id: 'Tiler',         icon: LayoutGrid,  label: 'Tiler',         color: 'slate'  },
];

const SERVICE_ACTIVE_CLS = {
  yellow: 'bg-yellow-500/10 border-yellow-500/60 text-yellow-300',
  blue:   'bg-blue-500/10 border-blue-500/60 text-blue-300',
  amber:  'bg-amber-500/10 border-amber-500/60 text-amber-300',
  purple: 'bg-purple-500/10 border-purple-500/60 text-purple-300',
  cyan:   'bg-cyan-500/10 border-cyan-500/60 text-cyan-300',
  orange: 'bg-orange-500/10 border-orange-500/60 text-orange-300',
  stone:  'bg-stone-500/10 border-stone-400/60 text-stone-300',
  slate:  'bg-slate-500/10 border-slate-400/60 text-slate-300',
};

function useDebouncedValue(value, delay = 450) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const InlineVideo = ({ url }) => {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);

  return (
    <div className="relative w-full h-full bg-black rounded-xl overflow-hidden group border border-slate-800">
      <video
        ref={videoRef}
        src={`${API_BASE_URL}${url}`}
        muted={muted}
        loop
        playsInline
        controls
        preload="metadata"
        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {playing && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-red-600/90 px-2 py-1 
          rounded-md text-[10px] font-black text-white pointer-events-none shadow-lg">
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
          LIVE PITCH
        </div>
      )}
    </div>
  );
};

const BookingModal = ({ isOpen, onClose, tech, userId, onBookingSubmit }) => {
  const [requestedDate, setRequestedDate] = useState("");
  const [requestedTime, setRequestedTime] = useState("10:00");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!requestedDate || !description.trim()) { setError("Please fill in all required fields"); return; }
    setSubmitting(true); setError(null);
    try {
      const dateTimeString = `${requestedDate}T${requestedTime}:00`;
      const response = await api.post("/api/bookings", {
        technicianId: tech.technician.id, description: description.trim(), requestedDate: dateTimeString,
      });
      if (response.status === 201 || response.status === 200) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false); onClose(); setRequestedDate(""); setRequestedTime("10:00"); setDescription("");
        }, 2000);
      }
    } catch (err) { setError(err.response?.data?.error || "Failed to create booking"); } 
    finally { setSubmitting(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease]">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center font-bold text-indigo-400 text-sm">
              {tech.user?.name?.substring(0, 2).toUpperCase() || "T"}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Book Service</h3>
              <p className="text-xs text-slate-400">{tech.user?.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
              <h4 className="text-xl font-bold text-white mb-2">Booking Requested!</h4>
              <p className="text-sm text-slate-400">Your request has been forwarded securely.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2"><Calendar className="w-3.5 h-3.5 inline mr-1.5" />Preferred Date</label>
                <input type="date" value={requestedDate} onChange={(e) => setRequestedDate(e.target.value)} min={new Date().toISOString().split("T")[0]} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm" required />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2"><Clock className="w-3.5 h-3.5 inline mr-1.5" />Preferred Time</label>
                <input type="time" value={requestedTime} onChange={(e) => setRequestedTime(e.target.value)} className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2"><FileText className="w-3.5 h-3.5 inline mr-1.5" />Work Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the scope of work..." className="w-full px-4 py-3 bg-slate-950 border border-slate-800 text-white placeholder-slate-600 rounded-xl focus:outline-none focus:border-indigo-500 transition text-sm resize-none h-24" required />
              </div>
              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}
              <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
                <div className="flex items-center justify-between text-sm mb-2"><span className="text-slate-400">Technician Rate:</span><span className="font-bold text-white">₹{tech.technician?.pricePerHour || "N/A"}/hour</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-slate-400">Current Rating:</span><span className="font-bold text-yellow-400 flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-current" />{(tech.technician?.avgRating || 4.8).toFixed(1)}</span></div>
              </div>
              <button type="submit" disabled={submitting} className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25">
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Calendar className="w-4 h-4" /> Request Booking</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

const ProfileCard = ({ technician, user, distanceInKm, avgPrice, onChat }) => {
  const hasVideo = !!technician.videoIntroUrl;
  const rating = technician.avgRating || 4.8;
  const fullStars = Math.round(rating);

  return (
    <div className="glass-card rounded-3xl border border-slate-800/80 overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10">
      <div className="flex flex-col lg:flex-row">
        <div className="w-full lg:w-[420px] h-[280px] lg:h-[380px] shrink-0 bg-slate-950 relative p-4">
          {hasVideo ? (
            <InlineVideo url={technician.videoIntroUrl} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center font-black text-slate-300 text-3xl shadow-inner">
                {(user?.name || 'T').substring(0, 2).toUpperCase()}
              </div>
              <p className="text-sm text-slate-500 font-semibold tracking-wide uppercase">No video pitch</p>
            </div>
          )}
        </div>
        <div className="flex-1 p-6 lg:p-8 flex flex-col justify-between min-w-0 bg-slate-900/40">
          <div>
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-black text-white text-2xl lg:text-3xl truncate tracking-tight">{user?.name || 'Technician'}</h3>
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {(technician.skills || []).slice(0, 4).map(s => (
                    <span key={s} className="text-[11px] font-bold uppercase tracking-wider bg-slate-800 px-3 py-1 rounded-md border border-slate-700 text-slate-300">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              {technician.verificationStatus === 'APPROVED' && (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
                  <Shield className="w-4 h-4" /> Verified
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6 py-5 border-y border-slate-800/60">
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < fullStars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                  ))}
                </div>
                <p className="text-sm font-black text-white mt-2">{rating.toFixed(1)}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Rating</p>
              </div>
              <div className="text-center">
                <div className="text-xl font-black text-white">{technician.totalJobs || 0}</div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Jobs Done</p>
              </div>
              <div className="text-center sm:text-right">
                <div className="flex items-center justify-center sm:justify-end gap-1.5 text-lg font-black text-indigo-400">
                  <MapPin className="w-4 h-4" />{distanceInKm} km
                </div>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold mt-0.5">Distance</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap mb-8">
              {technician.pricePerHour && (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                  <IndianRupee className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-sm text-emerald-300 font-bold">{technician.pricePerHour}/hr</span>
                </div>
              )}
              {avgPrice && (
                <div className="flex items-center gap-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl">
                  <TrendingUp className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-400 font-medium">Market avg: <strong className="text-white">₹{avgPrice}</strong></span>
                </div>
              )}
            </div>
          </div>
          <button onClick={() => onChat(user, technician)} className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 border border-indigo-500">
            <MessageSquare className="w-5 h-5" /> Initiate Negotiation
          </button>
        </div>
      </div>
    </div>
  );
};

const FeedbackModal = ({ booking, onClose, onSubmit }) => {
  const [amountPaid, setAmountPaid] = useState('');
  const [stars, setStars] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setSubmitting(true);
    await onSubmit({ amountPaid: parseFloat(amountPaid) || 0, rating: stars, comment });
    setSubmitting(false); onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[60] p-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-[slideUp_0.3s_ease]">
        <div className="px-6 py-5 border-b border-slate-800 flex items-start justify-between bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white">Rate Service</h3>
            <p className="text-xs text-slate-500 mt-0.5">{booking?.techName} · {booking?.skill}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Final Payment (₹)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400">₹</span>
              <input type="number" value={amountPaid} onChange={e => setAmountPaid(e.target.value)} placeholder="0.00" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3.5 text-white text-sm focus:outline-none focus:border-indigo-500 transition" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Rating</label>
            <div className="flex gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800 w-fit">
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} type="button" onClick={() => setStars(s)} className="p-1.5 hover:scale-110 transition">
                  <Star className={`w-8 h-8 ${s <= stars ? 'fill-yellow-400 text-yellow-400' : 'text-slate-700'}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-2">Public Review</label>
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Describe your experience..." className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 resize-none transition" />
          </div>
          <button onClick={handleSubmit} disabled={submitting} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />} Submit Rating
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// MAIN DASHBOARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
const CustomerDashboard = () => {
  const { userProfile, gpsCoordinates, logout } = useAuth();
  const { stompClient, connected, sendMessage } = useSocket();

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('search');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [neighborhood, setNeighborhood] = useState('Detecting location...');

  // Search State
  const [radius, setRadius] = useState(5);
  const [selectedService, setSelectedService] = useState('Electrician');
  const [locality, setLocality] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const debouncedLocality = useDebouncedValue(locality, 450);
  const debouncedMinPrice = useDebouncedValue(minPrice, 450);
  const debouncedMaxPrice = useDebouncedValue(maxPrice, 450);
  const debouncedRadius = useDebouncedValue(radius, 250);

  const [technicians, setTechnicians] = useState([]);
  const [loadingTechs, setLoadingTechs] = useState(false);
  const [avgPrice, setAvgPrice] = useState(null);

  // Chat State (Master-Detail)
  const [chatRooms, setChatRooms] = useState([]);
  const [activeChatUser, setActiveChatUser] = useState(null);
  const [activeChatTechObj, setActiveChatTechObj] = useState(null);
  const [activeChatId, setActiveChatId] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [typedMessage, setTypedMessage] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const chatScrollRef = useRef(null);

  // Bookings State
  const [bookings, setBookings] = useState([
    { id: '1', technicianId: 'mock1', techName: 'Ramesh Kumar', skill: 'Electrician', status: 'Active',    date: 'Today, 2:00 PM' },
    { id: '2', technicianId: 'mock2', techName: 'Suresh Patil', skill: 'Plumber',     status: 'Completed', date: 'Yesterday' },
  ]);
  const [bookingsTab, setBookingsTab] = useState('active');
  const [feedbackTarget, setFeedbackTarget] = useState(null);

  // ── Initialization & Data Fetching ─────────────────────────────────────────
  useEffect(() => {
    if (!gpsCoordinates) return;
    const ctrl = new AbortController();
    fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${gpsCoordinates.lat}&lon=${gpsCoordinates.lng}`, { signal: ctrl.signal })
      .then(r => r.json())
      .then(data => {
        const addr = data?.address || {};
        setNeighborhood(addr.neighbourhood || addr.suburb || addr.town || addr.city || 'Your area');
      }).catch(() => setNeighborhood('Your area'));
    return () => ctrl.abort();
  }, [gpsCoordinates]);

  const fetchTechnicians = useCallback(async () => {
    if (!gpsCoordinates) return;
    setLoadingTechs(true);
    try {
      const res = await api.get('/api/technicians/nearby', {
        params: {
          lng: gpsCoordinates.lng, lat: gpsCoordinates.lat, radiusKm: debouncedRadius, skill: selectedService,
          locality: debouncedLocality || undefined, minPrice: debouncedMinPrice || undefined, maxPrice: debouncedMaxPrice || undefined,
        }
      });
      setTechnicians(res.data);
    } catch { setTechnicians([]); } 
    finally { setLoadingTechs(false); }
  }, [gpsCoordinates, debouncedRadius, selectedService, debouncedLocality, debouncedMinPrice, debouncedMaxPrice]);

  const fetchAveragePrice = useCallback(async () => {
    if (!gpsCoordinates || !selectedService) return;
    try {
      const res = await api.get('/api/price-reports/average', {
        params: { serviceType: selectedService, lng: gpsCoordinates.lng, lat: gpsCoordinates.lat, radiusKm: 10 }
      });
      setAvgPrice(res.data.avgPrice);
    } catch { setAvgPrice(null); }
  }, [gpsCoordinates, selectedService]);

  useEffect(() => { if (gpsCoordinates) { fetchTechnicians(); fetchAveragePrice(); } }, [fetchTechnicians, fetchAveragePrice, gpsCoordinates]);

  // ── Chat WebSocket Logic ───────────────────────────────────────────────────
  useEffect(() => {
    if (!connected) return;
    api.get("/api/chat/rooms").then(res => setChatRooms(res.data || [])).catch(() => {});
  }, [connected, activeTab]);

  useEffect(() => {
    let sub;
    if (activeChatId && stompClient && connected) {
      api.get(`/api/chat/messages/${activeChatId}`).then(r => setChatMessages(r.data)).catch(console.error);
      sub = stompClient.subscribe(`/topic/chat/${activeChatId}`, (frame) => {
        const b = JSON.parse(frame.body);
        setChatMessages(p => [...p, b]);
        setChatRooms(prev => {
          if (prev.some(room => room.id === b.chatId)) return prev;
          return [{ id: b.chatId, name: b.senderName || "Technician", lastMessage: b.message, timestamp: b.timestamp }, ...prev];
        });
      });
    }
    return () => sub?.unsubscribe();
  }, [activeChatId, stompClient, connected]);

  useEffect(() => {
    if (chatScrollRef.current) chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const handleOpenChat = (techUser, techObj) => {
    setActiveTab('chat');
    setActiveChatUser(techUser);
    setActiveChatTechObj(techObj);
    const roomId = [userProfile.id, techUser.id].filter(Boolean).sort().join("_");
    setActiveChatId(roomId);
    
    setChatRooms(prev => {
      if (prev.some(r => r.id === roomId)) return prev;
      return [...prev, { id: roomId, name: techUser.name, skill: (techObj.skills || [])[0] || 'Technician', user: techUser, technician: techObj }];
    });
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!typedMessage.trim() || !activeChatId) return;
    sendMessage(activeChatId, userProfile.id, "USER", typedMessage);
    setTypedMessage("");
  };

  const handleFeedbackSubmit = async ({ amountPaid, rating, comment }) => {
    await api.post('/api/price-reports/review', { technicianId: feedbackTarget?.technicianId, rating, amountPaid, comments: comment }).catch(console.error);
    fetchAveragePrice();
  };

  const selectedServiceObj = SERVICES.find(s => s.id === selectedService);
  const activeBookings = bookings.filter(b => b.status === 'Active');
  const completedBookings = bookings.filter(b => b.status === 'Completed');

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 w-full h-full flex bg-[#0a0f1c] text-slate-100 font-sans overflow-hidden">
      
      {/* Ambient Glow */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* ── SIDEBAR ── */}
      <aside className={`absolute md:relative z-40 w-64 h-full bg-slate-950/90 backdrop-blur-2xl border-r border-slate-800/80 flex flex-col shrink-0 transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-24 px-6 border-b border-slate-800/60 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-black text-xl tracking-tight text-white">Shramik Client</span>
          </div>
          <button className="md:hidden text-slate-400" onClick={() => setMobileMenuOpen(false)}><X className="w-5 h-5"/></button>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-6 bg-slate-900/80 border border-slate-800 rounded-2xl flex flex-col gap-3 shadow-inner shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-black text-indigo-400 text-lg">
              {userProfile?.name?.substring(0, 2).toUpperCase() || "US"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-white truncate">{userProfile?.name || "Client"}</p>
              <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
            </div>
          </div>
          <div className="h-px w-full bg-slate-800" />
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
            <MapPin className="w-3 h-3 text-emerald-400" /> {neighborhood}
          </div>
        </div>

        <nav className="flex-1 px-4 mt-6 flex flex-col gap-2 overflow-y-auto no-scrollbar min-h-0">
          {[
            { id: 'search', icon: Search, label: 'Discover Pros' },
            { id: 'chat', icon: MessageSquare, label: 'Active Chats', badge: chatRooms.length > 0 },
            { id: 'bookings', icon: Calendar, label: 'Service Bookings' }
          ].map(item => (
            <button key={item.id} onClick={() => { setActiveTab(item.id); setMobileMenuOpen(false); }}
              className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === item.id ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-sm" : "text-slate-400 hover:bg-slate-900 hover:text-slate-200 border border-transparent"
              }`}>
              <div className="flex items-center gap-3"><item.icon className="w-4 h-4" />{item.label}</div>
              {item.badge && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800/60 shrink-0">
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-slate-500 bg-slate-900 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition border border-transparent hover:border-red-500/20">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 flex flex-col h-full min-h-0 min-w-0 overflow-hidden relative z-10">
        
        {/* Top Header */}
        <header className="shrink-0 h-24 px-6 md:px-10 flex items-center justify-between border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-xl z-20">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-white capitalize">{activeTab === 'search' ? 'Discover Pros' : activeTab.replace('-', ' ')}</h1>
              <p className="text-xs md:text-sm text-slate-400 mt-1 hidden sm:block">
                {activeTab === 'search' ? 'Find verified experts in your neighborhood.' : 
                 activeTab === 'chat' ? 'Negotiate securely in real-time.' : 'Manage your service schedule.'}
              </p>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center gap-3 bg-slate-900/80 border border-slate-800/80 p-2 pl-4 rounded-full shadow-inner">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Security</span>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-xs font-bold">
              <Shield className="w-3.5 h-3.5" /> Trusted
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className={`flex-1 w-full flex flex-col h-full min-h-0 ${activeTab === 'chat' ? 'p-4 md:p-6 overflow-hidden' : 'p-6 md:p-10 overflow-y-auto no-scrollbar'}`}>
          <div className="max-w-[1400px] mx-auto w-full flex-1 flex flex-col min-h-0 h-full">

            {/* ╔════════════ TAB: SEARCH ════════════╗ */}
            {activeTab === 'search' && (
              <div className="flex flex-col lg:flex-row gap-8 pb-10">
                
                {/* Left: Filters */}
                <aside className="w-full lg:w-80 shrink-0 space-y-6">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 backdrop-blur-xl">
                    <h3 className="text-base font-bold text-white mb-6">Discovery Filters</h3>
                    
                    {/* Proximity */}
                    <div className="mb-6">
                      <div className="flex justify-between items-center mb-3">
                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> Radius</span>
                        <span className="text-sm font-black text-indigo-400">{radius} km</span>
                      </div>
                      <input type="range" min="1" max="20" value={radius} onChange={e => setRadius(parseInt(e.target.value))} className="w-full h-1.5 bg-slate-800 rounded-full appearance-none cursor-pointer accent-indigo-500" />
                    </div>

                    {/* Category */}
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">Service Type</span>
                      <div className="grid grid-cols-2 gap-2">
                        {SERVICES.map(svc => {
                          const active = selectedService === svc.id;
                          const IconCmp = svc.icon;
                          return (
                            <button key={svc.id} onClick={() => setSelectedService(svc.id)}
                              className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all duration-200 ${
                                active ? 'bg-indigo-600/15 border-indigo-500/50 shadow-md text-indigo-300' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                              }`}>
                              <IconCmp className={`w-6 h-6 ${active ? 'text-indigo-400' : ''}`} />
                              <span className="text-[10px] font-bold tracking-wide">{svc.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">Hourly Rate (₹)</span>
                      <div className="flex gap-2">
                        <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="Min" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none" />
                        <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="Max" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-sm text-white focus:border-indigo-500 outline-none" />
                      </div>
                    </div>

                    {/* Locality */}
                    <div>
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-500 block mb-3">Area</span>
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input type="text" value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Indiranagar" className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:border-indigo-500 outline-none" />
                      </div>
                    </div>
                  </div>
                </aside>

                {/* Right: Results */}
                <div className="flex-1 min-w-0 space-y-6">
                  {/* Header Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                        {selectedServiceObj && <selectedServiceObj.icon className="w-5 h-5 text-indigo-400" />}
                      </div>
                      <div>
                        <h2 className="text-sm font-bold text-white uppercase tracking-widest">{selectedService}s</h2>
                        <p className="text-xs text-slate-500">{technicians.length} professionals found</p>
                      </div>
                    </div>
                    {avgPrice && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-bold text-emerald-400">
                        <TrendingUp className="w-4 h-4" /> Market Avg: ₹{avgPrice}/hr
                      </div>
                    )}
                  </div>

                  {/* Grid */}
                  {loadingTechs ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 bg-slate-900/20 border border-slate-800/50 rounded-3xl border-dashed">
                      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                      <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Scanning local grid...</p>
                    </div>
                  ) : technicians.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 bg-slate-900/20 border border-slate-800/50 rounded-3xl border-dashed text-center px-4">
                      {selectedServiceObj && <selectedServiceObj.icon className="w-16 h-16 text-slate-700 mb-4" />}
                      <h3 className="text-xl font-bold text-white mb-2">No professionals found</h3>
                      <p className="text-sm text-slate-500 max-w-sm mb-6">Expand your radius or adjust pricing filters to discover more workers.</p>
                      <button onClick={fetchTechnicians} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition border border-slate-700">
                        <RotateCcw className="w-4 h-4" /> Refresh Grid
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {technicians.map(({ technician, user, distanceInKm }) => (
                        <ProfileCard key={technician.id} technician={technician} user={user} distanceInKm={distanceInKm} avgPrice={avgPrice} onChat={handleOpenChat} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ╔════════════ TAB: CHAT (MASTER-DETAIL) ════════════╗ */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col md:flex-row min-h-0 h-full w-full bg-slate-900/40 border border-slate-800/80 rounded-3xl backdrop-blur-xl overflow-hidden shadow-2xl animate-[fadeIn_0.3s_ease]">
                
                {/* Master: Chat List */}
                <div className={`w-full md:w-80 lg:w-96 border-r border-slate-800 flex flex-col min-h-0 h-full bg-slate-950/50 shrink-0 ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
                  
                  <div className="h-24 p-5 border-b border-slate-800 shrink-0 flex flex-col justify-center">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-white">Active Negotiations</h2>
                    </div>
                    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold border w-fit ${connected ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-slate-800 border-slate-700 text-slate-400"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-500"}`} />
                      {connected ? "Secure Connection Active" : "Connecting..."}
                    </div>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto min-h-0 p-3 space-y-2 no-scrollbar">
                    {chatRooms.length === 0 ? (
                      <div className="text-center py-10 px-4">
                        <MessageSquare className="w-10 h-10 text-slate-700 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-300">Inbox Empty</p>
                        <p className="text-xs text-slate-500 mt-1">Initiate a chat from a worker's profile.</p>
                      </div>
                    ) : (
                      chatRooms.map(room => (
                        <button key={room.id} onClick={() => { setActiveChatUser(room.user); setActiveChatTechObj(room.technician); setActiveChatId(room.id); }}
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
                      <p className="text-lg font-bold text-slate-400">Select a conversation</p>
                    </div>
                  ) : (
                    <>
                      {/* Chat Header */}
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
                            <p className="text-xs text-emerald-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Verified Pro</p>
                          </div>
                        </div>
                        {/* Book Now Button in Header */}
                        <button onClick={() => setShowBookingModal(true)} className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-600/20">
                          <Calendar className="w-4 h-4" /> Book Service
                        </button>
                      </div>

                      {/* Safety Banner */}
                      {avgPrice && (
                        <div className="shrink-0 px-5 py-3 bg-indigo-950/40 border-b border-indigo-900/50 flex items-start gap-3 backdrop-blur">
                          <TrendingUp className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-indigo-300 leading-relaxed">
                            Market intelligence: Average rate for this service nearby is <strong className="text-indigo-200">₹{avgPrice}</strong>. Agree on a final price here before booking.
                          </p>
                        </div>
                      )}

                      {/* Messages Flow */}
                      <div ref={chatScrollRef} className="flex-1 overflow-y-auto min-h-0 p-6 space-y-4 no-scrollbar">
                        {chatMessages.length === 0 ? (
                           <div className="text-center text-slate-500 py-10 text-sm font-semibold">Secure connection established. Outline your task.</div>
                        ) : (
                          chatMessages.map((msg, idx) => {
                            const isMe = msg.senderId === userProfile?.id;
                            return (
                              <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[85%] sm:max-w-[75%] px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${isMe ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-slate-800 border border-slate-700 text-slate-200 rounded-tl-sm"}`}>
                                  <p>{msg.message || msg.content}</p>
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
                      <div className="shrink-0 p-4 bg-slate-950/80 backdrop-blur border-t border-slate-800">
                        {/* Mobile Book Button */}
                        <button onClick={() => setShowBookingModal(true)} className="sm:hidden w-full mb-3 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white text-sm font-bold rounded-xl shadow-lg">
                          <Calendar className="w-4 h-4" /> Book Service
                        </button>
                        <form onSubmit={handleSendMessage} className="flex gap-3">
                          <input type="text" value={typedMessage} onChange={e => setTypedMessage(e.target.value)} placeholder="Message technician..." className="flex-1 w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-3.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition" />
                          <button type="submit" disabled={!typedMessage.trim()} className="shrink-0 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition flex items-center justify-center shadow-lg">
                            <Send className="w-5 h-5" />
                          </button>
                        </form>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ╔════════════ TAB: BOOKINGS ════════════╗ */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 max-w-4xl mx-auto pb-10">
                <div className="flex bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800/80">
                  {[
                    { id: 'active', label: 'Active Jobs', count: activeBookings.length },
                    { id: 'completed', label: 'History', count: completedBookings.length }
                  ].map(t => (
                    <button key={t.id} onClick={() => setBookingsTab(t.id)} className={`flex-1 py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 ${bookingsTab === t.id ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}>
                      {t.label} <span className={`text-[10px] px-2 py-0.5 rounded-full ${bookingsTab === t.id ? 'bg-white/20' : 'bg-slate-800'}`}>{t.count}</span>
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookingsTab === 'active' && (
                    activeBookings.length === 0 ? (
                      <div className="md:col-span-2"><EmptyBookingsState text="No active bookings." /></div>
                    ) : activeBookings.map(b => (
                      <div key={b.id} className="glass-card p-6 rounded-3xl border border-slate-800/80 flex flex-col h-full">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-white text-lg">{b.techName}</h3>
                            <p className="text-xs text-indigo-400 font-bold uppercase tracking-wider mt-1">{b.skill}</p>
                          </div>
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-lg border bg-amber-500/10 text-amber-400 border-amber-500/25 uppercase tracking-widest">{b.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400 mb-8 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                          <Clock className="w-4 h-4 text-indigo-400" /> {b.date}
                        </div>
                        <button onClick={() => { setBookings(p => p.map(x => x.id === b.id ? { ...x, status: 'Completed' } : x)); setFeedbackTarget(b); }} className="mt-auto w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl transition shadow-lg shadow-emerald-600/20">
                          <CheckSquare className="w-5 h-5" /> Mark Job Complete
                        </button>
                      </div>
                    ))
                  )}

                  {bookingsTab === 'completed' && (
                    completedBookings.length === 0 ? (
                      <div className="md:col-span-2"><EmptyBookingsState text="No job history." /></div>
                    ) : completedBookings.map(b => (
                      <div key={b.id} className="glass-card p-6 rounded-3xl border border-slate-800/80 flex flex-col h-full opacity-70 hover:opacity-100 transition">
                        <div className="flex justify-between items-start mb-6">
                          <div>
                            <h3 className="font-bold text-white text-lg line-through decoration-slate-600">{b.techName}</h3>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-1">{b.skill}</p>
                          </div>
                          <span className="text-[10px] font-black px-3 py-1.5 rounded-lg border bg-emerald-500/10 text-emerald-500 border-emerald-500/25 uppercase tracking-widest">{b.status}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <Clock className="w-4 h-4" /> {b.date}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </main>

      {/* Booking Modal Overlay */}
      {showBookingModal && activeChatTechObj && (
        <BookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          tech={{ user: activeChatUser, technician: activeChatTechObj }}
          userId={userProfile?.id}
          onBookingSubmit={() => setShowBookingModal(false)}
        />
      )}

      {/* Feedback Modal Overlay */}
      {feedbackTarget && (
        <FeedbackModal
          booking={feedbackTarget}
          onClose={() => setFeedbackTarget(null)}
          onSubmit={handleFeedbackSubmit}
        />
      )}
    </div>
  );
};

const EmptyBookingsState = ({ text }) => (
  <div className="flex flex-col items-center justify-center py-20 bg-slate-900/20 border border-slate-800/50 rounded-3xl border-dashed text-center">
    <Calendar className="w-12 h-12 text-slate-700 mb-4" />
    <p className="text-base font-bold text-slate-400">{text}</p>
  </div>
);

export default CustomerDashboard;