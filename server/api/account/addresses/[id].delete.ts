export default defineEventHandler(async event => {
  const { user } = await readCustomerWrite(event)
  const id = customerAddressId(event)
  const { data, error } = await shopSessionClient(event).from('addresses')
    .delete().eq('id', id).eq('user_id', user.id).select('id').maybeSingle()
  shopDataError(error)
  if (!data) throw createError({ statusCode: 404 })
  return { ok: true }
})

