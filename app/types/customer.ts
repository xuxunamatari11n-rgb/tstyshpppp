import type { ShopRow } from '~~/shared/types/database'

export type CustomerProfile = Pick<ShopRow<'profiles'>, 'first_name' | 'last_name' | 'phone'>
export type CustomerAddress = Pick<ShopRow<'addresses'>,
  'id' | 'label' | 'recipient_name' | 'recipient_phone' | 'country' | 'city' | 'district' | 'street' | 'delivery_instructions' | 'is_default'>

export type AddressForm = Omit<{ [Key in keyof CustomerAddress]: NonNullable<CustomerAddress[Key]> }, 'id'>
export type AddressSaveResult = { addressId: string; defaultApplied: boolean }

