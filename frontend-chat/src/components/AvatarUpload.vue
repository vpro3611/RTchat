<script setup lang="ts">
import { ref } from "vue";
import { useQuasar } from "quasar";
import AppAvatar from "./AppAvatar.vue";

defineProps<{
  avatarId?: string | null | undefined;
  name?: string | undefined;
  size?: string;
  loading?: boolean;
  canDelete?: boolean;
}>();

const emit = defineEmits<{
  (e: "upload", file: File): void;
  (e: "delete"): void;
}>();

const $q = useQuasar();
const fileInput = ref<HTMLInputElement | null>(null);

function triggerUpload() {
  fileInput.value?.click();
}

function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    const file = target.files[0];
    if (!file) return; // TS guard
    
    // Базовая валидация на фронтенде
    if (file.size > 2 * 1024 * 1024) {
      $q.notify({
        type: "negative",
        message: "File is too large (max 2MB)"
      });
      return;
    }
    
    if (!file.type.startsWith("image/")) {
      $q.notify({
        type: "negative",
        message: "Only images are allowed"
      });
      return;
    }

    emit("upload", file);
    // Очищаем инпут чтобы можно было выбрать тот же файл снова
    target.value = "";
  }
}

function confirmDelete() {
  $q.dialog({
    title: 'Confirm Deletion',
    message: 'Are you sure you want to remove the avatar?',
    cancel: true,
    persistent: true,
    ok: {
      label: 'Delete',
      color: 'negative',
      flat: true
    }
  }).onOk(() => {
    emit("delete");
  });
}
</script>

<template>
  <div class="column items-center q-gutter-y-sm">
    <div class="relative-position">
      <AppAvatar
        :avatar-id="avatarId"
        :name="name"
        :size="size || '120px'"
        class="cursor-pointer"
        @click="triggerUpload"
      />
      
      <q-inner-loading :showing="loading" class="rounded-borders">
        <q-spinner-oval size="50px" color="primary" />
      </q-inner-loading>

      <div class="absolute-bottom-right q-gutter-x-xs row">
        <q-btn
          round
          size="sm"
          color="primary"
          icon="camera_alt"
          @click="triggerUpload"
          :loading="loading"
        >
          <q-tooltip>Upload Photo</q-tooltip>
        </q-btn>
        
        <q-btn
          v-if="avatarId && canDelete"
          round
          size="sm"
          color="negative"
          icon="delete"
          @click="confirmDelete"
          :loading="loading"
        >
          <q-tooltip>Remove Photo</q-tooltip>
        </q-btn>
      </div>
    </div>

    <input
      type="file"
      ref="fileInput"
      style="display: none"
      accept="image/*"
      @change="handleFileChange"
    />
    
    <div class="text-caption text-grey text-center">
      Click image to change
    </div>
  </div>
</template>

<style scoped>
.relative-position {
  display: inline-block;
}
</style>
