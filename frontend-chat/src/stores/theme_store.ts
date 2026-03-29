import { reactive } from 'vue'
import { Dark } from 'quasar'

type ThemeMode = 'light' | 'dark' | 'auto'

export const ThemeStore = reactive({
  mode: (localStorage.getItem('theme-mode') as ThemeMode) || 'auto',

  setMode(mode: ThemeMode) {
    this.mode = mode
    localStorage.setItem('theme-mode', mode)
    this.apply()
  },

  init() {
    this.apply()
  },

  apply() {
    if (this.mode === 'auto') {
      Dark.set('auto')
    } else {
      Dark.set(this.mode === 'dark')
    }
  }
})

// Initialize theme on store load
ThemeStore.init()
