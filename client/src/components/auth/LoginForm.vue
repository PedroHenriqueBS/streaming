<script setup lang="ts">
import { useRouter } from 'vue-router'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { useAuthForm } from '@/composables/useAuthForm'
import { extractErrorMessage } from '@/api/http'
import { useAuthStore } from '@/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()
const { fields, errors, submitting, validate, clearError } = useAuthForm()

async function submit(): Promise<void> {
  if (!validate([])) {
    return
  }
  submitting.value = true
  try {
    await authStore.login({ email: fields.email.trim(), password: fields.password })
    await router.push({ name: 'profiles' })
  } catch (error) {
    errors.password = extractErrorMessage(error, 'Não foi possível entrar. Tente novamente.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <h1 class="mb-1.5 font-display text-[26px] font-bold">Entrar</h1>
  <p class="mb-7 text-sm text-foreground/55">Bem-vindo de volta. Continue de onde parou.</p>

  <form class="flex flex-col gap-3.5" novalidate @submit.prevent="submit">
    <BaseInput
      v-model="fields.email"
      type="email"
      placeholder="E-mail"
      autocomplete="email"
      :error="errors.email"
      @update:model-value="clearError('email')"
    />
    <BaseInput
      v-model="fields.password"
      type="password"
      placeholder="Senha"
      autocomplete="current-password"
      :error="errors.password"
      @update:model-value="clearError('password')"
    />
    <BaseButton type="submit" class="mt-2" :loading="submitting">
      {{ submitting ? 'Entrando…' : 'Entrar' }}
    </BaseButton>
  </form>

  <p class="mt-6.5 text-center text-sm text-foreground/50">
    Primeira vez aqui?
    <RouterLink :to="{ name: 'register' }" class="font-bold text-primary hover:text-primary-soft">
      Criar conta
    </RouterLink>
  </p>
</template>
