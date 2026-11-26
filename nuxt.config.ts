import tailwindcss from '@tailwindcss/vite'

const storefrontPreviewPaths = {
  catalogue: { fr: '/catalogue', es: '/catalogo' },
  search: { fr: '/recherche', es: '/buscar' },
  favorites: { fr: '/favoris', es: '/favoritos' },
  cart: { fr: '/panier', es: '/carrito' },
  account: { fr: '/compte', es: '/cuenta' },
  legal: { fr: '/mentions-legales', es: '/aviso-legal' },
  privacy: { fr: '/confidentialite', es: '/privacidad' },
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  css: ['~/assets/css/main.css', '~/assets/css/storefront.css'],
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
  },
  runtimeConfig: {
    public: { whatsappNumber: '' },
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hook('pages:extend', (pages) => {
        if (!nuxt.options.dev) {
          const previews = new Set(['index', 'design-system'])
          for (let index = pages.length - 1; index >= 0; index--) {
            const name = pages[index]?.name
            if (name && previews.has(name)) pages.splice(index, 1)
          }
          return
        }

        const mockPages = `${nuxt.options.srcDir.replace(/[/\\]+$/, '')}/mocks/pages`
        for (const [name, paths] of Object.entries(storefrontPreviewPaths)) {
          pages.push({
            name,
            path: paths.fr,
            file: `${mockPages}/${name}.vue`,
            meta: { i18n: { paths } },
          })
        }
      })
    },
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@pinia/nuxt',
  ],
  vite: { plugins: [tailwindcss()] },
  i18n: {
    defaultLocale: 'fr',
    strategy: 'prefix_except_default',
    detectBrowserLanguage: false,
    locales: [
      { code: 'fr', language: 'fr', name: 'Français', file: 'fr.json' },
      { code: 'es', language: 'es', name: 'Español', file: 'es.json' },
    ],
  },
  fonts: {
    provider: 'local',
    families: [
      { name: 'General Sans', src: '/fonts/general-sans-variable.woff2', weight: '200 700', style: 'normal' },
    ],
  },
  icon: {
    clientBundle: { scan: true, icons: ['ion:refresh-outline', 'ion:bag-outline'] },
    serverBundle: 'local',
    fallbackToApi: false,
  },
})
