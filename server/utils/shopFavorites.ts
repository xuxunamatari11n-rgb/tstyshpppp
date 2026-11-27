import type { H3Event } from 'h3'

export async function listShopFavorites(event: H3Event) {
  const client = shopSessionClient(event)
  const { data, error } = await client.from('favorites').select('product_id,created_at').order('created_at', { ascending: false })
  shopDataError(error)
  return data ?? []
}

export async function updateShopFavorite(event: H3Event, productId: string, favorite: boolean) {
  const client = shopSessionClient(event)
  const result = favorite
    ? await client.from('favorites').upsert({ product_id: productId }, { onConflict: 'user_id,product_id', ignoreDuplicates: true })
    : await client.from('favorites').delete().eq('product_id', productId)
  if (result.error?.code === '42501') throw createError({ statusCode: 403, statusMessage: 'Favorite operation refused' })
  shopDataError(result.error)
}
