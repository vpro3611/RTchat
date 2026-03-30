# Chat Application – Database Plan (PostgreSQL)

Production-oriented schema for:
- 1-to-1 conversations
- Group chats
- Roles & moderation
- Mute / Ban / Block
- JWT refresh tokens
- Presence support (partial via DB)

---

# 1. Extensions

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

Used for: `gen_random_uuid()`

---

# 2. Users

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,

  avatar_url TEXT,

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  last_seen_at TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Indexes:

```sql
CREATE INDEX idx_users_last_seen ON users(last_seen_at);
```

---

# 3. Refresh Tokens

```sql
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  token TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_user ON refresh_tokens(user_id);
```

---

# 4. Conversations

```sql
CREATE TYPE conversation_type AS ENUM ('direct', 'group');

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  type conversation_type NOT NULL,
  title TEXT,

  created_by UUID REFERENCES users(id),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# 5. Conversation Participants

```sql
CREATE TABLE conversation_participants (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  role VARCHAR(20) NOT NULL DEFAULT 'member', -- owner | admin | member

  can_send_messages BOOLEAN NOT NULL DEFAULT TRUE,
  muted_until TIMESTAMP,

  joined_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (conversation_id, user_id)
);

CREATE INDEX idx_participants_user ON conversation_participants(user_id);
```

---

# 6. Conversation Bans

```sql
CREATE TABLE conversation_bans (
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  banned_by UUID REFERENCES users(id),
  banned_until TIMESTAMP,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (conversation_id, user_id)
);
```

---

# 7. Messages

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),

  content TEXT NOT NULL,

  is_edited BOOLEAN NOT NULL DEFAULT FALSE,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updatedAt TIMESTAMP
);
```

Indexes:

```sql
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

---

# 8. Read Receipts (Optional but Recommended)

```sql
CREATE TABLE message_reads (
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,

  read_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (message_id, user_id)
);
```

---

# 9. User Blocks (Global Blacklist)

```sql
CREATE TABLE user_blocks (
  blocker_id UUID REFERENCES users(id) ON DELETE CASCADE,
  blocked_id UUID REFERENCES users(id) ON DELETE CASCADE,

  created_at TIMESTAMP NOT NULL DEFAULT NOW(),

  PRIMARY KEY (blocker_id, blocked_id)
);
```

---

# 10. Optional: Attachments

```sql
CREATE TABLE message_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,

  file_url TEXT NOT NULL,
  file_type VARCHAR(50),

  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

# 11. Soft Delete Strategy

Instead of deleting users or messages physically:

- Use `is_active` for users
- Use `is_deleted` for messages

---

# 12. Redis Responsibilities (NOT stored in SQL)

Redis should handle:

- Online users set
- Socket session mapping
- Conversation room membership (runtime)
- Rate limiting counters

---

# Final Notes

This schema supports:

- Direct chats
- Group chats
- Roles (owner/admin/member)
- Mute (temporary or permanent)
- Ban (temporary or permanent)
- Global block
- Read receipts
- Attachments
- Soft delete
- JWT refresh system

This structure is production-ready and scalable for a modular monolith or future microservice split.

