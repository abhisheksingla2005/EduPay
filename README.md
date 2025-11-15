# EduPay

Role-based educational assistance platform connecting Students, Donors, and Admins. Built with Node.js, Express, MongoDB (Mongoose), EJS, JWT, Socket.io **and Redis caching**.

## Features
- Authentication (register/login/logout) with JWT in httpOnly cookie
- Roles: student, donor, admin
- Student: create requests, view/update/delete, dashboard metrics
- Donor: view open requests, donate (mock), live updates via Socket.io, donation history
- Admin: read-only overview dashboard (placeholder)
- EJS views with Bootstrap 5 and express-ejs-layouts
- Real-time notifications when students create requests and when requests get updated

## Getting Started

### Requirements
- Node.js 18+
- MongoDB running at `mongodb://localhost:27017/edupay` (default)
- Redis (optional but recommended) running at `redis://localhost:6379` or a hosted URL

### Setup
1. Copy `.env.example` to `.env` and adjust if needed.
2. Install dependencies using your preferred package manager.

Using pnpm (recommended):

```powershell
pnpm install
```

Using npm:

```powershell
npm install
```

### Run

```powershell
node server.js
```

or with auto-reload in development:

```powershell
pnpm dev
```

App will be available at http://localhost:8080 (default PORT now 8080)

### Default Environment
```
PORT=8080
MONGO_URI=mongodb://localhost:27017/edupay
JWT_SECRET=change_this_secret
REDIS_URL=redis://localhost:6379
NODE_ENV=development
```

## Folder Structure
```
config/          -> MongoDB connection
controllers/     -> auth, student, donor, admin controllers
middleware/      -> auth, role-based, error handlers
models/          -> User, Request, Donation, Payment
routes/          -> route files per role
utils/           -> token helpers, async handler, roles
public/          -> CSS/JS static assets
views/           -> EJS templates (layouts, auth, student, donor, admin, errors)
server.js        -> Entrypoint with Express + Socket.io
```

## Notes
- JWT stored in httpOnly cookie named `token`.
- Socket.io rooms: users join `students` or `donors` room based on meta tag included in layout; server emits updates accordingly.
- Payments are mocked via `Payment` model as a placeholder.
- Redis caching:
	- Student dashboard (totals + recent requests) cached for 60s under key `student:dashboard:<id>`.
	- Donor open requests list cached for 30s (no search query) under key `donor:dashboard:open`.
	- Cache automatically invalidated on request create/update/delete and on donations.
	- If Redis is unreachable the app continues without caching (graceful fallback).

## Next Steps / Enhancements
- Add request verification workflow for admins
- Add real payment gateway
- Add form validation library and flash messaging middleware
- Add pagination and richer filtering for donor dashboard
- Add rate limiting (Redis) for donations & request creation
- Add cache bust pattern scanning if keys grow
