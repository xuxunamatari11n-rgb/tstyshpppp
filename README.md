# Testy Shop

Nuxt 4 foundation for the Testy Shop storefront, customer account and administration.

## Local development

```sh
pnpm install
pnpm dev
```

Open `/design-system` for the French guide or `/es/design-system` for Spanish. Both preview routes are development-only.

The storefront homepage is available at `/` and `/es`. The lightweight catalogue and search destinations share localized mock products with the homepage. Favorites, cart, account, and legal preview routes are development-only. Homepage product actions reset when the page is left.

To enable the footer’s WhatsApp contact link, set `NUXT_PUBLIC_WHATSAPP_NUMBER` to the shop’s international number. With no valid number configured, the footer shows the contact as unavailable.

```sh
pnpm typecheck
pnpm build
```

## Project structure

- `app/assets/css/main.css` defines the Tailwind theme, responsive page dimensions and base styles.
- `app/components/ui` holds the UI primitives. Pass translated text to labels, hints, errors and slots.
- `app/components/shared` holds components used across areas, including the language switcher.
- `app/layouts` provides the default, account and admin shells. Select a shell with `definePageMeta({ layout: 'account' })` or `definePageMeta({ layout: 'admin' })`.
- `app/composables` provides field accessibility and client-side entrance motion. `app/utils/formatCurrency.ts` formats whole francs.
- `i18n/locales` contains the French and Spanish messages. Add corresponding keys to each locale.

Pinia and Nuxt Image are available to features that need shared state and media. Supabase services are planned for a later milestone.

## Homepage imagery

| Files under `public/images/home` | Format and dimensions | Placement |
| --- | --- | --- |
| `sneaker.webp`, `headphones.webp`, `crossbody.webp`, `dome-lamp.webp` | Transparent WebP, 608 × 608 | Isolated shoe, headphones, bag and lamp for the hero and product cards |
| `category-fashion.webp`, `category-electronics.webp`, `category-home.webp`, `category-beauty.webp`, `category-sport.webp`, `category-children.webp` | WebP, 512 × 512 | Six studio category photographs and selected mock product images |
| `universe-tech.webp`, `universe-style.webp`, `universe-home.webp`, `campaign-home.webp` | WebP, 768 × 512 | Technology, fashion and home photographs for the universe grid and dual campaigns |

The commercial photographs represent the mock products and can be replaced with the shop’s photography when it is available.
