create schema if not exists private;
revoke all on schema private from public, anon, authenticated;
grant usage on schema private to anon, authenticated;

create type public.shop_locale as enum ('fr', 'es');
create type public.shop_role as enum ('customer', 'admin');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '' check (length(first_name) <= 80),
  last_name text not null default '' check (length(last_name) <= 80),
  phone text check (length(phone) <= 40),
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role public.shop_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid,
  is_root boolean generated always as (parent_id is null) stored,
  parent_is_root boolean generated always as (true) stored,
  stable_key text not null unique check (stable_key ~ '^[A-Za-z][A-Za-z0-9-]{0,79}$'),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  image_path text,
  is_visible boolean not null default false,
  is_featured boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, is_root),
  foreign key (parent_id, parent_is_root) references public.categories(id, is_root) on delete restrict
);
create index categories_parent_idx on public.categories(parent_id);

create table public.category_translations (
  category_id uuid not null references public.categories(id) on delete cascade,
  locale public.shop_locale not null,
  name text not null check (length(btrim(name)) between 1 and 160),
  description text,
  image_alt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (category_id, locale)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories(id) on delete restrict,
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 120),
  sku text unique,
  price integer not null check (price >= 0),
  comparison_price integer check (comparison_price > price),
  stock_quantity integer check (stock_quantity >= 0),
  is_available boolean not null default false,
  is_visible boolean not null default false,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  bestseller_rank integer check (bestseller_rank > 0),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index products_category_idx on public.products(category_id);
create index products_visible_price_idx on public.products(price, id) where is_visible;
create index products_visible_recent_idx on public.products(created_at desc, id) where is_visible;
create index products_bestseller_idx on public.products(bestseller_rank, id) where is_visible and bestseller_rank is not null;

create table public.product_translations (
  product_id uuid not null references public.products(id) on delete cascade,
  locale public.shop_locale not null,
  name text not null check (length(btrim(name)) between 1 and 180),
  short_description text,
  full_description text,
  keywords text[] not null default '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (product_id, locale)
);

create function private.localized_text(value jsonb) returns boolean
language sql immutable strict set search_path = '' as $$
  select jsonb_typeof(value) = 'object' and value - 'fr' - 'es' = '{}'::jsonb
    and (not value ? 'fr' or jsonb_typeof(value -> 'fr') = 'string')
    and (not value ? 'es' or jsonb_typeof(value -> 'es') = 'string');
$$;
revoke all on function private.localized_text(jsonb) from public;
grant execute on function private.localized_text(jsonb) to authenticated;

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  storage_path text not null check (length(btrim(storage_path)) between 1 and 512),
  alt jsonb not null default '{}' check (private.localized_text(alt)),
  width integer not null default 800 check (width between 1 and 20000),
  height integer not null default 800 check (height between 1 and 20000),
  is_cutout boolean not null default false,
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, storage_path)
);
create index product_images_order_idx on public.product_images(product_id, sort_order, id);

create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label jsonb not null check (private.localized_text(label) and coalesce(btrim(label ->> 'fr'), '') <> ''),
  value jsonb not null check (private.localized_text(value) and coalesce(btrim(value ->> 'fr'), '') <> ''),
  sort_order integer not null default 0 check (sort_order >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index product_specifications_order_idx on public.product_specifications(product_id, sort_order, id);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);
create index favorites_product_idx on public.favorites(product_id);

create table public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  label text not null check (length(btrim(label)) between 1 and 80),
  recipient_name text not null check (length(btrim(recipient_name)) between 1 and 160),
  recipient_phone text not null check (length(btrim(recipient_phone)) between 1 and 40),
  country text not null,
  city text not null,
  district text,
  street text not null,
  delivery_instructions text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index addresses_user_idx on public.addresses(user_id);
create unique index addresses_one_default_idx on public.addresses(user_id) where is_default;

create table public.store_settings (
  id uuid primary key default gen_random_uuid(),
  singleton boolean not null unique default true check (singleton),
  store_name text not null,
  whatsapp_number text check (whatsapp_number ~ '^[1-9][0-9]{6,14}$'),
  support_email text,
  currency_symbol text not null default 'F',
  announcement jsonb not null default '{}' check (private.localized_text(announcement)),
  support_information jsonb not null default '{}' check (private.localized_text(support_information)),
  is_open boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create function private.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles','user_roles','categories','category_translations','products',
    'product_translations','product_images','product_specifications','addresses','store_settings']
  loop
    execute format('create trigger shop_touch_updated_at before update on public.%I for each row execute function private.touch_updated_at()', table_name);
  end loop;
end;
$$;

