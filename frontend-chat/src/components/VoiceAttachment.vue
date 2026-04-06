<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { fetchAuthenticatedMedia } from 'src/services/media_service';
import { BaseUrl } from 'src/base_url/base_url';
import type { Attachment } from 'src/api/types/attachment';

const props = defineProps<{
  attachment: Attachment;
  isOwn: boolean;
}>();

const audioUrl = computed(() => `${BaseUrl.apiBaseUrl}/private/attachments/blob/${props.attachment.blobId}`);
const objectUrl = ref<string | null>(null);
const audio = ref<HTMLAudioElement | null>(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(props.attachment.duration || 0);
const isLoading = ref(true);

async function initAudio() {
  try {
    isLoading.value = true;
    objectUrl.value = await fetchAuthenticatedMedia(audioUrl.value);
    if (audio.value) {
      audio.value.src = objectUrl.value;
      audio.value.load();
    }
  } catch (e) {
    console.error('Failed to load voice message:', e);
  } finally {
    isLoading.value = false;
  }
}

function togglePlay() {
  if (!audio.value || isLoading.value) return;
  
  if (isPlaying.value) {
    audio.value.pause();
  } else {
    void audio.value.play();
  }
}

function onTimeUpdate() {
  if (audio.value) {
    currentTime.value = audio.value.currentTime;
  }
}

function onLoadedMetadata() {
  if (audio.value) {
    if (audio.value.duration === Infinity) {
      // Workaround for Chrome bug with streamed OGG/WebM duration
      audio.value.currentTime = 1e101;
      audio.value.onseeked = () => {
        if (!audio.value) return;
        audio.value.onseeked = null;
        audio.value.currentTime = 0;
        duration.value = audio.value.duration;
      };
    } else if (!props.attachment.duration || props.attachment.duration === 0) {
      duration.value = audio.value.duration || 0;
    }
  }
}

function onEnded() {
  isPlaying.value = false;
  currentTime.value = 0;
}

function seek(val: number | null) {
  if (audio.value && val !== null) {
    audio.value.currentTime = val;
  }
}

function formatTime(seconds: number | undefined | null) {
  if (!seconds || !isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

onMounted(() => {
  void initAudio();
});

onUnmounted(() => {
  if (audio.value) {
    audio.value.pause();
    audio.value = null;
  }
});

watch(() => audioUrl.value, () => {
  void initAudio();
});
</script>

<template>
  <div class="voice-attachment q-pa-sm rounded-borders" :class="isOwn ? 'voice-own' : 'voice-incoming'">
    <audio
      ref="audio"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @play="isPlaying = true"
      @pause="isPlaying = false"
      @ended="onEnded"
      class="hidden"
    ></audio>

    <div class="row items-center no-wrap q-gutter-x-sm">
      <q-btn
        flat round dense
        :icon="isPlaying ? 'pause' : 'play_arrow'"
        :color="isOwn ? 'white' : 'primary'"
        @click="togglePlay"
        :loading="isLoading"
      />

      <div class="col column">
        <!-- Visual Waveform Placeholder / Slider -->
        <q-slider
          v-model="currentTime"
          :min="0"
          :max="Number.isFinite(duration) && duration > 0 ? duration : 1"
          :step="0.1"
          @update:model-value="seek"
          :color="isOwn ? 'white' : 'primary'"
          dense
          class="voice-slider"
        />
        
        <div class="row justify-between text-caption" :class="isOwn ? 'text-white-70' : 'text-grey-7'" style="font-size: 10px; margin-top: -8px;">
          <span>{{ formatTime(currentTime) }}</span>
          <span>{{ formatTime(duration) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voice-attachment {
  min-width: 200px;
  max-width: 300px;
}

.voice-own {
  background: rgba(255, 255, 255, 0.1);
}

.voice-incoming {
  background: rgba(0, 0, 0, 0.05);
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.voice-slider :deep(.q-slider__track) {
  opacity: 0.3;
}

.voice-slider :deep(.q-slider__thumb) {
  display: none;
}

.voice-attachment:hover .voice-slider :deep(.q-slider__thumb) {
  display: block;
}
</style>
