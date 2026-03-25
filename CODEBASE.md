# CODEBASE.md — Project Context

## Project Overview

**Chat App** — A full-stack real-time messaging application.

### Tech Stack

**Backend:**
- **Runtime:** Node.js with TypeScript 5.x
- **Framework:** Express 5.x
- **Database:** PostgreSQL
- **Caching:** Redis
- **Real-time:** Socket.io (WebSocket)
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Zod
- **Logging:** Pino
- **Testing:** Jest + Supertest
- **Migrations:** node-pg-migrate

**Frontend:**
- **Framework:** Vue.js 3 + Quasar Framework
- **Build Tool:** Vite
- **Routing:** Vue Router 5
- **State Management:** Pinia

### Backend Architecture

The project follows **Clean Architecture** principles with **DDD** elements:

```
src/
├── index.ts                    # Entry point
├── server.ts                   # HTTP & WebSocket server startup
├── app.ts                      # Express & routes configuration
├── container.ts                # DI Container
├── database.ts                 # PostgreSQL connection
├── modules/
│   ├── authentification/       # Authentication (JWT, middleware)
│   ├── chat/                   # Chat functionality
│   │   ├── domain/             # Domain entities (Conversation, Message, Participant)
│   │   ├── application/        # Use cases
│   │   ├── controllers/        # HTTP controllers
│   │   ├── repositories_pg_realization/  # PostgreSQL repositories
│   │   ├── web_socket/         # WebSocket gateway
│   │   ├── DTO/                # Data Transfer Objects
│   │   └── shared/             # Module shared utilities
│   ├── users/                  # User management
│   │   ├── domain/             # User, Email, Password, Username
│   │   ├── application/        # Use cases
│   │   ├── controllers/        # HTTP controllers
│   │   ├── repositories/       # Repositories (Reader/Writer)
│   │   ├── ports/              # Repository interfaces
│   │   ├── DTO/                # Data Transfer Objects
│   │   └── errors/             # Domain errors
│   ├── infrasctructure/        # Infrastructure layer
│   │   └── ports/
│   │       ├── bcrypter/       # Password hashing
│   │       ├── cache_service/  # Redis client
│   │       ├── transaction_manager/  # Transaction management
│   │       └── email_verif_infra/    # Email verification
│   ├── middlewares/            # Express middleware
│   └── error_mapper/           # DB error mapping
└── errors_base/                # Base error classes
```

### Module Structure (Pattern)

