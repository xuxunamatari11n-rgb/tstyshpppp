<script setup lang="ts">
import '~/assets/css/admin.css'
const a = useRegieText()
const { t, locale } = useI18n()
const path = useLocalePath()
const route = useRoute()
const baseName = useRouteBaseName()
const routeName = computed(() => String(baseName(route) ?? ''))
const { data } = await useShopSession()
const user = computed(() => data.value?.user)
const { logout: shopLogout, signingOut, logoutError } = useCustomerAccount({ logoutDestination: 'regie-login' })
const nuxt = useNuxtApp()
async function logout() {
  await shopLogout()
  if (!logoutError.value) nuxt.runWithContext(() => clearNuxtData(key => key.startsWith('regie-')))
}
const { setUser } = useCustomerSession()
watch(user, value => { if (value) setUser(value) }, { immediate: true })
const collapsed = ref(false)
onMounted(() => {
  try { collapsed.value = localStorage.getItem('testy-regie-sidebar') === '1' } catch {}
})
function collapse() {
  collapsed.value = !collapsed.value
  try { localStorage.setItem('testy-regie-sidebar', collapsed.value ? '1' : '0') } catch {}
}
const module = computed(() => regieNav.flatMap(group => [...group.items]).find(item =>
  item.name === routeName.value || (item.name === 'regie-products' && routeName.value?.startsWith(item.name))))
const subpage = computed(() => routeName.value === 'regie-products-new' ? a('newProduct') : routeName.value === 'regie-products-edit' ? a('editProduct') : '')
const dialog = useTemplateRef<HTMLDialogElement>('drawer')
const closeButton = useTemplateRef<HTMLButtonElement>('closeButton')
const modal = useStorefrontModal(dialog, closeButton)
const transition = useStorefrontTransition(-20, 'x')
const initial = computed(() => (user.value?.firstName || user.value?.email || '?').slice(0, 1).toLocaleUpperCase(locale.value))
useSeoMeta({ title: () => 'Testy Shop — ' + a('brand'), robots: 'noindex, nofollow' })
</script>

<template>
  <div class="regie-shell" :data-collapsed="collapsed">
    <a href="#regie-main" class="storefront-skip">{{ t('guide.skip') }}</a>
    <aside class="regie-sidebar">
      <div class="regie-brand">
        <NuxtLink :to="path('shop-admin')" :aria-label="'Testy Shop — ' + a('brand')">
          <strong>testy<span class="regie-brand-full">shop</span><i>.</i></strong>
          <span class="regie-brand-name">{{ a('brand') }}</span>
        </NuxtLink>
        <button type="button" class="regie-side-toggle" :title="a(collapsed ? 'expand' : 'collapse')"
          :aria-label="a(collapsed ? 'expand' : 'collapse')" :aria-expanded="!collapsed" @click="collapse">
          <Icon :name="collapsed ? 'ion:chevron-forward-outline' : 'ion:chevron-back-outline'" size="18" />
        </button>
      </div>
      <AdminNav :collapsed="collapsed" />
      <div class="regie-sidebar-bottom">
        <NuxtLink :to="path('index')" :title="a('viewStore')" :aria-label="a('viewStore')">
          <Icon name="ion:open-outline" size="19" aria-hidden="true" /><span>{{ a('viewStore') }}</span>
        </NuxtLink>
        <div class="regie-sidebar-user"><span class="regie-avatar">{{ initial }}</span><strong>{{ user?.firstName || user?.email }}</strong></div>
        <button type="button" :aria-label="t('auth.logout')" :title="t('auth.logout')" :disabled="signingOut" @click="logout()">
          <Icon name="ion:log-out-outline" size="20" /><span>{{ t('auth.logout') }}</span>
        </button>
      </div>
    </aside>
    <div class="regie-body">
      <header class="regie-topbar">
        <button type="button" class="regie-icon regie-mobile-trigger" :aria-label="a('menu')" :aria-expanded="modal.active.value"
          aria-controls="regie-drawer" @click="modal.open($event.currentTarget as HTMLElement)">
          <Icon name="ion:menu-outline" size="23" aria-hidden="true" />
        </button>
        <nav class="regie-crumb" :aria-label="t('catalogue.breadcrumb')">
          <NuxtLink :to="path('shop-admin')" class="regie-crumb-home">{{ a('brand') }}</NuxtLink>
          <Icon name="ion:chevron-forward-outline" size="12" class="regie-crumb-home" />
          <NuxtLink v-if="module && subpage" :to="path(module.name)" class="regie-crumb-parent">{{ a(module.key) }}</NuxtLink>
          <Icon v-if="subpage" name="ion:chevron-forward-outline" size="12" class="regie-crumb-parent" />
          <span aria-current="page">{{ subpage || (module && a(module.key)) }}</span>
        </nav>
        <div class="regie-top-actions">
          <SharedLanguageSwitcher compact />
          <NuxtLink :to="path('index')" class="regie-icon regie-top-store" :title="a('viewStore')" :aria-label="a('viewStore')">
            <Icon name="ion:open-outline" size="18" aria-hidden="true" />
          </NuxtLink>
          <details class="regie-menu">
            <summary :aria-label="t('customer.nav.overview')"><span class="regie-avatar">{{ initial }}</span></summary>
            <div class="regie-menu-content">
              <p>{{ user?.email }}</p>
              <NuxtLink :to="path('account')">{{ t('customer.nav.overview') }}</NuxtLink>
              <button type="button" :disabled="signingOut" @click="logout()">{{ t('auth.logout') }}</button>
            </div>
          </details>
        </div>
      </header>
      <main id="regie-main" class="regie-main" tabindex="-1">
        <p v-if="logoutError" class="regie-feedback" data-error role="alert">{{ t('customer.logoutError') }}</p>
        <slot />
      </main>
    </div>
    <dialog id="regie-drawer" ref="drawer" class="regie-drawer" :aria-label="a('brand')" @cancel.prevent="modal.close()"
      @keydown.tab="modal.trapFocus" @click.self="modal.close()">
      <Transition v-bind="transition" @after-leave="modal.finishClose">
        <div v-if="modal.active.value" class="regie-drawer-panel">
          <div class="regie-brand">
            <NuxtLink :to="path('shop-admin')"><strong>testyshop<i>.</i></strong><span class="regie-brand-name">{{ a('brand') }}</span></NuxtLink>
            <button ref="closeButton" type="button" class="regie-side-toggle" :aria-label="a('close')" @click="modal.close()">
              <Icon name="ion:close-outline" size="24" aria-hidden="true" />
            </button>
          </div>
          <AdminNav />
          <div class="regie-sidebar-bottom">
            <NuxtLink :to="path('index')"><Icon name="ion:open-outline" size="19" />{{ a('viewStore') }}</NuxtLink>
            <div class="regie-sidebar-user"><span class="regie-avatar">{{ initial }}</span><strong>{{ user?.firstName || user?.email }}</strong></div>
            <button type="button" :disabled="signingOut" @click="logout()"><Icon name="ion:log-out-outline" size="20" />{{ t('auth.logout') }}</button>
          </div>
        </div>
      </Transition>
    </dialog>
  </div>
</template>
