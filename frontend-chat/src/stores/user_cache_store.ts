import { reactive } from "vue"
import type { User } from "src/api/types/register_response"
import { UserApi } from "src/api/apis/user_api"

type UserById = Record<string, User>

export const UserCacheStore = reactive({
  byId: {} as UserById,
  loading: new Set<string>(),

  getUsername(userId: string | null | undefined) {
    if (!userId) return null
    return this.byId[userId]?.username ?? null
  },

  getAvatarId(userId: string | null | undefined) {
    if (!userId) return null
    return this.byId[userId]?.avatarId ?? null
  },

  async ensureUser(userId: string | null | undefined) {
    if (!userId || typeof userId !== 'string' || userId === 'undefined') return
    if (this.byId[userId]) return
    if (this.loading.has(userId)) return

    this.loading.add(userId)
    try {
      const user = await UserApi.getSpecificUser(userId)
      this.byId[userId] = user
    } catch (e) {
      console.warn(`UserCacheStore: Failed to fetch user ${userId}. They might be deleted.`, e)
      // Кэшируем "пустого" пользователя, чтобы не пытаться снова (избегаем спама 404)
      const now = new Date().toISOString();
      this.byId[userId] = { 
        id: userId, 
        username: 'Deleted User', 
        email: 'deleted@user.com',
        avatarId: null,
        isActive: false,
        isVerified: false,
        lastSeenAt: now,
        createdAt: now,
        updatedAt: now
      }
    } finally {
      this.loading.delete(userId)
    }
  },

  async ensureUsers(userIds: Array<string | null | undefined>) {
    const unique = Array.from(new Set(userIds.filter(Boolean))) as string[]
    await Promise.all(unique.map((id) => this.ensureUser(id)))
  }
})

