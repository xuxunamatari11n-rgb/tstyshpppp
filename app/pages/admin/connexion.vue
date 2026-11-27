<script setup lang="ts">
import { regieDestination, regieReturnQuery } from '~~/shared/utils/regieDestination'

definePageMeta({ name: 'regie-login', layout: 'regie-auth',
  i18n: { paths: { fr: '/admin/connexion', es: '/admin/acceso' } } })
const { t, locale } = useI18n()
const route = useRoute()
const path = useLocalePath()
const request = useRequestFetch()
const { invalidate } = useShopIdentityControl()
const session = useShopSession()
const { data, error, refresh } = session
const user = computed(() => data.value?.user)
const formElement = useTemplateRef<HTMLFormElement>('formElement')
const headingElement = useTemplateRef<HTMLHeadingElement>('headingElement')
const working = ref(false)
const failure = ref('')
const notice = ref<'sent' | 'updated' | 'denied'>()
const otherAccount = ref(false)
const email = ref('')
const password = ref('')
const confirmation = ref('')
const field = ref<'email' | 'password' | 'confirmation'>()
const mode = computed(() => route.query.intent === 'reset' ? 'reset' : route.query.intent === 'recovery' ? 'recover' : 'login')
const recovery = useAsyncData('regie-recovery-state', () => mode.value === 'recover'
  ? request<{ active: boolean }>('/api/auth/regie-recovery') : Promise.resolve({ active: false }), { watch: [mode] })

function loginPath(intent?: string) {
  const next = regieReturnQuery(route.query.next, route.query.product)
  return path({ name: 'regie-login', query: { ...next, ...(intent ? { intent } : {}) } })
}
function destination() {
  return path(regieDestination(route.query.next, route.query.product))
}

await session
await recovery
if (mode.value === 'login' && route.query.auth !== 'invalid' && user.value?.role === 'admin') {
  await navigateTo(destination(), { replace: true })
}

const view = computed(() => {
  if (notice.value) return notice.value
  if (error.value) return 'unavailable'
  if (route.query.auth === 'invalid' || (mode.value === 'recover' && !recovery.data.value?.active)) return 'expired'
  if (mode.value === 'login' && user.value?.role === 'customer' && !otherAccount.value) return 'denied'
  return mode.value
})
const title = computed(() => t('regieAuth.' + ({
  login: 'title', reset: 'resetTitle', recover: 'recoverTitle', sent: 'sentTitle', updated: 'updatedTitle',
  denied: 'deniedTitle', expired: 'expiredTitle', unavailable: 'unavailableTitle',
} as const)[view.value]))
useSeoMeta({ title: () => t('regieAuth.access'), robots: 'noindex, nofollow' })
watch([mode, () => route.query.auth], () => {
  notice.value = undefined
  failure.value = ''
  field.value = undefined
  password.value = ''
  confirmation.value = ''
})
watch(view, () => headingElement.value?.focus({ preventScroll: true }), { flush: 'post' })
function useOtherAccount() {
  notice.value = undefined
  otherAccount.value = true
  failure.value = ''
}
function clearFeedback() {
  failure.value = ''
  field.value = undefined
}
async function invalid(entry: typeof field.value, message: string) {
  field.value = entry
  failure.value = message
  await nextTick()
  formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
async function submit() {
  if (working.value) return
  const action = mode.value
  clearFeedback()
  const values = new FormData(formElement.value ?? undefined)
  const mail = String(values.get('email') ?? email.value).trim()
  const secret = String(values.get('password') ?? '')
  if (action !== 'recover' && (mail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail))) {
    return invalid('email', 'emailError')
  }
  if (action !== 'reset' && (!secret || secret.length > 128 || (action === 'recover' && secret.length < 8))) {
    return invalid('password', action === 'login' ? 'passwordError' : 'passwordLength')
  }
  if (action === 'recover' && secret !== values.get('confirmation')) return invalid('confirmation', 'mismatch')
  working.value = true
  try {
    await $fetch('/api/auth/action', { method: 'POST', body: {
      area: 'regie', action, email: mail, password: secret, locale: locale.value,
      owner: action === 'recover' ? user.value?.id : undefined,
    } })
    if (action === 'reset') {
      notice.value = 'sent'
      return
    }
    if (action === 'recover') {
      notice.value = 'updated'
      return
    }
    invalidate(undefined)
    try { localStorage.setItem('testy-shop/auth-changed', String(Date.now())) } catch {}
    await refresh()
    if (user.value?.role === 'admin' && !error.value) await navigateTo(destination(), { replace: true })
    else if (user.value?.role === 'customer') notice.value = 'denied'
    else failure.value = 'unavailableTitle'
  } catch (caught) {
    const code = (caught as { data?: { data?: { code?: string } } }).data?.data?.code
    if (code === 'denied') notice.value = 'denied'
    else if (code === 'expired') await navigateTo({ path: route.path, query: { auth: 'invalid' } }, { replace: true })
    else if (code === 'password' && action === 'recover') await invalid('password', 'passwordLength')
    else if (code === 'email') await invalid('email', 'emailError')
    else if (code === 'credentials' || code === 'rate' || code === 'unconfirmed' || code === 'reauth') failure.value = code
    else failure.value = 'unavailableTitle'
  } finally {
    password.value = ''
    confirmation.value = ''
    working.value = false
  }
}
</script>

