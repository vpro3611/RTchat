<script setup lang="ts">
import { computed } from 'vue'
import { ThemeStore } from 'stores/theme_store'

const currentIcon = computed(() => {
  if (ThemeStore.mode === 'light') return 'wb_sunny'
  if (ThemeStore.mode === 'dark') return 'nights_stay'
  return 'brightness_auto'
})

const currentLabel = computed(() => {
  if (ThemeStore.mode === 'light') return 'Light'
  if (ThemeStore.mode === 'dark') return 'Dark'
  return 'System'
})
</script>

<template>
  <q-btn flat dense round :icon="currentIcon">
    <q-tooltip>Theme: {{ currentLabel }}</q-tooltip>
    <q-menu
      auto-close
      class="theme-menu shadow-3"
      style="border: 2px solid var(--q-primary); border-radius: 8px;"
    >
      <q-list style="min-width: 150px">
        <q-item
          clickable
          :active="ThemeStore.mode === 'light'"
          active-class="text-primary text-weight-bold"
          @click="ThemeStore.setMode('light')"
        >
          <q-item-section avatar>
            <q-icon name="wb_sunny" />
          </q-item-section>
          <q-item-section>Light</q-item-section>
        </q-item>

        <q-item
          clickable
          :active="ThemeStore.mode === 'dark'"
          active-class="text-primary text-weight-bold"
          @click="ThemeStore.setMode('dark')"
        >
          <q-item-section avatar>
            <q-icon name="nights_stay" />
          </q-item-section>
          <q-item-section>Dark</q-item-section>
        </q-item>

        <q-item
          clickable
          :active="ThemeStore.mode === 'auto'"
          active-class="text-primary text-weight-bold"
          @click="ThemeStore.setMode('auto')"
        >
          <q-item-section avatar>
            <q-icon name="brightness_auto" />
          </q-item-section>
          <q-item-section>System</q-item-section>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<style scoped>
.theme-menu {
  overflow: hidden;
}
</style>
