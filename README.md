# BuildConnect 🏗️

**The professional marketplace and network for construction engineers.**

A full-stack platform connecting civil, structural, MEP engineers, architects, and quantity surveyors with clients and companies — powered by Django, Next.js, PostgreSQL, and real-time WebSockets.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Python 3.12+

### 1. Clone and configure

```bash
git clone https://github.com/your-org/buildconnect.git
cd buildconnect

# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your credentials

# Frontend environment  
cp frontend/.env.local.example frontend/.env.local
# Edit frontend/.env.local
```

### 2. Start with Docker (recommended)

```bash
docker compose up --build
```

Services will be available at:
- Frontend:  http://localhost (via Nginx)
- API:       http://localhost/api/
- API Docs:  http://localhost/api/docs/
- Admin:     http://localhost/admin/
- RabbitMQ:  http://localhost:15672

### 3. Local development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements/development.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

**Celery worker** (separate terminal):
```bash
celery -A config worker -l info
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

---

## 🧱 Tech Stack

| Layer         | Technology                                      |
|---------------|-------------------------------------------------|
| Backend       | Django 5 + Django REST Framework                |
| Auth          | SimpleJWT + django-allauth (Google OAuth)       |
| Realtime      | Django Channels + Redis (WebSocket)             |
| Task Queue    | Celery + RabbitMQ                               |
| Database      | PostgreSQL 16 (full-text search + geo indexing) |
| Cache         | Redis                                           |
| File Storage  | AWS S3 / Cloudinary                             |
| Frontend      | Next.js 14 (App Router) + TypeScript            |
| Styling       | Tailwind CSS + Radix UI                         |
| State         | Zustand + TanStack Query                        |
| Payments      | Stripe (checkout + escrow + webhooks)           |
| Email         | SendGrid                                        |
| Deployment    | Docker + Nginx + GitHub Actions CI/CD           |
| Monitoring    | Sentry                                          |

---

## 📁 Project Structure

```
buildconnect/
├── backend/               # Django API
│   ├── config/            # Settings, URLs, ASGI
│   ├── apps/
│   │   ├── users/         # Auth, JWT, registration
│   │   ├── profiles/      # Engineer & client profiles
│   │   ├── projects/      # Marketplace, bids, milestones
│   │   ├── messaging/     # Chat (WebSocket consumers)
│   │   ├── reviews/       # Ratings & moderation
│   │   ├── payments/      # Stripe escrow
│   │   ├── notifications/ # In-app + email (Celery)
│   │   ├── search/        # Full-text + geo search
│   │   └── analytics/     # Engineer & admin dashboards
│   └── core/              # Permissions, pagination, storage
├── frontend/              # Next.js App Router
│   ├── app/               # Pages (auth, dashboard, admin)
│   ├── components/        # UI components
│   ├── lib/               # API clients, hooks, Zustand store
│   └── types/             # Global TypeScript types
├── nginx/                 # Nginx config (SSL, WebSocket, rate limit)
├── .github/workflows/     # CI/CD pipeline
└── docker-compose.yml
```

---

## 🔑 Key API Endpoints

| Method | Endpoint                           | Description              |
|--------|------------------------------------|--------------------------|
| POST   | `/api/auth/register/`              | Register new user        |
| POST   | `/api/auth/login/`                 | JWT token pair           |
| GET    | `/api/engineers/`                  | List/filter engineers    |
| GET    | `/api/engineers/{slug}/`           | Engineer profile         |
| POST   | `/api/projects/`                   | Post a project           |
| POST   | `/api/projects/{id}/bids/`         | Submit a bid             |
| PATCH  | `/api/bids/{id}/`                  | Accept/reject bid        |
| POST   | `/api/payments/checkout/`          | Create Stripe session    |
| POST   | `/api/webhooks/stripe/`            | Stripe webhook           |
| GET    | `/api/search/engineers/?q=...`     | Full-text + geo search   |
| WS     | `ws://host/ws/chat/{room_id}/`     | Real-time chat           |
| WS     | `ws://host/ws/notifications/`      | Push notifications       |

Full interactive docs at `/api/docs/` (Swagger UI).

---

## 🔐 User Roles

- **Engineer** — Create profile, showcase portfolio, bid on projects, receive payments
- **Client** — Post projects, search engineers, hire & pay via milestones
- **Admin** — Verify engineers, moderate content, view platform analytics

---

## 💳 Payments & Escrow

1. Client creates a milestone and pays via Stripe Checkout
2. Funds are held in escrow (`status = held`)
3. Stripe webhook confirms payment → `Payment.status = 'held'`
4. On project completion, client releases the milestone
5. Engineer receives net amount (gross minus platform commission)
6. Platform commission is configurable via `PLATFORM_COMMISSION_PERCENT` env var

---

## 🌐 WebSocket Events

**Chat** (`ws/chat/{room_id}/`):
```json
// Send
{ "content": "Hello!", "file_url": "", "file_name": "" }

// Receive
{ "id": 1, "sender_name": "John", "content": "Hello!", "sent_at": "2025-01-01T10:00:00Z" }
```

**Notifications** (`ws/notifications/`):
```json
{ "id": 1, "type": "bid_received", "title": "New bid on your project", "body": "...", "link": "/projects/5" }
```

---

## 🚀 Production Deployment

See the [CI/CD workflow](.github/workflows/deploy.yml).  
Ensure these secrets are set in GitHub:

```
SERVER_HOST, SERVER_USER, SSH_PRIVATE_KEY, SERVER_PORT,
SLACK_WEBHOOK (optional)
```

The workflow: runs tests → lints → builds → SSH deploys → health checks.

---

## 🌟 Unique Feature: Blueprint Room

An in-browser collaborative annotation layer where engineers and clients open DWG/PDF drawings inside the chat, annotate in real-time, tag cost estimates, and export an annotated PDF brief — the Figma for construction drawings.

Implementation: S3 storage → pdf.js renderer → Fabric.js canvas → WebSocket delta broadcast → `DrawingAnnotation` model in PostgreSQL.

---

## 📈 Scaling Path

1. **Read replicas** — Add PostgreSQL read replica for GET-heavy profile/search queries
2. **Full-text search** — Replace PG FTS with Typesense at 50k+ engineers
3. **Media CDN** — Cloudflare R2 + eager Cloudinary transforms
4. **Cache** — Per-profile 60s Redis cache, invalidated on save signals
5. **WebSockets** — Horizontal Channels scaling via Redis pub/sub cluster
6. **Partitioning** — Monthly partitions on `messages` and `profile_views` tables

---

## 📄 License

MIT © BuildConnect
