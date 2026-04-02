<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseUrl } from 'src/base_url/base_url';
import type { Attachment } from 'src/api/types/attachment';

const isOpen = ref(false);
const attachments = ref<Attachment[]>([]);
const currentIndex = ref(0);

const currentAttachment = computed(() => attachments.value[currentIndex.value]);

const mediaUrl = computed(() => {
  if (!currentAttachment.value) return '';
  return `${BaseUrl.apiBaseUrl}/private/attachment/${currentAttachment.value.blobId}`;
});

function open(items: Attachment[], index: number) {
  attachments.value = items;
  currentIndex.value = index;
  isOpen.value = true;
}

async function download() {
  if (!currentAttachment.value) return;
  
  try {
    const response = await fetch(mediaUrl.value);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentAttachment.value.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    // Fallback to direct link if fetch fails
    const link = document.createElement('a');
    link.href = mediaUrl.value;
    link.download = currentAttachment.value.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

defineExpose({ open });
</script>

<template>
  <q-dialog
    v-model="isOpen"
    maximized
    transition-show="fade"
    transition-hide="fade"
    class="media-viewer-dialog"
  >
    <q-card class="bg-black text-white flex flex-center no-scroll overflow-hidden">
      <!-- Toolbar -->
      <div class="absolute-top full-width row items-center justify-between q-pa-md z-max toolbar-gradient">
        <div class="row items-center q-gutter-x-sm">
          <q-btn
            icon="arrow_back"
            flat
            round
            dense
            v-close-popup
            color="white"
          />
          <div class="column">
            <div class="text-subtitle2 text-weight-medium ellipsis" style="max-width: 250px">
              {{ currentAttachment?.name }}
            </div>
            <div class="text-caption text-grey-4" v-if="attachments.length > 1">
              {{ currentIndex + 1 }} / {{ attachments.length }}
            </div>
          </div>
        </div>

        <div class="row items-center q-gutter-x-sm">
          <q-btn
            icon="download"
            flat
            round
            dense
            @click="download"
            color="white"
          >
            <q-tooltip>Download</q-tooltip>
          </q-btn>
          <q-btn
            icon="close"
            flat
            round
            dense
            v-close-popup
            color="white"
          />
        </div>
      </div>

      <q-carousel
        v-model="currentIndex"
        animated
        swipeable
        arrows
        infinite
        transition-prev="slide-right"
        transition-next="slide-left"
        class="full-width full-height bg-transparent"
      >
        <q-carousel-slide
          v-for="(item, index) in attachments"
          :key="item.id"
          :name="index"
          class="flex flex-center q-pa-none no-scroll"
        >
          <div v-if="item.type === 'image'" class="full-width full-height flex flex-center">
             <img 
              :src="`${BaseUrl.apiBaseUrl}/private/attachment/${item.blobId}`" 
              class="responsive-media"
            />
          </div>
          <div v-else-if="item.type === 'video'" class="full-width full-height flex flex-center">
            <video
              controls
              autoplay
              class="responsive-media"
              style="max-width: 100%; max-height: 100%;"
            >
              <source :src="`${BaseUrl.apiBaseUrl}/private/attachment/${item.blobId}`" :type="item.mimeType">
              Your browser does not support the video tag.
            </video>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.media-viewer-dialog :deep(.q-dialog__inner) {
  padding: 0;
}

.toolbar-gradient {
  background: linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%);
  pointer-events: auto;
}

.responsive-media {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.z-max {
  z-index: 1000;
}
</style>
