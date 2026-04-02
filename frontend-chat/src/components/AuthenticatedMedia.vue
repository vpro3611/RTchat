<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import type { StyleValue } from 'vue';
import { fetchAuthenticatedMedia } from 'src/services/media_service';
import { AuthStore } from 'src/stores/auth_store';

const props = defineProps<{
  src: string;
  type: 'image' | 'video';
  fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  controls?: boolean;
  autoplay?: boolean;
  className?: string;
  style?: StyleValue;
}>();

const objectUrl = ref<string | null>(null);
const isLoading = ref(true);
const isError = ref(false);

async function loadMedia() {
  if (!props.src) return;
  
  isLoading.value = true;
  isError.value = false;
  
  try {
    objectUrl.value = await fetchAuthenticatedMedia(props.src);
  } catch (error) {
    console.error('Failed to load authenticated media:', error);
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadMedia();
});
watch(() => props.src, () => {
  void loadMedia();
});
watch(() => AuthStore.accessToken, (newToken) => {
  if (newToken && !objectUrl.value) {
    void loadMedia();
  }
});
</script>

<template>
  <div class="authenticated-media-container relative-position flex flex-center full-width full-height">
    <template v-if="isLoading">
      <q-spinner-dots color="primary" size="2em" />
    </template>
    
    <template v-else-if="isError">
      <q-icon name="broken_image" size="2em" color="grey" />
    </template>
    
    <template v-else-if="objectUrl">
      <img
        v-if="type === 'image'"
        :src="objectUrl"
        :class="className"
        :style="[{ objectFit: fit || 'cover' }, style]"
      />
      <video
        v-else-if="type === 'video'"
        :src="objectUrl"
        :controls="controls"
        :autoplay="autoplay"
        :class="className"
        :style="[{ objectFit: fit || 'contain' }, style]"
      />
    </template>
  </div>
</template>

<style scoped>
.authenticated-media-container {
  min-height: 50px;
  overflow: hidden;
}
img, video {
  max-width: 100%;
  max-height: 100%;
  display: block;
}
</style>
