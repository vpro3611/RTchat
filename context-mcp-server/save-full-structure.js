import { Redis } from "@upstash/redis";
import { randomUUID } from "crypto";

const redis = new Redis({
  url: "https://easy-termite-36651.upstash.io",
  token: "AY8rAAIncDFlODBmMmYxMjVjZDM0ZWQ0YmQzOWU0ZTVjNzMyZTNhZnAxMzY2NTE",
});

const sessionId = "db69e5af-ab2c-406e-8e49-7ef8c30ce6f8"; // reuse existing

const context = {
  sessionId,
  projectPath: "/home/vpro3611",
  projectName: "RTchat",
  description: "Чат-приложение (full-stack)",
  
  techStack: {
    backend: "Node.js + Express + TypeScript 5.x",
    database: "PostgreSQL",
    cache: "Redis (Upstash)",
    realtime: "Socket.io",
    auth: "JWT",
    frontend: "Vue 3 + Quasar Framework",
    testing: "Jest + Supertest"
  },
  
  // Полная структура проекта
  projectStructure: {
    root: {
      "KODA.md": "Документация проекта",
      "context.md": "История изменений",
      "package.json": "Backend зависимости",
      "jest.config.js": "Конфиг тестов",
      "tsconfig.json": "Конфиг TypeScript",
      "migrations/": "Миграции БД (13 файлов)",
      "src/": "Исходный код backend",
      "__tests__/": "Тесты",
      "frontend-chat/": "Фронтенд Vue 3 + Quasar"
    },
    
    src: {
      "index.ts": "Точка входа",
      "server.ts": "Запуск сервера",
      "app.ts": "Express конфиг",
      "container.ts": "DI контейнер",
      "database.ts": "Подключение к PostgreSQL",
      "http_errors_base.ts": "Базовые классы ошибок",
      "declare_global.ts": "Глобальные типы",
      
      "modules/": {
        "authentification/": "Аутентификация (JWT, login, register)",
        "users/": "Управление пользователями",
        "chat/": "Чат (сообщения, беседы, участники)",
        "infrasctructure/": "Инфраструктура (Redis, bcrypt)",
        "middlewares/": "Express middleware",
        "error_mapper/": "Маппинг ошибок БД"
      }
    },
    
    "modules/users": {
      "domain/": "User, Username, Email, Password",
      "application/": "Use cases (register, login, block, unblock...)",
      "controllers/": "HTTP контроллеры",
      "repositories/": "Репозитории (PG реализация)",
      "ports/": "Интерфейсы репозиториев",
      "DTO/": "Data Transfer Objects",
      "errors/": "Специфичные ошибки",
      "transactional_services/": "Транзакционные сервисы",
      "shared/": "Общие утилиты"
    },
    
    "modules/chat": {
      "domain/": "Conversation, Message, Participant",
      "application/": "Use cases",
      "controllers/": "HTTP контроллеры",
      "repositories_pg_realization/": "PG репозитории",
      "web_socket/": "Socket.io handlers",
      "DTO/": "Data Transfer Objects",
      "errors/": "Ошибки"
    },
    
    "__tests__": {
      "users/": {
        "integration_tests/": "Интеграционные тесты БД",
        "application_tests/": "Юнит тесты use cases",
        "controller_tests/": "E2E тесты контроллеров",
        "domain_tests/": "Доменные тесты",
        "__tests__/users_reader_integration.tests.spec.ts": "",
        "__tests__/users_writer_integration.tests.spec.ts": ""
      },
      "chat/": {
        "conversation/": "Тесты бесед",
        "message/": "Тесты сообщений",
        "participant/": "Тесты участников"
      },
      "auth/": "Тесты аутентификации",
      "middleware_test/": "Тесты middleware",
      "cache_service/": "Тесты Redis"
    },
    
    "frontend-chat": {
      "src/": "Исходный код",
      "public/": "Статические файлы",
      "quasar.config.ts": "Конфиг Quasar",
      "tsconfig.json": "TypeScript конфиг"
    },
    
    migrations: {
      "1772487313468_create-user-schema.ts": "Таблица users",
      "1774306610604_user-to-user-bans.ts": "Таблица user_blocks"
      // ... остальные миграции
    }
  },
  
  // Все важные файлы
  importantFiles: [
    // Auth
    "src/modules/authentification/auth_service.ts",
    "src/modules/authentification/auth_middleware/auth_middleware.ts",
    "src/modules/authentification/jwt_token_service/token_service.ts",
    
    // Users
    "src/modules/users/domain/user.ts",
    "src/modules/users/repositories/user_to_user_blocks_pg.ts",
    "src/modules/users/application/block_specific_user_use_case.ts",
    "src/modules/users/application/unblock_specific_user_use_case.ts",
    "src/modules/users/application/get_full_black_list_use_case.ts",
    "src/modules/users/controllers/block_specific_user_controller.ts",
    "src/modules/users/controllers/unblock_specific_user_controller.ts",
    "src/modules/users/controllers/get_full_black_list_controller.ts",
    
    // Chat
    "src/modules/chat/domain/conversation.ts",
    "src/modules/chat/domain/message.ts",
    "src/modules/chat/domain/participant.ts",
    
    // Infrastructure
    "src/modules/error_mapper/pg_error_mapper.ts",
    "src/container.ts",
    "src/app.ts",
    
    // Tests (новые)
    "__tests__/users/integration_tests/user_to_user_blocks_pg.spec.ts",
    "__tests__/users/application_tests/block_specific_user_use_case.spec.ts",
    "__tests__/users/application_tests/unblock_specific_user_use_case.spec.ts",
    "__tests__/users/application_tests/get_full_black_list_use_case.spec.ts",
    "__tests__/users/controller_tests/block_specific_user_controller.spec.ts",
    "__tests__/users/controller_tests/unblock_specific_user_controller.spec.ts",
    "__tests__/users/controller_tests/get_full_black_list_controller.spec.ts"
  ],
  
  apiEndpoints: {
    public: [
      "GET /health",
      "POST /register",
      "POST /login-email",
      "POST /login-username",
      "GET /verify-email",
      "POST /refresh"
    ],
    private: [
      "GET /me",
      "PATCH /change-email",
      "PATCH /change-password",
      "PATCH /change-username",
      "POST /direct-conv/:targetId/create",
      "POST /group-conv/create",
      "GET /conversations",
      "GET /conversation/:id/messages",
      "GET /conversation/:id/participants",
      "PATCH /user/:targetId/block_user",    // НОВЫЙ
      "PATCH /user/:targetId/unblock_user",  // НОВЫЙ
      "GET /user/black_list"                  // НОВЫЙ
    ]
  },
  
  tests: {
    total: 346,
    new: [
      "user_to_user_blocks_pg.spec.ts (10 тестов)",
      "block_specific_user_use_case.spec.ts",
      "unblock_specific_user_use_case.spec.ts",
      "get_full_black_list_use_case.spec.ts",
      "block_specific_user_controller.spec.ts",
      "unblock_specific_user_controller.spec.ts",
      "get_full_black_list_controller.spec.ts"
    ],
    fixed: [
      "users_writer_integration.tests.spec.ts",
      "get_specific_participant_use_case.spec.ts"
    ]
  },
  
  bugsFixed: [
    "Название таблицы: user_to_user_blocks -> user_blocks",
    "pg_error_mapper - улучшена обработка ошибок pg",
    "blockSpecificUser/unblockSpecificUser - добавлен запрос user data после INSERT/DELETE",
    "users_writer_integration - добавлена очистка FK таблиц",
    "get_specific_participant_use_case - моки с полными данными"
  ],
  
  mcpServer: {
    path: "context-mcp-server/",
    url: "https://easy-termite-36651.upstash.io",
    tools: ["save_context", "load_context", "list_contexts", "delete_context", "ping_redis"]
  },
  
  lastUpdated: new Date().toISOString()
};

async function updateContext() {
  await redis.set(`context:${sessionId}`, JSON.stringify(context), { ex: 604800 });
  console.log("✅ Full context updated!");
  console.log("Session ID:", sessionId);
  console.log("Files:", context.importantFiles.length);
  console.log("Structure saved:", Object.keys(context.projectStructure).length, "top-level keys");
}

updateContext();
