alter table public.products add column sort_order integer not null default 0 check (sort_order >= 0);
create index products_visible_order_idx on public.products(sort_order, id) where is_visible;

create function private.shop_search(value text) returns text
language sql immutable strict set search_path = '' as $$
  select btrim(regexp_replace(
    translate(replace(replace(lower(value), 'œ', 'oe'), 'æ', 'ae'),
      'àâäáãåçèêëéìîïíñòôöóõùûüúýÿ', 'aaaaaaceeeeiiiinooooouuuuyy'),
    '[^[:alnum:]]+', ' ', 'g'));
$$;
revoke all on function private.shop_search(text) from public;
grant execute on function private.shop_search(text) to anon, authenticated;

create function public.shop_categories(language public.shop_locale default 'fr') returns jsonb
language sql stable security invoker set search_path = '' as $$
  with visible as materialized (
    select c.id, c.parent_id, c.stable_key, c.slug, c.image_path, c.is_featured, c.sort_order,
      coalesce(nullif(local.name, ''), fr.name, c.slug) as name,
      coalesce(nullif(local.description, ''), fr.description) as description,
      coalesce(nullif(local.image_alt, ''), fr.image_alt) as image_alt
    from public.categories c
    left join public.categories parent on parent.id = c.parent_id
    left join public.category_translations fr on fr.category_id = c.id and fr.locale = 'fr'
    left join public.category_translations local on local.category_id = c.id and local.locale = language
    where c.is_visible and (c.parent_id is null or parent.is_visible)
  )
  select coalesce(jsonb_agg(to_jsonb(root) || jsonb_build_object('children', coalesce((
    select jsonb_agg(to_jsonb(child) order by child.sort_order, child.stable_key)
    from visible child where child.parent_id = root.id
  ), '[]'::jsonb)) order by root.sort_order, root.stable_key), '[]'::jsonb)
  from (select * from visible where parent_id is null order by sort_order, stable_key limit 250) root;
$$;

