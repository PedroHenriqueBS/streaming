import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { useProfilesStore } from '@/stores/profiles.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/AuthView.vue'),
      props: { mode: 'login' },
      meta: { guestOnly: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/AuthView.vue'),
      props: { mode: 'register' },
      meta: { guestOnly: true },
    },
    {
      path: '/profiles',
      name: 'profiles',
      component: () => import('@/views/ProfilesView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/browse/:section(movies|series|animation|my-list)?',
      name: 'browse',
      component: () => import('@/views/BrowseView.vue'),
      meta: { requiresAuth: true, requiresProfile: true },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { requiresAuth: true, requiresProfile: true },
    },
    { path: '/:pathMatch(.*)*', redirect: { name: 'browse' } },
  ],
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  await authStore.bootstrap()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' }
  }
  if (to.meta.guestOnly && authStore.isAuthenticated) {
    return { name: 'profiles' }
  }
  if (to.meta.requiresProfile) {
    const profilesStore = useProfilesStore()
    if (!profilesStore.loaded) {
      await profilesStore.fetchProfiles()
    }
    if (!profilesStore.activeProfile) {
      return { name: 'profiles' }
    }
  }
  return true
})

export default router
