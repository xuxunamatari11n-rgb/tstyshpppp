<script setup lang="ts">
import type { ShopRow } from '~~/shared/types/database'

type SavedAddress = Pick<ShopRow<'addresses'>, 'id' | 'label' | 'recipient_name' | 'recipient_phone' | 'country' | 'city' | 'district' | 'street' | 'delivery_instructions'>

const { t } = useI18n()
const localePath = useLocalePath()
const { order } = useCommerce()
const identity = useShopIdentity()
const { name } = useProductContent()
const draft = useOrderPreparation()
const { checking, lines, open: shopOpen, contactAvailable, total, usable, failure, contact, delivery, message, tooLong } = draft
const dialog = useTemplateRef('dialog')
const closeButton = useTemplateRef('closeButton')
const title = useId()
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(dialog, closeButton, { mobileOnly: false })
const motion = useStorefrontTransition(26)
const addresses = shallowRef<SavedAddress[]>([])
const addressChoice = ref('')
let addressRevision = 0
let appliedContact = ''
let appliedDelivery = ''

function clearAddress() {
  ++addressRevision
  addresses.value = []
  addressChoice.value = ''
  if (contact.value === appliedContact) contact.value = ''
  if (delivery.value === appliedDelivery) delivery.value = ''
  appliedContact = ''
  appliedDelivery = ''
}

async function loadAddresses() {
  const owner = identity.value?.id
  if (!owner) return
  const current = ++addressRevision
  try {
    const rows = await $fetch<SavedAddress[]>('/api/account/addresses', { query: { owner } })
    if (active.value && current === addressRevision && owner === identity.value?.id) addresses.value = rows
  } catch { /* Manual details remain available. */ }
}

function applyAddress(event: Event) {
  const id = (event.target as HTMLSelectElement).value
  if (contact.value === appliedContact) contact.value = ''
  if (delivery.value === appliedDelivery) delivery.value = ''
  const address = addresses.value.find(item => item.id === id)
  appliedContact = address ? [address.recipient_name, address.recipient_phone].filter(Boolean).join(' · ') : ''
  appliedDelivery = address ? [address.street, address.district, address.city, address.country, address.delivery_instructions].filter(Boolean).join(', ') : ''
  if (address) {
    contact.value = appliedContact
    delivery.value = appliedDelivery
  }
}

watch(order, value => {
  if (!value) return
  order.value = null
  const invoker = document.activeElement
  if (!(invoker instanceof HTMLElement) || active.value) return
  clearAddress()
  draft.reset(value)
  void open(invoker)
  void draft.refresh()
  void loadAddresses()
})
watch(() => identity.value?.id, () => {
  if (appliedContact) contact.value = ''
  if (appliedDelivery) delivery.value = ''
  clearAddress()
  if (active.value) void loadAddresses()
})

function afterLeave() {
  finishClose()
  clearAddress()
  draft.reset(null)
}
</script>

<template>
  <dialog ref="dialog" class="commerce-dialog commerce-order" :aria-labelledby="title"
    @click.self="close()" @cancel.prevent="close()" @keydown.tab="trapFocus">
    <Transition v-bind="motion" :css="false" @after-leave="afterLeave">
      <div v-show="active" class="commerce-order-panel">
        <header class="commerce-overlay-head">
          <div><h2 :id="title">{{ t('commerce.order.title') }}</h2><p>{{ t('commerce.order.description') }}</p></div>
          <button ref="closeButton" type="button" class="commerce-overlay-close" :aria-label="t('commerce.close')" @click="close()">
            <Icon name="ion:close-outline" size="25" aria-hidden="true" />
          </button>
        </header>
        <div class="commerce-overlay-body commerce-order-body">
          <p v-if="checking" class="commerce-inline-note" role="status">{{ t('commerce.validation.checking') }}</p>
          <p v-if="failure" class="commerce-inline-note" role="alert">
            {{ t(failure) }}
            <button v-if="failure === 'commerce.validation.error'" class="commerce-text-link" type="button" @click="draft.refresh()">{{ t('catalogue.retry') }}</button>
          </p>
          <p v-if="!shopOpen" class="commerce-inline-note" role="status">{{ t('product.shopClosed') }}</p>
          <ul v-if="lines.length" class="commerce-order-lines">
            <li v-for="entry in lines" :key="entry.line.productId">
              <div>
                <strong>{{ entry.product ? name(entry.product) : t('commerce.validation.missing') }}</strong>
                <p>{{ t('commerce.cart.quantityValue', { count: entry.line.quantity }) }}</p>
                <p v-if="entry.status !== 'ready' && entry.status !== 'missing'" class="commerce-row-warning">{{ t(`commerce.validation.${entry.status}`) }}</p>
                <p v-if="entry.priceChanged" class="commerce-row-warning">{{ t('commerce.validation.price') }}</p>
              </div>
              <UiNumericText v-if="entry.status === 'ready' && entry.product" :value="draft.money(entry.product.price * entry.line.quantity)" />
            </li>
          </ul>
          <template v-if="usable">
            <h3>{{ t('commerce.order.optional') }}</h3>
            <p class="commerce-secondary">{{ t('commerce.order.disclosure') }}</p>
            <label v-if="addresses.length" class="ui-field commerce-address">
              <span>{{ t('commerce.order.savedAddress') }}</span>
              <select v-model="addressChoice" class="ui-control" @change="applyAddress">
                <option value="">{{ t('commerce.order.noAddress') }}</option>
                <option v-for="address in addresses" :key="address.id" :value="address.id">{{ address.label }} · {{ address.city }}</option>
              </select>
            </label>
            <UiInput v-model="contact" :label="t('commerce.order.contact')" maxlength="200" />
            <UiInput v-model="delivery" :label="t('commerce.order.delivery')" maxlength="300" />
            <label class="ui-field commerce-preview">
              <span>{{ t('commerce.order.preview') }}</span>
              <textarea class="ui-control" :value="message" readonly rows="7" />
            </label>
            <p v-if="tooLong" class="commerce-inline-note" role="status">{{ t('commerce.order.tooLong') }}</p>
          </template>
          <p v-if="!checking && !usable && lines.length && shopOpen" class="commerce-inline-note">{{ t('commerce.validation.resolve') }}</p>
        </div>
        <footer v-if="lines.length" class="commerce-overlay-actions">
          <p class="commerce-estimate">{{ t('commerce.cart.total') }} <UiNumericText :value="draft.money(total)" /></p>
          <template v-if="!checking && !contactAvailable && usable">
            <p class="commerce-secondary">{{ t('commerce.order.noContact') }}</p>
            <NuxtLink :to="{ path: localePath({ name: 'index' }), hash: '#storefront-assistance' }" class="ui-button" data-variant="outline" @click="close(false)">
              {{ t('commerce.order.assistance') }}
            </NuxtLink>
          </template>
          <UiButton v-else :disabled="checking || !usable || !contactAvailable || tooLong || failure === 'commerce.validation.error'"
            :loading="checking" @click="draft.handoff()">
            <template #icon><Icon name="ion:logo-whatsapp" size="21" aria-hidden="true" /></template>
            {{ t('commerce.order.openWhatsApp') }}
          </UiButton>
        </footer>
      </div>
    </Transition>
  </dialog>
</template>