create function public.shop_catalogue(filters jsonb default '{}', language public.shop_locale default 'fr') returns jsonb
language sql stable security invoker set search_path = '' as $$
  with params as (
    select left(coalesce(filters ->> 'q', ''), 100) as q,
      nullif(filters ->> 'slug', '') as slug,
      nullif(filters ->> 'exclude', '') as exclude_slug,
      nullif(filters ->> 'subcategory', '') as subcategory,
      case when filters ->> 'min' ~ '^[0-9]{1,16}$' then (filters ->> 'min')::numeric end as min,
      case when filters ->> 'max' ~ '^[0-9]{1,16}$' then (filters ->> 'max')::numeric end as max,
      coalesce(filters ->> 'stock', '') = 'true' as in_stock,
      coalesce(filters ->> 'promo', '') = 'true' or coalesce(filters ->> 'selection', '') = 'promotions' as promos,
      coalesce(filters ->> 'new', '') = 'true' or coalesce(filters ->> 'selection', '') = 'new' as new_arrivals,
      coalesce(filters ->> 'selection', '') = 'bestsellers' as bestsellers,
      coalesce(filters ->> 'sort', '') as sorting,
      case when filters ->> 'limit' ~ '^[0-9]{1,2}$' then least(48, (filters ->> 'limit')::int) else 6 end as take,
      case when filters ->> 'page' ~ '^[1-9][0-9]{0,4}$' then least(10000, (filters ->> 'page')::int) - 1 else 0 end as skip_pages,
      case when jsonb_typeof(filters -> 'categories') = 'array' then filters -> 'categories' else '[]'::jsonb end as category_keys
  ),
  matched as materialized (
    select p.id, p.price, p.created_at, p.sort_order, p.bestseller_rank,
      coalesce(parent.stable_key, category.stable_key) as category_key,
      case when parent.id is not null then category.stable_key end as subcategory_key,
      coalesce(nullif(local.name, ''), fr.name, p.slug) as name,
      coalesce(nullif(local.short_description, ''), fr.short_description) as short_description,
      coalesce(nullif(local.full_description, ''), fr.full_description) as full_description,
      coalesce(nullif(local.seo_title, ''), fr.seo_title) as seo_title,
      coalesce(nullif(local.seo_description, ''), fr.seo_description) as seo_description
    from public.products p
    join public.categories category on category.id = p.category_id
    left join public.categories parent on parent.id = category.parent_id
    left join public.product_translations fr on fr.product_id = p.id and fr.locale = 'fr'
    left join public.product_translations local on local.product_id = p.id and local.locale = language
    left join public.category_translations cfr on cfr.category_id = category.id and cfr.locale = 'fr'
    left join public.category_translations clocal on clocal.category_id = category.id and clocal.locale = language
    left join public.category_translations pfr on pfr.category_id = parent.id and pfr.locale = 'fr'
    left join public.category_translations plocal on plocal.category_id = parent.id and plocal.locale = language
    cross join params
    where p.is_visible and p.published_at <= now() and category.is_visible
      and (category.parent_id is null or parent.is_visible)
      and (params.slug is null or p.slug = params.slug)
      and (params.exclude_slug is null or p.slug <> params.exclude_slug)
      and (params.category_keys = '[]'::jsonb or params.category_keys ? coalesce(parent.stable_key, category.stable_key))
      and (params.subcategory is null or (parent.id is not null and category.stable_key = params.subcategory))
      and (params.min is null or p.price >= params.min) and (params.max is null or p.price <= params.max)
      and (not params.in_stock or (p.is_available and (p.stock_quantity is null or p.stock_quantity > 0)))
      and (not params.promos or p.comparison_price is not null)
      and (not params.new_arrivals or p.is_new_arrival)
      and (not params.bestsellers or p.bestseller_rank is not null)
      and (params.q = '' or (private.shop_search(params.q) <> '' and not exists (
        select 1 from unnest(string_to_array(private.shop_search(params.q), ' ')) as term
        where strpos(private.shop_search(concat_ws(' ',
          coalesce(nullif(local.name, ''), fr.name, p.slug),
          coalesce(nullif(local.short_description, ''), fr.short_description),
          coalesce(nullif(local.full_description, ''), fr.full_description),
          array_to_string(coalesce(nullif(local.keywords, '{}'::text[]), fr.keywords), ' '),
          coalesce(nullif(clocal.name, ''), cfr.name),
          coalesce(nullif(plocal.name, ''), pfr.name)
        )), term) = 0
      )))
  ),
  selected as materialized (
    select m.* from matched m cross join params
    order by
      case when sorting = 'price-asc' then m.price end asc,
      case when sorting = 'price-desc' then m.price end desc,
      case when sorting = 'newest' or (sorting in ('','default') and new_arrivals) then m.created_at end desc,
      case when sorting = 'bestsellers' or bestsellers then m.bestseller_rank end asc nulls last,
      m.sort_order, m.id
    limit (select take from params) offset (select take * skip_pages from params)
  ),
  payload as (
    select to_jsonb(p) || jsonb_build_object(
      'category_key', s.category_key,
      'subcategory_key', s.subcategory_key,
      'name', s.name,
      'short_description', s.short_description,
      'full_description', s.full_description,
      'seo_title', s.seo_title,
      'seo_description', s.seo_description,
      'images', coalesce((select jsonb_agg(to_jsonb(image) order by image.sort_order, image.id)
        from (select * from public.product_images where product_id = p.id order by sort_order, id limit 32) image), '[]'::jsonb),
      'specifications', coalesce((select jsonb_agg(to_jsonb(spec) order by spec.sort_order, spec.id)
        from (select * from public.product_specifications where product_id = p.id order by sort_order, id limit 48) spec), '[]'::jsonb)
    ) as item, s.position
    from (select selected.*, row_number() over () as position from selected) s
    join public.products p on p.id = s.id
  )
  select jsonb_build_object('total', (select count(*) from matched),
    'products', coalesce(jsonb_agg(item order by position), '[]'::jsonb))
  from payload;
$$;

revoke all on function public.shop_categories(public.shop_locale), public.shop_catalogue(jsonb, public.shop_locale)
  from public, anon, authenticated;
grant execute on function public.shop_categories(public.shop_locale), public.shop_catalogue(jsonb, public.shop_locale)
  to anon, authenticated;
