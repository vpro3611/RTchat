<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue';

interface Props {
  pendingFiles: File[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'remove', index: number): void;
}>();

const previews = ref<string[]>([]);

const generatePreviews = () => {
  // Clean up old object URLs to avoid memory leaks
  previews.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });

  previews.value = props.pendingFiles.map(file => {
    if (file.type.startsWith('image/')) {
      return URL.createObjectURL(file);
    }
    return ''; // No preview for non-image files
  });
};

watch(() => props.pendingFiles, generatePreviews, { deep: true, immediate: true });

onUnmounted(() => {
  previews.value.forEach(url => {
    if (url.startsWith('blob:')) {
      URL.revokeObjectURL(url);
    }
  });
});

function getFileIcon(type: string) {
  if (type.startsWith('video/')) return 'movie';
  if (type.startsWith('audio/')) return 'audiotrack';
  if (type.includes('pdf')) return 'picture_as_pdf';
  if (type.includes('zip') || type.includes('rar') || type.includes('compressed')) return 'archive';
  return 'insert_drive_file';
}

function formatSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
</script>

<template>
  <div class="upload-preview-bar row no-wrap items-center q-px-sm q-py-xs bg-grey-1 scroll hide-scrollbar">
    <div
      v-for="(file, index) in pendingFiles"
      :key="`${file.name}-${index}`"
      class="preview-item relative-position q-ma-xs rounded-borders overflow-hidden shadow-1"
    >
      <!-- Image Preview -->
      <q-img
        v-if="previews[index]"
        :src="previews[index]"
        spinner-color="primary"
        style="width: 70px; height: 70px"
        class="cursor-pointer"
        fit="cover"
      />

      <!-- Icon Preview (non-image) -->
      <div
        v-else
        class="file-placeholder column items-center justify-center bg-grey-3"
        style="width: 70px; height: 70px"
      >
        <q-icon :name="getFileIcon(file.type)" size="32px" color="grey-7" />
        <div class="text-caption text-grey-8 ellipsis full-width q-px-xs text-center" style="font-size: 8px">
          {{ formatSize(file.size) }}
        </div>
      </div>

      <!-- Remove Button -->
      <q-btn
        flat round dense
        icon="close"
        size="xs"
        color="white"
        class="remove-btn absolute-top-right bg-black-transparent"
        @click="emit('remove', index)"
      />

      <q-tooltip anchor="top middle" self="bottom middle">
        {{ file.name }}
      </q-tooltip>
    </div>
  </div>
</template>

<style scoped>
.upload-preview-bar {
  min-height: 80px;
  max-height: 100px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.body--dark .upload-preview-bar {
  background: #252525;
  border-color: rgba(255, 255, 255, 0.05);
}

.preview-item {
  flex: 0 0 70px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.body--dark .preview-item {
  border-color: rgba(255, 255, 255, 0.1);
}

.remove-btn {
  margin: 2px;
  z-index: 10;
}

.bg-black-transparent {
  background: rgba(0, 0, 0, 0.5);
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
