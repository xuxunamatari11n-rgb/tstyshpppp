export default defineEventHandler(async event => {
  const user = await requireCustomerOwner(event, getQuery(event).owner)
  const { data, error } = await shopSessionClient(event).from('profiles')
    .select('first_name,last_name,phone').eq('id', user.id).maybeSingle()
  shopDataError(error)
  if (!data) throw createError({ statusCode: 404 })
  return data
})

