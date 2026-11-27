<script setup lang="ts">
import type { AddressForm } from '~/types/customer'
import { addressFields, requiredAddressFields } from '~~/shared/utils/customerAccount'

const props = defineProps<{ id?: string }>()
const { t } = useI18n()
const localePath = useLocalePath()
const { addresses, addressStatus, loadAddresses, saveAddress } = useCustomerAccount()
const fields = reactive<AddressForm>({
  label: '', recipient_name: '', recipient_phone: '', country: '', city: '', district: '', street: '', delivery_instructions: '', is_default: false,
})
const originalDefault = ref(false)
const initialized = ref(!props.id)
const saving = ref(false)
const saved = ref<boolean>()
const feedback = ref<'createError' | 'updateError' | ''>('')
const errors = reactive<Partial<Record<keyof typeof addressFields, string>>>({})
const form = useTemplateRef('form')
const list = computed(() => localePath({ name: 'account-addresses' }))
const address = computed(() => addresses.value.find(entry => entry.id === props.id))
const keys = Object.keys(addressFields) as (keyof typeof addressFields)[]
const autocomplete = {
  label: undefined, recipient_name: 'name', recipient_phone: 'tel', country: 'country-name',
  city: 'address-level2', district: 'address-level3', street: 'street-address', delivery_instructions: undefined,
}

function required(key: keyof typeof addressFields) { return requiredAddressFields.some(field => field === key) }

watch([address, addressStatus], () => {
  if (initialized.value || !address.value || addressStatus.value !== 'ready') return
  const item = address.value
  for (const key of keys) fields[key] = item[key] ?? ''
  fields.is_default = item.is_default
  originalDefault.value = item.is_default
  initialized.value = true
}, { immediate: true })
onMounted(() => { if (props.id) void loadAddresses(true) })

async function save() {
  if (saving.value || saved.value !== undefined) return
  feedback.value = ''
  for (const key of keys) {
    const value = fields[key].trim()
    delete errors[key]
    if (!value && required(key)) errors[key] = t('customer.validation.required')
    else if (value.length > addressFields[key]) errors[key] = t('customer.validation.tooLong', { count: addressFields[key] })
  }
  if (Object.keys(errors).length) {
    await nextTick()
    form.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  saving.value = true
  try {
    const result = await saveAddress(fields, props.id, !props.id || originalDefault.value !== fields.is_default)
    if (result) saved.value = result.defaultApplied
  } catch { feedback.value = props.id ? 'updateError' : 'createError' }
  finally { saving.value = false }
}
</script>

<template>
  <section class="customer-detail customer-address-form">
    <p class="customer-description">{{ t('customer.addresses.formDescription') }}</p>
    <template v-if="saved !== undefined">
      <CustomerFeedback :warning="!saved">{{ t(saved ? 'customer.addresses.savedFeedback' : 'customer.addresses.savedDefaultWarning') }}</CustomerFeedback>
      <NuxtLink :to="list" class="ui-button" data-variant="primary">{{ t('customer.addresses.returnList') }}</NuxtLink>
    </template>
    <UiSkeleton v-else-if="id && !initialized && (addressStatus === 'idle' || addressStatus === 'loading')" class="min-h-56 w-full" />
    <p v-else-if="id && !initialized" class="customer-feedback" role="alert">
      {{ t(addressStatus === 'error' ? 'customer.addresses.loadError' : 'customer.addresses.notFound') }}
      <button v-if="addressStatus === 'error'" type="button" class="commerce-text-link" @click="loadAddresses(true)">{{ t('catalogue.retry') }}</button>
      <NuxtLink v-else :to="list" class="commerce-text-link">{{ t('customer.addresses.returnList') }}</NuxtLink>
    </p>
    <form v-else ref="form" class="customer-form" novalidate @submit.prevent="save">
      <p v-if="Object.keys(errors).length" class="sr-only" role="alert">{{ t('auth.access.checkFields') }}</p>
      <div class="customer-form-grid">
        <template v-for="key in keys" :key="key">
          <UiTextarea v-if="key === 'street' || key === 'delivery_instructions'" v-model="fields[key]" class="customer-field-wide" :name="key"
            :label="t(`customer.fields.${key}`)" :autocomplete="autocomplete[key]" :maxlength="addressFields[key]"
            :required="required(key)" :error="errors[key]" :disabled="saving" :rows="2" @update:model-value="delete errors[key]" />
          <UiInput v-else v-model="fields[key]" :name="key" :label="t(`customer.fields.${key}`)"
            :type="key === 'recipient_phone' ? 'tel' : 'text'" :autocomplete="autocomplete[key]" :maxlength="addressFields[key]"
            :required="required(key)" :error="errors[key]" :disabled="saving" @update:model-value="delete errors[key]" />
        </template>
      </div>
      <label class="customer-checkbox"><input v-model="fields.is_default" type="checkbox" :disabled="saving"> {{ t('customer.addresses.makeDefault') }}</label>
      <CustomerFeedback v-if="feedback" error>{{ t(`customer.addresses.${feedback}`) }}</CustomerFeedback>
      <div class="customer-actions">
        <UiButton type="submit" :disabled="saving" :loading="saving">{{ t('customer.save') }}</UiButton>
        <NuxtLink :to="list" class="ui-button" data-variant="outline">{{ t('customer.cancel') }}</NuxtLink>
      </div>
    </form>
  </section>
</template>

