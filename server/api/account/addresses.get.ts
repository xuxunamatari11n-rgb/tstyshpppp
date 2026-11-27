export default defineEventHandler(async event => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireShopSession(event)
  if (getQuery(event).owner !== user.id) throw createError({ statusCode: 409 })
  const { data, error } = await shopSessionClient(event).from('addresses')
    .select('id,label,recipient_name,recipient_phone,country,city,district,street,delivery_instructions')
    .eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at').limit(50)
  shopDataError(error)
  return data ?? []
})

