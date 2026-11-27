-- Run with a privileged database connection against an isolated test project.
begin;
insert into auth.users (id, aud, role, email, raw_user_meta_data)
values
  ('f0000000-0000-4000-8000-000000000001','authenticated','authenticated','rls-a@example.invalid','{"first_name":"A","role":"admin"}'),
  ('f0000000-0000-4000-8000-000000000002','authenticated','authenticated','rls-b@example.invalid','{}'),
  ('f0000000-0000-4000-8000-000000000003','authenticated','authenticated','rls-c@example.invalid','{}');
update public.user_roles set role = 'admin' where user_id = 'f0000000-0000-4000-8000-000000000003';

insert into public.categories(id, stable_key, slug, is_visible) values
  ('f1000000-0000-4000-8000-000000000001','RlsOpen','rls-open',true),
  ('f1000000-0000-4000-8000-000000000002','RlsHidden','rls-hidden',false);
insert into public.categories(id, parent_id, stable_key, slug, is_visible) values
  ('f1000000-0000-4000-8000-000000000003','f1000000-0000-4000-8000-000000000002','RlsChild','rls-child',true);
insert into public.products(id,category_id,slug,price,is_visible,is_available,published_at) values
  ('f2000000-0000-4000-8000-000000000001','f1000000-0000-4000-8000-000000000001','rls-public-product',100,true,true,now()),
  ('f2000000-0000-4000-8000-000000000002','f1000000-0000-4000-8000-000000000001','rls-hidden-product',100,false,true,now()),
  ('f2000000-0000-4000-8000-000000000003','f1000000-0000-4000-8000-000000000003','rls-hidden-parent-product',100,true,true,now());
insert into public.product_translations(product_id,locale,name,short_description) values
  ('f2000000-0000-4000-8000-000000000001','fr','Éclairage sûr','Décoration'),
  ('f2000000-0000-4000-8000-000000000002','fr','Produit privé','Caché');
insert into public.favorites(user_id,product_id) values
  ('f0000000-0000-4000-8000-000000000002','f2000000-0000-4000-8000-000000000001');
insert into public.addresses(id,user_id,label,recipient_name,recipient_phone,country,city,street) values
  ('f3000000-0000-4000-8000-000000000001','f0000000-0000-4000-8000-000000000001','A','A','0','Test','Test','Test'),
  ('f3000000-0000-4000-8000-000000000002','f0000000-0000-4000-8000-000000000001','A2','A','0','Test','Test','Test'),
  ('f3000000-0000-4000-8000-000000000003','f0000000-0000-4000-8000-000000000002','B','B','0','Test','Test','Test');

do $$ begin
  begin
    insert into public.categories(parent_id,stable_key,slug) values ('f1000000-0000-4000-8000-000000000003','RlsGrandchild','rls-grandchild');
    raise exception 'A third category level was accepted';
  exception when foreign_key_violation then null;
  end;
end $$;

set local role anon;
do $$ begin
  if not exists(select from public.products where slug = 'rls-public-product') then raise exception 'Public product missing'; end if;
  if exists(select from public.products where slug in ('rls-hidden-product','rls-hidden-parent-product')) then raise exception 'Private product visible'; end if;
  if exists(select from public.categories where slug in ('rls-hidden','rls-child')) then raise exception 'Hidden hierarchy visible'; end if;
  if exists(select from public.product_translations where product_id = 'f2000000-0000-4000-8000-000000000002') then raise exception 'Hidden translation visible'; end if;
  if (public.shop_catalogue('{"q":"eclairage decoration"}','es')->>'total')::int <> 1 then raise exception 'Accent or French fallback failed'; end if;
  begin perform 1 from public.profiles; raise exception 'Anonymous profiles grant'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.addresses; raise exception 'Anonymous addresses grant'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.favorites; raise exception 'Anonymous favorites grant'; exception when insufficient_privilege then null; end;
  begin perform 1 from public.user_roles; raise exception 'Anonymous roles grant'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000001',true);
do $$
declare affected integer;
begin
  if (select role from public.user_roles limit 1) <> 'customer' then raise exception 'Metadata affected role'; end if;
  if (select first_name from public.profiles limit 1) <> 'A' or (select count(*) from public.profiles) <> 1 then raise exception 'Profile isolation failed'; end if;
  if exists(select from public.favorites where user_id = 'f0000000-0000-4000-8000-000000000002') then raise exception 'Favorite isolation failed'; end if;
  if exists(select from public.addresses where user_id = 'f0000000-0000-4000-8000-000000000002') then raise exception 'Address isolation failed'; end if;
  insert into public.favorites(product_id) values ('f2000000-0000-4000-8000-000000000001');
  delete from public.favorites where product_id = 'f2000000-0000-4000-8000-000000000001';
  perform public.set_default_address('f3000000-0000-4000-8000-000000000001');
  perform public.set_default_address('f3000000-0000-4000-8000-000000000002');
  if (select count(*) from public.addresses where is_default) <> 1 then raise exception 'Default address constraint failed'; end if;
  begin perform public.set_default_address('f3000000-0000-4000-8000-000000000003'); raise exception 'Other customer address changed'; exception when no_data_found then null; end;
  update public.products set price = 900 where slug = 'rls-public-product';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer changed product'; end if;
  update public.categories set sort_order = 900 where slug = 'rls-open';
  get diagnostics affected = row_count;
  if affected <> 0 then raise exception 'Customer changed category'; end if;
  begin update public.user_roles set role = 'admin'; raise exception 'Customer promoted themselves'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects(bucket_id,name) values ('product-images','rls-public-product/forbidden.webp'); raise exception 'Customer wrote product media'; exception when insufficient_privilege then null; end;
  begin insert into storage.objects(bucket_id,name) values ('avatars','f0000000-0000-4000-8000-000000000002/blocked.webp'); raise exception 'Customer wrote another avatar'; exception when insufficient_privilege then null; end;
  insert into storage.objects(bucket_id,name) values ('avatars','f0000000-0000-4000-8000-000000000001/rls.webp');
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claim.sub','f0000000-0000-4000-8000-000000000003',true);
do $$
declare affected integer;
begin
  update public.products set price = 150 where slug = 'rls-public-product';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin could not edit product'; end if;
  update public.categories set sort_order = 100 where slug = 'rls-open';
  get diagnostics affected = row_count;
  if affected <> 1 then raise exception 'Admin could not edit category'; end if;
  if exists(select from public.profiles where id = 'f0000000-0000-4000-8000-000000000001') then raise exception 'Admin can see private customer profile'; end if;
  insert into storage.objects(bucket_id,name) values ('product-images','rls-public-product/admin.webp');
  begin insert into storage.objects(bucket_id,name) values ('category-images','rls-open/not-an-image.svg'); raise exception 'Incorrect extension accepted'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
select 'shop_rls_passed' as result;
