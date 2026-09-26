# EventsPlatform — Event Management Application

A full-stack event management platform built with a **NestJS + Prisma + PostgreSQL** backend and a **Next.js 14 (App Router) + TypeScript + Tailwind CSS** frontend.

---

## 🌟 Key Features

- 🔐 **Dual-Token Authentication**: Secure JWT Access (`15m`) and Refresh Tokens (`7d`) stored in HTTP-only state with automatic 401 token refresh interceptors.
- 📅 **Event Discovery & Filtering**: Search events by title or description, filter by location, sort by **Newest First** / **Oldest First**, and navigate with server pagination.
- ⚡ **Concurrency-Safe Registrations**: PostgreSQL row-level locking (`FOR UPDATE`) prevents oversubscription when thousands of users click **Join Event** at the exact same microsecond.
- 🎨 **Modern Responsive UI**: Interactive Tailwind CSS components, custom modal confirmation dialogs for Sign Out and Event Deletion, password visibility toggles, and skeleton loaders.
- 🔄 **Optimistic UI Updates**: Instant RSVP state toggles powered by TanStack Query, featuring automatic cache purging on user session changes.
- 📊 **User Workspace Dashboard**: Dedicated workspace displaying **"My Created Events"** and **"My Joined RSVPs"**.
- 📖 **Swagger OpenAPI Specs**: Interactive API documentation at `http://localhost:3000/api/docs`.

---

## 🏗️ Tech Stack

### **Backend (`/backend`)**
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Authentication**: Passport.js & JWT (`@nestjs/jwt`, `bcrypt`)
- **Validation**: `class-validator` & `class-transformer`
- **Testing**: Jest unit testing suite

### **Frontend (`/frontend`)**
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Lucide Icons
- **State & Data Fetching**: TanStack Query (React Query) & Axios
- **Form Handling**: React Hook Form & Zod schema validation

---

## 📋 Prerequisites

Before running the project on your machine, ensure you have the following installed:
- **Node.js**: `v18.x`, `v20.x`, or higher
- **npm**: `v9.x` or higher
- **Docker Desktop** (or a local PostgreSQL instance)
- **Git**

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/event-management.git
cd event-management
```

---

### 2. Start PostgreSQL Database
Start the PostgreSQL container via Docker Compose:
```bash
docker compose up -d
```
> **Note**: Database runs at `localhost:5432` with database name `events_db`.

---

### 3. Setup Backend (`/backend`)

1. **Navigate to the backend folder**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env` file in the `backend/` directory by copying `.env.example`:
   ```bash
   cp .env.example .env
   ```

   Ensure your `.env` contains the required keys:
   ```env
   NODE_ENV=development
   PORT=3000
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/events_db?schema=public"
   JWT_ACCESS_SECRET="your-access-secret-32-chars-min"
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_SECRET="your-refresh-secret-32-chars-min"
   JWT_REFRESH_EXPIRES_IN=7d
   CORS_ORIGIN=*
   THROTTLE_TTL=60
   THROTTLE_LIMIT=100
   ```

4. **Run Prisma Migrations**:
   - **Production Deployment**: `npx prisma migrate deploy`
   - **Local Prototyping**: `npx prisma db push`

5. **Start the Backend API Server**:
   ```bash
   npm run start:dev
   ```
   - **REST API Base URL**: `http://localhost:3000/api/v1`
   - **Swagger OpenAPI Docs**: `http://localhost:3000/api/docs`

---

### 4. Setup Frontend (`/frontend`)

1. **Open a new terminal and navigate to the frontend folder**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file in the `frontend/` directory by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

   Verify `.env.local` content:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
   ```

4. **Start the Frontend Development Server**:
   ```bash
   npm run dev
   ```
   - **Frontend App URL**: `http://localhost:3001`

---

## 🧪 Running Unit Tests

### Backend Unit Tests
To execute the backend Jest unit test suite:
```bash
cd backend
npm test
```

To run test coverage reports:
```bash
npm run test:cov
```

---

## 🌐 API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/v1/auth/register` | Register a new user account | ❌ |
| `POST` | `/api/v1/auth/login` | Authenticate user & receive tokens | ❌ |
| `POST` | `/api/v1/auth/refresh` | Obtain new access token via refresh token | ❌ |
| `POST` | `/api/v1/auth/logout` | Revoke session & invalidate refresh token | ✅ |
| `GET` | `/api/v1/auth/me` | Fetch currently authenticated user profile | ✅ |
| `GET` | `/api/v1/events` | List events (supports search, location, sort & pagination) | ❌ |
| `POST` | `/api/v1/events` | Create a new event | ✅ |
| `GET` | `/api/v1/events/:id` | Get event details by ID | ❌ |
| `PATCH` | `/api/v1/events/:id` | Update event (Creator only) | ✅ |
| `DELETE` | `/api/v1/events/:id` | Delete event (Creator only) | ✅ |
| `POST` | `/api/v1/events/:id/attendees` | Join / RSVP for an event | ✅ |
| `DELETE` | `/api/v1/events/:id/attendees` | Cancel attendance / Leave event | ✅ |
| `GET` | `/api/v1/events/:id/attendees` | List registered attendees for an event | ❌ |

---

## 📁 Repository Directory Structure

```text
event-management/
├── backend/                  # NestJS API Server
│   ├── prisma/               # Prisma Database Schema & Migrations
│   ├── src/
│   │   ├── attendees/        # RSVPs & Concurrency Management
│   │   ├── auth/             # JWT Authentication & Strategies
│   │   ├── common/           # Exception Filters & Interceptors
│   │   ├── database/         # Prisma Database Module
│   │   ├── events/           # Events CRUD & Query Filtering
│   │   └── main.ts           # NestJS Entry Point
│   └── tsconfig.json
├── frontend/                 # Next.js 14 Web Application
│   ├── src/
│   │   ├── app/              # App Router Pages & Layouts
│   │   ├── components/       # UI Components & Modals
│   │   ├── lib/              # Axios Client & Helper Utilities
│   │   ├── providers/        # Auth & TanStack Query Contexts
│   │   └── types/            # TypeScript Interface Definitions
│   └── tsconfig.json
├── docker-compose.yml        # PostgreSQL Docker Service
└── README.md                 # Project Documentation
```

---

## 📄 License

This project is licensed under the MIT License.
