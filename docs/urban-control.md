# Testy Shop — Régie

Urban Control is the French and Spanish commercial administration for the existing Testy Shop catalogue.

## Routes

| Screen | French | Spanish |
| --- | --- | --- |
| Overview | `/admin` | `/es/admin` |
| Dedicated sign-in | `/admin/connexion` | `/es/admin/acceso` |
| Products | `/admin/produits` | `/es/admin/productos` |
| Create a product | `/admin/produits/nouveau` | `/es/admin/productos/nuevo` |
| Edit a product | `/admin/produits/[id]` | `/es/admin/productos/[id]` |
| Categories | `/admin/categories` | `/es/admin/categorias` |
| Customers | `/admin/clients` | `/es/admin/clientes` |
| Settings | `/admin/parametres` | `/es/admin/ajustes` |

The existing administrative link leads to the new overview. The old `/administration` and `/es/administracion` paths require administrative access and redirect there.

## Implementation

- `app/layouts/admin.vue`, `app/assets/css/admin.css` and `app/components/admin/` contain the admin shell, responsive navigation, dialogs, product table, editor and media controls. The administration shares the commercial price formatter and product card with the storefront. Preview disables product navigation, cart and favorites.
- `app/pages/admin/` contains actual operational counts, recent products, configuration checks, bounded product search, category management and public settings.
- `app/composables/useRegieText.ts` holds French and Spanish administration labels. `useRegieEditor.ts` handles unsaved changes, transfer progress and storefront refresh. Customer account refinements are in `app/layouts/account.vue`, `app/layouts/default.vue`, `app/components/customer/`, `app/assets/css/customer.css` and both locale files. The compact footer links to legal pages when those routes are available in the current build. The production router currently includes the assistance route and omits the existing legal preview pages.
- `server/api/regie/[...path].ts`, `server/utils/adminCatalogue.ts` and `server/utils/adminValidation.ts` route verified administrative requests and validate their input. `shared/types/admin.ts` and `shared/types/database.ts` define application and RPC types.
- `supabase/migrations/20261127174402_urban_control.sql` adds the administrator-only catalogue functions. `20261127184008_urban_control_version_conflicts.sql` adds the current save functions with HTTP 409 conflict handling. Both migrations were applied to the configured Testy Shop project. Existing RLS and Storage policies apply to calls made through the administrator's session.

### Catalogue operations

Product list filtering and pagination run in Postgres. The current page contains at most 24 products. Selection supports publishing or hiding products with a success/failure count. Effective product visibility uses the existing publication date and category hierarchy. Product availability uses the manual switch and optional quantity, with a distinct out-of-stock state at zero.

