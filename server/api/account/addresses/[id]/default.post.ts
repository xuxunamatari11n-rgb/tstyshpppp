export default defineEventHandler(async event => {
  await readCustomerWrite(event)
  const id = customerAddressId(event)
  const { error } = await shopSessionClient(event).rpc('set_default_address', { address_id: id })
  if (error?.code === 'P0002') throw createError({ statusCode: 404 })
  shopDataError(error)
  return { ok: true }
})

