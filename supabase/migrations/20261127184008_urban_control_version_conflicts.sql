-- Version conflicts are application errors. Serialization failures trigger PostgREST transaction retries.
create function public.regie_store_product(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  item public.products := jsonb_populate_record(null::public.products, payload);
  previous public.products;
  target uuid;
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  if item.id is not null then
    select * into strict previous from public.products where id = item.id for update;
    if previous.updated_at is distinct from item.updated_at then raise sqlstate 'PT409' using message = 'conflict'; end if;
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

create function public.regie_store_category(payload jsonb) returns uuid
language plpgsql security invoker set search_path = '' as $$
declare
  item public.categories := jsonb_populate_record(null::public.categories, payload);
  previous public.categories;
  target uuid;
begin
  if not private.is_shop_admin() then raise insufficient_privilege; end if;
  if item.id is not null then
    select * into strict previous from public.categories where id=item.id for update;
    if previous.updated_at is distinct from item.updated_at then raise sqlstate 'PT409' using message = 'conflict'; end if;
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

revoke all on function public.regie_store_product(jsonb), public.regie_store_category(jsonb)
  from public, anon, authenticated;
grant execute on function public.regie_store_product(jsonb), public.regie_store_category(jsonb) to authenticated;

