insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 8388608, array['image/webp','image/jpeg','image/png','image/avif']),
  ('category-images', 'category-images', true, 8388608, array['image/webp','image/jpeg','image/png','image/avif']),
  ('avatars', 'avatars', false, 2097152, array['image/webp','image/jpeg','image/png'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy shop_commercial_media_admin on storage.objects for all to authenticated
using (bucket_id in ('product-images', 'category-images') and (select private.is_shop_admin()))
with check (
  bucket_id in ('product-images', 'category-images') and (select private.is_shop_admin())
  and name ~ '^[a-z0-9]+(-[a-z0-9]+)*/[a-z0-9]+(-[a-z0-9]+)*\.(webp|jpeg|jpg|png|avif)$'
);

create policy shop_avatar_owner on storage.objects for all to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text
  and name ~ '^[a-f0-9-]+/[a-z0-9]+(-[a-z0-9]+)*\.(webp|jpeg|jpg|png)$');
