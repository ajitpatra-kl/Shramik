# Shramik-Profile — Backend
### Spring Boot 3.3 · MongoDB · JWT · WebSocket (STOMP/SockJS)

A high-performance, production-ready RESTful + WebSocket backend for the Shramik hyperlocal service marketplace.

---

## 🏗️ Architecture Overview

```
com.shramik.profile
├── config/
│   ├── MongoConfig.java          — Custom MongoTemplate, suppresses _class field
│   └── WebSocketConfig.java      — STOMP broker + SockJS endpoints
├── controller/
│   ├── AuthController.java       — OTP request + JWT verification
│   ├── GeoController.java        — Technician search, profile CRUD, status toggle
│   ├── ChatController.java       — WebSocket message handler + chat history API
│   ├── PriceController.java      — Price report submission + geoNear average
│   ├── VideoStreamingController.java — HTTP 206 byte-range streaming + file upload
│   └── AdminController.java      — Document audit queue + price ledger management
├── dto/                          — Request/Response transfer objects
├── exception/
│   └── GlobalExceptionHandler.java — Centralized @RestControllerAdvice handler
├── model/                        — MongoDB @Document domain POJOs (Lombok)
├── repository/                   — Spring Data MongoRepository interfaces
├── security/
│   ├── WebSecurityConfig.java    — JWT filter chain, CORS, role-based access
│   ├── AuthTokenFilter.java      — JWT extraction + SecurityContext population
│   ├── JwtUtils.java             — JJWT 0.12.x token generation + validation
│   ├── UserDetailsImpl.java      — UserDetails adapter with ROLE_ prefix
│   └── UserDetailsServiceImpl.java — Loads user by email from MongoDB
└── service/
    ├── AuthService.java          — OTP generation, verification, lazy registration
    ├── EmailService.java         — JavaMailSender with development log fallback
    ├── GeoSearchService.java     — MongoTemplate NearQuery with filtering criteria
    └── VideoStreamingService.java — File storage + ResourceRegion chunked streaming
```

---

## 🚀 Prerequisites

| Dependency | Version | Notes |
|-----------|---------|-------|
| Java (JDK) | 21+ | Required — uses records, text blocks |
| Apache Maven | 3.8+ | Build tool |
| MongoDB | 6.0+ | Must be running on `localhost:27017` |

---

## ⚙️ Configuration

Edit `src/main/resources/application.yml`:

### MongoDB
```yaml
spring.data.mongodb.uri: mongodb://localhost:27017/shramik
spring.data.mongodb.auto-index-creation: true  # Critical for TTL + 2dsphere indexes
```

### JWT Secret
```yaml
app.jwt.secret: "<your-256-bit-base64-key>"  # Generate: openssl rand -base64 32
app.jwt.expiration-ms: 86400000               # 24 hours
```

### Media Storage
```yaml
app.media.upload-dir: "d:/Shramik/CODE/shramik-media"
```
> Directory is auto-created on startup if it doesn't exist.

### SMTP Email (Development)
OTP codes are **printed to the console log** in development — no SMTP server needed.
For production, configure Gmail SMTP in `application.yml`:
```yaml
spring.mail.host: smtp.gmail.com
spring.mail.port: 587
spring.mail.username: your@gmail.com
spring.mail.password: your-16-char-app-password  # Google App Password
spring.mail.properties.mail.smtp.auth: true
spring.mail.properties.mail.smtp.starttls.enable: true
```

---

## 🏃 Running Locally

```bash
# 1. Ensure MongoDB is running
mongod --dbpath /path/to/db

# 2. Start the Spring Boot application
cd shramik-backend
mvn clean spring-boot:run

# Server starts on: http://localhost:8080
```

---

## 🔑 Core Feature Details

### Passwordless OTP Authentication
1. `POST /api/auth/otp/request` → Generates 6-digit code, saves to `otp_tokens` with 5-min TTL
2. `POST /api/auth/otp/verify` → Validates OTP, performs lazy user registration, returns signed JWT
3. New TECHNICIAN users automatically get a `technicians` sub-profile created

### Geospatial Discovery Engine
- Uses MongoDB `NearQuery` with `2dsphere` index on `technicians.location`
- Filters: `isOnline: true`, `verificationStatus: APPROVED`, and optional `skills` match
- Returns results sorted by proximity ascending with distance in km

### HTTP 206 Byte-Range Video Streaming
- `GET /api/video/stream/{filename}` with `Range: bytes=X-Y` header
- Returns `ResourceRegion` (Spring's byte-range abstraction) in 1MB chunks
- Supports HTML5 `<video>` seek/pause/play natively

### STOMP/SockJS WebSocket Chat
- Client connects to `/ws` SockJS endpoint
- Sends to `/app/chat.sendMessage` → `ChatController.sendMessage()`
- Messages persisted to MongoDB + broadcast to `/topic/chat/{chatId}`
- Historical messages: `GET /api/chat/messages/{chatId}`

### Crowdsourced Price Index
- `GET /api/price-reports/average` → `$geoNear` aggregation + `$group` → `$avg`
- Falls back to hardcoded market estimates if no data exists yet
- Price data auto-logged when technician reviews are submitted

### Admin Document Audit Pipeline
- `GET /api/admin/pending-audits` — Technicians with `PENDING` status
- `POST /api/admin/approve/{id}` — Sets `APPROVED` + `isOnline: true`
- `POST /api/admin/reject/{id}` — Sets `REJECTED` + `isOnline: false`
- All admin routes secured with `@PreAuthorize("hasRole('ADMIN')")`

---

## 📦 Key Dependencies

| Dependency | Purpose |
|-----------|---------|
| `spring-boot-starter-data-mongodb` | MongoDB ORM + geo queries |
| `spring-boot-starter-security` | JWT filter chain + role authorization |
| `spring-boot-starter-websocket` | STOMP broker for real-time chat |
| `spring-boot-starter-mail` | OTP email delivery |
| `io.jsonwebtoken:jjwt-*` (0.12.5) | JWT signing + validation |
| `org.projectlombok:lombok` | Boilerplate reduction (POJOs) |
| `spring-boot-starter-validation` | Request body validation (@Valid) |

---

## 🧪 Testing the API

```bash
# 1. Request OTP (check console log for the code in dev mode)
curl -X POST http://localhost:8080/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'

# 2. Verify OTP (replace 123456 with code from console log)
curl -X POST http://localhost:8080/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otpCode":"123456","role":"USER","latitude":12.9716,"longitude":77.5946}'

# 3. Use returned JWT token for authenticated requests
export TOKEN="<jwt-from-response>"

# 4. Search for technicians
curl http://localhost:8080/api/technicians/search?lat=12.9716&lng=77.5946&radiusKm=5&skill=Electrician \
  -H "Authorization: Bearer $TOKEN"
```
