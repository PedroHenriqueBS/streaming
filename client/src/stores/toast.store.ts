import { defineStore } from 'pinia'

const TOAST_DURATION_MS = 2200

interface ToastState {
  message: string
  visible: boolean
  timeoutId: ReturnType<typeof setTimeout> | null
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    message: '',
    visible: false,
    timeoutId: null,
  }),

  actions: {
    show(message: string): void {
      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }
      this.message = message
      this.visible = true
      this.timeoutId = setTimeout(() => {
        this.visible = false
        this.timeoutId = null
      }, TOAST_DURATION_MS)
    },
  },
})
