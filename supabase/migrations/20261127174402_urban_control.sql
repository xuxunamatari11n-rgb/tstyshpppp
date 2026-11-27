-- All functions use the caller's authenticated RLS context.
create function public.regie_products(filters jsonb default '{}') returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  return (
    with base as (
      select p.*, private.public_product(p.id) as is_public,
        private.public_category(p.category_id) as category_public,
        p.is_available and coalesce(p.stock_quantity > 0, true) as available,
        fr.name as name_fr, es.name as name_es,
        fr.name is not null as french,
        es.name is not null and nullif(btrim(es.short_description), '') is not null
          and nullif(btrim(es.full_description), '') is not null as spanish,
        (select i.storage_path from public.product_images i where i.product_id = p.id
           order by i.sort_order, i.id limit 1) as thumbnail
      from public.products p
      left join public.product_translations fr on fr.product_id = p.id and fr.locale = 'fr'
      left join public.product_translations es on es.product_id = p.id and es.locale = 'es'
    ), matched as materialized (
      select b.* from base b where
        (coalesce(filters->>'q','') = '' or strpos(private.shop_search(concat_ws(' ', b.name_fr, b.name_es, b.sku, b.slug)), private.shop_search(filters->>'q')) > 0)
        and (filters->>'category' is null or b.category_id::text = filters->>'category'
          or exists(select 1 from public.categories c where c.id = b.category_id and c.parent_id::text = filters->>'category'))
        and (case filters->>'visibility' when 'public' then b.is_public when 'hidden' then not b.is_visible
          when 'blocked' then b.is_visible and not b.is_public else true end)
        and (case filters->>'availability' when 'available' then b.available when 'unavailable' then not b.available
          when 'stock' then b.stock_quantity = 0 else true end)
        and (filters->>'attention' is distinct from 'true' or b.thumbnail is null or not b.french
          or not b.spanish or not b.available or (b.is_visible and not b.is_public))
    ), selection as (
      select m.*, row_number() over (
        order by case when filters->>'sort' = 'price-asc' then m.price end,
        case when filters->>'sort' = 'price-desc' then m.price end desc,
        case when filters->>'sort' = 'name' then lower(coalesce(m.name_fr, m.slug)) end,
        m.updated_at desc, m.id
      ) as position
      from matched m order by position
      limit case when filters->>'overview' = 'true' then 6 else 24 end
      offset case when filters->>'page' ~ '^[0-9]{1,5}$' then least(10000, (filters->>'page')::integer) * 24 else 0 end
    )
    select jsonb_build_object('total', (select count(*) from matched),
      'products', coalesce((select jsonb_agg(to_jsonb(selection) order by position) from selection), '[]'),
      'counts', case when filters->>'overview' = 'true' then (
        select jsonb_build_object('total',count(*),'public',count(*) filter(where is_public),
          'hidden',count(*) filter(where not is_public),'unavailable',count(*) filter(where not available),
          'categories',(select count(*) from public.categories),
          'publicCategories',(select count(*) from public.categories where private.public_category(id)))
        from base) end)
  );
end;
$$;

create function public.regie_categories() returns jsonb
language plpgsql stable security invoker set search_path = '' as $$
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  return coalesce((select jsonb_agg(to_jsonb(c) || jsonb_build_object(
      'effective', private.public_category(c.id),
      'product_count', (select count(*) from public.products p where p.category_id = c.id),
      'child_count', (select count(*) from public.categories child where child.parent_id = c.id),
      'translations', coalesce((select jsonb_agg(to_jsonb(t)) from public.category_translations t where t.category_id = c.id), '[]'))
      order by c.sort_order, c.stable_key) from public.categories c), '[]');
end;
$$;

