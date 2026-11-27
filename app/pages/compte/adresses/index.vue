<script setup lang="ts">
import type { CustomerAddress } from '~/types/customer'

definePageMeta({ name: 'account-addresses', layout: 'account', middleware: 'customer-account', i18n: { paths: { fr: '/compte/adresses', es: '/cuenta/direcciones' } } })
const { t } = useI18n()
const localePath = useLocalePath()
const { addresses, addressStatus, loadAddresses, changeAddress } = useCustomerAccount()
const working = ref(false)
const feedback = ref<'deleted' | 'defaultSet' | 'defaultError' | ''>('')
const deletionError = ref(false)
const selected = shallowRef<CustomerAddress>()
const dialog = useTemplateRef('dialog')
const cancelButton = useTemplateRef('cancelButton')
const heading = useTemplateRef('heading')
const title = useId()
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(dialog, cancelButton, { mobileOnly: false })
const motion = useStorefrontTransition(16)

useSeoMeta({ title: () => t('customer.nav.addresses'), robots: 'noindex, nofollow' })
onMounted(() => { void loadAddresses(true) })

function askToRemove(address: CustomerAddress, event: MouseEvent) {
  if (!(event.currentTarget instanceof HTMLElement) || working.value) return
  selected.value = address
  deletionError.value = false
  feedback.value = ''
  void open(event.currentTarget)
}

function cancel() { if (!working.value) close() }
function dismiss() {
  finishClose()
  if (feedback.value === 'deleted') heading.value?.focus({ preventScroll: true })
  selected.value = undefined
}

async function update(id: string, action: 'delete' | 'default') {
  if (working.value) return
  working.value = true
  feedback.value = ''
  deletionError.value = false
  try {
    if (await changeAddress(id, action)) {
      feedback.value = action === 'delete' ? 'deleted' : 'defaultSet'
      if (action === 'delete') close(false)
    }
  } catch {
    if (action === 'delete') deletionError.value = true
    else feedback.value = 'defaultError'
  } finally { working.value = false }
}
</script>

<template>
  <section class="customer-detail customer-addresses">
    <div class="customer-section-head">
      <h2 ref="heading" tabindex="-1">{{ t('customer.addresses.saved') }}</h2>
      <NuxtLink :to="localePath({ name: 'account-address-new' })" class="ui-button" data-variant="primary">
        <Icon name="ion:add-outline" size="20" aria-hidden="true" /> {{ t('customer.addresses.add') }}
      </NuxtLink>
    </div>
    <p class="customer-description">{{ t('customer.addresses.description') }}</p>
    <CustomerFeedback v-if="feedback" :error="feedback === 'defaultError'">{{ t(`customer.addresses.${feedback}`) }}</CustomerFeedback>
    <UiSkeleton v-if="!addresses.length && (addressStatus === 'idle' || addressStatus === 'loading')" class="min-h-56 w-full" />
    <p v-if="addressStatus === 'error'" class="customer-feedback" role="alert">
      {{ t('customer.addresses.loadError') }}
      <button type="button" class="commerce-text-link" @click="loadAddresses(true)">{{ t('catalogue.retry') }}</button>
    </p>
    <div v-if="addressStatus === 'ready' && !addresses.length" class="customer-empty">
      <span><Icon name="ion:location-outline" size="30" aria-hidden="true" /></span>
      <h3>{{ t('customer.addresses.emptyTitle') }}</h3>
      <p>{{ t('customer.addresses.emptyText') }}</p>
    </div>
    <ul v-if="addresses.length" class="customer-address-grid">
      <li v-for="address in addresses" :key="address.id" class="customer-address" :data-default="address.is_default">
        <div class="customer-address-title">
          <h3>{{ address.label }}</h3>
          <span v-if="address.is_default" class="customer-default-tag"><Icon name="ion:checkmark-outline" size="15" aria-hidden="true" />{{ t('customer.addresses.default') }}</span>
        </div>
        <address>
          <strong>{{ address.recipient_name }}</strong>
          <span>{{ address.recipient_phone }}</span>
          <span>{{ address.street }}</span>
          <span>{{ [address.district, address.city, address.country].filter(Boolean).join(', ') }}</span>
        </address>
        <p v-if="address.delivery_instructions" class="customer-address-notes">{{ address.delivery_instructions }}</p>
        <div class="customer-address-actions">
          <NuxtLink :to="localePath({ name: 'account-address-edit', params: { id: address.id } })" class="ui-button" data-variant="outline"
            :aria-label="t('customer.addresses.editNamed', { name: address.label })">{{ t('customer.addresses.editAction') }}</NuxtLink>
          <UiButton variant="ghost" :disabled="working" :aria-label="t('customer.addresses.deleteNamed', { name: address.label })"
            @click="askToRemove(address, $event)">{{ t('customer.addresses.delete') }}</UiButton>
          <button v-if="!address.is_default" type="button" class="commerce-text-link" :disabled="working" @click="update(address.id, 'default')">
            {{ t('customer.addresses.makeDefault') }}
          </button>
        </div>
      </li>
    </ul>
    <dialog ref="dialog" class="commerce-dialog customer-delete-dialog" :aria-labelledby="title"
      @cancel.prevent="cancel" @click.self="cancel" @keydown.tab="trapFocus">
      <Transition v-bind="motion" :css="false" @after-leave="dismiss">
        <section v-show="active" class="customer-delete-panel">
          <h2 :id="title">{{ t('customer.addresses.deleteTitle') }}</h2>
          <p v-if="selected">{{ t('customer.addresses.deleteDescription', { name: selected.label }) }}</p>
          <CustomerFeedback v-if="deletionError" error>{{ t('customer.addresses.deleteError') }}</CustomerFeedback>
          <div class="customer-actions">
            <button ref="cancelButton" type="button" class="ui-button" data-variant="outline" :disabled="working" @click="cancel">{{ t('customer.cancel') }}</button>
            <UiButton variant="secondary" :disabled="working" :loading="working" @click="selected && update(selected.id, 'delete')">
              {{ t('customer.addresses.delete') }}
            </UiButton>
          </div>
        </section>
      </Transition>
    </dialog>
  </section>
</template>

