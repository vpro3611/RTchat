# CODEBASE.md — Architecture & Engineering Context

This document serves as the comprehensive architectural and engineering guide for the **RTChat** application. It outlines the design patterns, domain models, directory structures, and API contracts utilized across the stack.

---

## 🏛 Architectural Principles

RTChat is built upon **Clean Architecture** and **Domain-Driven Design (DDD)** principles. The goal is to enforce a strict separation of concerns, ensuring that the core business logic remains isolated from external frameworks, databases, and UI components.

### Core Tenets
1. **Dependency Rule:** Source code dependencies can only point inward. The Domain layer knows nothing about the Application layer, and the Application layer knows nothing about the Infrastructure or Presentation layers.
2. **Encapsulation:** Primitive concepts (e.g., Email, Password, Username) are encapsulated within strictly validated **Value Objects**.
3. **Rich Entities:** Domain Entities contain state and the behavior that transitions that state. Anemic domain models are avoided.
4. **Interface Adapters:** Repositories and external services are defined via interfaces (Ports) in the Domain or Application layers, and implemented in the Infrastructure layer.

---

## 🏗 Backend Architecture

### Directory Structure
```text
src/
├── index.ts                    # Application entry point
├── server.ts                   # HTTP & WebSocket server bootstrap
├── app.ts                      # Express configuration & routing map
├── container.ts                # Dependency Injection (DI) Container
├── database.ts                 # PostgreSQL connection pool
├── modules/
│   ├── authentification/       # Auth domain (JWT, Google OAuth 2, login, registration)
│   ├── chat/                   # Core messaging domain
│   │   ├── domain/             # Entities (Conversation, Message, Participant)
│   │   ├── application/        # Use Cases (Send Message, Create Group)
│   │   ├── controllers/        # HTTP Handlers
│   │   ├── repositories_pg_realization/ # PostgreSQL Adapters
│   │   ├── web_socket/         # Socket.io Gateway & Event Handlers
│   │   ├── infrasctructure/    # Sub-infrastructure (e.g., ClamAV scanner)
│   │   └── shared/             # Domain-specific utilities
│   ├── users/                  # User profile and relationship domain
│   ├── infrasctructure/        # Global Infrastructure Layer
│   │   └── ports/              # Implementations of cross-cutting concerns
│   │       ├── bcrypter/       # Password hashing implementation
│   │       ├── cache_service/  # Redis client implementation
│   │       └── email_verif_infra/# Email transport (SMTP) implementation
│   ├── middlewares/            # Express middlewares (Auth, Error, Validation)
│   └── error_mapper/           # Translates DB/System errors to HTTP responses
└── errors_base/                # Core exception hierarchy (HttpError, DomainError)
```

### Infrastructure Nuances
- **Virus Scanning:** Attachments are scanned using ClamAV. The system uses a dual-strategy: attempting to connect to a daemon (via `CLAMAV_HOST`), and safely falling back to the `clamscan` binary if the daemon is unavailable.
- **Dependency Injection:** `container.ts` manually wires the application, injecting repository implementations into use cases, and use cases into controllers. This ensures easily testable components.

---

## 🎨 Frontend Architecture

The frontend is a Single Page Application (SPA) built with **Vue.js 3** (Composition API) and **Quasar Framework**.

### Directory Structure
```text
frontend-chat/
├── src/
│   ├── api/              # API layer
│   │   ├── apis/         # Typed API clients (AuthApi, ChatApi)
│   │   ├── fetch/        # Generic fetch wrappers with centralized error handling
│   │   └── types/        # TypeScript interfaces for DTOs
│   ├── components/       # Reusable UI components (MessageBubble, AppAvatar)
│   ├── layouts/          # Quasar Layouts (MainLayout, AuthLayout)
│   ├── pages/            # Routable views (ChatPage, MainPage)
│   ├── router/           # Vue Router configuration & route guards
│   ├── services/         # Singleton services (WebSocket client manager)
│   └── stores/           # Pinia state management
├── public/               # Static assets (Icons, Manifests)
├── nginx.conf            # Nginx reverse proxy & static file serving configuration
└── quasar.config.ts      # Quasar build and dev server configuration
```

### Frontend State Management (Pinia)
- **AuthStore:** Manages JWT tokens, user profile, and application bootstrap state.
- **ChatStore:** Manages the list of active conversations and typing indicators.
- **MessageStore:** Handles message pagination, optimistic UI updates, and real-time appending.
- **UserCacheStore:** Implements a localized cache for user metadata (usernames, avatars, online status) to drastically reduce redundant API requests in group chats.

---

## 🗄 Database Schema (PostgreSQL)

The database utilizes foreign keys, indexes, and soft-deletes where appropriate.

- **`users`**: Core user accounts (id, username, email, password_hash, is_active).
- **`refresh_tokens`**: JWT session tracking for secure rotation and revocation.
- **`conversations`**: Chat entities. Supports `type` (direct | group).
- **`conversation_participants`**: Many-to-many relationship mapping users to conversations. Includes role management (admin, member), mute settings, and send privileges.
- **`messages`**: Individual chat messages. Includes references for attachments and replies (`original_message_id`).
- **`conversation_reads`**: Cursor tracking for unread message calculation.
- **`user_to_user_blocks`**: Global blocking system preventing interaction across all direct and group contexts.
- **`attachments`**: Metadata for uploaded files (MIME type, size, storage blob reference).

---

## 🔌 API & WebSocket Contract

### REST API Design
- **Auth Flow:** Supports standard Email/Username login and **Google OAuth 2** (`/public/auth/google/login`, `/public/auth/google/register`).
- **Validation:** All incoming HTTP requests are validated at the middleware layer using **Zod** schemas before reaching the controllers.
- **Standardized Responses:** Errors are mapped to a standardized JSON format `{ "code": "ERROR_CODE", "message": "Human readable message" }`.
- **Pagination:** List endpoints (messages, conversations) utilize cursor-based pagination for high performance.

### WebSocket Events (Socket.io)
Real-time events are strictly namespaced.

#### Client to Server
- `conversation:join` / `conversation:leave`: Subscribe/unsubscribe to room channels.
- `message:send` / `message:edit` / `message:delete`: Operations on messages.
- `message:read`: Updates the read cursor.
- `typing:start` / `typing:stop`: Broadcasts typing status.

#### Server to Client
- `message:new` / `message:edited` / `message:deleted`: Propagates state changes to connected clients.
- `user:online` / `user:offline`: Presence indicators.
- `error`: Asynchronous error delivery (e.g., attempting to send a message to a blocked user).

---

## 🔒 Security Guidelines

1. **Authentication:** Access tokens are short-lived. Refresh tokens are stored in HTTP-only, secure cookies to prevent XSS exfiltration.
2. **File Uploads:** Nginx restricts payload sizes (`client_max_body_size 20M`). Multer enforces memory limits in Node.js. All files are scanned by ClamAV before persistence.
3. **Authorization:** Participant roles and global blocklists are validated at the Use Case layer prior to any database mutation.
