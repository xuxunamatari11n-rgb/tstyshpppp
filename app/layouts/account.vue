<script setup lang="ts">
import '~/assets/css/customer.css'

const { t } = useI18n()
const route = useRoute()
const { current, currentItem, addressForm, path } = useCustomerNavigation()
const { user, loadProfile, signingOut, logoutError, signIn } = useCustomerAccount()
const overview = computed(() => current.value === 'account')
const heading = computed(() => t(addressForm.value
  ? current.value === 'account-address-new' ? 'customer.addresses.create' : 'customer.addresses.edit'
  : `customer.nav.${currentItem.value?.key ?? 'overview'}`))
const content = useTemplateRef('content')
const { play } = useEntranceMotion(content, { duration: 0.24, opacity: 0.94 })

onMounted(() => { if (user.value) void loadProfile(true) })
watch(() => user.value?.id, id => { if (id) void loadProfile() })
watch(current, () => { if (user.value) play() }, { flush: 'post' })
watch([user, signingOut], () => {
  if (!user.value && !signingOut.value && (current.value === 'account' || current.value?.startsWith('account-'))) {
    void navigateTo(signIn(current.value, route.params.id), { replace: true })
  }
}, { flush: 'post' })
</script>

<template>
  <NuxtLayout name="default">
    <template #mobile-header>
      <div class="customer-mobile-header" :data-overview="overview">
        <NuxtLink v-if="!overview" :to="path(addressForm ? 'account-addresses' : 'account')" :aria-label="t('customer.back')">
          <Icon name="ion:arrow-back-outline" size="23" aria-hidden="true" />
        </NuxtLink>
        <span>{{ heading }}</span>
        <NuxtLink v-if="overview" :to="path('account-security')" :aria-label="t('customer.nav.security')" class="customer-mobile-settings">
          <Icon name="ion:settings-outline" size="23" aria-hidden="true" />
        </NuxtLink>
      </div>
    </template>
    <template v-if="!overview" #mobile-bottom><span hidden /></template>
    <UiContainer v-if="user" class="customer-layout" :data-overview="overview">
      <nav class="product-breadcrumb" :aria-label="t('catalogue.breadcrumb')">
        <ol>
          <li><NuxtLink :to="path('index')">{{ t('storefront.nav.home') }}</NuxtLink></li>
          <li v-if="!overview"><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" /><NuxtLink :to="path('account')">{{ t('customer.nav.overview') }}</NuxtLink></li>
          <li aria-current="page"><Icon name="ion:chevron-forward-outline" size="12" aria-hidden="true" />{{ heading }}</li>
        </ol>
      </nav>
      <h1 class="customer-heading">{{ heading }}</h1>
      <p v-if="logoutError" class="customer-feedback" role="alert">{{ t('customer.logoutError') }}</p>
      <div class="customer-columns">
        <aside class="customer-sidebar"><CustomerNavigation /></aside>
        <div ref="content" class="customer-content">
          <slot />
        </div>
      </div>
    </UiContainer>
  </NuxtLayout>
</template>

