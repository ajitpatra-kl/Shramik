# 🛠️ Shramik-Profile
## Hyperlocal On-Demand Skill Marketplace

A full-stack, production-ready marketplace connecting customers with verified local service technicians (plumbers, electricians, carpenters, painters) in real time.

---

## Workspace Structure

```
d:\Shramik\CODE\
├── shramik-frontend/    — React 19 + Vite 8 + TailwindCSS PWA
└── shramik-backend/     — Spring Boot 3.3 + MongoDB + JWT + WebSocket
```

---

## 🚀 Quick Start

### 1. Start MongoDB
```bash
mongod --dbpath /path/to/your/db
# MongoDB must be running on localhost:27017
```

### 2. Start Backend
```bash
cd shramik-backend
mvn clean spring-boot:run
# Starts on http://localhost:8080
```

### 3. Start Frontend
```bash
cd shramik-frontend
npm install  # first time only
npm run dev
# Opens on http://localhost:5173
```

---

## 🏛️ Core Architecture

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 19, Vite 8, TailwindCSS 3 | Mobile-first PWA UI |
| API | Spring Boot 3.3, Spring Security | RESTful JSON API |
| Real-time | STOMP over SockJS | WebSocket chat |
| Database | MongoDB 6+ | Geospatial + TTL indexing |
| Auth | Passwordless OTP + JWT | Stateless authentication |
| Media | Spring ResourceRegion | HTTP 206 byte-range streaming |

---

## 🔑 Core Features

| Feature | Implementation |
|---------|---------------|
| **Passwordless Auth** | 6-digit OTP via `spring-boot-starter-mail` → 5-min TTL index in MongoDB → JWT |
| **Geospatial Engine** | MongoDB `2dsphere` index + `NearQuery` filtered by online status + verification |
| **Video Streaming** | HTTP 206 `ResourceRegion` byte-range chunks → Native HTML5 `<video>` seek/play |
| **Real-time Chat** | STOMP/SockJS → in-memory broker → async MongoDB persistence → topic broadcast |
| **Price Indexing** | Post-job crowdsourced amounts → `$geoNear` + `$avg` aggregation pipeline |
| **Admin Pipeline** | Document upload → PENDING status → Admin review → APPROVED/REJECTED visibility |

---

## 👥 User Roles

| Role | Access |
|------|--------|
| `USER` (Customer) | Search technicians, chat, submit reviews and price reports |
| `TECHNICIAN` | Manage profile, upload ID/video, toggle online status, receive chats |
| `ADMIN` | Document audit queue, approve/reject accounts, purge price anomalies |

---

## 📁 Detailed Documentation

- [`shramik-backend/README.md`](./shramik-backend/README.md) — API docs, config, curl examples
- [`shramik-frontend/README.md`](./shramik-frontend/README.md) — Design system, component guide, run instructions

---

## 🔒 Security Notes

- JWT secret in `application.yml` is a **development placeholder** — replace before production
- Admin routes protected with `@PreAuthorize("hasRole('ADMIN')")` on controller class
- CORS configured to allow all origins in development — restrict in production
- Video streaming endpoint is public (no auth) for standard HTML5 video compatibility
- OTP tokens auto-expire via MongoDB TTL index (5 minutes)

---

## 🗄️ MongoDB Collections

| Collection | Description |
|-----------|-------------|
| `users` | User accounts with GeoJSON location (2dsphere indexed) |
| `technicians` | Technician profiles linked to users (2dsphere indexed) |
| `otp_tokens` | Temporary OTP codes (TTL: 5 minutes, auto-deleted) |
| `chat_messages` | Persisted chat messages indexed by chatId |
| `price_reports` | Crowdsourced service pricing data (2dsphere indexed) |
