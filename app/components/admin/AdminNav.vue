<script setup lang="ts">
defineProps<{ collapsed?: boolean }>()
const a = useRegieText()
const path = useLocalePath()
const route = useRoute()
const baseName = useRouteBaseName()
const routeName = computed(() => String(baseName(route) ?? ''))
function isActive(name: string) {
  const current = routeName.value
  return name === 'regie-products' ? current?.startsWith(name) : current === name
}
</script>

<template>
  <nav class="regie-nav" :aria-label="a('brand')">
    <section v-for="group in regieNav" :key="group.key" data-drawer-group>
      <p>{{ a(group.key) }}</p>
      <NuxtLink v-for="item in group.items" :key="item.name" :to="path(item.name)" :title="a(item.key)"
        :class="{ active: isActive(item.name) }" :aria-label="a(item.key)"
        :aria-current="routeName === item.name ? 'page' : isActive(item.name) ? 'location' : undefined">
        <Icon :name="item.icon" size="20" aria-hidden="true" />
        <span>{{ a(item.key) }}</span>
      </NuxtLink>
    </section>
  </nav>
</template>
