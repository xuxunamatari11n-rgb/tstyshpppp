<script setup lang="ts">
defineProps<{ compact?: boolean }>()
const { t, locale, locales } = useI18n()
const includeHash = ref(false)

// The browser's fragment is unavailable during SSR.
onMounted(() => { includeHash.value = true })
</script>

<template>
  <nav :aria-label="t('language')">
    <ul class="flex flex-wrap items-center gap-y-1 font-medium" :class="compact ? 'gap-x-2 text-xs' : 'gap-x-4 text-sm'">
      <li v-for="option in locales" :key="option.code">
        <SwitchLocalePathLink v-slot="{ href, navigate }" :locale="option.code" custom>
          <a
            class="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            :href="includeHash ? href : href?.replace(/#.*$/, '')"
            :lang="option.language"
            :hreflang="option.language"
            :aria-label="compact ? `${option.code.toUpperCase()} ${option.name}` : undefined"
            :aria-current="locale === option.code ? 'page' : undefined"
            :class="{ underline: locale === option.code, 'min-w-11 justify-center': compact }"
            @click="navigate"
          >
            {{ compact ? option.code.toUpperCase() : option.name }}
          </a>
        </SwitchLocalePathLink>
      </li>
    </ul>
  </nav>
</template>
