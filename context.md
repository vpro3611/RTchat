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

### Блок/разблок пользователей
- Файл: `frontend-chat/src/api/apis/user_api.ts`
  - Добавлен метод `getBlacklist()` - получение списка заблокированных пользователей
  - Методы `blockUser()` и `unblockUser()` уже были

- Файл: `frontend-chat/src/components/UserProfileDialog.vue`
  - Добавлена проверка статуса блокировки при открытии диалога
  - Добавлены кнопки "Block User" / "Unblock User"
  - Кнопка блока показывается только если это не текущий пользователь
  - Показывается сообщение "You have blocked this user" если пользователь заблокирован
  - **Исправлен баг**: при каждом открытии диалога сбрасывается isBlocked и загружается актуальный статус

- Файл: `frontend-chat/src/components/ParticipantDetailsDialog.vue`
  - Добавлена проверка статуса блокировки при открытии диалога
  - Добавлены кнопки "Block User" / "Unblock User" в списке действий
  - Кнопки доступны для всех участников, кроме себя
  - Показывается сообщение о статусе блокировки
  - **Исправлен баг**: при каждом открытии диалога сбрасывается isBlocked

- Файл: `frontend-chat/src/pages/ChatPage.vue`
  - Добавлена проверка статуса блокировки собеседника в direct чатах
  - Добавлено отображение "заблокирован" (Telegram-стиль) - серая плашка с кнопкой разблокировки
  - Проверка выполняется при загрузке чата и при смене типа чата

- Файл: `frontend-chat/src/pages/BlacklistPage.vue` (НОВЫЙ)
  - Страница чёрного списка
  - Загружает и отображает заблокированных пользователей
  - Позволяет разблокировать пользователя из списка
  - Клик по пользователю открывает его профиль

- Файл: `frontend-chat/src/router/routes.ts`
  - Добавлен роут `/blacklist` для страницы чёрного списка

- Файл: `frontend-chat/src/layouts/MainLayout.vue`
  - Добавлена кнопка "block" в header для перехода к чёрному списку

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
- Подтверждающие диалоги перед опасными действиями (kick, leave group, block user)
- Уведомления (toast) об успехе/ошибке операций
- Индикация "You" для текущего пользователя
- Индикация "Owner" badge для владельца
- Показ времени мута если участник заглушен
- Кнопки блока/разблока не показываются для самого себя

### Дополнительный дебаг и фиксы блокировок (март 2026)
- Файл: `frontend-chat/src/api/apis/user_api.ts`
  - Исправлен контракт `getBlacklist()` под реальный backend-ответ: теперь возвращается `User[]`, а не `{ items, nextCursor }`.

- Файл: `frontend-chat/src/components/UserProfileDialog.vue`
  - Исправлен race condition при открытии/закрытии диалога и быстрых переключениях пользователей.
  - Добавлен `loadSeq` (защита от stale async ответа), чтобы старый ответ не перетирал новый state.
  - Проверка блокировки теперь использует стабильный `targetId`, а не текущее `props.userId` в момент завершения запроса.
  - При закрытии диалога сбрасывается активная загрузка и инвалидируются старые запросы.

- Файл: `frontend-chat/src/components/ParticipantDetailsDialog.vue`
  - Исправлен аналогичный race condition для статуса блокировки в диалоге участника.
  - Добавлен `loadSeq` + защита от устаревших async-результатов.
  - Проверка блокировки выполняется по переданному `targetId`, а не по потенциально изменённому `participant`.
  - При закрытии диалога сбрасываются state и активная загрузка.

- Файл: `frontend-chat/src/pages/ChatPage.vue`
  - Исправлен баг, когда в direct-чате плашка "You have blocked this user" не появлялась/обновлялась своевременно.
  - Вместо отслеживания только `route.params.id` и `chat.conversationType` добавлен `watch` на `otherUserId` (с `immediate: true`).
  - Это учитывает сценарий, где чат догружается в Store позже и раньше `otherUserId` был `null`.

- Файл: `frontend-chat/src/pages/BlacklistPage.vue`
  - Приведён к правильному контракту `getBlacklist()` (теперь работает с `User[]`).

- Проверки качества:
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS

- Выявленная корневая причина бага "иногда снова показывается Block вместо Unblock":
  - На фронте были сразу две проблемы:
    1) неправильный тип/контракт ответа blacklist API (`response.items` вместо массива),
    2) гонки async-запросов при переоткрытии диалогов (устаревший ответ мог перетирать актуальный state).
  - После фикса контракта + stale-protection поведение стабилизировано.

### Доп. доработка (по запросу): блок ввода + рабочий blacklist UI
- Файл: `frontend-chat/src/layouts/MainLayout.vue`
  - Исправлен рендер вложенных страниц: вместо ручного `ChatPage` теперь используется `<router-view />`.
  - Это устранило проблему, из-за которой маршрут `/blacklist` фактически не отображался (и казалось, что "ничего не открывается").

- Файл: `frontend-chat/src/pages/ChatPage.vue`
  - Добавлено состояние `isCurrentUserCanSendMessages`.
  - Добавлена проверка права отправки через `ParticipantApi.getSpecificParticipant(conversationId, currentUserId)`.
  - Для direct-чата учитываются оба условия: `canSendMessages` из participant + локальный флаг `isOtherUserBlocked`.
  - Поле ввода сообщения и кнопка отправки теперь disabled, если отправка запрещена.
  - Добавлен текст-пояснение под инпутом: `You can't send messages in this chat.`
  - `sendMessage` и `handleTyping` теперь не выполняются, если отправка запрещена.

- Файл: `frontend-chat/src/pages/BlacklistPage.vue`
  - Интегрирован `UserProfileDialog` прямо в страницу blacklist.
  - Клик по пользователю открывает `UserProfileDialog` для этого пользователя (без навигации на `/main`).
  - После закрытия `UserProfileDialog` выполняется `loadBlacklist()` для актуализации списка (например, после unblock внутри диалога).
  - Разблокировка из списка осталась и работает через кнопку `Unblock`.

- Проверки качества после изменений:
  - `npm run typecheck` — PASS
  - `npm run lint` — PASS
