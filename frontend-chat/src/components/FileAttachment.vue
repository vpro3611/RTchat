<script setup lang="ts">
import { Attachment } from 'src/api/types/attachment';
import { BaseUrl } from 'src/base_url/base_url';
import { useQuasar } from 'quasar';

const props = defineProps<{
  attachment: Attachment;
  isOwn?: boolean;
}>();

const $q = useQuasar();

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(mimeType: string, name: string): string {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'movie';
  if (mimeType.startsWith('audio/')) return 'audiotrack';
  if (mimeType === 'application/pdf') return 'picture_as_pdf';
  if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.7z')) return 'archive';
  if (name.endsWith('.doc') || name.endsWith('.docx')) return 'description';
  if (name.endsWith('.xls') || name.endsWith('.xlsx')) return 'table_view';
  return 'insert_drive_file';
}

const downloadUrl = `${BaseUrl.apiBaseUrl}/private/attachment/${props.attachment.blobId}`;

function downloadFile() {
  window.open(downloadUrl, '_blank');
}
</script>

<template>
  <div 
    class="file-attachment q-pa-sm q-mb-xs cursor-pointer rounded-borders row items-center no-wrap"
    :class="[
      $q.dark.isActive ? 'bg-dark' : 'bg-grey-2',
      isOwn ? 'own-file' : 'incoming-file'
    ]"
    @click="downloadFile"
  >
    <div class="icon-container flex flex-center q-mr-sm">
      <q-icon :name="getFileIcon(attachment.mimeType, attachment.name)" size="24px" color="primary" />
    </div>
    
    <div class="file-info column justify-center overflow-hidden">
      <div class="file-name text-weight-medium ellipsis" :class="isOwn ? 'text-white' : 'text-primary'">
        {{ attachment.name }}
      </div>
      <div class="file-meta text-caption" :class="isOwn ? 'text-white-70' : 'text-grey-7'">
        {{ formatFileSize(attachment.size) }}
      </div>
    </div>

    <q-space />
    
    <q-btn flat round dense icon="download" size="sm" :color="isOwn ? 'white' : 'primary'">
      <q-tooltip>Download</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped>
.file-attachment {
  max-width: 300px;
  min-width: 200px;
  transition: background 0.2s ease;
}

.file-attachment:hover {
  filter: brightness(0.95);
}

.own-file {
  background: rgba(255, 255, 255, 0.15);
}

.incoming-file {
  background: rgba(0, 0, 0, 0.05);
}

.icon-container {
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
}

.incoming-file .icon-container {
  background: white;
}

.file-name {
  font-size: 0.9rem;
  line-height: 1.2;
}

.file-meta {
  font-size: 0.75rem;
}

.text-white-70 {
  color: rgba(255, 255, 255, 0.7);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
