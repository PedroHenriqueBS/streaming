import { createPinia, setActivePinia } from 'pinia'
import { useToastStore } from './toast.store'

describe('toast store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('shows a message and hides it after 2.2s', () => {
    const store = useToastStore()
    store.show('Adicionado à sua lista')

    expect(store.visible).toBe(true)
    expect(store.message).toBe('Adicionado à sua lista')

    jest.advanceTimersByTime(2200)
    expect(store.visible).toBe(false)
  })

  it('restarts the timer when a new message arrives', () => {
    const store = useToastStore()
    store.show('Primeira')
    jest.advanceTimersByTime(2000)

    store.show('Segunda')
    jest.advanceTimersByTime(2000)
    expect(store.visible).toBe(true)
    expect(store.message).toBe('Segunda')

    jest.advanceTimersByTime(200)
    expect(store.visible).toBe(false)
  })
})