create function public.regie_save_product(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  item public.products := jsonb_populate_record(null::public.products, payload);
  previous public.products;
  target uuid;
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  if item.id is not null then
    select * into strict previous from public.products where id = item.id for update;
    if previous.updated_at is distinct from item.updated_at then raise sqlstate '40001'; end if;
    if previous.published_at is not null and previous.slug <> item.slug and payload->>'confirm_slug' is distinct from 'true'
      then raise sqlstate 'PT422' using message = 'slug-confirm'; end if;
  end if;
  if item.is_visible and not exists (
    select 1 from jsonb_array_elements(payload->'translations') t where t->>'locale' = 'fr' and nullif(btrim(t->>'name'), '') is not null
  ) then raise sqlstate 'PT422' using message = 'french-required'; end if;
  if item.is_visible and not private.public_category(item.category_id) and
    (not coalesce(previous.is_visible, false) or previous.category_id is distinct from item.category_id)
    then raise sqlstate 'PT422' using message = 'category-hidden'; end if;
  if item.id is null then
    insert into public.products(category_id,slug,sku,price,comparison_price,stock_quantity,is_available,is_visible,
      is_featured,is_new_arrival,bestseller_rank,sort_order,published_at)
    values(item.category_id,item.slug,item.sku,item.price,item.comparison_price,item.stock_quantity,item.is_available,
      item.is_visible,item.is_featured,item.is_new_arrival,item.bestseller_rank,item.sort_order,case when item.is_visible then now() end)
    returning id into target;
  else
    update public.products set category_id=item.category_id,slug=item.slug,sku=item.sku,price=item.price,
      comparison_price=item.comparison_price,stock_quantity=item.stock_quantity,is_available=item.is_available,
      is_visible=item.is_visible,is_featured=item.is_featured,is_new_arrival=item.is_new_arrival,
      bestseller_rank=item.bestseller_rank,sort_order=item.sort_order,
      published_at=coalesce(case when item.is_visible and not previous.is_visible then now() end,
        previous.published_at,case when item.is_visible then now() end)
    where id=item.id returning id into target;
  end if;
  delete from public.product_translations t where t.product_id = target
    and not exists(select 1 from jsonb_array_elements(payload->'translations') v where v->>'locale' = t.locale::text);
  insert into public.product_translations(product_id,locale,name,short_description,full_description,keywords,seo_title,seo_description)
    select target,t.locale,t.name,t.short_description,t.full_description,coalesce(t.keywords,'{}'),t.seo_title,t.seo_description
    from jsonb_populate_recordset(null::public.product_translations,payload->'translations') t
  on conflict(product_id,locale) do update set name=excluded.name,short_description=excluded.short_description,
    full_description=excluded.full_description,keywords=excluded.keywords,seo_title=excluded.seo_title,seo_description=excluded.seo_description;
  delete from public.product_images i where i.product_id = target
    and not exists(select 1 from jsonb_array_elements(payload->'images') v where v->>'storage_path' = i.storage_path);
  insert into public.product_images(product_id,storage_path,alt,width,height,is_cutout,sort_order)
    select target,i.storage_path,i.alt,i.width,i.height,i.is_cutout,i.sort_order
    from jsonb_populate_recordset(null::public.product_images,payload->'images') i
  on conflict(product_id,storage_path) do update set alt=excluded.alt,width=excluded.width,height=excluded.height,
    is_cutout=excluded.is_cutout,sort_order=excluded.sort_order;
  delete from public.product_specifications where product_id = target;
  insert into public.product_specifications(product_id,label,value,sort_order)
    select target,s.label,s.value,s.sort_order
    from jsonb_populate_recordset(null::public.product_specifications,payload->'specifications') s;
  return target;
end;
$$;

create function public.regie_visibility(target uuid, visible boolean) returns void
language plpgsql security invoker set search_path = '' as $$
declare item public.products;
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  select * into strict item from public.products where id = target for update;
  if visible and not private.public_category(item.category_id)
    then raise sqlstate 'PT422' using message = 'category-hidden'; end if;
  if visible and not exists(select 1 from public.product_translations where product_id=target and locale='fr')
    then raise sqlstate 'PT422' using message = 'french-required'; end if;
  update public.products set is_visible=visible,published_at=case when visible then least(coalesce(published_at,now()),now()) else published_at end
    where id=target;
end;
$$;

create function public.regie_save_category(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  item public.categories := jsonb_populate_record(null::public.categories, payload);
  previous public.categories;
  target uuid;
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  if item.id is not null then
    select * into strict previous from public.categories where id=item.id for update;
    if previous.updated_at is distinct from item.updated_at then raise sqlstate '40001'; end if;
    if previous.is_visible and not item.is_visible and payload->>'confirm_hide' is distinct from 'true'
      then raise sqlstate 'PT422' using message = 'confirm-hide'; end if;
  end if;
  if item.parent_id is not null and (item.parent_id = item.id or not exists(
      select 1 from public.categories where id=item.parent_id and parent_id is null))
    then raise sqlstate 'PT422' using message = 'category-parent'; end if;
  if not exists (select 1 from jsonb_array_elements(payload->'translations') t
      where t->>'locale'='fr' and nullif(btrim(t->>'name'),'') is not null)
    then raise sqlstate 'PT422' using message = 'french-required'; end if;
  if item.id is null then
    insert into public.categories(stable_key,parent_id,slug,image_path,is_visible,is_featured,sort_order)
    values('regie-' || gen_random_uuid(),item.parent_id,item.slug,item.image_path,item.is_visible,item.is_featured,item.sort_order)
    returning id into target;
  else
    update public.categories set parent_id=item.parent_id,slug=item.slug,image_path=item.image_path,is_visible=item.is_visible,
      is_featured=item.is_featured,sort_order=item.sort_order where id=item.id returning id into target;
  end if;
  delete from public.category_translations t where t.category_id=target
    and not exists(select 1 from jsonb_array_elements(payload->'translations') v where v->>'locale'=t.locale::text);
  insert into public.category_translations(category_id,locale,name,description,image_alt)
    select target,t.locale,t.name,t.description,t.image_alt
    from jsonb_populate_recordset(null::public.category_translations,payload->'translations') t
  on conflict(category_id,locale) do update set name=excluded.name,description=excluded.description,image_alt=excluded.image_alt;
  return target;
end;
$$;

revoke all on function public.regie_products(jsonb), public.regie_categories(), public.regie_save_product(jsonb),
  public.regie_visibility(uuid,boolean), public.regie_save_category(jsonb) from public, anon, authenticated;
grant execute on function public.regie_products(jsonb), public.regie_categories(), public.regie_save_product(jsonb),
  public.regie_visibility(uuid,boolean), public.regie_save_category(jsonb) to authenticated;
