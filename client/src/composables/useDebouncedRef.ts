import { ref, watch, type Ref } from 'vue'

/** Mirrors `source` into the returned ref, delayed by `delayMs`. */
export function useDebouncedRef<T>(source: Ref<T>, delayMs = 350): Ref<T> {
  const debounced = ref(source.value) as Ref<T>
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(source, (value) => {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      debounced.value = value
    }, delayMs)
  })

  return debounced
}
