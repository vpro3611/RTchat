<script setup lang="ts">
import { computed } from 'vue';
import type { Attachment } from 'src/api/types/attachment';
import { BaseUrl } from 'src/base_url/base_url';
import { useQuasar } from 'quasar';

const props = defineProps<{
  attachments: Attachment[];
}>();

const emit = defineEmits<{
  (e: 'open-viewer', index: number): void;
}>();

const $q = useQuasar();

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
      <q-img
        v-if="attachment.type === 'image'"
        :src="getAttachmentUrl(attachment.blobId)"
        class="full-height"
        fit="cover"
        :placeholder-src="undefined"
      >
        <template v-slot:loading>
          <div :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'" class="full-height flex flex-center">
            <q-spinner-dots color="primary" size="2em" />
          </div>
        </template>
        <template v-slot:error>
          <div :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'" class="full-height flex flex-center">
            <q-icon name="broken_image" size="2em" color="grey" />
          </div>
        </template>
      </q-img>

      <div v-else-if="attachment.type === 'video'" class="video-placeholder full-height relative-position" :class="$q.dark.isActive ? 'bg-dark' : 'bg-grey-2'">
        <!-- In a real app we might have thumbnails. Here we just show a placeholder with play icon -->
        <div class="full-height flex flex-center">
          <q-icon name="play_circle_outline" size="3em" color="white" />
        </div>
        <div class="absolute-bottom text-white q-pa-xs text-caption text-center shadow-2" style="background: rgba(0,0,0,0.3)">
          {{ attachment.name }}
        </div>
      </div>

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
  max-width: 400px; /* Adjust based on bubble size */
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

/* For 3 items, we can make the first one span 2 columns if we want it to look better */
.attachment-gallery.grid-2x2 .gallery-item:first-child:nth-last-child(3) {
  grid-column: span 2;
  aspect-ratio: 16 / 9;
}

.video-placeholder {
  width: 100%;
}

.overlay-text {
  pointer-events: none;
}

.gallery-item:hover .q-img,
.gallery-item:hover .video-placeholder {
  filter: brightness(0.9);
  transition: filter 0.2s ease;
}
</style>
