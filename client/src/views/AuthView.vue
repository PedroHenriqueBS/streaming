<script setup lang="ts">
import AppLogo from '@/components/ui/AppLogo.vue'
import LoginForm from '@/components/auth/LoginForm.vue'
import PosterWall from '@/components/auth/PosterWall.vue'
import RegisterForm from '@/components/auth/RegisterForm.vue'

defineProps<{ mode: 'login' | 'register' }>()
</script>

<template>
  <div class="fixed inset-0 overflow-hidden bg-background">
    <PosterWall />

    <div class="relative flex min-h-screen items-center justify-center px-5 py-8">
      <div
        class="w-full max-w-[420px] animate-fade-up rounded-[20px] border border-white/10 bg-[rgba(17,15,13,0.82)] p-10 px-10 shadow-[0_40px_90px_rgba(0,0,0,0.6)] backdrop-blur-[18px]"
      >
        <AppLogo size="lg" class="mb-8" />
        <LoginForm v-if="mode === 'login'" />
        <RegisterForm v-else />
      </div>
    </div>
  </div>
</template>
