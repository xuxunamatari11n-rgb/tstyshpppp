import tailwindcss from '@tailwindcss/vite'

const storefrontPublicPaths = {
  favorites: { fr: '/favoris', es: '/favoritos' },
  cart: { fr: '/panier', es: '/carrito' },
}

const storefrontPreviewPaths = {
  legal: { fr: '/mentions-legales', es: '/aviso-legal' },
  privacy: { fr: '/confidentialite', es: '/privacidad' },
}

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  pages: true,
  css: ['~/assets/css/main.css', '~/assets/css/storefront.css', '~/assets/css/home.css', '~/assets/css/catalogue.css', '~/assets/css/product.css'],
  app: {
    head: {
      viewport: 'width=device-width, initial-scale=1, viewport-fit=cover',
    },
  },
  runtimeConfig: {
    supabaseUrl: '',
    supabasePublishableKey: '',
    siteUrl: '',
    public: { whatsappNumber: '', storefrontMock: false },
  },
  modules: [
    (_options, nuxt) => {
      nuxt.hook('pages:extend', (pages) => {
        if (!nuxt.options.dev) {
          const designSystemIndex = pages.findIndex(page => page.name === 'design-system')
          if (designSystemIndex !== -1) pages.splice(designSystemIndex, 1)
        }

        const mockPages = `${nuxt.options.srcDir.replace(/[/\\]+$/, '')}/mocks/pages`
        const storefrontPaths = nuxt.options.dev
          ? { ...storefrontPublicPaths, ...storefrontPreviewPaths }
          : storefrontPublicPaths

        for (const [name, paths] of Object.entries(storefrontPaths)) {
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