The same form handles creation and editing. A hidden product can be saved as a draft. Publication requires a nonempty French name and an effectively visible category. Spanish content can fall back to French. Editing a slug with a publication history requires confirmation. Existing public links use the new slug after confirmation. Price and stock use integers. Product core fields, translations, image references and specifications save in one transaction. Product and category editors check the previously loaded modification timestamp to detect conflicting updates. A stale form now receives HTTP 409 immediately. The initial SQLSTATE triggered PostgREST transaction retries. [Supabase troubleshooting note](https://supabase.com/kb/troubleshooting/high-cpu-and-infinite-transaction-retries-when-using-custom-error-codes-in-rpc-functions-77326b) Product deletion explicitly confirms loss of the product, relevant public link and associated favorites.

Category management supports primary categories and one level of subcategories. The database restricts depth and deletion when products or children remain. Category counts show products directly assigned to each category. Hiding a category requires confirmation because it also blocks public access to descendants and their products. Changing visibility preserves assignments and descendant publication flags.

### Media lifecycle

The editor makes local previews and uploads only when the user saves. The upload endpoint checks the verified administrator, origin, bucket, content length, MIME and file signature. The form supports movement by pointer and keyboard, localized alt text and first-image selection. A file is limited to 4 MiB in the admin upload path to fit within the Vercel Functions request body ceiling. The existing Storage bucket configuration independently caps eligible files at 8 MiB. [Vercel Functions limits](https://vercel.com/docs/functions/limitations)

If an upload fails, the editor keeps form values and successful staged uploads so the administrator can retry. Postgres commits media references with the product or category, after their uploads have succeeded. Removing a reference, replacing an image or abandoning an editor can leave an unreferenced object. Blob deletion is intentionally manual because preventing loss after a partial or unacknowledged save takes priority.

During a maintenance window with admin editing paused, inspect the existing public commercial buckets with a trusted project administrator. This read-only query identifies managed objects older than seven days without a matching reference. Recheck exact bucket and name before deleting each confirmed orphan with the Storage API or Dashboard. Keep other paths and repository-hosted images in place.

```sql
select o.bucket_id, o.name, o.created_at
from storage.objects o
where o.name ~ '^regie-[a-f0-9-]{36}/[a-f0-9-]{36}\.(jpg|png|webp|avif)$'
  and o.created_at < now() - interval '7 days'
  and (
    (o.bucket_id = 'product-images' and not exists (
      select 1 from public.product_images i where i.storage_path = o.name
    ))
    or
    (o.bucket_id = 'category-images' and not exists (
      select 1 from public.categories c where c.image_path = o.name
    ))
  );
```

Objects in the existing commercial buckets are publicly retrievable by their exact URL. Keep confidential files out of these buckets.

### Permissions and settings

Every administration API response uses `Cache-Control: private, no-store`. The server verifies Supabase Auth and reads the role from the existing user role table. Writes also require the trusted storefront origin. The API and commercial media use the authenticated administrator's Supabase client, and the new database functions check administrator membership while preserving RLS. The existing customer directory remains gated and displays only an explanation of the current owner-only profile policy. There is no public role assignment.

The settings form persists the store name, public support address and localized information, localized announcement, WhatsApp number, currency symbol and purchase availability in the existing single public settings row. The WhatsApp action opens a test draft. The storefront falls back to its existing environment number if the public settings row has no WhatsApp number. Prices and stored values use the existing single integer currency model.

## Dedicated administrative sign-in

The administrative authentication layout uses the shared Supabase account and session cookie. A server-side role check runs before a candidate session is installed, so a refused sign-in leaves the current browser session intact. Return destinations resolve from a fixed list of internal route names. The workspace, API, database and Storage each continue to enforce authorization. The login, recovery and private responses use no-store caching. Admin logout returns to the dedicated sign-in page.

See the setup guide for account provisioning, the private recovery secret and future invitation handling. [Supabase setup](./supabase.md#first-administrator)

The dedicated sign-in was verified in Chrome on the local production build against the configured Supabase project. The checks covered guest redirects, allowlisted return targets, administrator login and logout, refusal of customers, and preservation of an unrelated active customer session. After a role change from admin to customer, the same active session was denied by the workspace, API, database RPC and Storage.

Recovery verification exercised the hosted Supabase token-hash callback on a temporary account, the dedicated form, password update, rejection of a replayed link and sign-in with the new password. SMTP delivery and the full PKCE email flow still require a smoke test on the deployment origin.

- [Desktop sign-in, French](../.data/qa/regie-auth/admin-connexion-1440.png)
- [Mobile sign-in, French](../.data/qa/regie-auth/admin-fr-320.png)
- [Mobile sign-in, Spanish](../.data/qa/regie-auth/admin-es-320.png)
- [Password recovery, Spanish](../.data/qa/regie-auth/admin-recovery-es-768.png)

## Deployment

For an environment other than the configured Testy Shop project, apply its existing foundation, catalogue, Storage and Urban Control migrations. Keep `NUXT_SITE_URL` set to the exact trusted storefront origin and set `NUXT_SUPABASE_URL` and `NUXT_SUPABASE_PUBLISHABLE_KEY` for that environment. Grant admin membership to the intended regular account through the existing trusted Supabase administration workflow. [Supabase setup](./supabase.md) The connection uses the publishable key and an administrator session. Production hosting is managed separately.

## Verification

The administration was tested in Chrome against the local production build and the configured Supabase project.

| Check | Observed result |
| --- | --- |
| TypeScript and build | `pnpm typecheck` and `pnpm build` completed successfully. The built server started on localhost. |
| Authorization and caching | Anonymous administration redirected to sign-in and the API returned 401. A signed-in customer received 403. The verified admin could load the dashboard and perform catalogue writes. Administrative API responses had `Cache-Control: private, no-store`. Direct calls to the new read RPCs and direct Storage upload attempts were denied to anonymous and customer clients. |
| Product lifecycle | Created a hidden draft with an image through the Vue form. Verified publication, editing, hiding, deletion, rejection of invalid prices and stock, required French content, slug-change confirmation on the API, and stale-version HTTP 409. The Spanish public API reflected effective category visibility and returned the saved Spanish content. |
| Media | Uploaded real PNG files into both buckets. Verified stored URLs, the editor reorder buttons, database image order and removal of references. The test uploaded one image through the browser file input and the form submission. |
| Categories | Created a parent and child, updated child media, verified parent hiding also removed the test product from public queries, restored visibility, rejected deletion with dependencies and deleted the categories after removing those dependencies. |
| Settings | Rejected an invalid WhatsApp number, saved the existing commercial settings values and read the store name back through the Spanish public metadata API. The test button generated the expected WhatsApp draft URL. |
| Customer account | Verified the compact footer and hidden reassurance at 390px, and equal profile input heights at 1024px. The mobile shortcuts use one three-row group. Verified full labels, saved counts, link targets and no horizontal overflow at 320, 375, 390 and 430px in French and Spanish. The three desktop cards also passed verification at 1440px. |
| Responsive UI | Checked editor geometry at 320, 390, 768, 1024, 1440 and 1920px. Opened and closed the mobile drawer and opened the live product-card preview. The topbar stayed on one line at 320px and 390px. |
| Test data | Verified zero remaining temporary product and category rows. Removed the test media objects through Storage and deleted both temporary Auth accounts. |
| Hosted deployment | Verification ran locally against hosted Supabase. Production Vercel deployment is pending. |

### Screenshots

These captures are local to this workspace. Git ignores the QA output directory.

- [Overview](../.data/qa/lot09/dashboard-1440.png)
- [Product list](../.data/qa/lot09/products-1440.png)
- [New product](../.data/qa/lot09/product-new-1440.png)
- [Product edit](../.data/qa/lot09/product-edit-1440.png)
- [Media manager](../.data/qa/lot09/media-1440.png)
- [Category management](../.data/qa/lot09/categories-1440.png)
- [Store settings](../.data/qa/lot09/settings-1440.png)
- [Mobile navigation](../.data/qa/lot09/mobile-navigation-390.png)
- Account shortcuts at 320px [French](../.data/qa/account-shortcuts/fr-320.png) and [Spanish](../.data/qa/account-shortcuts/es-320.png).
- Responsive editor widths [320](../.data/qa/lot09/responsive-edit-320.png), [390](../.data/qa/lot09/responsive-edit-390.png), [768](../.data/qa/lot09/responsive-edit-768.png), [1024](../.data/qa/lot09/responsive-edit-1024.png), [1440](../.data/qa/lot09/responsive-edit-1440.png), [1920](../.data/qa/lot09/responsive-edit-1920.png).

