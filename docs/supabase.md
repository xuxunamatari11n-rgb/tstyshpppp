# Testy Shop · Lot 06

## Architecture

Nitro reads Supabase on the server. Public storefront requests use an anonymous Supabase client with a publishable key. Authenticated requests use the official SSR client with per-request, HTTP-only, same-site cookies. Account responses are private and uncached. Authorization uses a verified Auth user and the database role table. Public routes remain available to guests.

Routes for registration, sign-in, sign-out, email confirmation and password recovery use the existing localized account route and UI primitives. The generic `shop-auth` middleware protects private routes and checks the admin role on `/administration` and `/es/administracion`. Private API operations check the session themselves and remain subject to RLS.

## Implementation files

| Area | Files |
| --- | --- |
| Nuxt and dependencies | `nuxt.config.ts`, `package.json`, `pnpm-lock.yaml`, `.env.example`, `.gitignore` |
| Database | `supabase/migrations/`, `supabase/seed.sql`, `supabase/tests/shop_rls.sql`, `shared/types/database.ts`, `scripts/generate-shop-seed.mjs` |
| Server integration | `server/utils/{supabase,storefrontData,shopAuth,shopFavorites}.ts`, `server/api/{shop,auth,account}/` |
| Authentication UI | `app/pages/compte/index.vue`, `app/pages/administration.vue`, `app/middleware/shop-auth.ts`, `app/composables/useShopSession.ts` |
| Storefront | `app/app.vue`, `app/pages/{index,categorie,produit}`, `app/components/{storefront,home,catalogue,product}/` and their catalogue, pricing and contact composables |
| Localization | `i18n/locales/fr.json`, `i18n/locales/es.json` |

## Runtime configuration

Copy `.env.example` to `.env` for local development. On the host, set the same variables in its environment configuration.

| Variable | Purpose |
| --- | --- |
| `NUXT_SUPABASE_URL` | Supabase project URL |
| `NUXT_SUPABASE_PUBLISHABLE_KEY` | Project publishable key. No elevated key is needed |
| `NUXT_SITE_URL` | Trusted storefront origin for Auth callbacks and origin checks |
| `NUXT_PUBLIC_WHATSAPP_NUMBER` | Optional fallback when commercial settings have no contact number |
| `NUXT_PUBLIC_STOREFRONT_MOCK` | Set to `true` in Nuxt development only to explicitly use fixtures |

Public requests display the existing loading, empty and error states. A failed production request does not switch to mock products. Access to the shop's private operations is not based on a browser-supplied role.

## Database and migrations

| Migration | Changes |
| --- | --- |
| `20261127064420_shop_foundation.sql` | Profiles, roles, category hierarchy, products, translations, image metadata, specifications, favorites, addresses and commercial settings |
| `20261127064637_shop_catalogue.sql` | Public read RPCs, accent normalization and deterministic, bounded product pagination |
| `20261127064645_shop_storage.sql` | Commercial image buckets and private avatar permissions |

Categories and products have UUIDs. The existing product slugs and category keys are preserved for URLs and filters. Products may belong to a root or its direct child. The hierarchy uses a composite foreign key to prevent deeper levels and restricts deletion while children or products exist. Prices and stock are whole numbers. Visibility and publication are separate from product availability. Translation and favorite join tables use composite keys. Spanish content falls back to French field by field.

Localized JSON fields for image alt text, specifications and public settings allow FR and ES string values. Specification labels and values require French content. Profile names are copied from two controlled signup metadata fields. Signup always assigns the customer role. The private database helpers have a fixed search path and explicit execution permissions.

Anonymous roles can read visible commercial content and public settings. Customer profile access is owner-only and updates are column-scoped. Favorite and address rows are owner-only. The address RPC serializes default selection, and a partial unique index enforces at most one default. Only database-confirmed administrators can mutate commercial tables or media. Administrators do not gain access to other customers' private profile, address or favorite rows.

The generated types live in `shared/types/database.ts`. Refresh the generated database definition with the official Supabase workflow and retain the three project type aliases at its end.

## Storefront data

