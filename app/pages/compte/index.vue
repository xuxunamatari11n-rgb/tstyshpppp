<script setup lang="ts">
definePageMeta({ name: 'account', i18n: { paths: { fr: '/compte', es: '/cuenta' } } })
const { t, locale } = useI18n()
const route = useRoute()
const localePath = useLocalePath()
const { data, status, error, refresh } = await useShopSession()
const user = computed(() => data.value?.user)
const mode = computed(() => route.query.intent === 'create-account' ? 'signup'
  : route.query.intent === 'reset' ? 'reset' : route.query.intent === 'recovery' ? 'recover' : 'login')
const working = ref(false)
const failure = ref('')
const notice = ref('')
const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
useSeoMeta({ title: () => t('auth.account'), robots: 'noindex, nofollow' })

function accountLink(intent?: string) {
  return localePath({ name: 'account', query: { intent } })
}

watch(mode, () => { password.value = ''; failure.value = ''; notice.value = '' })
async function submit(action: 'login' | 'signup' | 'reset' | 'recover' | 'logout') {
  if (working.value) return
  working.value = true
  failure.value = ''
  notice.value = ''
  try {
    await $fetch('/api/auth/action', {
      method: 'POST', body: { action, locale: locale.value, email: email.value, password: password.value,
        firstName: firstName.value, lastName: lastName.value },
    })
    password.value = ''
    if (action === 'signup' || action === 'reset') {
      notice.value = action
      await refresh()
    } else {
      await refresh()
      await navigateTo(accountLink(), { replace: true })
      if (action === 'recover') notice.value = 'updated'
    }
  } catch (caught) {
    const reason = (caught as { data?: { data?: { code?: string } } }).data?.data?.code
    failure.value = reason && ['email','password','rate','unconfirmed','credentials','invalid'].includes(reason) ? reason : 'unavailable'
  } finally {
    working.value = false
  }
}
</script>

<template>
  <UiContainer class="py-8 lg:py-12">
    <section class="mx-auto grid max-w-md gap-5" aria-labelledby="shop-auth-title">
      <h1 id="shop-auth-title" class="text-section font-semibold">{{ t('auth.account') }}</h1>
      <p v-if="route.query.auth === 'invalid'" role="alert">{{ t('auth.invalidLink') }}</p>
      <p v-if="route.query.auth === 'confirmed'" role="status">{{ t('auth.confirmed') }}</p>
      <p v-if="notice" role="status" class="text-success-ink">{{ t(`auth.notices.${notice}`) }}</p>
      <p v-if="failure" role="alert" class="text-danger-ink">{{ t(`auth.errors.${failure}`) }}</p>

      <UiSkeleton v-if="status === 'pending'" class="w-full" />
      <UiEmptyState v-else-if="error" :title="t('auth.errors.unavailable')" as="h2">
        <template #action><UiButton variant="outline" @click="refresh()">{{ t('catalogue.retry') }}</UiButton></template>
      </UiEmptyState>
      <div v-else-if="user && mode !== 'recover'" class="grid gap-3">
        <p>{{ user.firstName || user.email }}</p>
        <NuxtLink v-if="user.role === 'admin'" :to="localePath({ name: 'shop-admin' })" class="ui-button w-fit" data-variant="outline">{{ t('auth.admin') }}</NuxtLink>
        <UiButton class="w-fit" variant="outline" :loading="working" @click="submit('logout')">{{ t('auth.logout') }}</UiButton>
      </div>
      <div v-else-if="mode === 'recover' && !user" class="grid gap-3">
        <p>{{ t('auth.invalidLink') }}</p>
        <NuxtLink :to="accountLink('reset')" class="ui-button w-fit" data-variant="outline">{{ t('auth.reset') }}</NuxtLink>
      </div>
      <form v-else class="grid gap-4" @submit.prevent="submit(mode)">
        <h2 class="text-lg font-semibold">{{ t(`auth.${mode}`) }}</h2>
        <div v-if="mode === 'signup'" class="grid grid-cols-2 gap-2">
          <UiInput v-model="firstName" :label="t('auth.firstName')" maxlength="80" autocomplete="given-name" />
          <UiInput v-model="lastName" :label="t('auth.lastName')" maxlength="80" autocomplete="family-name" />
        </div>
        <UiInput v-if="mode !== 'recover'" v-model="email" :label="t('auth.email')" type="email" autocomplete="email" required maxlength="254" />
        <UiInput v-if="mode !== 'reset'" v-model="password" :label="t('auth.password')" type="password" required maxlength="128"
          :minlength="mode === 'login' ? undefined : 8" :autocomplete="mode === 'login' ? 'current-password' : 'new-password'" />
        <UiButton type="submit" :loading="working" :disabled="working">{{ t(`auth.${mode}`) }}</UiButton>
        <div v-if="mode !== 'recover'" class="flex flex-wrap gap-3 text-sm underline underline-offset-4">
          <NuxtLink v-if="mode !== 'login'" :to="accountLink()">{{ t('auth.login') }}</NuxtLink>
          <NuxtLink v-if="mode !== 'signup'" :to="accountLink('create-account')">{{ t('auth.signup') }}</NuxtLink>
          <NuxtLink v-if="mode !== 'reset'" :to="accountLink('reset')">{{ t('auth.reset') }}</NuxtLink>
        </div>
      </form>
    </section>
  </UiContainer>
</template>
