<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import PlanSelector from '@/components/settings/PlanSelector.vue'
import PlaybackPreferences from '@/components/settings/PlaybackPreferences.vue'
import SettingsCard from '@/components/settings/SettingsCard.vue'
import { extractErrorMessage } from '@/api/http'
import { useToast } from '@/composables/useToast'
import { useAccountStore } from '@/stores/account.store'
import { useAuthStore } from '@/stores/auth.store'
import { useProfilesStore } from '@/stores/profiles.store'
import { useWatchlistStore } from '@/stores/watchlist.store'
import { useCatalogStore } from '@/stores/catalog.store'
import type { Plan, UserPreferences } from '@/types/api'

const PLAN_NAMES: Record<Plan, string> = {
  BASIC: 'Básico',
  STANDARD: 'Padrão',
  PREMIUM: 'Premium',
}

const router = useRouter()
const accountStore = useAccountStore()
const authStore = useAuthStore()
const profilesStore = useProfilesStore()
const watchlistStore = useWatchlistStore()
const catalogStore = useCatalogStore()
const { showToast } = useToast()

const accountForm = reactive({ name: '', email: '' })
const savingAccount = ref(false)
const searchQuery = ref('')

watch(searchQuery, (query) => {
  if (query.trim()) {
    void router.push({ name: 'browse' })
  }
})

onMounted(async () => {
  if (!accountStore.account) {
    await accountStore.fetchAccount().catch(() => undefined)
  }
  accountForm.name = accountStore.account?.name ?? ''
  accountForm.email = accountStore.account?.email ?? ''
})

async function saveAccount(): Promise<void> {
  savingAccount.value = true
  try {
    await accountStore.updateAccount({
      name: accountForm.name.trim(),
      email: accountForm.email.trim(),
    })
    showToast('Alterações salvas')
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível salvar as alterações.'))
  } finally {
    savingAccount.value = false
  }
}

async function selectPlan(plan: Plan): Promise<void> {
  try {
    await accountStore.updatePlan(plan)
    showToast(`Plano ${PLAN_NAMES[plan]} selecionado`)
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível alterar o plano.'))
  }
}

async function updatePreferences(payload: Partial<UserPreferences>): Promise<void> {
  try {
    await accountStore.updatePreferences(payload)
  } catch (error) {
    showToast(extractErrorMessage(error, 'Não foi possível salvar a preferência.'))
  }
}

function switchProfile(): void {
  void router.push({ name: 'profiles' })
}

function manageProfiles(): void {
  void router.push({ name: 'profiles', query: { manage: '1' } })
}

async function logout(): Promise<void> {
  await authStore.logout()
  profilesStore.reset()
  watchlistStore.reset()
  accountStore.reset()
  catalogStore.$reset()
  void router.push({ name: 'login' })
}
</script>

<template>
  <div class="min-h-screen bg-background">
    <AppHeader v-model:search="searchQuery" />

    <div class="mx-auto max-w-[820px] animate-fade-in px-5 pt-9 pb-20 sm:px-6">
      <RouterLink
        :to="{ name: 'browse' }"
        class="mb-4.5 inline-flex items-center gap-2 text-[13.5px] font-bold text-foreground/55 hover:text-primary-soft"
      >
        ← Voltar ao catálogo
      </RouterLink>
      <h1 class="m-0 mb-7.5 font-display text-[32px] font-extrabold tracking-[-0.5px]">
        Configurações da conta
      </h1>

      <LoadingSpinner v-if="!accountStore.account" />

      <div v-else class="flex flex-col gap-5">
        <SettingsCard title="Conta">
          <div class="mb-4 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-3.5">
            <BaseInput v-model="accountForm.name" label="Nome" placeholder="Seu nome" />
            <BaseInput
              v-model="accountForm.email"
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
            />
          </div>
          <BaseButton :loading="savingAccount" class="!px-6 !py-3 !text-[13.5px]" @click="saveAccount">
            Salvar alterações
          </BaseButton>
        </SettingsCard>

        <SettingsCard title="Plano">
          <PlanSelector :current-plan="accountStore.account.plan" @select="selectPlan" />
        </SettingsCard>

        <SettingsCard title="Reprodução">
          <PlaybackPreferences
            :preferences="accountStore.account.preferences"
            @update="updatePreferences"
          />
        </SettingsCard>

        <SettingsCard title="Sessão">
          <div class="flex flex-wrap gap-3">
            <BaseButton variant="ghost" class="!py-3 !text-sm" @click="switchProfile">
              Trocar perfil
            </BaseButton>
            <BaseButton variant="ghost" class="!py-3 !text-sm" @click="manageProfiles">
              Gerenciar perfis
            </BaseButton>
            <BaseButton variant="danger" class="!py-3 !text-sm" @click="logout">
              Sair da conta
            </BaseButton>
          </div>
        </SettingsCard>
      </div>
    </div>
  </div>
</template>
