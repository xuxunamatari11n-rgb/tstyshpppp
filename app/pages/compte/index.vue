<script setup lang="ts">
definePageMeta({ name: 'account', layout: false, i18n: { paths: { fr: '/compte', es: '/cuenta' } } })

const { t } = useI18n()
const { setUser } = useCustomerSession()
const panel = useTemplateRef('panel')
const title = useTemplateRef('title')
const form = useTemplateRef('form')
const { play } = useEntranceMotion(panel, { duration: 0.28, opacity: 0.86 })
const { user, mode, working, failure, notice, fieldErrors, email, password, confirmation, firstName, lastName,
  view, session, refresh, accountLink, returnDestination, clearField, submit } = useAuthFlow(form)
await session
const signedIn = computed(() => view.value === 'signedIn' && !!user.value)
watch([signedIn, user], () => { if (signedIn.value && user.value) setUser(user.value) }, { immediate: true })

const isForm = computed(() => view.value === 'login' || view.value === 'signup' || view.value === 'reset' || view.value === 'recover')
const compact = computed(() => view.value !== 'login' && view.value !== 'signup')
const stateIcons = {
  signupSent: 'ion:mail-outline',
  resetSent: 'ion:mail-outline',
  confirmed: 'ion:checkmark-outline',
  updated: 'ion:checkmark-outline',
  expired: 'ion:time-outline',
  unavailable: 'ion:alert-circle-outline',
  signedIn: 'ion:person-outline',
}
const stateIcon = computed(() => stateIcons[view.value as keyof typeof stateIcons])
const signupBenefits = [
  { key: 'favorites', icon: 'ion:heart-outline' },
  { key: 'addresses', icon: 'ion:location-outline' },
  { key: 'support', icon: 'ion:headset-outline' },
]
const actionLabels = {
  login: 'auth.login',
  signup: 'auth.signup',
  reset: 'auth.access.sendLink',
  recover: 'auth.access.updatePassword',
}

useSeoMeta({ title: () => t('auth.account'), robots: 'noindex, nofollow' })

watch(view, () => {
  title.value?.focus()
  play()
}, { flush: 'post' })
</script>

<template>
  <NuxtLayout :name="signedIn ? 'account' : 'auth'">
  <CustomerOverview v-if="signedIn" />
  <section v-else :key="view" ref="panel" class="auth-panel" :data-auth-compact="compact || undefined" aria-labelledby="shop-auth-title">
    <div
      v-if="stateIcon" class="auth-status-icon"
      :data-tone="view === 'confirmed' || view === 'updated' ? 'success' : view === 'expired' || view === 'unavailable' ? 'neutral' : undefined"
    >
      <Icon :name="stateIcon" size="27" aria-hidden="true" />
    </div>
    <div class="auth-intro">
      <h1 id="shop-auth-title" ref="title" tabindex="-1">{{ t(`auth.access.states.${view}.title`) }}</h1>
      <p v-if="view === 'signedIn' && user">{{ t('auth.access.greeting', { name: user.firstName || user.email }) }}</p>
      <p v-else>{{ t(`auth.access.states.${view}.description`) }}</p>
    </div>

    <p v-if="failure" class="auth-feedback" role="alert">
      <Icon name="ion:alert-circle-outline" size="21" aria-hidden="true" />
      {{ t(`auth.errors.${failure}`) }}
    </p>

    <UiSkeleton v-if="view === 'pending'" class="w-full" />
    <UiButton v-else-if="view === 'unavailable'" class="auth-primary" @click="refresh()">{{ t('catalogue.retry') }}</UiButton>

    <form v-else-if="isForm" ref="form" class="auth-form" novalidate @submit.prevent="submit(mode)">
      <p v-if="Object.keys(fieldErrors).length" class="sr-only" role="alert">{{ t('auth.access.checkFields') }}</p>
      <div v-if="mode === 'signup'" class="auth-name-fields">
        <UiInput v-model="firstName" :label="t('auth.firstName')" name="firstName" maxlength="80" autocomplete="given-name" :disabled="working" />
        <UiInput v-model="lastName" :label="t('auth.lastName')" name="lastName" maxlength="80" autocomplete="family-name" :disabled="working" />
      </div>
      <UiInput
        v-if="mode !== 'recover'" v-model="email" :label="t('auth.email')" name="email" type="email" autocomplete="email"
        inputmode="email" autocapitalize="none" spellcheck="false" maxlength="254" required :disabled="working"
        :error="fieldErrors.email && t(fieldErrors.email)" @update:model-value="clearField('email')"
      />
      <AuthPasswordField
        v-if="mode !== 'reset'" v-model="password" name="password"
        :label="t(mode === 'recover' ? 'auth.access.newPassword' : 'auth.password')"
        :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
        :minlength="mode === 'login' ? undefined : 8"
        :hint="mode === 'login' ? undefined : t('auth.access.passwordHint')" :disabled="working"
        :error="fieldErrors.password && t(fieldErrors.password)" @update:model-value="clearField('password')"
      />
      <AuthPasswordField
        v-if="mode === 'recover'" v-model="confirmation" name="confirmation" :label="t('auth.access.confirmPassword')"
        autocomplete="new-password" :disabled="working"
        :error="fieldErrors.confirmation && t(fieldErrors.confirmation)" @update:model-value="clearField('confirmation')"
      />
      <NuxtLink v-if="mode === 'login'" :to="accountLink('reset')" class="auth-text-link auth-forgot">
        {{ t('auth.access.forgot') }}
      </NuxtLink>
      <UiButton class="auth-primary" type="submit" :loading="working" :disabled="working">
        {{ t(working ? 'auth.access.pendingAction' : actionLabels[mode]) }}
      </UiButton>
    </form>

    <div v-if="view === 'login' || view === 'signup'" class="auth-switch">
      <p>
        {{ t(view === 'login' ? 'auth.access.noAccount' : 'auth.access.haveAccount') }}
        <NuxtLink :to="view === 'login' ? accountLink('create-account') : accountLink()" class="auth-text-link">
          {{ t(view === 'login' ? 'auth.signup' : 'auth.login') }}
        </NuxtLink>
      </p>
    </div>
    <ul v-if="view === 'signup'" class="auth-benefits" :aria-label="t('auth.access.accountBenefits')">
      <li v-for="benefit in signupBenefits" :key="benefit.key">
        <Icon :name="benefit.icon" size="17" aria-hidden="true" />
        {{ t(`auth.access.benefits.${benefit.key}`) }}
      </li>
    </ul>
    <div v-if="view === 'reset'" class="auth-switch">
      <NuxtLink :to="accountLink()" class="auth-text-link">{{ t('auth.access.backToLogin') }}</NuxtLink>
    </div>

    <div v-if="view === 'signupSent' || view === 'resetSent' || view === 'confirmed' || view === 'updated' || view === 'expired'" class="auth-state-actions">
      <NuxtLink
        :to="view === 'expired' ? accountLink('reset') : user ? returnDestination() || accountLink() : accountLink()"
        class="ui-button auth-primary" data-variant="primary"
        @click="notice = undefined"
      >
        {{ t(view === 'expired' ? 'auth.access.requestAnotherLink' : user ? 'auth.access.openAccount' : 'auth.access.backToLogin') }}
      </NuxtLink>
      <NuxtLink v-if="view === 'expired'" :to="accountLink()" class="auth-text-link">{{ t('auth.access.backToLogin') }}</NuxtLink>
    </div>
  </section>
  </NuxtLayout>
</template>
