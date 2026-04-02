<script setup lang="ts">
interface Props {
  show: boolean;
}

defineProps<Props>();
</script>

<template>
  <transition
    enter-active-class="animated fadeIn"
    leave-active-class="animated fadeOut"
  >
    <div
      v-if="show"
      class="drag-overlay flex flex-center"
    >
      <div class="overlay-content column items-center justify-center">
        <q-icon name="cloud_upload" size="64px" color="primary" class="q-mb-md" />
        <div class="text-h5 text-weight-medium text-primary">Drop files here</div>
        <div class="text-caption text-grey-7 q-mt-sm">Add attachments to your message</div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.drag-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  pointer-events: none; /* Allows drop events to pass through to the parent */
  border: 3px dashed var(--q-primary);
  margin: 8px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.body--dark .drag-overlay {
  background: rgba(30, 30, 30, 0.85);
  border-color: var(--q-primary);
}

.overlay-content {
  pointer-events: none;
}
</style>