<template>
  <section class="regie-auth-panel" aria-labelledby="regie-login-title">
    <div class="regie-auth-badge" aria-hidden="true"><Icon name="ion:shield-checkmark-outline" size="24" /></div>
    <div class="regie-auth-heading">
      <h1 id="regie-login-title" ref="headingElement" tabindex="-1">{{ title }}</h1>
      <p>{{ t('regieAuth.' + view + 'Description') }}</p>
    </div>
    <form v-if="view === 'login' || view === 'reset' || view === 'recover'" ref="formElement"
      class="regie-auth-form" novalidate :aria-busy="working" @submit.prevent="submit">
      <UiInput v-if="view !== 'recover'" v-model="email" name="email" type="email" :label="t('regieAuth.email')"
        autocomplete="username" maxlength="254" autocapitalize="none" :disabled="working"
        :error="field === 'email' ? t('regieAuth.' + failure) : undefined" required @update:model-value="clearFeedback" />
      <AuthPasswordField v-if="view !== 'reset'" :key="view" v-model="password" name="password"
        :label="t(view === 'recover' ? 'regieAuth.newPassword' : 'regieAuth.password')"
        :autocomplete="view === 'recover' ? 'new-password' : 'current-password'"
        :error="field === 'password' ? t('regieAuth.' + failure) : undefined" :disabled="working" @update:model-value="clearFeedback" />
      <AuthPasswordField v-if="view === 'recover'" v-model="confirmation" name="confirmation" :label="t('regieAuth.confirmPassword')"
        autocomplete="new-password" :disabled="working" :error="field === 'confirmation' ? t('regieAuth.' + failure) : undefined" @update:model-value="clearFeedback" />
      <p v-if="failure && !field" class="regie-auth-error" role="alert">{{ t('regieAuth.' + failure) }}</p>
      <NuxtLink v-if="view === 'login'" class="regie-auth-link regie-auth-forgot" :to="loginPath('reset')">{{ t('regieAuth.forgot') }}</NuxtLink>
      <UiButton type="submit" :loading="working" :disabled="working">
        {{ t(working ? 'regieAuth.working' : view === 'login' ? 'regieAuth.submit' : view === 'reset' ? 'regieAuth.send' : 'regieAuth.update') }}
        <Icon v-if="!working" name="ion:arrow-forward-outline" size="19" aria-hidden="true" />
      </UiButton>
      <NuxtLink v-if="view !== 'login'" class="regie-auth-link" :to="loginPath()">{{ t('regieAuth.back') }}</NuxtLink>
    </form>
    <div v-else class="regie-auth-form">
      <UiButton v-if="view === 'denied'" type="button" @click="useOtherAccount">{{ t('regieAuth.otherAccount') }}</UiButton>
      <NuxtLink v-if="view === 'denied' && user" class="regie-auth-link" :to="path('account')">{{ t('regieAuth.customerAccount') }}</NuxtLink>
      <NuxtLink v-else-if="view === 'expired'" class="ui-button" data-variant="primary" :to="loginPath('reset')">{{ t('regieAuth.requestNew') }}</NuxtLink>
      <NuxtLink v-else-if="view === 'updated'" class="ui-button" data-variant="primary" :to="destination()">{{ t('regieAuth.submit') }}</NuxtLink>
      <UiButton v-else-if="view === 'unavailable'" type="button" @click="refresh()">{{ t('regieAuth.retry') }}</UiButton>
      <NuxtLink v-if="view === 'sent' || view === 'expired'" class="regie-auth-link" :to="loginPath()">{{ t('regieAuth.back') }}</NuxtLink>
    </div>
  </section>
</template>

