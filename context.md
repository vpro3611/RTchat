# Context - RTchat Frontend

## Что было сделано

### Исправление сортировки сообщений (backend)
- Файл: `src/modules/chat/repositories_pg_realization/message_repository_pg.ts`
- При первом запросе (без курсора): получаем последние сообщения с `ORDER BY created_at DESC`, затем переворачиваем массив
- При пагинации (с курсором): получаем более старые сообщения с `ORDER BY created_at ASC`
- Теперь сообщения отображаются как в Telegram/WhatsApp: старые сверху, новые снизу

### Вычисление senderUsername на фронтенде
- Файл: `frontend-chat/src/pages/ChatPage.vue`
  - Добавлен импорт `UserCacheStore`
  - При загрузке сообщений (`loadMessages`) вызывается `UserCacheStore.ensureUsers(senderIds)` для загрузки данных об отправителях
  - При пагинации (`loadMoreMessages`) также вызывается `ensureUsers`

- Файл: `frontend-chat/src/components/MessageBubble.vue`
  - Добавлен computed `senderUsername`, который:
    - Использует `message.senderUsername` если есть
    - Иначе получает из `UserCacheStore.getUsername(message.senderId)`
  - Убран `as any` из шаблона
  - Username отображается только для чужих сообщений (`!isOwn`)

## Как работает

1. При входе в чат загружаются последние сообщения
2. После загрузки提取ются все `senderId` из сообщений
3. `UserCacheStore.ensureUsers()` делает API-вызовы для каждого уникального senderId и кэширует их
4. В `MessageBubble` computed свойство `senderUsername` проверяет:
   - Если бэкенд вернул `senderUsername` в сообщении - использует его
   - Иначе - берет из кэша через `UserCacheStore.getUsername(senderId)`
