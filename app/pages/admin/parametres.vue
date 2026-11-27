<script setup lang="ts">
import { adminLocalized, type AdminSettings } from '~~/shared/types/admin'
import { whatsappLink } from '~/utils/whatsappCommerce'
definePageMeta({ name: 'regie-settings', layout: 'admin', middleware: 'shop-auth', shopRole: 'admin',
  i18n: { paths: { fr: '/admin/parametres', es: '/admin/ajustes' } } })
const a = useRegieText()
const refreshRegieStorefront = useRegieStorefrontRefresh()
const request = useRequestFetch()
const { data, error, refresh, status } = await useAsyncData('regie-settings', () => request<AdminSettings | null>('/api/regie/settings'))
const form = reactive<AdminSettings>({
  store_name: '', whatsapp_number: '', support_email: '', currency_symbol: 'F',
  announcement: adminLocalized(null), support_information: adminLocalized(null), is_open: true,
})
const baseline = ref('')
const feedback = ref<RegieLabel>()
const failed = ref(false)
const saving = ref(false)
const languages = ['fr', 'es'] as const
const testUrl = computed(() => whatsappLink(form.whatsapp_number, a('testMessage')))
const dirty = computed(() => !!baseline.value && JSON.stringify(form) !== baseline.value)
useRegieUnsaved(dirty)
function init(value?: AdminSettings | null) {
  if (value) Object.assign(form, {
    store_name: value.store_name, whatsapp_number: value.whatsapp_number ?? '', support_email: value.support_email ?? '',
    currency_symbol: value.currency_symbol, announcement: adminLocalized(value.announcement),
    support_information: adminLocalized(value.support_information), is_open: value.is_open, updated_at: value.updated_at,
  })
  baseline.value = JSON.stringify(form)
}
watch(status, current => { if (current === 'success' && !baseline.value) init(data.value) }, { immediate: true })
async function save() {
  if (saving.value) return
  saving.value = true
  try {
    const result = await $fetch<AdminSettings>('/api/regie/settings', { method: 'PATCH', body: form })
    init(result)
    failed.value = false
    feedback.value = 'saved'
    await refreshRegieStorefront()
  } catch (error) { failed.value = true; feedback.value = regieError(error) }
  finally { saving.value = false }
}
</script>

<template>
  <div class="regie-stack">
    <header class="regie-title"><h1>{{ a('settings') }}</h1><p>{{ a('settingsIntro') }}</p></header>
    <p v-if="error" class="regie-feedback" data-error role="alert">{{ a(regieError(error)) }}
      <button type="button" class="regie-button" @click="refresh()">{{ a('retry') }}</button>
    </p>
    <p v-else-if="!baseline" role="status">{{ a('loading') }}</p>
    <form v-else class="regie-editor" @submit.prevent="save">
      <div class="regie-editor-toolbar">
        <button type="submit" class="regie-button" data-tone="primary" :disabled="saving || !dirty">{{ a(saving ? 'saving' : 'saveChanges') }}</button>
        <p v-if="feedback" class="regie-feedback" :data-error="failed" :role="failed ? 'alert' : 'status'">{{ a(feedback) }}</p>
      </div>
      <fieldset class="regie-settings-grid" :disabled="saving">
        <section class="regie-surface">
          <h2><Icon name="ion-storefront-outline" size="20" />{{ a('general') }}</h2>
          <label class="regie-field"><span>{{ a('storeName') }}</span><input v-model="form.store_name" maxlength="100" required></label>
          <label class="regie-field"><span>{{ a('currency') }}</span><input v-model="form.currency_symbol" maxlength="12" required></label>
          <label class="regie-check"><input v-model="form.is_open" type="checkbox">{{ a('storeOpen') }}</label>
        </section>
        <section class="regie-surface">
          <h2><Icon name="ion:logo-whatsapp" size="21" />{{ a('whatsapp') }}</h2>
          <label class="regie-field"><span>{{ a('phone') }}</span><input v-model="form.whatsapp_number" type="tel" maxlength="40" autocomplete="off"><small>{{ a('phoneHint') }}</small></label>
          <a v-if="testUrl" class="regie-button" :href="testUrl" target="_blank" rel="noopener noreferrer">
            {{ a('testWhatsapp') }} <Icon name="ion:open-outline" size="17" />
          </a>
        </section>
        <section class="regie-surface">
          <h2><Icon name="ion:headset-outline" size="20" />{{ a('publicSupport') }}</h2>
          <label class="regie-field"><span>{{ a('email') }}</span><input v-model="form.support_email" type="email" maxlength="254"></label>
          <label v-for="language in languages" :key="language" class="regie-field">
            <span>{{ a('supportInfo') }} · {{ a(language) }}</span>
            <textarea v-model="form.support_information[language]" maxlength="1500" rows="3" :lang="language" />
          </label>
        </section>
        <section class="regie-surface">
          <h2><Icon name="ion:megaphone-outline" size="20" />{{ a('communication') }}</h2>
          <label v-for="language in languages" :key="language" class="regie-field"><span>{{ a('announcement') }} · {{ a(language) }}</span>
            <textarea v-model="form.announcement[language]" maxlength="250" rows="3" :lang="language" />
          </label>
        </section>
      </fieldset>
    </form>
  </div>
</template>
