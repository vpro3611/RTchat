# KODA.md — Контекст проекта

## Обзор проекта

**Чат-приложение (Chat App)** — full-stack приложение для обмена сообщениями в реальном времени.

### Технологический стек

**Бэкенд:**
- **Runtime:** Node.js с TypeScript 5.x
- **Framework:** Express 5.x
- **База данных:** PostgreSQL
- **Кэширование:** Redis
- **Real-time:** Socket.io (WebSocket)
- **Аутентификация:** JWT (jsonwebtoken)
- **Валидация:** Zod
- **Логирование:** Pino
- **Тестирование:** Jest + Supertest
- **Миграции:** node-pg-migrate

**Фронтенд:**
- **Framework:** Vue.js 3 + Quasar Framework
- **Сборка:** Vite
- **Роутинг:** Vue Router 5

### Архитектура бэкенда

Проект следует принципам **Чистой архитектуры (Clean Architecture)** с элементами **DDD**:

```
src/
├── index.ts                    # Точка входа
├── server.ts                   # Запуск HTTP и WebSocket сервера
├── app.ts                      # Конфигурация Express и маршрутов
├── container.ts                # DI-контейнер
├── database.ts                 # Подключение к PostgreSQL
├── modules/
│   ├── authentification/       # Аутентификация (JWT, middleware)
│   ├── chat/                   # Чат-функционал
│   │   ├── domain/             # Доменные сущности (Conversation, Message, Participant)
│   │   ├── application/        # Use cases
│   │   ├── controllers/        # HTTP-контроллеры
│   │   ├── repositories_pg_realization/  # Репозитории PostgreSQL
│   │   ├── web_socket/         # WebSocket gateway
│   │   ├── DTO/                # Data Transfer Objects
│   │   └── shared/             # Общие утилиты модуля
│   ├── users/                  # Управление пользователями
│   │   ├── domain/             # User, Email, Password, Username
│   │   ├── application/        # Use cases
│   │   ├── controllers/        # HTTP-контроллеры
│   │   ├── repositories/       # Репозитории (Reader/Writer)
│   │   ├── ports/              # Интерфейсы репозиториев
│   │   ├── DTO/                # Data Transfer Objects
│   │   └── errors/             # Доменные ошибки
│   ├── infrasctructure/        # Инфраструктурный слой
│   │   └── ports/
│   │       ├── bcrypter/       # Хэширование паролей
│   │       ├── cache_service/  # Redis клиент
│   │       ├── transaction_manager/  # Управление транзакциями
│   │       └── email_verif_infra/    # Email-верификация
│   ├── middlewares/            # Express middleware
│   └── error_mapper/           # Маппинг ошибок БД
└── errors_base/                # Базовые классы ошибок
```

### Структура модуля (паттерн)

