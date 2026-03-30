<script setup lang="ts">
import { computed } from "vue";
import { BaseUrl } from "src/base_url/base_url";

const props = defineProps<{
  avatarId?: string | null | undefined;
  name?: string | undefined;
  size?: string;
  square?: boolean;
}>();

const avatarUrl = computed(() => {
  if (!props.avatarId) return null;
  return `${BaseUrl.apiBaseUrl}/public/avatar/${props.avatarId}`;
});

const initials = computed(() => {
  if (!props.name) return "?";
  return props.name.trim().charAt(0).toUpperCase();
});

// Генерируем цвет фона на основе имени
const bgColor = computed(() => {
  if (!props.name) return "#2563EB";
  const colors = [
    "#2563EB", "#3B82F6", "#F97316", "#10B981", 
    "#EF4444", "#8B5CF6", "#F59E0B", "#EC4899"
  ];
  let hash = 0;
  for (let i = 0; i < props.name.length; i++) {
    hash = props.name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
});

const fontSize = computed(() => {
  const s = props.size || "40px";
  const num = parseInt(s);
  return isNaN(num) ? "1rem" : `${num * 0.5}px`;
});
</script>

<template>
  <q-avatar
    :size="size || '40px'"
    :square="square"
    :style="{ backgroundColor: avatarUrl ? 'transparent' : bgColor }"
    class="app-avatar shadow-1"
  >
    <img v-if="avatarUrl" :src="avatarUrl" class="avatar-img" />
    <span v-else class="text-white text-weight-bold" :style="{ fontSize }">
      {{ initials }}
    </span>
  </q-avatar>
</template>

<style scoped>
.app-avatar {
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease;
}

.app-avatar:hover {
  transform: scale(1.02);
}

.avatar-img {
  object-fit: cover;
}
</style>
