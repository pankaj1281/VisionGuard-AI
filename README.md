# VisionGuard AI — AI Image Detection Web Application

A **production-ready**, full-stack web application that determines whether an uploaded image is real or AI-generated with high accuracy, using the [Sightengine](https://sightengine.com) AI detection API.

---

## 🖥️ Live Features

| Feature | Description |
|---|---|
| **AI Detection** | Real Sightengine API — not a mock |
| **Confidence Score** | Animated progress bar with % score |
| **Drag & Drop Upload** | With file preview and validation |
| **Dark / Light Mode** | Toggle with persistence |
| **Multi-Language** | English 🇬🇧 + Hindi 🇮🇳 |
| **User Auth** | JWT-based register / login |
| **Dashboard** | Analysis history with filter & delete |
| **Admin Panel** | User management, ban/unban, platform stats |
| **Toast Notifications** | Animated feedback for every action |
| **Rate Limiting** | Per-IP limits on API and detection routes |
| **Security** | API keys never exposed to frontend |

---

## 🗂️ Project Structure

```
VisionGuard-AI/
├── frontend/               # Static HTML/CSS/JS frontend
│   ├── index.html          # Main upload page
│   ├── dashboard.html      # User history dashboard
│   ├── admin.html          # Admin panel
│   ├── css/
│   │   └── styles.css      # Custom styles (supplements Tailwind)
│   └── js/
│       ├── i18n.js         # Internationalisation (EN + HI)
│       ├── main.js         # Upload logic, auth modal, theme
│       ├── dashboard.js    # History, stats, filters
│       └── admin.js        # User management, platform stats
│
├── backend/                # Node.js + Express API
│   ├── server.js           # Express app entry point
│   ├── package.json
│   ├── config/
│   │   └── db.js           # MongoDB connection
│   ├── models/
│   │   ├── User.js         # User schema (bcrypt, JWT)
│   │   └── Detection.js    # Detection result schema
│   ├── middleware/
│   │   ├── auth.js         # JWT middleware (requireAuth, optionalAuth, requireAdmin)
│   │   ├── rateLimiter.js  # Per-IP rate limiting
│   │   └── fileValidation.js  # MIME type + size validation
│   ├── routes/
│   │   ├── auth.js         # POST /register, POST /login, GET /me
│   │   ├── detect.js       # POST /detect (Sightengine integration)
│   │   ├── dashboard.js    # GET /history, GET /stats, DELETE /history/:id
│   │   └── admin.js        # GET /users, PUT /ban, GET /detections, GET /stats
│   └── tests/
│       └── api.test.js     # Jest + Supertest integration tests
│
└── config/
    └── .env.example        # Environment variable template
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas) — optional for persistence)
- [Sightengine](https://sightengine.com) API credentials (free tier available)

---

### 1. Clone the repository

```bash
git clone https://github.com/pankaj1281/VisionGuard-AI.git
cd VisionGuard-AI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

### 3. Configure environment variables

```bash
cp config/.env.example backend/.env
```

Edit `backend/.env` and fill in:

```env
PORT=5000
FRONTEND_URL=http://localhost:5000

# MongoDB (leave blank to run without persistence)
MONGODB_URI=mongodb://localhost:27017/visionguard

# JWT secret (use a long random string)
JWT_SECRET=your-long-random-secret-here

# Sightengine API — get free keys at https://sightengine.com
SIGHTENGINE_API_USER=your_api_user
SIGHTENGINE_API_SECRET=your_api_secret
```

> **Getting Sightengine keys:**
> 1. Sign up at [sightengine.com](https://sightengine.com) (free tier: 2,000 operations/month)
> 2. Go to Dashboard → API Keys
> 3. Copy your `api_user` and `api_secret`

### 4. (Optional) Rebuild Tailwind CSS

The pre-built `frontend/css/tailwind.css` is included in the repository. If you modify the HTML or add new Tailwind classes, rebuild it:

```bash
# Install Tailwind CLI globally
npm install -g @tailwindcss/cli

# Rebuild from the frontend directory
cd frontend
tailwindcss -i input.css -o css/tailwind.css --content "./index.html,./dashboard.html,./admin.html,./js/*.js"
```

### 5. Run the server

```bash
# Development (with auto-reload)
cd backend && npm run dev

# Production
cd backend && npm start
```

The server starts on **http://localhost:5000** and serves the frontend automatically.

Open your browser at: **http://localhost:5000**

---

## 🧪 Running Tests

```bash
cd backend
npm test
```

Tests cover:
- Health endpoint
- File validation (missing file, invalid type, API key check)
- Auth routes (missing fields → 400, unauthenticated routes → 401)
- Admin protection (401 without token)

---

## 🔐 Security Highlights

- **API keys** stored in `.env` — never exposed to the browser
- **Images processed in memory** — never written to disk
- **Rate limiting** on all routes (global 100/15min, detection 20/15min)
- **File validation** on both frontend (client-side) and backend (middleware)
- **JWT** for authentication with banned-user checks on every request
- **bcrypt** (12 rounds) for password hashing

---

## 🌐 API Reference

### Detection
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/detect` | Optional | Analyse an uploaded image |

**Request:** `multipart/form-data` with field `image`

**Response:**
```json
{
  "result": "AI Generated",
  "confidence": 94,
  "aiScore": 0.9423,
  "realScore": 0.0577,
  "signals": ["AI-generated patterns detected", "Strong AI synthesis artifacts present"],
  "detectionId": "..."
}
```

### Auth
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login, receive JWT |
| GET | `/api/auth/me` | Required | Get current user |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/dashboard/history` | Required | Paginated history (`?filter=ai\|real`) |
| DELETE | `/api/dashboard/history/:id` | Required | Delete a record |
| GET | `/api/dashboard/stats` | Required | User stats |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/users` | Admin | List all users |
| PUT | `/api/admin/users/:id/ban` | Admin | Ban a user |
| PUT | `/api/admin/users/:id/unban` | Admin | Unban a user |
| GET | `/api/admin/detections` | Admin | All detections |
| GET | `/api/admin/stats` | Admin | Platform statistics |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, Tailwind CSS (CDN), Vanilla JavaScript |
| Backend | Node.js, Express.js |
| Database | MongoDB via Mongoose |
| AI API | [Sightengine](https://sightengine.com) (genai model) |
| Auth | JSON Web Tokens (JWT) + bcryptjs |
| File processing | Multer + Sharp (compression) |
| Rate limiting | express-rate-limit |
| Testing | Jest + Supertest |

---

## 📸 Screenshots

| Page | Description |
|---|---|
| `index.html` | Upload page with drag & drop, dark mode |
| `dashboard.html` | Analysis history with stats cards |
| `admin.html` | Admin panel with user management |
