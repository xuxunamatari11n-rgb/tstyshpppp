<script setup lang="ts">
defineProps<{ mobile?: boolean }>()
const { t } = useI18n()
const { user, profile, logout, signingOut } = useCustomerAccount()
const { navigation, current, currentGroup, path } = useCustomerNavigation()
const displayName = computed(() => [profile.value?.first_name ?? user.value?.firstName, profile.value?.last_name].filter(Boolean).join(' ')
  || t('customer.nav.overview'))
const initials = computed(() => displayName.value.trim().split(/\s+/).slice(0, 2).map(word => Array.from(word)[0]).join('').toLocaleUpperCase())
</script>

<template>
  <div class="customer-navigation" :class="{ 'customer-navigation-mobile': mobile }">
    <div v-if="!mobile" class="customer-identity">
      <span class="customer-initials" aria-hidden="true">{{ initials }}</span>
      <strong>{{ displayName }}</strong>
    </div>
    <nav :aria-label="t('customer.navigation')">
      <ul v-for="group in navigation.filter(group => !mobile || group[0].name !== 'account')" :key="group[0].name" class="customer-nav-group">
        <li v-for="item in group" :key="item.name">
          <NuxtLink :to="path(item.name)" :data-active="currentGroup === item.name"
            :aria-current="current === item.name ? 'page' : currentGroup === item.name ? 'location' : undefined">
            <Icon :name="item.icon" size="20" aria-hidden="true" />
            <span>{{ t(`customer.nav.${item.key}`) }}</span>
            <Icon v-if="mobile" class="customer-nav-next" name="ion:chevron-forward-outline" size="16" aria-hidden="true" />
          </NuxtLink>
        </li>
      </ul>
      <ul class="customer-nav-group">
        <li v-if="user?.role === 'admin'">
          <NuxtLink :to="path('shop-admin')"><Icon name="ion:shield-outline" size="20" aria-hidden="true" /><span>{{ t('auth.admin') }}</span></NuxtLink>
        </li>
        <li>
          <button type="button" class="customer-logout" :disabled="signingOut" :aria-busy="signingOut" @click="logout">
            <Icon name="ion:log-out-outline" size="20" aria-hidden="true" />
            <span>{{ t('auth.logout') }}</span>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

