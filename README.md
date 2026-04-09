# RTChat - Real-Time Messaging Platform

RTChat is a modern, full-stack real-time messaging application. Built with a focus on clean architecture, performance, and user experience, it features a robust backend powered by Node.js, Express, and PostgreSQL, and a highly responsive frontend crafted with Vue.js 3 and the Quasar Framework.

## 🌟 Key Features

- **Real-Time Communication:** Instant messaging with WebSocket (Socket.io) integration.
- **Direct & Group Chats:** Support for one-on-one conversations and multi-user groups with role management.
- **Rich Media & File Sharing:** Secure attachment uploads with built-in virus scanning (ClamAV) and up to 20MB file size support.
- **Voice Messages:** Integrated voice recording and sharing.
- **Message Management:** Edit, delete, forward, reply, and bookmark/save messages.
- **User Privacy:** Advanced blocking system and granular participant muting capabilities.
- **Security:** JWT-based authentication, password encryption, and secure HTTPS/WSS proxying via Nginx.

## 🛠 Tech Stack

### Backend
- **Runtime & Language:** Node.js, TypeScript 5.x
- **Framework:** Express 5.x
- **Database & ORM:** PostgreSQL (node-pg-migrate for migrations)
- **Caching:** Redis
- **Real-time:** Socket.io
- **Security:** JWT, bcrypt, ClamAV (Virus Scanning)

### Frontend
- **Framework:** Vue.js 3, Quasar Framework
- **Build Tool:** Vite
- **State Management:** Pinia
- **Styling:** SCSS, Tailwind-inspired utility classes

### Infrastructure
- **Containerization:** Docker, Docker Compose
- **Web Server / Reverse Proxy:** Nginx

---

## 🐳 Infrastructure & Docker Guide

The project is fully containerized, making it easy to deploy and scale. The infrastructure consists of four main services:
1. **db**: PostgreSQL database.
2. **redis**: Redis cache for sessions and socket management.
3. **backend**: Node.js API and WebSocket server.
4. **frontend**: Nginx web server serving the compiled Vue SPA and acting as a reverse proxy for the backend.

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Environment Configuration
Before starting the application, ensure you have a `.env` file in the root directory. You can copy the provided example or use the following template:

```env
# Database
DB_USER=vpro3611
DB_PASSWORD=new_pass
DB_NAME=rtchat

# Secrets (Change in production!)
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
MESSAGE_ENCRYPTION_KEY=your_encryption_key

# Email/SMTP (For registration & verification)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password

# URLs
API_URL=http://localhost:3000
FRONTEND_URL=http://localhost:9000
VITE_API_BASE_URL=http://localhost:9000
```

### Running the Application

**1. Build and Start the Stack:**
To build the images and start all services in detached mode:
```bash
docker compose up -d --build
```

**2. View Logs:**
To monitor the logs of all services:
```bash
docker compose logs -f
```
To view logs for a specific service (e.g., backend or frontend):
```bash
docker compose logs -f backend
```

**3. Stop the Application:**
To stop and remove the containers and networks:
```bash
docker compose down
```
*Note: Add `-v` to remove database volumes and wipe all data.*

### Accessing the Application
- **Frontend UI:** `http://localhost:9000`
- **Backend API:** `http://localhost:9000/public` or `http://localhost:9000/private` (Routed via Nginx)
- **Direct Backend (Optional):** `http://localhost:3000`

---

## 💻 Local Development

If you prefer to run the application locally without Docker (e.g., for active debugging):

### Backend Setup
1. Ensure PostgreSQL and Redis are running locally (or use Docker for just the databases via `docker compose up -d db redis`).
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run database migrations:
   ```bash
   npm run migrate
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend-chat
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite/Quasar development server:
   ```bash
   npm run dev
   ```

## 📚 Codebase Documentation
For an in-depth look at the architectural patterns, domain-driven design principles, database schemas, and API contracts, please refer to the [CODEBASE.md](./CODEBASE.md).
