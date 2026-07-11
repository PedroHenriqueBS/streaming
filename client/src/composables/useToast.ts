import { useToastStore } from '@/stores/toast.store'

export function useToast() {
  const toastStore = useToastStore()
  return {
    showToast: (message: string) => toastStore.show(message),
  }
}
