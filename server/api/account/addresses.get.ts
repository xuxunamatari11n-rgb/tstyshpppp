import type { CustomerAddress } from '~/types/customer'

export default defineEventHandler(async event => {
  const user = await requireCustomerOwner(event, getQuery(event).owner)
  const client = shopSessionClient(event)
  const addresses: CustomerAddress[] = []
  const pageSize = 100
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await client.from('addresses').select(customerAddressColumns)
      .eq('user_id', user.id).order('is_default', { ascending: false }).order('created_at').order('id')
      .range(offset, offset + pageSize - 1)
    shopDataError(error)
    addresses.push(...(data ?? []))
    if (!data || data.length < pageSize) return addresses
  }
})

