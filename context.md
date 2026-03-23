# Context - RTchat Frontend

## Что было сделано

### Исправление сортировки сообщений (backend)
- Файл: `src/modules/chat/repositories_pg_realization/message_repository_pg.ts`
- При первом запросе (без курсора) - получаем последние сообщения с `ORDER BY created_at DESC`, затем переворачиваем массив
- При пагинации (с курсором) - получаем более старые сообщения с `ORDER BY created_at ASC`
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

### Participant API - синхронизация фронтенда и бэкенда
- Файл: `frontend-chat/src/api/types/participant_response.ts`
  - Добавлен тип `ParticipantRole = 'owner' | 'member'` (было 'admin' | 'member')
  - Добавлен тип `MuteDuration = '1h' | '8h' | '1d' | '1w' | 'forever'`

- Файл: `frontend-chat/src/api/apis/participant_api.ts`
  - Исправлены типы role: `'owner' | 'member'` (было `'admin' | 'member'`)
  - Исправлен тип duration: `MuteDuration` (было `number`)
  - changeRole возвращает `ParticipantResponse` (было `{ok: boolean}`)
  - muteParticipant возвращает `ParticipantResponse` (было `{ok: boolean}`)
  - unmuteParticipant возвращает `ParticipantResponse` (было `{ok: boolean}`)
  - kickParticipant возвращает `ParticipantResponse` (было `{ok: boolean}`)
  - joinConversation возвращает `ParticipantResponse` (было `{ok: boolean}`)
  - leaveConversation возвращает `void` (поддержка 204)

- Файл: `frontend-chat/src/api/fetch/generinc_fetcher.ts`
  - Добавлена поддержка 204 No Content статуса

### Исправление getParticipants - добавление username/email (backend)
- Файл: `src/modules/chat/DTO/participant_list_dto.ts` (НОВЫЙ)
  - Новый DTO с username и email

- Файл: `src/modules/chat/domain/ports/participant_repo_interface.ts`
  - Изменён тип возврата getParticipants на ParticipantListDTO[]

- Файл: `src/modules/chat/repositories_pg_realization/participant_repository_pg.ts`
  - getParticipants теперь делает JOIN с users таблицей
  - Добавлен метод mapToParticipantListDto
  - Сортировка по username ASC

- Файл: `src/modules/chat/application/participant/get_participants_use_case.ts`
  - Убран маппер (теперь маппинг в репозитории)
  - Конвертация дат в ISO строки

- Файл: `src/modules/chat/transactional_services/participant/get_participants_service.ts`
  - Убран маппер из конструктора

- Файл: `src/modules/chat/application/message/send_message_use_case.ts`
  - Обновлён тип для invalidateCache

- Файл: `__tests__/chat/participant/application/get_participants_use_case.spec.ts`
  - Обновлён тест

### UI для управления участниками
- Файл: `frontend-chat/src/components/ParticipantListDialog.vue` (НОВЫЙ)
  - Диалог со списком участников беседы
  - Загрузка участников с пагинацией
  - Для владельца (owner):
    - Изменить роль (сделать owner / убрать owner)
    - Mute участника (выбор длительности: 1ч, 8ч, 1д, 1нед, навсегда)
    - Unmute участника
    - Кик (удаление из группы)
  - Для всех участников группы:
    - Кнопка "Join group" (присоединиться)
    - Кнопка "Leave group" (покинуть)
  - Отображение: аватар, username, email, роль (badge), статус мута

- Файл: `frontend-chat/src/pages/ChatPage.vue`
  - Добавлена кнопка "group" в header для открытия списка участников
  - Добавлен импорт `ParticipantListDialog` и `ParticipantStore`
  - Очистка `ParticipantStore` при выходе из чата

## Как работает

1. При входе в чат загружаются последние сообщения
2. После загрузки提取ются все `senderId` из сообщений
3. `UserCacheStore.ensureUsers()` делает API-вызовы для каждого уникального senderId и кэширует их
4. В `MessageBubble` computed свойство `senderUsername` проверяет:
   - Если бэкенд вернул `senderUsername` в сообщении - использует его
   - Иначе - берет из кэша через `UserCacheStore.getUsername(senderId)`

## UX особенности

- Кнопка "Participants" видна только в групповых чатах
- Меню действий (mute, kick, change role) доступно только владельцу группы
- Подтверждающие диалоги перед опасными действиями (kick, leave group)
- Уведомления (toast) об успехе/ошибке операций
- Индикация "You" для текущего пользователя
- Индикация "Owner" badge для владельца
- Показ времени мута если участник заглушен
