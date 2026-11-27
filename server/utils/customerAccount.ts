import type { H3Event } from 'h3'
import { addressFields, profileFields, requiredAddressFields } from '~~/shared/utils/customerAccount'
import { uuidPattern } from '~~/shared/utils/commerceSelection'

export const customerAddressColumns = 'id,label,recipient_name,recipient_phone,country,city,district,street,delivery_instructions,is_default'

export async function requireCustomerOwner(event: H3Event, expected: unknown) {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const user = await requireShopSession(event)
  if (expected !== user.id) throw createError({ statusCode: 409, statusMessage: 'Account changed' })
  return user
}

export async function readCustomerWrite(event: H3Event) {
  requireShopOrigin(event)
  const body = await readBody<Record<string, unknown> | null>(event)
  const user = await requireCustomerOwner(event, body?.owner)
  if (!body || Array.isArray(body)) throw createError({ statusCode: 400 })
  return { body, user }
}

export function customerAddressId(event: H3Event) {
  const id = getRouterParam(event, 'id')
  if (!id || !uuidPattern.test(id)) throw createError({ statusCode: 404 })
  return id
}

function readText(body: Record<string, unknown>, key: string, limit: number, required = false) {
  const input = body[key]
  if (input !== null && input !== undefined && typeof input !== 'string') {
    throw createError({ statusCode: 400, data: { field: key } })
  }
  const value = typeof input === 'string' ? input.trim() : ''
  if (value.length > limit || (required && !value)) throw createError({ statusCode: 400, data: { field: key } })
  return value
}

export function customerProfileInput(body: Record<string, unknown>) {
  return {
    first_name: readText(body, 'first_name', profileFields.first_name),
    last_name: readText(body, 'last_name', profileFields.last_name),
    phone: readText(body, 'phone', profileFields.phone) || null,
  }
}

export function customerAddressInput(body: Record<string, unknown>) {
  const text = (key: keyof typeof addressFields) => readText(body, key, addressFields[key],
    requiredAddressFields.some(field => field === key))
  if (typeof body.is_default !== 'boolean') throw createError({ statusCode: 400, data: { field: 'is_default' } })
  return { fields: { label: text('label'), recipient_name: text('recipient_name'), recipient_phone: text('recipient_phone'),
    country: text('country'), city: text('city'), district: text('district') || null,
    street: text('street'), delivery_instructions: text('delivery_instructions') || null }, preferDefault: body.is_default }
}

export async function saveCustomerAddress(event: H3Event, id?: string) {
  const { body, user } = await readCustomerWrite(event)
  const { fields, preferDefault } = customerAddressInput(body)
  const client = shopSessionClient(event)
  const { data, error } = id
    ? await client.from('addresses').update(preferDefault ? fields : { ...fields, is_default: false })
      .eq('id', id).eq('user_id', user.id).select('id,is_default').maybeSingle()
    : await client.from('addresses').insert(fields).select('id,is_default').single()
  shopDataError(error)
  if (!data) throw createError({ statusCode: 404 })
  const defaultResult = preferDefault ? await client.rpc('set_default_address', { address_id: data.id }) : undefined
  return { addressId: data.id, defaultApplied: !defaultResult?.error }
}

