# Shramik-Profile — Frontend
### React 19 · Vite 8 · TailwindCSS 3 · STOMP WebSockets · Axios

A high-performance, mobile-first Progressive Web App (PWA) for the Shramik hyperlocal service marketplace.

---

## 🏗️ Project Structure

```
shramik-frontend/src
├── context/
│   ├── AuthContext.jsx     — JWT state, profile hydration, GPS detection
│   └── SocketContext.jsx   — STOMP/SockJS client lifecycle + sendMessage()
├── services/
│   └── api.js              — Axios instance with JWT interceptor + 401 logout
├── components/
│   ├── Gateway.jsx         — Passwordless OTP auth (email input + 6-digit split OTP)
│   └── Onboarding.jsx      — Profile completion form (name, phone, coordinates)
├── dashboards/
│   ├── CustomerDashboard.jsx    — Home/Search + Chat + Bookings (mobile PWA layout)
│   ├── TechnicianDashboard.jsx  — Profile/Upload + Chat + Metrics (worker layout)
│   └── AdminDashboard.jsx       — Document Audits + Price Ledger (desktop console)
├── App.jsx                 — Root router (splash → gateway → onboarding → dashboard)
├── App.css                 — Intentionally minimal; all styles in index.css
├── index.css               — Premium design system (glass cards, animations, slider)
└── main.jsx                — React root mount + SockJS global polyfill
```

---

## 🚀 Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| Node.js | 18+ | Required for Vite 8 |
| npm | 9+ | Package manager |

---

## ⚙️ Configuration

The API base URL is configured in `src/services/api.js`:
```js
const API_BASE_URL = 'http://localhost:8080'; // Spring Boot backend
```

---

## 🏃 Running Locally

```bash
# 1. Install dependencies (first time only)
cd shramik-frontend
npm install

# 2. Start the Vite development server
npm run dev

# App available at: http://localhost:5173
```

> **Important**: The Spring Boot backend must be running on port 8080 before using the app.

---

## 🎨 Design System

### Color Palette
| Token | Hex | Usage |
|-------|-----|-------|
| `slate-950` | `#030712` | Primary background |
| `slate-900` | `#0f172a` | Card/panel backgrounds |
| `slate-850` | `#14213d` | Intermediate panels |
| `slate-800` | `#1e293b` | Borders, dividers |
| `indigo-600` | `#4f46e5` | Primary accent, CTAs |
| `indigo-400` | `#818cf8` | Text accents, labels |
| `emerald-500` | `#10b981` | Online status, success |

### Typography
- **Primary**: Inter (300–900 weights)
- **Display**: Plus Jakarta Sans (400–800 weights)
- **Rendering**: Anti-aliased across all platforms

### Reusable CSS Classes (index.css)
| Class | Purpose |
|-------|---------|
| `.glass-card` | Glassmorphism panels with blur + border |
| `.glass-card-hover` | Hover lift + border glow transition |
| `.premium-gradient-text` | Slate → indigo gradient text |
| `.btn-primary` | Premium button with shine overlay |
| `.status-dot-online` | Animated pulse dot for online status |
| `.skeleton-shimmer` | Loading skeleton animation |
| `.modal-overlay` / `.modal-content` | Fade/slide-up modal animations |
| `.message-bubble` | Chat bubble pop-in animation |

---

## 📱 Application Flow

```
User visits /
    ↓
App.jsx checks auth state
    ├── loading=true     → SplashLoader (animated brand screen)
    ├── no token         → Gateway (OTP email auth)
    ├── incomplete profile → Onboarding (name/phone/location)
    └── authenticated    → Role-based Dashboard
                             ├── USER      → CustomerDashboard
                             ├── TECHNICIAN → TechnicianDashboard
                             └── ADMIN     → AdminDashboard
```

---

## 🔌 Key Features

### Gateway (OTP Auth)
- Email input + Role selection (Customer / Technician)
- Sends OTP → smooth state transition to 6-digit split OTP input
- 60-second animated countdown resend link
- Auto-focuses next digit input on entry

### Customer Dashboard
- **Proximity Slider**: Custom-styled range input (1-10km) with real-time technician reload
- **Category Grid**: Service type selector with live crowdsourced price badges
- **Technician Cards**: Profile initials, skills badges, distance, star rating, Watch Intro + Chat buttons
- **Video Modal**: Native HTML5 `<video>` with HTTP 206 streaming (`autoPlay`, `controls`)
- **WebSocket Chat**: STOMP subscription per chatId, safety price banner, scroll-to-bottom
- **Bookings**: Mock booking list with completion → review modal
- **Review Modal**: Star selector, price input (logs price index), text feedback

### Technician Dashboard
- **Online Toggle**: Instantly syncs `isOnline` to DB; disabled until APPROVED
- **Verification Banner**: Color-coded (Red/Yellow/Green) for each verification state
- **Document Upload**: Drag-and-drop zone → POST multipart → sets PENDING status
- **Video Recorder**: HTML5 MediaRecorder API with 15s countdown; fallback file picker
- **Skills Grid**: Toggle-based skill selection, synced to DB on each click

### Admin Dashboard
- **Document Audits**: Table view of PENDING technicians with ID document side panel
- **Approve/Reject**: Binary actions with real API calls
- **Price Ledger**: Global transaction table with admin purge capability

---

## 📦 Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `react` | 19.x | UI framework |
| `@vitejs/plugin-react` | 6.x | Vite + React HMR |
| `tailwindcss` | 3.x | Utility CSS |
| `axios` | 1.x | HTTP client with interceptors |
| `@stomp/stompjs` | 7.x | STOMP protocol client |
| `sockjs-client` | 1.x | SockJS transport layer |
| `lucide-react` | 1.x | Premium icon set |
