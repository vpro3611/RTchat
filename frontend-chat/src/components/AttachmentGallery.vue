<script setup lang="ts">
import { computed } from 'vue';
import type { Attachment } from 'src/api/types/attachment';
import { BaseUrl } from 'src/base_url/base_url';
import AuthenticatedMedia from './AuthenticatedMedia.vue';

const props = defineProps<{
  attachments: Attachment[];
}>();

const emit = defineEmits<{
  (e: 'open-viewer', index: number): void;
}>();

const mediaAttachments = computed(() => 
  props.attachments.filter(a => a.type === 'image' || a.type === 'video')
);

const displayAttachments = computed(() => {
  if (mediaAttachments.value.length <= 4) {
    return mediaAttachments.value;
  }
  return mediaAttachments.value.slice(0, 4);
});

const getAttachmentUrl = (blobId: string) => `${BaseUrl.apiBaseUrl}/private/attachment/${blobId}`;

const gridClass = computed(() => {
  const count = mediaAttachments.value.length;
  if (count === 1) return 'grid-1';
  if (count === 2) return 'grid-2';
  return 'grid-2x2';
});

function handleItemClick(index: number) {
  emit('open-viewer', index);
}
</script>

<template>
  <div v-if="mediaAttachments.length > 0" class="attachment-gallery q-mb-xs" :class="gridClass">
    <div
      v-for="(attachment, index) in displayAttachments"
      :key="attachment.id"
      class="gallery-item cursor-pointer relative-position overflow-hidden"
      :class="{ 'last-item': index === 3 && mediaAttachments.length > 4 }"
      @click="handleItemClick(index)"
    >
      <AuthenticatedMedia
        :src="getAttachmentUrl(attachment.blobId)"
        :type="attachment.type === 'image' ? 'image' : 'video'"
        fit="cover"
        class-name="full-height full-width"
      />

      <!-- Overlay for +N -->
      <div
        v-if="index === 3 && mediaAttachments.length > 4"
        class="absolute-full flex flex-center overlay-text text-white text-h5 text-weight-bold"
        style="background: rgba(0,0,0,0.5)"
      >
        +{{ mediaAttachments.length - 3 }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.attachment-gallery {
  display: grid;
  gap: 4px;
  border-radius: 8px;
  overflow: hidden;
  max-width: 400px;
}

.gallery-item {
  aspect-ratio: 1 / 1;
  min-height: 100px;
}

.grid-1 {
  grid-template-columns: 1fr;
}
.grid-1 .gallery-item {
  aspect-ratio: 16 / 9;
  max-height: 300px;
}

.grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-2x2 {
  grid-template-columns: repeat(2, 1fr);
}

.attachment-gallery.grid-2x2 .gallery-item:first-child:nth-last-child(3) {
  grid-column: span 2;
  aspect-ratio: 16 / 9;
}

.overlay-text {
  pointer-events: none;
}

.gallery-item:hover {
  filter: brightness(0.9);
  transition: filter 0.2s ease;
}
</style>
