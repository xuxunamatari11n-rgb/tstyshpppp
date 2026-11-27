<script setup lang="ts">
import type { CustomerProfile } from '~/types/customer'
import { profileFields } from '~~/shared/utils/customerAccount'

definePageMeta({ name: 'account-profile', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/profil', es: '/cuenta/perfil' } } })
const { t } = useI18n()
const { user, profile, profileStatus, loadProfile, saveProfile } = useCustomerAccount()
const fields = reactive({ first_name: '', last_name: '', phone: '' })
const status = ref<'idle' | 'success' | 'error'>('idle')
const saving = ref(false)
const fieldError = ref<keyof CustomerProfile>()
const form = useTemplateRef('form')
const keys = Object.keys(profileFields) as (keyof typeof profileFields)[]
const autocomplete = { first_name: 'given-name', last_name: 'family-name', phone: 'tel' }

useSeoMeta({ title: () => t('customer.nav.profile'), robots: 'noindex, nofollow' })
watch(profile, value => {
  if (value) Object.assign(fields, { ...value, phone: value.phone ?? '' })
}, { immediate: true })
onMounted(() => { void loadProfile() })

async function save() {
  if (saving.value || !user.value) return
  status.value = 'idle'
  fieldError.value = keys.find(key => fields[key].trim().length > profileFields[key])
  if (fieldError.value) {
    await nextTick()
    form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  saving.value = true
  try {
    if (await saveProfile({ ...fields, phone: fields.phone.trim() || null })) status.value = 'success'
  } catch { status.value = 'error' }
  finally { saving.value = false }
}
</script>

<template>
  <section class="customer-detail customer-profile">
    <p class="customer-description">{{ t('customer.profile.description') }}</p>
    <UiSkeleton v-if="profileStatus === 'loading' || profileStatus === 'idle'" class="min-h-56 w-full" />
    <p v-else-if="!profile && profileStatus === 'error'" class="customer-feedback" role="alert">
      {{ t('customer.profile.loadError') }}
      <button type="button" class="commerce-text-link" @click="loadProfile(true)">{{ t('catalogue.retry') }}</button>
    </p>
    <form v-else-if="profile" ref="form" class="customer-form" novalidate @submit.prevent="save">
      <div class="customer-form-grid">
        <UiInput v-for="key in keys" :key="key" v-model="fields[key]" :name="key" :label="t(`customer.profile.${key}`)"
          :type="key === 'phone' ? 'tel' : 'text'" :autocomplete="autocomplete[key]" :maxlength="profileFields[key]" :disabled="saving"
          :error="fieldError === key ? t('customer.validation.tooLong', { count: profileFields[key] }) : undefined"
          @update:model-value="status = 'idle'; fieldError = undefined" />
        <UiInput :model-value="user?.email ?? ''" :label="t('auth.email')" name="email" type="email" autocomplete="email"
          readonly :hint="t('customer.profile.emailHint')" />
      </div>
      <CustomerFeedback v-if="status !== 'idle'" :error="status === 'error'">{{ t(`customer.profile.${status}`) }}</CustomerFeedback>
      <div class="customer-actions">
        <UiButton type="submit" :disabled="saving" :loading="saving">{{ t('customer.save') }}</UiButton>
      </div>
    </form>
  </section>
</template>

