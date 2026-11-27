import { uuidPattern } from './commerceSelection'

export const customerRoutes = [
  'account-profile', 'account-addresses', 'account-address-new', 'account-address-edit',
  'account-orders', 'account-security', 'account-assistance',
] as const

export type CustomerRoute = typeof customerRoutes[number]

export function customerDestination(name: unknown, address?: unknown) {
  const next = customerRoutes.find(route => route === name)
  if (!next) return
  if (next === 'account-address-edit') {
    if (typeof address !== 'string' || !uuidPattern.test(address)) return
    return { name: next, params: { id: address } }
  }
  return { name: next }
}

export function customerReturnQuery(name: unknown, address?: unknown) {
  const target = customerDestination(name, address)
  return target ? { next: target.name, ...(target.params ? { address: target.params.id } : {}) } : {}
}

export const profileFields = { first_name: 80, last_name: 80, phone: 40 } as const
export const addressFields = {
  label: 80, recipient_name: 160, recipient_phone: 40, country: 100,
  city: 100, district: 120, street: 300, delivery_instructions: 500,
} as const
export const requiredAddressFields = ['label', 'recipient_name', 'recipient_phone', 'country', 'city', 'street'] as const