create function private.create_shop_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles(id, first_name, last_name)
  values (new.id,
    case when jsonb_typeof(new.raw_user_meta_data -> 'first_name') = 'string'
      then left(btrim(new.raw_user_meta_data ->> 'first_name'), 80) else '' end,
    case when jsonb_typeof(new.raw_user_meta_data -> 'last_name') = 'string'
      then left(btrim(new.raw_user_meta_data ->> 'last_name'), 80) else '' end)
  on conflict (id) do nothing;
  insert into public.user_roles(user_id, role) values (new.id, 'customer')
  on conflict (user_id) do nothing;
  return new;
end;
$$;
revoke all on function private.create_shop_user() from public, anon, authenticated;
create trigger shop_auth_user_created after insert on auth.users
for each row execute function private.create_shop_user();

create function private.is_shop_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.user_roles where user_id = (select auth.uid()) and role = 'admin');
$$;
create function private.public_category(category uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.categories c left join public.categories p on p.id = c.parent_id
    where c.id = category and c.is_visible and (c.parent_id is null or p.is_visible));
$$;
create function private.public_product(product uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.products p where p.id = product and p.is_visible
    and p.published_at <= now() and private.public_category(p.category_id));
$$;
revoke all on function private.is_shop_admin(), private.public_category(uuid), private.public_product(uuid) from public, anon, authenticated;
grant execute on function private.is_shop_admin() to authenticated;
grant execute on function private.public_category(uuid), private.public_product(uuid) to anon, authenticated;

do $$
declare
  table_name text;
begin
  foreach table_name in array array['profiles','user_roles','categories','category_translations','products',
    'product_translations','product_images','product_specifications','favorites','addresses','store_settings']
  loop
    execute format('alter table public.%I enable row level security', table_name);
    execute format('revoke all privileges on public.%I from public, anon, authenticated', table_name);
  end loop;
  foreach table_name in array array['categories','category_translations','products','product_translations',
    'product_images','product_specifications','store_settings']
  loop
    execute format('grant select on public.%I to anon, authenticated', table_name);
    execute format('grant insert, update, delete on public.%I to authenticated', table_name);
    execute format('create policy shop_admin_manage on public.%I for all to authenticated using ((select private.is_shop_admin())) with check ((select private.is_shop_admin()))', table_name);
  end loop;
end;
$$;

create policy shop_categories_public on public.categories for select to anon, authenticated using (private.public_category(id));
create policy shop_category_text_public on public.category_translations for select to anon, authenticated using (private.public_category(category_id));
create policy shop_products_public on public.products for select to anon, authenticated using (private.public_product(id));
create policy shop_product_text_public on public.product_translations for select to anon, authenticated using (private.public_product(product_id));
create policy shop_product_images_public on public.product_images for select to anon, authenticated using (private.public_product(product_id));
create policy shop_product_specifications_public on public.product_specifications for select to anon, authenticated using (private.public_product(product_id));
create policy shop_settings_public on public.store_settings for select to anon, authenticated using (true);

grant select on public.profiles, public.user_roles to authenticated;
grant update(first_name, last_name, phone, avatar_path) on public.profiles to authenticated;
create policy shop_profile_read on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy shop_profile_update on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy shop_role_read on public.user_roles for select to authenticated using ((select auth.uid()) = user_id);

grant select, delete on public.favorites, public.addresses to authenticated;
grant insert(product_id) on public.favorites to authenticated;
grant insert(label,recipient_name,recipient_phone,country,city,district,street,delivery_instructions) on public.addresses to authenticated;
grant update(label,recipient_name,recipient_phone,country,city,district,street,delivery_instructions,is_default) on public.addresses to authenticated;
create policy shop_favorite_read on public.favorites for select to authenticated using ((select auth.uid()) = user_id);
create policy shop_favorite_add on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id and private.public_product(product_id));
create policy shop_favorite_remove on public.favorites for delete to authenticated using ((select auth.uid()) = user_id);
create policy shop_address_owner on public.addresses for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create function public.set_default_address(address_id uuid) returns void
language plpgsql security invoker set search_path = '' as $$
declare
  owner_id uuid := auth.uid();
begin
  if owner_id is null then raise exception 'Authentication required' using errcode = '42501'; end if;
  perform pg_advisory_xact_lock(hashtextextended(owner_id::text, 0));
  perform 1 from public.addresses where id = address_id and user_id = owner_id for update;
  if not found then raise exception 'Address not found' using errcode = 'P0002'; end if;
  update public.addresses set is_default = false where user_id = owner_id and is_default and id <> address_id;
  update public.addresses set is_default = true where id = address_id and user_id = owner_id;
end;
$$;
revoke all on function public.set_default_address(uuid) from public, anon, authenticated;
grant execute on function public.set_default_address(uuid) to authenticated;
