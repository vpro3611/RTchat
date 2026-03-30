# Context MCP Server

MCP-сервер для сохранения контекста между сессиями работы с Koda AI.

## Возможности

- **save_context** — сохранить текущий контекст (проект, файлы, изменения, заметки)
- **load_context** — загрузить контекст предыдущей сессии
- **list_contexts** — показать все сохранённые контексты
- **delete_context** — удалить конкретный контекст
- **ping_redis** — проверить подключение к Redis

## Установка

```bash
cd context-mcp-server
npm install
```

## Запуск

```bash
# Создай .env файл на основе .env.example
cp .env.example .env

# Запуск
npm start
```

## Интеграция с Koda

### Вариант 1: Через Claude Desktop

Добавь в `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "context-memory": {
      "command": "node",
      "args": ["/path/to/context-mcp-server/src/index.js"],
      "env": {
        "REDIS_URL": "redis://localhost:6379"
      }
    }
  }
}
```

### Вариант 2: Прямой запуск

```bash
# В терминале
node /path/to/context-mcp-server/src/index.js
```

## Использование

### Сохранить контекст

```javascript
// В разговоре с Koda:
/* 
Сохрани контекст:
- проект: /path/to/myproject
- заметки: Работал над тестами для блокировки пользователей
- ключевые файлы: user_to_user_blocks_pg.ts, block_specific_user_use_case.ts
*/
```

Koda вызовет `save_context` с переданными параметрами.

### Загрузить контекст

```javascript
// Загрузи предыдущий контекст
```

Koda вызовет `load_context` и получит:
- Путь к проекту
- Заметки
- Ключевые файлы
- История изменений

## Структура Redis

```
contexts:index     → Sorted set с session ID
context:<session>  → JSON с полным контекстом
```

## Пример сохранённого контекста

```json
{
  "sessionId": "abc123",
  "projectPath": "/home/user/myproject",
  "notes": "Работал над функционалом блокировки пользователей",
  "keyFiles": [
    "src/modules/users/repositories/user_to_user_blocks_pg.ts",
    "src/modules/users/application/block_specific_user_use_case.ts"
  ],
  "changes": [
    "Исправлена таблица user_to_user_blocks -> user_blocks",
    "Добавлены интеграционные тесты"
  ],
  "lastUpdated": "2024-01-15T10:30:00.000Z"
}
```