Each business module follows a unified structure:
- **domain/** — Domain entities with encapsulated business logic (Value Objects, Entities)
- **application/** — Use cases (orchestrating business logic)
- **controllers/** — HTTP controllers (request handling)
- **repositories/** — Repository implementations for DB operations
- **ports/** — Interfaces (contracts)
- **DTO/** — Data Transfer Objects
- **shared/** — Module shared utilities
- **errors/** — Module-specific errors

---

## Build and Run

### Backend

```bash
# Install dependencies
npm install

# Development (hot-reload)
npm run dev

# Build TypeScript → dist/
npm run build

# Production start
npm start

# Database migrations
npm run migrate

# Tests
npm test                # Run once
npm run test:watch      # Watch mode
npm run test:ci         # For CI (sequential)
```

### Frontend (frontend-chat/)

```bash
cd frontend-chat

# Install dependencies
pnpm install

# Development
pnpm dev       # or quasar dev

# Production build
pnpm build     # or quasar build

# Linting
pnpm lint

# Formatting
pnpm format

# Type checking
pnpm typecheck
```

### Environment Variables

Create a `.env` file in the project root. Expected variables:
- `PORT` — Server port (default: 3000)
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL` — Redis connection string
- `JWT_SECRET` — Secret for signing JWT tokens

---

## API Endpoints

### Public Routes (`/public`)

| Method | Path | Description |
|-------|------|----------|
| GET | `/health` | Health check |
| POST | `/register` | User registration |
| POST | `/resend-register` | Resend verification |
| POST | `/login-email` | Login via email |
| POST | `/login-username` | Login via username |
| GET | `/verify-email` | Email verification |
| GET | `/confirm-email-change` | Confirm email change |
| POST | `/refresh` | Token refresh |

### Private Routes (`/private`) — Requires Authentication

**Users:**
- `GET /me` — Current user profile
- `PATCH /change-email` — Change email
- `PATCH /change-password` — Change password
- `PATCH /change-username` — Change username
- `PATCH /toggle-status` — Toggle account activity
- `GET /search-users` — Search users
- `GET /user/:targetId/view` — User profile view

**User Blocking:**
- `PATCH /user/:targetId/block_user` — Block user
- `PATCH /user/:targetId/unblock_user` — Unblock user
- `GET /user/black_list` — Get blacklist

**Conversations:**
- `POST /direct-conv/:targetId/create` — Create direct chat
- `POST /group-conv/create` — Create group chat
- `GET /conversations` — User's conversation list
- `PATCH /conversation/:conversationId/title` — Update title
- `GET /search-conversations` — Search conversations

**Messages:**
- `GET /conversation/:conversationId/messages` — Get messages
- `GET /conversation/:conversationId/:messageId/view` — Get specific message

**Participants:**
- `GET /conversation/:conversationId/participants` — Get participants
- `POST /conversation/:conversationId/join` — Join conversation
- `DELETE /conversation/:conversationId/leave` — Leave conversation
- `PATCH /conversation/:conversationId/:targetId/role` — Change role
- `PATCH /conversation/:conversationId/:targetId/mute` — Mute participant
- `DELETE /conversation/:conversationId/:targetId/kick` — Kick participant

---

## WebSocket Events (Socket.io)

### Outgoing (frontend → backend)

| Event | Params | Description |
|---------|-----------|----------|
| `conversation:join` | `{ conversationId }` | Join room |
| `conversation:leave` | `{ conversationId }` | Leave room |
| `message:send` | `{ conversationId, content }` | Send message |
| `message:edit` | `{ conversationId, messageId, newContent }` | Edit message |
| `message:delete` | `{ conversationId, messageId }` | Delete message |
| `message:read` | `{ conversationId, messageId }` | Mark as read |
| `typing:start` | `{ conversationId }` | Typing started |
| `typing:stop` | `{ conversationId }` | Typing stopped |

### Incoming (backend → frontend)

| Event | Params | Description |
|---------|-----------|----------|
| `message:new` | `Message` | New message |
| `message:edited` | `{ message: Message }` | Message edited |
| `message:deleted` | `{ message: Message }` | Message deleted |
| `message:read` | `{ conversationId, messageId, userId }` | Message read |
| `typing:start` | `{ conversationId, userId, username }` | User typing start |
| `typing:stop` | `{ conversationId, userId, username }` | User typing stop |
| `user:online` | `{ userId }` | User online |
| `user:offline` | `{ userId }` | User offline |
| `error` | `{ message }` | Error (e.g., blocked) |

---

## Development Rules

### Coding Style

1. **TypeScript strict mode** — Enabled.
2. **Value Objects** — Primitive concepts (Email, Password, Username) are encapsulated in classes with validation.
3. **Domain Entities** — Contain business logic and state transition methods.
4. **Dependency Injection** — Dependencies are passed via constructor (DI container in `container.ts`).
5. **Repository Pattern** — Separation into Reader and Writer interfaces.
6. **Error Handling** — Specialized error classes inheriting from base classes.
7. **Message Sorting** — Messages are fetched with `ORDER BY created_at DESC` for the initial load and `ASC` for pagination, displayed with old at top and new at bottom.

---

## Frontend (frontend-chat/)

### Structure

```
frontend-chat/
├── src/                  # Source code
│   ├── api/              # API Clients
│   │   ├── apis/         # API methods
│   │   ├── fetch/        # HTTP client (fetchJson)
│   │   └── types/        # TypeScript types
│   ├── components/       # Vue components
│   ├── layouts/          # Layout components
│   ├── pages/            # Pages
│   ├── router/           # Routing
│   ├── services/         # Services (WebSocket)
│   └── stores/           # Pinia stores
├── public/               # Static assets
├── quasar.config.ts      # Quasar configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies and scripts
```

### Recent Features & UX

- **User Cache:** `UserCacheStore` caches user data to avoid redundant API calls for displaying usernames.
- **Participant Management:** `ParticipantListDialog` allows owners to manage roles, mute, and kick participants.
- **Blocking System:** Users can block/unblock each other. In direct chats, if one party is blocked, input is disabled.
- **Blacklist Page:** A dedicated page to manage blocked users.
- **Telegram-style UI:** Sorting of messages and block indicators follow modern chat app conventions.

---

## Database Schema

Main tables:
- **users** — User accounts.
- **email_verification_tokens** — For email verification.
- **refresh_tokens** — For JWT session management.
- **conversations** — Both direct and group chats.
- **conversation_participants** — Maps users to conversations with roles and mute status.
- **messages** — Chat messages.
- **conversation_reads** — Tracks read status.
- **user_to_user_blocks** — Tracks who blocked whom.

---

## License

MIT License (Copyright © 2026 vpro3611)