The homepage collections and featured categories, catalogue, category pages, product details, related products, search suggestions and search results use Supabase. Search uses case- and accent-insensitive term matching against localized product and category text. It is substring-based and has no typo correction or external ranking engine. The product RPC returns a bounded page plus an exact result count and loads media only for the returned products. Bestseller ordering uses an explicit merchandising rank. Pagination is represented in the URL.

Commercial settings can supply the store name, announcement, assistance text, currency symbol and WhatsApp contact. Closing the shop disables product ordering while preserving browsing. Existing campaign imagery is bundled with the application.

## Demonstration inventory and images

Run `node scripts/generate-shop-seed.mjs` on Node 24 to regenerate `supabase/seed.sql` from the previous fixtures and FR/ES messages. This seed is for development and demonstration use. It is idempotent by stable keys and does not overwrite existing rows. It contains no customers, orders, stock estimates or fabricated sales.

The demonstration images retain their stable `/images/home/*.webp` paths. The same build serves those files. To migrate an image to Storage, upload it as an administrator to `product-images` or `category-images` using a key such as `product-slug/<unique-id>.webp`, then set the database path to that key. Store the key, not a URL. Product and category buckets allow WebP, JPEG, PNG and AVIF up to 8 MiB. The private `avatars` bucket allows WebP, JPEG and PNG up to 2 MiB under `<auth-user-id>/<unique-id>.webp`. Public image objects remain public when a product is hidden. Remove or replace the object when it also needs to be withdrawn from public access.

## Hosted authentication setup

In Supabase Auth URL Configuration, set the deployment origin as Site URL and allow the four exact callback paths below on each trusted origin. Set `NUXT_SITE_URL` to the same origin. Retain the localhost entries only when needed for development.

- `/api/auth/callback/fr/confirm`
- `/api/auth/callback/es/confirm`
- `/api/auth/callback/fr/recovery`
- `/api/auth/callback/es/recovery`

Enable email confirmation and configure the hosted SMTP provider before serving real customer traffic. The callback accepts the default PKCE code flow and the token-hash template flow. For a device-independent email template, point the link to `{{ .RedirectTo }}?token_hash={{ .TokenHash }}` in the corresponding confirmation or recovery template. Verify the full email flow on the final domain.

To assign the first administrator, have the intended person register and complete email verification. In the trusted Supabase SQL Editor, look up and verify that account's UUID before running the update below. Ordinary clients have no write grant on the role table.

```sql
select id, email, email_confirmed_at from auth.users where email = '<verified email>';
update public.user_roles set role = 'admin' where user_id = '<verified UUID>';
```

## Hosted project

`testy-shop` (`yaxxjtiikwhtirwbnlsd`) is the separate project in Wady’s Org. The three versioned migrations and the demonstration seed have been applied there. The committed sample environment has placeholders and can be used for another project.

## Verification

The transactional suite `supabase/tests/shop_rls.sql` can be run by an operator in the Supabase SQL Editor or via a privileged PostgreSQL connection with stop-on-error enabled. It covers anonymous access, hidden categories and products, French fallback search, isolation of profiles/favorites/addresses, self-promotion, admin mutations and storage restrictions. Its fixtures are rolled back.

The clean frozen install, `pnpm typecheck` and `pnpm build` passed on Windows with Node 24. The three migrations and the transactional RLS test were run against the hosted project. The seed was replayed and the final project counts were eight products, eight root categories, eight product image references and zero Auth users.

The local production server was tested with the hosted database. Checks covered the home page, catalogue pagination, Spanish accent-insensitive search, product and category SSR, 404s, guest account guards, safe callback redirection and cross-origin rejection. A temporary preconfirmed account verified login, HTTP-only session restoration, customer access controls, adding and removing a favorite, and logout. The account was removed after the test.

Chrome verified the desktop header stayed flush with the announcement and became sticky while scrolling. The first product content started below the header at the top of the page. The cart label and semantic in-stock color were verified in French and Spanish at 320 px without horizontal overflow.

The storefront still uses in-memory favorites in the UI. Live email delivery, confirmation and recovery require the final domain, callback allowlist and SMTP configuration. This build was verified with Nitro's Node target. The deployment environment and the first real administrator still require setup.
