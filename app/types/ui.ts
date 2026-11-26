export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'whatsapp'
export type ButtonType = 'button' | 'submit' | 'reset'
export type BadgeVariant = 'neutral' | 'brand' | 'discount' | 'featured' | 'success' | 'danger'

export interface FieldProps {
  label: string
  id?: string
  name?: string
  hint?: string
  error?: string
  disabled?: boolean
  required?: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}
