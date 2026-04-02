<script setup lang="ts">
import type { Attachment } from 'src/api/types/attachment';
import { BaseUrl } from 'src/base_url/base_url';
import { useQuasar } from 'quasar';
import { AuthStore } from 'src/stores/auth_store';

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

async function downloadFile() {
  try {
    const response = await fetch(downloadUrl, {
      headers: {
        'Authorization': `Bearer ${AuthStore.accessToken}`
      }
    });
    
    if (!response.ok) throw new Error('Download failed');
    
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = props.attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to download file'
    });
  }
}
</script>

<template>
  <div 
    class="file-attachment q-pa-sm q-mb-xs cursor-pointer rounded-borders row items-center no-wrap"
    :class="{ 'is-own': isOwn }"
    @click="downloadFile"
  >
    <div class="icon-container flex flex-center q-mr-sm">
      <q-icon :name="getFileIcon(attachment.mimeType, attachment.name)" size="24px" color="primary" />
    </div>
    
    <div class="file-info column justify-center overflow-hidden">
      <div class="file-name text-weight-medium ellipsis">
        {{ attachment.name }}
      </div>
      <div class="file-meta text-caption">
        {{ formatFileSize(attachment.size) }}
      </div>
    </div>

    <q-space />
    
    <q-btn flat round dense icon="download" size="sm" class="download-btn">
      <q-tooltip>Download</q-tooltip>
    </q-btn>
  </div>
</template>

<style scoped>
.file-attachment {
  max-width: 300px;
  min-width: 220px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  transition: all 0.2s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.body--dark .file-attachment {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.1);
}

/* Sender's bubble is primary, so we make the attachment stand out as a clean card */
.is-own {
  background: white !important;
  border: none;
}

.body--dark .is-own {
  background: #1e1e1e !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.file-attachment:hover {
  filter: brightness(0.98);
}

.icon-container {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  flex-shrink: 0;
}

.body--dark .icon-container {
  background: #2a2a2a;
}

.is-own .icon-container {
  background: #f5f5f5;
}

.file-name {
  color: var(--q-primary);
  font-size: 0.9rem;
  line-height: 1.2;
}

.file-meta {
  color: #666;
}

.body--dark .file-meta {
  color: #aaa;
}

.download-btn {
  color: var(--q-primary);
}

.is-own .download-btn {
  color: var(--q-primary);
}

.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
