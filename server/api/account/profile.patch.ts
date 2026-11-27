export default defineEventHandler(async event => {
  const { body, user } = await readCustomerWrite(event)
  const { data, error } = await shopSessionClient(event).from('profiles').update(customerProfileInput(body))
    .eq('id', user.id).select('first_name,last_name,phone').maybeSingle()
  shopDataError(error)
  if (!data) throw createError({ statusCode: 404 })
  return data
})

