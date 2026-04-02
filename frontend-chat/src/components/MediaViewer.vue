<script setup lang="ts">
import { ref, computed } from 'vue';
import { BaseUrl } from 'src/base_url/base_url';
import type { Attachment } from 'src/api/types/attachment';
import AuthenticatedMedia from './AuthenticatedMedia.vue';
import { fetchAuthenticatedMedia } from 'src/services/media_service';

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
    const objectUrl = await fetchAuthenticatedMedia(mediaUrl.value);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = currentAttachment.value.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
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
          <AuthenticatedMedia
            :src="`${BaseUrl.apiBaseUrl}/private/attachment/${item.blobId}`"
            :type="item.type === 'image' ? 'image' : 'video'"
            fit="contain"
            :controls="true"
            :autoplay="true"
            class-name="responsive-media"
          />
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
}

.z-max {
  z-index: 1000;
}
</style>
