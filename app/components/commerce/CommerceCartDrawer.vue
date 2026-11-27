<script setup lang="ts">
const { t, locale } = useI18n()
const localePath = useLocalePath()
const cart = useCartStore()
const { drawer, prepareOrder } = useCommerce()
const { settings } = useShopMeta()
const lookup = useShopSelection()
const dialog = useTemplateRef('dialog')
const closeButton = useTemplateRef('closeButton')
const title = useId()
const { active, open, close, finishClose, trapFocus } = useStorefrontModal(dialog, closeButton, { desktopOnly: true })
const motion = useStorefrontTransition(47, 'x')
const formatPrice = useShopPrice()

watch(drawer, () => {
  if (!window.matchMedia('(min-width: 64rem)').matches) return
  const invoker = document.activeElement
  if (!(invoker instanceof HTMLElement)) return
  void open(invoker)
  void cart.refresh(lookup)
})
watch(locale, () => { if (active.value) void cart.refresh(lookup) })
</script>

<template>
  <dialog ref="dialog" class="commerce-dialog commerce-drawer" :aria-labelledby="title"
    @click.self="close()" @cancel.prevent="close()" @keydown.tab="trapFocus">
    <Transition v-bind="motion" :css="false" @after-leave="finishClose">
      <div v-show="active" class="commerce-drawer-panel">
        <header class="commerce-overlay-head">
          <div><h2 :id="title">{{ t('commerce.cart.title') }}</h2><p>{{ t('commerce.cart.count', cart.quantity) }}</p></div>
          <button ref="closeButton" type="button" class="commerce-overlay-close" :aria-label="t('commerce.close')" @click="close()">
            <Icon name="ion:close-outline" size="25" aria-hidden="true" />
          </button>
        </header>
        <div class="commerce-overlay-body">
          <CommerceCartStatus />
          <CommerceEmpty v-if="!cart.selections.length" kind="cart" />
          <CommerceCartLines v-else />
        </div>
        <footer v-if="cart.selections.length" class="commerce-overlay-actions">
          <p class="commerce-estimate">{{ t('commerce.cart.subtotal') }} <UiNumericText :value="cart.validation === 'ready' ? formatPrice(cart.subtotal) : '—'" /></p>
          <UiButton :disabled="!cart.canOrder || settings?.open === false" @click="prepareOrder({ source: 'cart' }, $event)">{{ t('commerce.order.whatsapp') }}</UiButton>
          <NuxtLink :to="localePath({ name: 'cart' })" class="ui-button" data-variant="outline" @click="close(false)">{{ t('commerce.cart.view') }}</NuxtLink>
        </footer>
      </div>
    </Transition>
  </dialog>
</template>

