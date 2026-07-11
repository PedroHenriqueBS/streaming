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
  if (!validate(['name', 'confirmation'])) {
    return
  }
  submitting.value = true
  try {
    await authStore.register({
      name: fields.name.trim(),
      email: fields.email.trim(),
      password: fields.password,
    })
    await router.push({ name: 'profiles' })
  } catch (error) {
    errors.email = extractErrorMessage(error, 'Não foi possível criar a conta. Tente novamente.')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <h1 class="mb-1.5 font-display text-[26px] font-bold">Criar conta</h1>
  <p class="mb-7 text-sm text-foreground/55">Filmes, séries e desenhos. Tudo em um só lugar.</p>

  <form class="flex flex-col gap-3.5" novalidate @submit.prevent="submit">
    <BaseInput
      v-model="fields.name"
      placeholder="Nome"
      autocomplete="name"
      :error="errors.name"
      @update:model-value="clearError('name')"
    />
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
      placeholder="Senha (mín. 6 caracteres)"
      autocomplete="new-password"
      :error="errors.password"
      @update:model-value="clearError('password')"
    />
    <BaseInput
      v-model="fields.confirmation"
      type="password"
      placeholder="Confirmar senha"
      autocomplete="new-password"
      :error="errors.confirmation"
      @update:model-value="clearError('confirmation')"
    />
    <BaseButton type="submit" class="mt-2" :loading="submitting">
      {{ submitting ? 'Criando conta…' : 'Criar conta' }}
    </BaseButton>
  </form>

  <p class="mt-6.5 text-center text-sm text-foreground/50">
    Já tem conta?
    <RouterLink :to="{ name: 'login' }" class="font-bold text-primary hover:text-primary-soft">
      Entrar
    </RouterLink>
  </p>
</template>