Каждый бизнес-модуль следует единой структуре:
- **domain/** — доменные сущности с инкапсулированной бизнес-логикой (Value Objects, Entities)
- **application/** — use cases (оркестрация бизнес-логики)
- **controllers/** — HTTP-контроллеры (обработка запросов)
- **repositories/** — реализация репозиториев для работы с БД
- **ports/** — интерфейсы (контракты)
- **DTO/** — объекты для передачи данных
- **shared/** — общие утилиты модуля
- **errors/** — специфичные ошибки модуля

---

## Сборка и запуск

### Бэкенд

```bash
# Установка зависимостей
npm install

# Разработка (hot-reload)
npm run dev

# Сборка TypeScript → dist/
npm run build

# Продакшн запуск
npm start

# Миграции базы данных
npm run migrate

# Тесты
npm test                # Однократный запуск
npm run test:watch      # Watch-режим
npm run test:ci         # Для CI (последовательно)
```

### Фронтенд (frontend-chat/)

```bash
cd frontend-chat

# Установка зависимостей
pnpm install   # или yarn / npm install

# Разработка
pnpm dev       # или quasar dev

# Сборка для продакшн
pnpm build     # или quasar build

# Линтинг
pnpm lint

# Форматирование
pnpm format

# Проверка типов
pnpm typecheck
```

### Переменные окружения

Создайте `.env` файл в корне проекта. Ожидаемые переменные:
- `PORT` — порт сервера (по умолчанию 3000)
- `DATABASE_URL` — строка подключения к PostgreSQL
- `REDIS_URL` — строка подключения к Redis
- `JWT_SECRET` — секрет для подписи JWT-токенов

---

## API Endpoints

### Публичные маршруты (`/public`)

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/health` | Health check |
| POST | `/register` | Регистрация пользователя |
| POST | `/resend-register` | Повторная отправка верификации |
| POST | `/login-email` | Вход по email |
| POST | `/login-username` | Вход по username |
| GET | `/verify-email` | Верификация email |
| GET | `/confirm-email-change` | Подтверждение смены email |
| POST | `/refresh` | Обновление токенов |

### Приватные маршруты (`/private`) — требуют аутентификации

**Пользователи:**
- `GET /me` — профиль текущего пользователя
- `PATCH /change-email` — смена email
- `PATCH /change-password` — смена пароля
- `PATCH /change-username` — смена username
- `PATCH /toggle-status` — переключение активности
- `GET /search-users` — поиск пользователей
- `GET /user/:targetId/view` — профиль пользователя

**Блокировка пользователей:**
- `PATCH /user/:targetId/block_user` — заблокировать пользователя
- `PATCH /user/:targetId/unblock_user` — разблокировать пользователя
- `GET /user/black_list` — получить чёрный список

**Беседы:**
- `POST /direct-conv/:targetId/create` — создание личной беседы
- `POST /group-conv/create` — создание групповой беседы
- `GET /conversations` — список бесед пользователя
- `PATCH /conversation/:conversationId/title` — обновление названия
- `GET /search-conversations` — поиск бесед

**Сообщения:**
- `GET /conversation/:conversationId/messages` — сообщения беседы
- `GET /conversation/:conversationId/:messageId/view` — конкретное сообщение

**Участники:**
- `GET /conversation/:conversationId/participants` — участники беседы
- `POST /conversation/:conversationId/join` — присоединиться к беседе
- `DELETE /conversation/:conversationId/leave` — покинуть беседу
- `PATCH /conversation/:conversationId/:targetId/role` — изменить роль
- `PATCH /conversation/:conversationId/:targetId/mute` — заглушить участника
- `DELETE /conversation/:conversationId/:targetId/kick` — удалить участника

### WebSocket события

Реализованы через Socket.io:
- Отправка, редактирование, удаление сообщений
- Прочтение сообщений
- Индикаторы набора текста (typing)

---

## Правила разработки

### Стиль кодирования

1. **TypeScript strict mode** — включён строгий режим компилятора
2. **Value Objects** — примитивные концепты (Email, Password, Username) инкапсулируются в классы с валидацией
3. **Domain Entities** — сущности содержат бизнес-логику и методы изменения состояния
4. **Dependency Injection** — зависимости передаются через конструктор (контейнер в `container.ts`)
5. **Repository Pattern** — разделение на Reader (чтение) и Writer (запись) интерфейсы
6. **Error Handling** — специализированные классы ошибок с наследованием от базовых

### Пример доменной сущности

```typescript
// domain/user.ts
export class User {
    constructor(
        public readonly id: string,
        private username: Username,
        private email: Email,
        // ...
    ) {}

    setUsername(username: Username): void {
        this.canChangeUsername(username);  // Бизнес-правило
        this.username = username;
        this.setUpdatedAt(new Date());
    }
}
```

### Пример use case

```typescript
// application/register_use_case.ts
export class RegisterUseCase {
    constructor(
        private readonly userRepoReader: UserRepoReader,
        private readonly userRepoWriter: UserRepoWriter,
        private readonly bcrypter: BcryptInterface,
        // ...
    ) {}

    async registerUseCase(username: string, email: string, password: string): Promise<UserDTO> {
        // Валидация, бизнес-логика, сохранение
    }
}
```

### Валидация запросов

Используется Zod для валидации body и params:
```typescript
// В контроллере
publicRouter.post("/register",
    validateBody(RegisterBodySchema),
    dependencies.registerController.registerController
);
```

### Тестирование

- Тесты расположены в `__tests__/`
- Структура зеркалирует модули: `__tests__/users/`, `__tests__/chat/`, `__tests__/auth/`
- Используется Jest с ts-jest
- Для API-тестов — Supertest

### Миграции

Миграции находятся в `migrations/`. Формат имени: `<timestamp>_<description>.ts`

```bash
# Создание новой миграции
npm run migrate create <название-миграции>

# Применение миграций
npm run migrate up
```

---

## Структура базы данных

### Основные таблицы

- **users** — пользователи
- **email_verification_tokens** — токены верификации email
- **refresh_tokens** — refresh-токены для JWT
- **conversations** — беседы (личные и групповые)
- **conversation_participants** — участники бесед
- **messages** — сообщения
- **conversation_reads** — статус прочтения бесед
- **user_to_user_blocks** — блокировки пользователей (blocker_id, blocked_id)

---

## Фронтенд (frontend-chat/)

### Структура

```
frontend-chat/
├── src/                  # Исходный код
│   ├── api/              # API-клиенты
│   │   ├── apis/         # Методы API
│   │   ├── fetch/        # HTTP-клиент (fetchJson)
│   │   └── types/        # TypeScript-типы
│   ├── components/       # Vue-компоненты
│   ├── layouts/          # Layout-компоненты
│   ├── pages/            # Страницы
│   ├── router/           # Роутинг
│   ├── services/         # Сервисы (WebSocket)
│   └── stores/           # Pinia-сторы
├── public/               # Статические файлы
├── quasar.config.ts      # Конфигурация Quasar
├── tsconfig.json         # Конфигурация TypeScript
└── package.json          # Зависимости и скрипты
```

### Требования к Node.js

- Node.js: ^20, ^22, ^24, ^26, ^28
- Менеджеры пакетов: npm >= 6.13.4, yarn >= 1.21.1, pnpm >= 10.0.0

---

## Фронтенд API

### UserApi (`src/api/apis/user_api.ts`)

| Метод | Описание |
|-------|----------|
| `getBlacklist()` | Получить список заблокированных пользователей (`User[]`) |
| `blockUser(targetId)` | Заблокировать пользователя |
| `unblockUser(targetId)` | Разблокировать пользователя |
| `getSpecificUser(targetId)` | Получить профиль пользователя |
| `changePassword(old, new)` | Сменить пароль |
| `changeUsername(new)` | Сменить username |
| `changeEmail(new)` | Сменить email |
| `toggleStatus()` | Переключить активность аккаунта |
| `getUserConversations(params)` | Получить список бесед |
| `createDirectConversation(targetId)` | Создать личную беседу |
| `createGroupConversation(title)` | Создать групповую беседу |
| `searchUsers(query)` | Поиск пользователей |
| `searchConversations(query)` | Поиск бесед |

### MessageApi (`src/api/apis/message_api.ts`)

| Метод | Описание |
|-------|----------|
| `getMessages(conversationId, cursor?)` | Получить сообщения беседы |
| `getSpecificMessage(conversationId, messageId)` | Получить конкретное сообщение |

### ParticipantApi (`src/api/apis/participant_api.ts`)

| Метод | Описание |
|-------|----------|
| `getParticipants(conversationId)` | Получить участников беседы |
| `getSpecificParticipant(conversationId, targetId)` | Получить участника (включает `canSendMessages`) |
| `changeRole(conversationId, targetId, role)` | Изменить роль |
| `muteParticipant(conversationId, targetId, duration)` | Заглушить участника |
| `unmuteParticipant(conversationId, targetId)` | Снять заглушку |
| `kickParticipant(conversationId, targetId)` | Удалить участника |
| `joinConversation(conversationId)` | Присоединиться к беседе |
| `leaveConversation(conversationId)` | Покинуть беседу |

---

## WebSocket (Socket.io)

### События отправки (frontend → backend)

| Событие | Параметры | Описание |
|---------|-----------|----------|
| `conversation:join` | `{ conversationId }` | Присоединиться к комнате |
| `conversation:leave` | `{ conversationId }` | Покинуть комнату |
| `message:send` | `{ conversationId, content }` | Отправить сообщение |
| `message:edit` | `{ conversationId, messageId, newContent }` | Редактировать сообщение |
| `message:delete` | `{ conversationId, messageId }` | Удалить сообщение |
| `message:read` | `{ conversationId, messageId }` | Отметить как прочитанное |
| `typing:start` | `{ conversationId }` | Начало набора текста |
| `typing:stop` | `{ conversationId }` | Конец набора текста |

### События получения (backend → frontend)

| Событие | Параметры | Описание |
|---------|-----------|----------|
| `message:new` | `Message` | Новое сообщение |
| `message:edited` | `{ message: Message }` | Сообщение отредактировано |
| `message:deleted` | `{ message: Message }` | Сообщение удалено |
| `message:read` | `{ conversationId, messageId, userId }` | Сообщение прочитано |
| `typing:start` | `{ conversationId, userId, username }` | Начало набора |
| `typing:stop` | `{ conversationId, userId, username }` | Конец набора |
| `user:online` | `{ userId }` | Пользователь онлайн |
| `user:offline` | `{ userId }` | Пользователь оффлайн |
| `error` | `{ message }` | Ошибка (например, блокировка) |

### Обработка ошибок

Ошибки от сервера приходят через событие `error`. Типичные сценарии:
- Блокировка отправки: `"User is not allowed to send messages because of being blocked by the target user"`
- Заглушка в группе: `"User is not allowed to send messages"`

---

## Блокировка пользователей

### Бэкенд

- **Блокировка** (`blockUser`): создаёт запись в `user_to_user_blocks`
- **Разблокировка** (`unblockUser`): удаляет запись
- **Чёрный список** (`getBlacklist`): возвращает массив заблокированных пользователей (`User[]`)
- **Проверка блокировки** (`ensureAnyBlocksExists`): проверяет, есть ли блокировка между двумя пользователями

#### Ограничения

- Нельзя создать личную беседу с заблокированным пользователем
- Нельзя отправить сообщение в direct-чате, если одна из сторон заблокировала другую

### Фронтенд

Компоненты для блокировки:

- **UserProfileDialog** — профиль пользователя с кнопками Block/Unblock
- **ParticipantDetailsDialog** — детали участника в группе с Block/Unblock
- **BlacklistPage** — страница чёрного списка
- **ChatPage** — плашка "You have blocked this user" + блокировка ввода

#### Реактивность

При block/unblock dispatchится событие `block-status-changed`, на которое подписываются:
- ChatPage — для обновления плашки и состояния ввода
- Другие открытые диалоги

---

## Лицензия

MIT License (Copyright © 2026 vpro3611)
